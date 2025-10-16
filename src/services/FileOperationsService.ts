import * as vscode from 'vscode';
import * as path from 'path';
import { ErrorHandler, ErrorType } from './ErrorHandler';

export interface FileInfo {
    name: string;
    path: string;
    size: number;
    lastModified: Date;
    isDirectory: boolean;
}

export interface DirectoryContents {
    path: string;
    files: FileInfo[];
    jsonFiles: FileInfo[];
}

export class FileOperationsService {
    private _errorHandler: ErrorHandler;
    private _watchers: Map<string, vscode.FileSystemWatcher> = new Map();
    private _changeCallbacks: Map<string, (uri: vscode.Uri) => void> = new Map();

    constructor() {
        this._errorHandler = ErrorHandler.getInstance();
    }

    /**
     * Read a JSON file and return its content
     */
    public async readJsonFile(filePath: string): Promise<any> {
        return this._errorHandler.safeExecute(async () => {
            const fileUri = vscode.Uri.file(filePath);
            const fileContent = await vscode.workspace.fs.readFile(fileUri);
            const jsonString = fileContent.toString();
            
            try {
                return JSON.parse(jsonString);
            } catch (parseError) {
                throw new Error(`Invalid JSON in file ${filePath}: ${parseError}`);
            }
        }, `reading JSON file ${filePath}`, ErrorType.FILE_SYSTEM);
    }

