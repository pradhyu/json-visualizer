import * as vscode from 'vscode';
import * as path from 'path';
import { JsonParserService } from '../services/JsonParserService';
import { ConfigurationManager } from '../services/ConfigurationManager';
import { DataTransformationService } from '../services/DataTransformationService';
import { FileOperationsService } from '../services/FileOperationsService';
import { ErrorHandler, ErrorType } from '../services/ErrorHandler';
import { ArrayConfig, TimelineEntity, VisualizationData, FilterState } from '../types';

export class TimelineVisualizerProvider implements vscode.WebviewPanelSerializer {
    public static readonly viewType = 'jsonTimelineVisualizer';
    private _panel: vscode.WebviewPanel | undefined;
    private _jsonParser: JsonParserService;
    private _configManager: ConfigurationManager;
    private _dataTransformer: DataTransformationService;
    private _fileOps: FileOperationsService;
    private _errorHandler: ErrorHandler;
    private _currentData: VisualizationData;

    constructor(private readonly _extensionUri: vscode.Uri) {
        this._jsonParser = new JsonParserService();
        this._configManager = new ConfigurationManager();
        this._dataTransformer = new DataTransformationService();
        this._fileOps = new FileOperationsService();
        this._errorHandler = ErrorHandler.getInstance();
        this._currentData = {
            entities: [],
            configurations: this._configManager.getArrayConfigs(),
            selectedFiles: [],
            filterState: {
                columnFilters: {},
                arrayTypes: []
            }
        };
        
        // Initialize configurations from JSON file
        this._configManager.initializeFromJsonFile().then(() => {
            this._currentData.configurations = this._configManager.getArrayConfigs();
        });
    }

    public async deserializeWebviewPanel(
        webviewPanel: vscode.WebviewPanel,
        state: any
    ): Promise<void> {
        this._panel = webviewPanel;
        this._setupWebview(webviewPanel.webview);
        
        // Restore state if available
        if (state) {
            webviewPanel.webview.postMessage({
                type: 'restoreState',
                data: state
            });
        }
    }

