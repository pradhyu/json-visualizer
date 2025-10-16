import React, { useState, useCallback, useEffect } from 'react';

interface FileInfo {
    name: string;
    path: string;
    size?: number;
    lastModified?: Date;
    isDirectory?: boolean;
}

interface FileExplorerProps {
    currentDirectory: string;
    availableFiles: FileInfo[];
    selectedFiles: string[];
    onFileSelect: (filePaths: string[]) => void;
    onDirectoryChange?: (directoryPath: string) => void;
    loading: boolean;
}

// Use the global VSCode API
const vscode = window.vscodeApi || {
    postMessage: () => console.warn('VSCode API not available')
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
    currentDirectory,
    availableFiles,
    selectedFiles,
    onFileSelect,
    onDirectoryChange,
    loading
}) => {
    const [checkedFiles, setCheckedFiles] = useState<Set<string>>(new Set());
    const [expandedDirectories, setExpandedDirectories] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filterText, setFilterText] = useState('');

    // Clear checked files when directory changes
    useEffect(() => {
        setCheckedFiles(new Set());
    }, [currentDirectory]);

    const handleFileCheck = useCallback((filePath: string, checked: boolean) => {
        const newCheckedFiles = new Set(checkedFiles);
        
        if (checked) {
            newCheckedFiles.add(filePath);
        } else {
            newCheckedFiles.delete(filePath);
        }
        
        setCheckedFiles(newCheckedFiles);
    }, [checkedFiles]);

    const handleLoadSelected = useCallback(() => {
        const filePaths = Array.from(checkedFiles);
        if (filePaths.length > 0) {
            onFileSelect(filePaths);
        }
    }, [checkedFiles, onFileSelect]);

    const handleSelectAll = useCallback(() => {
        const jsonFiles = availableFiles.filter(file => !file.isDirectory);
        const allPaths = new Set(jsonFiles.map(file => file.path));
        setCheckedFiles(allPaths);
    }, [availableFiles]);

    const handleClearAll = useCallback(() => {
        setCheckedFiles(new Set());
    }, []);

    const handleDirectoryClick = useCallback((directoryPath: string) => {
        if (onDirectoryChange) {
            onDirectoryChange(directoryPath);
        } else {
            // Request directory contents from extension
            vscode.postMessage({
                type: 'readDirectory',
                data: { directoryPath }
            });
        }
    }, [onDirectoryChange]);

    const handleBrowseDirectory = useCallback(() => {
        vscode.postMessage({
            type: 'browseDirectory'
        });
    }, []);

    const handleRefresh = useCallback(() => {
        if (currentDirectory) {
            vscode.postMessage({
                type: 'readDirectory',
                data: { directoryPath: currentDirectory }
            });
        }
    }, [currentDirectory]);

    const formatFileSize = useCallback((bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const formatDate = useCallback((date: Date) => {
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, []);

    // Filter and sort files
    const processedFiles = useCallback(() => {
        let filtered = availableFiles;

        // Apply text filter
        if (filterText) {
            filtered = filtered.filter(file => 
                file.name.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        // Sort files
        filtered.sort((a, b) => {
            // Directories first
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;

            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0);
                    break;
                case 'modified':
                    const aTime = a.lastModified?.getTime() || 0;
                    const bTime = b.lastModified?.getTime() || 0;
                    comparison = aTime - bTime;
                    break;
            }

            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [availableFiles, filterText, sortBy, sortOrder]);

    const handleSort = useCallback((newSortBy: 'name' | 'size' | 'modified') => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    }, [sortBy, sortOrder]);

    const jsonFileCount = availableFiles.filter(file => !file.isDirectory).length;
    const checkedCount = checkedFiles.size;

    return (
        <div className="file-explorer">
            <div className="explorer-header">
                <h3>File Explorer</h3>
                <div className="explorer-actions">
                    <button 
                        onClick={handleBrowseDirectory}
                        className="browse-button"
                        title="Browse for directory"
                    >
                        📁
                    </button>
                    <button 
                        onClick={handleRefresh}
                        className="refresh-button"
                        disabled={!currentDirectory || loading}
                        title="Refresh directory"
                    >
                        🔄
                    </button>
                </div>
            </div>

            {currentDirectory ? (
                <>
                    <div className="directory-info">
                        <div className="directory-path" title={currentDirectory}>
                            <strong>Directory:</strong>
                            <span>{currentDirectory}</span>
                        </div>
                        <div className="file-stats">
                            {jsonFileCount} JSON files found
                        </div>
                    </div>

                    <div className="file-filter">
                        <input
                            type="text"
                            placeholder="Filter files..."
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            className="filter-input"
                        />
                    </div>

                    <div className="sort-controls">
                        <button 
                            onClick={() => handleSort('name')}
                            className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
                        >
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button 
                            onClick={() => handleSort('size')}
                            className={`sort-button ${sortBy === 'size' ? 'active' : ''}`}
                        >
                            Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                        <button 
                            onClick={() => handleSort('modified')}
                            className={`sort-button ${sortBy === 'modified' ? 'active' : ''}`}
                        >
                            Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                    </div>
                    
                    {jsonFileCount > 0 ? (
                        <>
                            <div className="file-controls">
                                <button 
                                    onClick={handleSelectAll}
                                    disabled={loading}
                                    className="control-button"
                                >
                                    Select All
                                </button>
                                <button 
                                    onClick={handleClearAll}
                                    disabled={loading}
                                    className="control-button"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={handleLoadSelected}
                                    disabled={loading || checkedCount === 0}
                                    className="load-button"
                                >
                                    {loading ? 'Loading...' : `Load Selected (${checkedCount})`}
                                </button>
                            </div>
                            
                            <div className="file-list">
                                {processedFiles().map((file, index) => (
                                    <div key={index} className={`file-item ${file.isDirectory ? 'directory' : 'file'}`}>
                                        {file.isDirectory ? (
                                            <div 
                                                className="directory-item"
                                                onClick={() => handleDirectoryClick(file.path)}
                                            >
                                                <span className="directory-icon">📁</span>
                                                <span className="file-name" title={file.path}>
                                                    {file.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <label className="json-file-item">
                                                <input
                                                    type="checkbox"
                                                    checked={checkedFiles.has(file.path)}
                                                    onChange={(e) => handleFileCheck(file.path, e.target.checked)}
                                                    disabled={loading}
                                                />
                                                <div className="file-details">
                                                    <div className="file-name-row">
                                                        <span className="file-name" title={file.path}>
                                                            {file.name}
                                                        </span>
                                                        {selectedFiles.some(sf => file.path.endsWith(sf)) && (
                                                            <span className="loaded-indicator" title="Currently loaded">✓</span>
                                                        )}
                                                    </div>
                                                    <div className="file-meta">
                                                        {file.size !== undefined && (
                                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                                        )}
                                                        {file.lastModified && (
                                                            <span className="file-date">{formatDate(file.lastModified)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="no-files">
                            {filterText ? 
                                `No JSON files match "${filterText}"` : 
                                'No JSON files found in this directory'
                            }
                        </div>
                    )}
                </>
            ) : (
                <div className="no-directory">
                    <p>No directory selected</p>
                    <button onClick={handleBrowseDirectory} className="browse-button-large">
                        Browse for Directory
                    </button>
                </div>
            )}
        </div>
    );
};