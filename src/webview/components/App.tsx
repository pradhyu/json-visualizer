import React, { useState, useEffect, useCallback } from 'react';
import { ConfigurationPanel } from './ConfigurationPanel';
import { FileExplorer } from './FileExplorer';
import { TimelineChart } from './TimelineChart';
import { DataTable } from './DataTable';
import { ViewControls } from './ViewControls';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';

// VSCode API interface
declare global {
    interface Window {
        vscodeApi?: {
            postMessage: (message: any) => void;
            getState: () => any;
            setState: (state: any) => void;
        };
    }
}

// Use the global VSCode API that was set up in the HTML
const vscode = window.vscodeApi || {
    postMessage: () => console.warn('VSCode API not available'),
    getState: () => null,
    setState: () => {}
};

// Types for component state
interface AppState {
    isReady: boolean;
    configurations: any[];
    visualizationData: any;
    settings: any;
    selectedFiles: string[];
    currentDirectory: string;
    availableFiles: any[];
    showChart: boolean;
    showTable: boolean;
    showConfig: boolean;
    loading: boolean;
    error: string | null;
}

export const App: React.FC = () => {
    const [state, setState] = useState<AppState>({
        isReady: false,
        configurations: [],
        visualizationData: null,
        settings: null,
        selectedFiles: [],
        currentDirectory: '',
        availableFiles: [],
        showChart: true,
        showTable: true,
        showConfig: false,
        loading: false,
        error: null
    });

    // Message handler
    const handleMessage = useCallback((event: MessageEvent) => {
        const message = event.data;
        
        switch (message.type) {
            case 'initialData':
                setState(prev => ({
                    ...prev,
                    configurations: message.data.configurations,
                    settings: message.data.settings,
                    visualizationData: message.data.visualizationData,
                    isReady: true
                }));
                break;
                
            case 'dataLoaded':
                setState(prev => ({
                    ...prev,
                    visualizationData: message.data.visualizationData,
                    selectedFiles: [message.data.file.fileName],
                    loading: false,
                    error: null
                }));
                break;
                
            case 'multipleFilesLoaded':
                setState(prev => ({
                    ...prev,
                    visualizationData: message.data.visualizationData,
                    selectedFiles: message.data.loadedFiles,
                    loading: false,
                    error: null
                }));
                break;
                
            case 'directoryLoaded':
                setState(prev => ({
                    ...prev,
                    currentDirectory: message.data.directoryPath,
                    availableFiles: message.data.files
                }));
                break;
                
            case 'visualizationDataUpdated':
                setState(prev => ({
                    ...prev,
                    visualizationData: message.data.visualizationData
                }));
                break;
                
            case 'configurationAdded':
            case 'configurationRemoved':
            case 'configurationsImported':
            case 'configurationsReset':
                setState(prev => ({
                    ...prev,
                    configurations: message.data.configurations || prev.configurations
                }));
                break;
                
            case 'loadError':
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: `Failed to load file: ${message.data.filePath}`
                }));
                break;
                
            case 'error':
                setState(prev => ({
                    ...prev,
                    error: message.data.message,
                    loading: false
                }));
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('message', handleMessage);
        
        // Notify extension that webview is ready
        vscode.postMessage({ type: 'ready' });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [handleMessage]);

    // Event handlers
    const handleFileSelect = useCallback((filePaths: string[]) => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        if (filePaths.length === 1) {
            vscode.postMessage({
                type: 'loadFile',
                data: { filePath: filePaths[0] }
            });
        } else {
            vscode.postMessage({
                type: 'loadFiles',
                data: { filePaths }
            });
        }
    }, []);

    const handleConfigurationUpdate = useCallback((config: any) => {
        vscode.postMessage({
            type: 'updateConfiguration',
            data: config
        });
    }, []);

    const handleFilterUpdate = useCallback((filterData: any) => {
        vscode.postMessage({
            type: 'updateFilter',
            data: filterData
        });
    }, []);

    const handleViewToggle = useCallback((viewType: 'chart' | 'table' | 'config') => {
        setState(prev => ({
            ...prev,
            [`show${viewType.charAt(0).toUpperCase() + viewType.slice(1)}`]: !prev[`show${viewType.charAt(0).toUpperCase() + viewType.slice(1)}` as keyof AppState]
        }));
    }, []);

    if (!state.isReady) {
        return (
            <div className="loading-container">
                <LoadingSpinner message="Initializing JSON Timeline Visualizer..." size="large" />
            </div>
        );
    }

    const hasData = state.visualizationData && state.visualizationData.entities.length > 0;

    return (
        <ErrorBoundary>
            <div className="app-container">
                <header className="app-header">
                    <h1>JSON Timeline Visualizer</h1>
                    <ViewControls
                        showChart={state.showChart}
                        showTable={state.showTable}
                        showConfig={state.showConfig}
                        onToggle={handleViewToggle}
                    />
                </header>

                {state.error && (
                    <div className="error-banner">
                        <span>⚠️ {state.error}</span>
                        <button onClick={() => setState(prev => ({ ...prev, error: null }))}>
                            ✕
                        </button>
                    </div>
                )}

                <div className="app-content">
                    <aside className="sidebar" role="complementary" aria-label="File explorer and configuration panel">
                        {state.currentDirectory && (
                            <ErrorBoundary fallback={
                                <div className="sidebar-error" role="alert">
                                    <p>Error loading file explorer</p>
                                    <button onClick={() => window.location.reload()}>Reload</button>
                                </div>
                            }>
                                <FileExplorer
                                    currentDirectory={state.currentDirectory}
                                    availableFiles={state.availableFiles}
                                    selectedFiles={state.selectedFiles}
                                    onFileSelect={handleFileSelect}
                                    onDirectoryChange={(directoryPath: string) => {
                                        vscode.postMessage({
                                            type: 'readDirectory',
                                            data: { directoryPath }
                                        });
                                    }}
                                    loading={state.loading}
                                />
                            </ErrorBoundary>
                        )}
                        
                        {state.showConfig && (
                            <ErrorBoundary fallback={
                                <div className="config-error">
                                    <p>Error loading configuration panel</p>
                                </div>
                            }>
                                <ConfigurationPanel
                                    configurations={state.configurations}
                                    settings={state.settings}
                                    onConfigurationUpdate={handleConfigurationUpdate}
                                />
                            </ErrorBoundary>
                        )}
                    </aside>

                    <main className="main-content" role="main" aria-label="Timeline visualization and data table">
                        {state.loading && (
                            <div className="loading-overlay">
                                <LoadingSpinner message="Processing JSON files..." />
                            </div>
                        )}
                        
                        {!hasData && !state.loading ? (
                            <EmptyState
                                icon="📊"
                                title="Welcome to JSON Timeline Visualizer"
                                description="Right-click on a JSON file or directory in the Explorer and select 'Open JSON Timeline Visualizer' to get started. This extension will help you visualize temporal data in your JSON files as interactive timeline charts with tabular editing capabilities."
                                action={{
                                    label: "Browse for Files",
                                    onClick: () => {
                                        vscode.postMessage({ type: 'browseDirectory' });
                                    }
                                }}
                            />
                        ) : hasData ? (
                            <div className="visualization-container">
                                {state.showChart && (
                                    <ErrorBoundary fallback={
                                        <div className="chart-error">
                                            <EmptyState
                                                icon="⚠️"
                                                title="Chart Error"
                                                description="Unable to render the timeline chart. Please check your data format and try again."
                                                action={{
                                                    label: "Reload Data",
                                                    onClick: () => window.location.reload()
                                                }}
                                            />
                                        </div>
                                    }>
                                        <div className="chart-section">
                                            <TimelineChart
                                                data={state.visualizationData}
                                                settings={state.settings}
                                                onFilterUpdate={handleFilterUpdate}
                                            />
                                        </div>
                                    </ErrorBoundary>
                                )}
                                
                                {state.showTable && (
                                    <ErrorBoundary fallback={
                                        <div className="table-error">
                                            <EmptyState
                                                icon="⚠️"
                                                title="Table Error"
                                                description="Unable to render the data table. Please check your data format and try again."
                                                action={{
                                                    label: "Reload Data",
                                                    onClick: () => window.location.reload()
                                                }}
                                            />
                                        </div>
                                    }>
                                        <div className="table-section">
                                            <DataTable
                                                data={state.visualizationData}
                                                settings={state.settings}
                                                onFilterUpdate={handleFilterUpdate}
                                                onDataSave={(data: any) => {
                                                    vscode.postMessage({
                                                        type: 'saveFile',
                                                        data
                                                    });
                                                }}
                                            />
                                        </div>
                                    </ErrorBoundary>
                                )}
                            </div>
                        ) : null}
                    </main>
                </div>
            </div>
        </ErrorBoundary>
    );
};