    public openVisualizer(uri?: vscode.Uri): void {
        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        if (this._panel) {
            // If panel exists, reveal it and send new file data
            this._panel.reveal(columnToShowIn);
            if (uri) {
                this._sendFileToWebview(uri);
            }
        } else {
            // Create new panel
            this._panel = vscode.window.createWebviewPanel(
                TimelineVisualizerProvider.viewType,
                'JSON Timeline Visualizer',
                columnToShowIn || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true,
                    localResourceRoots: [
                        vscode.Uri.joinPath(this._extensionUri, 'out'),
                        vscode.Uri.joinPath(this._extensionUri, 'webview-ui')
                    ]
                }
            );

            this._setupWebview(this._panel.webview);

            // Send initial file if provided
            if (uri) {
                this._sendFileToWebview(uri);
            }
        }
    }

    public openDirectory(uri?: vscode.Uri): void {
        this.openVisualizer();
        
        if (uri && this._panel) {
            this._panel.webview.postMessage({
                type: 'openDirectory',
                data: { directoryPath: uri.fsPath }
            });
        }
    }

    public async openConfigFile(): Promise<void> {
        await this._configManager.openConfigFile();
    }

    private _setupWebview(webview: vscode.Webview): void {
        webview.html = this._getWebviewContent(webview);

        // Handle messages from webview
        webview.onDidReceiveMessage(
            async (message) => {
                try {
                    await this._handleWebviewMessage(message);
                } catch (error) {
                    this._errorHandler.handleVisualizationError(error, 'webview message handling');
                }
            },
            undefined
        );

        // Clean up when panel is disposed
        this._panel!.onDidDispose(() => {
            this._panel = undefined;
        });
    }

    private _getWebviewContent(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this._extensionUri, 'out', 'webview.js')
        );

        const nonce = this._getNonce();

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src ${webview.cspSource} 'unsafe-inline'; font-src ${webview.cspSource} data:; img-src ${webview.cspSource} data: https:; connect-src ${webview.cspSource};">
            <title>JSON Timeline Visualizer</title>
        </head>
        <body>
            <div id="root"></div>
            <script nonce="${nonce}">
                // Prevent multiple VSCode API acquisitions
                if (!window.vscodeApi) {
                    window.vscodeApi = acquireVsCodeApi();
                }
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    private _getNonce(): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private async _sendFileToWebview(uri: vscode.Uri): Promise<void> {
        if (!this._panel) return;

        try {
            // Use the existing _loadFile method which properly processes the file
            await this._loadFile(uri.fsPath);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to load JSON file: ${error}`);
        }
    }

    private async _saveFile(data: { filePath: string; content: any }): Promise<void> {
        try {
            const fileUri = vscode.Uri.file(data.filePath);
            const jsonString = JSON.stringify(data.content, null, 2);
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(jsonString, 'utf8'));
            
            if (this._panel) {
                this._panel.webview.postMessage({
                    type: 'fileSaved',
                    data: { filePath: data.filePath }
                });
            }
            
            vscode.window.showInformationMessage('File saved successfully');
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to save file: ${error}`);
        }
    }

    private async _readFile(filePath: string): Promise<void> {
        if (!this._panel) return;

        try {
            // Use the existing _loadFile method which properly processes the file
            await this._loadFile(filePath);
        } catch (error) {
            this._panel.webview.postMessage({
                type: 'error',
                data: { message: `Failed to read file: ${error}` }
            });
        }
    }

    private async _readDirectory(directoryPath: string): Promise<void> {
        if (!this._panel) return;

        const directoryContents = await this._fileOps.readDirectory(directoryPath);
        
        if (directoryContents) {
            this._panel.webview.postMessage({
                type: 'directoryLoaded',
                data: {
                    directoryPath: directoryContents.path,
                    files: directoryContents.files
                }
            });
        }
    }

    /**
     * Browse for directory using file dialog
     */
    private async _browseDirectory(): Promise<void> {
        const selectedPaths = await this._fileOps.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false
        });

        if (selectedPaths && selectedPaths.length > 0) {
            await this._readDirectory(selectedPaths[0]);
        }
    }

    /**
     * Handle all webview messages
     */
    private async _handleWebviewMessage(message: any): Promise<void> {
        switch (message.type) {
            case 'ready':
                await this._sendInitialData();
                break;
            
            case 'loadFile':
                await this._loadFile(message.data.filePath);
                break;
            
            case 'loadFiles':
                await this._loadMultipleFiles(message.data.filePaths);
                break;
            
            case 'saveFile':
                await this._saveFile(message.data);
                break;
            
            case 'readDirectory':
                await this._readDirectory(message.data.directoryPath);
                break;
            
            case 'updateConfiguration':
                await this._updateConfiguration(message.data);
                break;
            
            case 'addConfiguration':
                await this._addConfiguration(message.data);
                break;
            
            case 'removeConfiguration':
                await this._removeConfiguration(message.data.name);
                break;
            
            case 'updateFilter':
                await this._updateFilter(message.data);
                break;
            
            case 'generateConfigSuggestions':
                await this._generateConfigSuggestions(message.data.jsonContent);
                break;
            
            case 'validateConfiguration':
                await this._validateConfiguration(message.data);
                break;
            
            case 'exportConfigurations':
                await this._exportConfigurations();
                break;
            
            case 'importConfigurations':
                await this._importConfigurations(message.data.jsonString);
                break;
            
            case 'resetConfigurations':
                await this._resetConfigurations();
                break;
            
            case 'browseDirectory':
                await this._browseDirectory();
                break;
            
            default:
                console.warn('Unknown message type:', message.type);
        }
    }

    /**
     * Send initial data to webview
     */
    private async _sendInitialData(): Promise<void> {
        if (!this._panel) return;

        this._panel.webview.postMessage({
            type: 'initialData',
            data: {
                configurations: this._currentData.configurations,
                settings: this._configManager.getSettings(),
                visualizationData: this._currentData
            }
        });
    }



    /**
     * Load a single file
     */
    private async _loadFile(filePath: string): Promise<void> {
        // Validate file size first
        const settings = this._configManager.getSettings();
        const isValidSize = await this._fileOps.validateFileSize(filePath, settings.fileSettings.maxFileSize);
        
        if (!isValidSize) {
            return;
        }

        const result = await this._errorHandler.safeExecute(async () => {
            const jsonContent = await this._fileOps.readJsonFile(filePath);
            
            if (jsonContent) {
                const parsedData = await this._jsonParser.parseFile(filePath, jsonContent, this._currentData.configurations);
                
                // Update current data
                this._currentData.entities = parsedData.entities;
                this._currentData.selectedFiles = [parsedData.fileName];
                
                // Transform and send data
                const visualizationData = this._dataTransformer.transformVisualizationData(
                    this._currentData.entities,
                    this._currentData.configurations,
                    this._currentData.selectedFiles,
                    this._currentData.filterState
                );
                
                this._currentData = visualizationData;
                
                if (this._panel) {
                    this._panel.webview.postMessage({
                        type: 'dataLoaded',
                        data: {
                            file: parsedData,
                            visualizationData
                        }
                    });
                }
            }
        }, 'loading file', ErrorType.FILE_SYSTEM);

        if (!result && this._panel) {
            this._panel.webview.postMessage({
                type: 'loadError',
                data: { filePath }
            });
        }
    }

    /**
     * Load multiple files
     */
    private async _loadMultipleFiles(filePaths: string[]): Promise<void> {
        // Validate file sizes first
        const settings = this._configManager.getSettings();
        const validFiles: string[] = [];
        
        for (const filePath of filePaths) {
            const isValidSize = await this._fileOps.validateFileSize(filePath, settings.fileSettings.maxFileSize);
            if (isValidSize) {
                validFiles.push(filePath);
            }
        }

        if (validFiles.length === 0) {
            return;
        }

        // Load files in parallel
        const fileContents = await this._fileOps.readMultipleJsonFiles(validFiles);
        const allEntities: TimelineEntity[] = [];
        const loadedFiles: string[] = [];

        for (const [filePath, jsonContent] of fileContents.entries()) {
            const result = await this._errorHandler.safeExecute(async () => {
                const parsedData = await this._jsonParser.parseFile(filePath, jsonContent, this._currentData.configurations);
                allEntities.push(...parsedData.entities);
                loadedFiles.push(parsedData.fileName);
            }, `processing file ${filePath}`, ErrorType.JSON_PARSING);
        }

        // Update current data
        this._currentData.entities = allEntities;
        this._currentData.selectedFiles = loadedFiles;
        
        // Transform and send data
        const visualizationData = this._dataTransformer.transformVisualizationData(
            this._currentData.entities,
            this._currentData.configurations,
            this._currentData.selectedFiles,
            this._currentData.filterState
        );
        
        this._currentData = visualizationData;
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'multipleFilesLoaded',
                data: {
                    loadedFiles,
                    visualizationData
                }
            });
        }
    }

    /**
     * Update configuration
     */
    private async _updateConfiguration(configData: ArrayConfig): Promise<void> {
        await this._configManager.addArrayConfig(configData);
        this._currentData.configurations = this._configManager.getArrayConfigs();
        
        // Refresh visualization data
        await this._refreshVisualizationData();
    }

    /**
     * Add new configuration
     */
    private async _addConfiguration(configData: ArrayConfig): Promise<void> {
        await this._configManager.addArrayConfig(configData);
        this._currentData.configurations = this._configManager.getArrayConfigs();
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configurationAdded',
                data: { configuration: configData }
            });
        }
        
        await this._refreshVisualizationData();
    }

    /**
     * Remove configuration
     */
    private async _removeConfiguration(name: string): Promise<void> {
        await this._configManager.removeArrayConfig(name);
        this._currentData.configurations = this._configManager.getArrayConfigs();
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configurationRemoved',
                data: { name }
            });
        }
        
        await this._refreshVisualizationData();
    }

    /**
     * Update filter state
     */
    private async _updateFilter(filterData: Partial<FilterState>): Promise<void> {
        this._currentData.filterState = { ...this._currentData.filterState, ...filterData };
        await this._refreshVisualizationData();
    }

    /**
     * Generate configuration suggestions
     */
    private async _generateConfigSuggestions(jsonContent: any): Promise<void> {
        const suggestions = this._configManager.generateConfigSuggestions(jsonContent);
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configSuggestions',
                data: { suggestions }
            });
        }
    }

    /**
     * Validate configuration
     */
    private async _validateConfiguration(configData: ArrayConfig): Promise<void> {
        const validation = this._errorHandler.validateConfiguration(configData);
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configValidation',
                data: validation
            });
        }
    }

    /**
     * Export configurations
     */
    private async _exportConfigurations(): Promise<void> {
        const exported = this._configManager.exportConfigurations();
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configurationsExported',
                data: { json: exported }
            });
        }
    }

    /**
     * Import configurations
     */
    private async _importConfigurations(jsonString: string): Promise<void> {
        const result = await this._errorHandler.safeExecute(async () => {
            await this._configManager.importConfigurations(jsonString);
            this._currentData.configurations = this._configManager.getArrayConfigs();
            
            if (this._panel) {
                this._panel.webview.postMessage({
                    type: 'configurationsImported',
                    data: { configurations: this._currentData.configurations }
                });
            }
            
            await this._refreshVisualizationData();
        }, 'importing configurations', ErrorType.CONFIGURATION);
    }

    /**
     * Reset configurations to defaults
     */
    private async _resetConfigurations(): Promise<void> {
        await this._configManager.resetToDefaults();
        this._currentData.configurations = this._configManager.getArrayConfigs();
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'configurationsReset',
                data: { configurations: this._currentData.configurations }
            });
        }
        
        await this._refreshVisualizationData();
    }

    /**
     * Refresh visualization data
     */
    private async _refreshVisualizationData(): Promise<void> {
        if (this._currentData.entities.length === 0) return;

        const visualizationData = this._dataTransformer.transformVisualizationData(
            this._currentData.entities,
            this._currentData.configurations,
            this._currentData.selectedFiles,
            this._currentData.filterState
        );
        
        this._currentData = visualizationData;
        
        if (this._panel) {
            this._panel.webview.postMessage({
                type: 'visualizationDataUpdated',
                data: { visualizationData }
            });
        }
    }
}