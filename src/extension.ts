import * as vscode from 'vscode';
import { TimelineVisualizerProvider } from './providers/TimelineVisualizerProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('JSON Timeline Visualizer extension is now active');

    // Register the webview provider
    const provider = new TimelineVisualizerProvider(context.extensionUri);

    // Register commands
    const openVisualizerCommand = vscode.commands.registerCommand(
        'jsonTimelineVisualizer.openVisualizer',
        (uri?: vscode.Uri) => {
            provider.openVisualizer(uri);
        }
    );

    const openDirectoryCommand = vscode.commands.registerCommand(
        'jsonTimelineVisualizer.openDirectory',
        (uri?: vscode.Uri) => {
            provider.openDirectory(uri);
        }
    );

    // Register webview panel serializer for persistence
    const webviewPanelSerializer = vscode.window.registerWebviewPanelSerializer(
        TimelineVisualizerProvider.viewType,
        provider
    );

    // Add to subscriptions for proper cleanup
    context.subscriptions.push(
        openVisualizerCommand,
        openDirectoryCommand,
        webviewPanelSerializer
    );
}

export function deactivate() {
    console.log('JSON Timeline Visualizer extension is now deactivated');
}