    /**
     * Write JSON content to a file
     */
    public async writeJsonFile(filePath: string, content: any): Promise<void> {
        const result = await this._errorHandler.safeExecute(async () => {
            const fileUri = vscode.Uri.file(filePath);
            const jsonString = JSON.stringify(content, null, 2);
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonString, 'utf8'));
        }, `writing JSON file ${filePath}`, ErrorType.FILE_SYSTEM);
        
        if (result === null) {
            throw new Error(`Failed to write JSON file: ${filePath}`);
        }
    }

    /**
     * Read directory contents and filter for JSON files
     */
    public async readDirectory(directoryPath: string): Promise<DirectoryContents> {
        const result = await this._errorHandler.safeExecute(async () => {
            const dirUri = vscode.Uri.file(directoryPath);
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            
            const files: FileInfo[] = [];
            const jsonFiles: FileInfo[] = [];

            for (const [name, type] of entries) {
                const fullPath = path.join(directoryPath, name);
                const isDirectory = type === vscode.FileType.Directory;
                
                // Get file stats
                let size = 0;
                let lastModified = new Date();
                
                try {
                    const stat = await vscode.workspace.fs.stat(vscode.Uri.file(fullPath));
                    size = stat.size;
                    lastModified = new Date(stat.mtime);
                } catch (error) {
                    // If we can't get stats, use defaults
                }

                const fileInfo: FileInfo = {
                    name,
                    path: fullPath,
                    size,
                    lastModified,
                    isDirectory
                };

                files.push(fileInfo);

                // Check if it's a JSON file
                if (!isDirectory && name.toLowerCase().endsWith('.json')) {
                    jsonFiles.push(fileInfo);
                }
            }

            // Sort files: directories first, then by name
            files.sort((a, b) => {
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
            });

            jsonFiles.sort((a, b) => a.name.localeCompare(b.name));

            return {
                path: directoryPath,
                files,
                jsonFiles
            };
        }, `reading directory ${directoryPath}`, ErrorType.FILE_SYSTEM);
        
        return result || {
            path: directoryPath,
            files: [],
            jsonFiles: []
        };
    }

    /**
     * Check if a file exists
     */
    public async fileExists(filePath: string): Promise<boolean> {
        try {
            const fileUri = vscode.Uri.file(filePath);
            await vscode.workspace.fs.stat(fileUri);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get file information
     */
    public async getFileInfo(filePath: string): Promise<FileInfo | null> {
        return this._errorHandler.safeExecute(async () => {
            const fileUri = vscode.Uri.file(filePath);
            const stat = await vscode.workspace.fs.stat(fileUri);
            
            return {
                name: path.basename(filePath),
                path: filePath,
                size: stat.size,
                lastModified: new Date(stat.mtime),
                isDirectory: stat.type === vscode.FileType.Directory
            };
        }, `getting file info for ${filePath}`, ErrorType.FILE_SYSTEM);
    }

    /**
     * Watch a file for changes
     */
    public watchFile(filePath: string, callback: (uri: vscode.Uri) => void): void {
        // Remove existing watcher if any
        this.unwatchFile(filePath);

        const pattern = new vscode.RelativePattern(path.dirname(filePath), path.basename(filePath));
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);

        // Set up event handlers
        const handleChange = (uri: vscode.Uri) => {
            callback(uri);
        };

        watcher.onDidChange(handleChange);
        watcher.onDidCreate(handleChange);
        watcher.onDidDelete(handleChange);

        // Store watcher and callback
        this._watchers.set(filePath, watcher);
        this._changeCallbacks.set(filePath, callback);
    }

    /**
     * Watch a directory for changes
     */
    public watchDirectory(directoryPath: string, callback: (uri: vscode.Uri) => void): void {
        // Remove existing watcher if any
        this.unwatchFile(directoryPath);

        const pattern = new vscode.RelativePattern(directoryPath, '**/*.json');
        const watcher = vscode.workspace.createFileSystemWatcher(pattern);

        // Set up event handlers
        const handleChange = (uri: vscode.Uri) => {
            callback(uri);
        };

        watcher.onDidChange(handleChange);
        watcher.onDidCreate(handleChange);
        watcher.onDidDelete(handleChange);

        // Store watcher and callback
        this._watchers.set(directoryPath, watcher);
        this._changeCallbacks.set(directoryPath, callback);
    }

    /**
     * Stop watching a file or directory
     */
    public unwatchFile(filePath: string): void {
        const watcher = this._watchers.get(filePath);
        if (watcher) {
            watcher.dispose();
            this._watchers.delete(filePath);
            this._changeCallbacks.delete(filePath);
        }
    }

    /**
     * Stop watching all files
     */
    public unwatchAll(): void {
        for (const watcher of this._watchers.values()) {
            watcher.dispose();
        }
        this._watchers.clear();
        this._changeCallbacks.clear();
    }

    /**
     * Validate file size against settings
     */
    public async validateFileSize(filePath: string, maxSize: number): Promise<boolean> {
        const result = await this._errorHandler.safeExecute(async () => {
            const fileInfo = await this.getFileInfo(filePath);
            if (!fileInfo) {
                throw new Error(`File not found: ${filePath}`);
            }

            if (fileInfo.size > maxSize) {
                const sizeMB = (fileInfo.size / (1024 * 1024)).toFixed(2);
                const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
                
                const proceed = await vscode.window.showWarningMessage(
                    `File ${fileInfo.name} is ${sizeMB}MB, which exceeds the recommended limit of ${maxSizeMB}MB. This may cause performance issues. Do you want to proceed?`,
                    'Yes', 'No'
                );
                
                return proceed === 'Yes';
            }

            return true;
        }, `validating file size for ${filePath}`, ErrorType.FILE_SYSTEM);
        
        return result || false;
    }

    /**
     * Create a backup of a file before modifying it
     */
    public async createBackup(filePath: string): Promise<string | null> {
        return this._errorHandler.safeExecute(async () => {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = `${filePath}.backup.${timestamp}`;
            
            const sourceUri = vscode.Uri.file(filePath);
            const backupUri = vscode.Uri.file(backupPath);
            
            const content = await vscode.workspace.fs.readFile(sourceUri);
            await vscode.workspace.fs.writeFile(backupUri, content);
            
            return backupPath;
        }, `creating backup for ${filePath}`, ErrorType.FILE_SYSTEM);
    }

    /**
     * Restore a file from backup
     */
    public async restoreFromBackup(originalPath: string, backupPath: string): Promise<void> {
        const result = await this._errorHandler.safeExecute(async () => {
            const backupUri = vscode.Uri.file(backupPath);
            const originalUri = vscode.Uri.file(originalPath);
            
            const content = await vscode.workspace.fs.readFile(backupUri);
            await vscode.workspace.fs.writeFile(originalUri, content);
        }, `restoring from backup ${backupPath}`, ErrorType.FILE_SYSTEM);
        
        if (result === null) {
            throw new Error(`Failed to restore from backup: ${backupPath}`);
        }
    }

    /**
     * Get multiple files' contents in parallel
     */
    public async readMultipleJsonFiles(filePaths: string[]): Promise<Map<string, any>> {
        const results = new Map<string, any>();
        
        // Process files in parallel with error handling
        const promises = filePaths.map(async (filePath) => {
            const content = await this.readJsonFile(filePath);
            if (content !== null) {
                results.set(filePath, content);
            }
        });

        await Promise.allSettled(promises);
        return results;
    }

    /**
     * Find JSON files recursively in a directory
     */
    public async findJsonFilesRecursive(directoryPath: string, maxDepth: number = 3): Promise<FileInfo[]> {
        const result = await this._errorHandler.safeExecute(async () => {
            const jsonFiles: FileInfo[] = [];
            
            const searchDirectory = async (currentPath: string, depth: number) => {
                if (depth > maxDepth) return;
                
                const contents = await this.readDirectory(currentPath);
                
                // Add JSON files from current directory
                jsonFiles.push(...contents.jsonFiles);
                
                // Recursively search subdirectories
                const subdirectories = contents.files.filter(f => f.isDirectory);
                for (const subdir of subdirectories) {
                    await searchDirectory(subdir.path, depth + 1);
                }
            };

            await searchDirectory(directoryPath, 0);
            return jsonFiles;
        }, `finding JSON files in ${directoryPath}`, ErrorType.FILE_SYSTEM);
        
        return result || [];
    }

    /**
     * Get workspace folders
     */
    public getWorkspaceFolders(): string[] {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) return [];
        
        return folders.map(folder => folder.uri.fsPath);
    }

    /**
     * Show file picker dialog
     */
    public async showOpenDialog(options?: {
        canSelectFiles?: boolean;
        canSelectFolders?: boolean;
        canSelectMany?: boolean;
        filters?: { [name: string]: string[] };
    }): Promise<string[] | null> {
        const defaultOptions = {
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: { 'JSON Files': ['json'] }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        const result = await vscode.window.showOpenDialog(mergedOptions);
        
        if (result && result.length > 0) {
            return result.map(uri => uri.fsPath);
        }
        
        return null;
    }

    /**
     * Show save dialog
     */
    public async showSaveDialog(defaultName?: string): Promise<string | null> {
        const result = await vscode.window.showSaveDialog({
            defaultUri: defaultName ? vscode.Uri.file(defaultName) : undefined,
            filters: { 'JSON Files': ['json'] }
        });
        
        return result ? result.fsPath : null;
    }

    /**
     * Dispose of all resources
     */
    public dispose(): void {
        this.unwatchAll();
    }
}