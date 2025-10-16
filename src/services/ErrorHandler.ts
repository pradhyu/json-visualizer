import * as vscode from 'vscode';

export enum ErrorType {
    FILE_SYSTEM = 'FILE_SYSTEM',
    JSON_PARSING = 'JSON_PARSING',
    CONFIGURATION = 'CONFIGURATION',
    VISUALIZATION = 'VISUALIZATION',
    VALIDATION = 'VALIDATION'
}

export interface ExtensionError {
    type: ErrorType;
    message: string;
    details?: string;
    code?: string;
    filePath?: string;
    suggestions?: string[];
}

export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorLog: ExtensionError[] = [];

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    /**
     * Handle file system errors
     */
    public handleFileError(error: any, filePath?: string): ExtensionError {
        let message = 'File operation failed';
        let suggestions: string[] = [];

        if (error.code === 'ENOENT') {
            message = `File not found: ${filePath || 'Unknown file'}`;
            suggestions = [
                'Check if the file path is correct',
                'Ensure the file exists in the specified location',
                'Verify you have read permissions for the file'
            ];
        } else if (error.code === 'EACCES') {
            message = `Permission denied: ${filePath || 'Unknown file'}`;
            suggestions = [
                'Check file permissions',
                'Try running VSCode as administrator (if necessary)',
                'Ensure the file is not locked by another process'
            ];
        } else if (error.code === 'EMFILE' || error.code === 'ENFILE') {
            message = 'Too many files open';
            suggestions = [
                'Close some files and try again',
                'Restart VSCode to free up file handles'
            ];
        }

        const extensionError: ExtensionError = {
            type: ErrorType.FILE_SYSTEM,
            message,
            details: error.message,
            code: error.code,
            filePath,
            suggestions
        };

        this.logError(extensionError);
        this.showUserFriendlyMessage(extensionError);
        return extensionError;
    }

    /**
     * Handle JSON parsing errors
     */
    public handleParsingError(error: any, filePath?: string, content?: string): ExtensionError {
        let message = 'Failed to parse JSON file';
        let suggestions: string[] = [];

        if (error instanceof SyntaxError) {
            message = `Invalid JSON syntax in ${filePath || 'file'}`;
            suggestions = [
                'Check for missing commas, brackets, or quotes',
                'Use a JSON validator to identify syntax errors',
                'Ensure the file contains valid JSON data'
            ];

            // Try to extract line number from error message
            const lineMatch = error.message.match(/line (\d+)/i);
            if (lineMatch) {
                message += ` (around line ${lineMatch[1]})`;
            }
        } else if (error.message?.includes('Unexpected end of JSON input')) {
            message = `Incomplete JSON data in ${filePath || 'file'}`;
            suggestions = [
                'Check if the file was completely written',
                'Ensure the JSON structure is complete',
                'Try refreshing the file if it\'s being written by another process'
            ];
        }

        const extensionError: ExtensionError = {
            type: ErrorType.JSON_PARSING,
            message,
            details: error.message,
            filePath,
            suggestions
        };

        this.logError(extensionError);
        this.showUserFriendlyMessage(extensionError);
        return extensionError;
    }

    /**
     * Handle configuration errors
     */
    public handleConfigurationError(error: any, configName?: string): ExtensionError {
        let message = 'Configuration error';
        let suggestions: string[] = [];

        if (error.message?.includes('fluent path')) {
            message = `Invalid fluent path in configuration${configName ? ` "${configName}"` : ''}`;
            suggestions = [
                'Check the fluent path syntax (use dot notation like "data.events")',
                'Ensure the path exists in your JSON structure',
                'Use the path suggestion feature to find valid paths'
            ];
        } else if (error.message?.includes('date')) {
            message = `Invalid date configuration${configName ? ` in "${configName}"` : ''}`;
            suggestions = [
                'Ensure start and end date paths point to valid date fields',
                'Check that date values are in a supported format (ISO, timestamp, etc.)',
                'Verify that start dates come before end dates'
            ];
        } else if (error.message?.includes('array')) {
            message = `Array configuration error${configName ? ` in "${configName}"` : ''}`;
            suggestions = [
                'Ensure the array path points to an actual array in your JSON',
                'Check that the array contains objects with the required properties',
                'Verify the array is not empty'
            ];
        }

        const extensionError: ExtensionError = {
            type: ErrorType.CONFIGURATION,
            message,
            details: error.message,
            suggestions
        };

        this.logError(extensionError);
        this.showUserFriendlyMessage(extensionError);
        return extensionError;
    }

    /**
     * Handle visualization errors
     */
    public handleVisualizationError(error: any, context?: string): ExtensionError {
        let message = 'Visualization error';
        let suggestions: string[] = [];

        if (error.message?.includes('no data')) {
            message = 'No data available for visualization';
            suggestions = [
                'Check that your JSON files contain arrays with timeline data',
                'Verify your configuration paths are correct',
                'Ensure at least one array configuration is enabled'
            ];
        } else if (error.message?.includes('date range')) {
            message = 'Invalid date range for visualization';
            suggestions = [
                'Check that your data contains valid start and end dates',
                'Ensure dates are in a supported format',
                'Verify that end dates come after start dates'
            ];
        } else if (error.message?.includes('performance')) {
            message = 'Performance issue with large dataset';
            suggestions = [
                'Try filtering your data to reduce the number of entities',
                'Consider splitting large files into smaller ones',
                'Use date range filters to limit the visualization scope'
            ];
        }

        const extensionError: ExtensionError = {
            type: ErrorType.VISUALIZATION,
            message,
            details: error.message,
            suggestions
        };

        this.logError(extensionError);
        this.showUserFriendlyMessage(extensionError);
        return extensionError;
    }

    /**
     * Handle validation errors
     */
    public handleValidationError(errors: string[], context?: string): ExtensionError {
        const message = `Validation failed${context ? ` for ${context}` : ''}`;
        const suggestions = [
            'Review the validation errors below',
            'Check your data format and configuration',
            'Ensure all required fields are present and valid'
        ];

        const extensionError: ExtensionError = {
            type: ErrorType.VALIDATION,
            message,
            details: errors.join('; '),
            suggestions
        };

        this.logError(extensionError);
        this.showUserFriendlyMessage(extensionError);
        return extensionError;
    }

    /**
     * Show user-friendly error message
     */
    public showUserFriendlyMessage(error: ExtensionError): void {
        const action = error.suggestions && error.suggestions.length > 0 ? 'Show Help' : undefined;
        
        const options = action ? [action] : [];
        vscode.window.showErrorMessage(error.message, ...options).then(selection => {
            if (selection === 'Show Help' && error.suggestions) {
                this.showErrorHelp(error);
            }
        });
    }

    /**
     * Show detailed error help
     */
    private showErrorHelp(error: ExtensionError): void {
        const helpContent = [
            `**Error:** ${error.message}`,
            '',
            error.details ? `**Details:** ${error.details}` : '',
            '',
            '**Suggestions:**',
            ...error.suggestions!.map(suggestion => `• ${suggestion}`)
        ].filter(line => line !== '').join('\n');

        vscode.window.showInformationMessage(
            'Error Help',
            { modal: true, detail: helpContent }
        );
    }

    /**
     * Log error for debugging
     */
    private logError(error: ExtensionError): void {
        this.errorLog.push({
            ...error,
            details: `${new Date().toISOString()}: ${error.details}`
        });

        // Keep only last 100 errors
        if (this.errorLog.length > 100) {
            this.errorLog = this.errorLog.slice(-100);
        }

        // Log to console for development
        console.error(`[JSON Timeline Visualizer] ${error.type}: ${error.message}`, error.details);
    }

    /**
     * Get error log for debugging
     */
    public getErrorLog(): ExtensionError[] {
        return [...this.errorLog];
    }

    /**
     * Clear error log
     */
    public clearErrorLog(): void {
        this.errorLog = [];
    }

    /**
     * Create a safe error wrapper for async operations
     */
    public async safeExecute<T>(
        operation: () => Promise<T>,
        errorContext: string,
        errorType: ErrorType = ErrorType.VISUALIZATION
    ): Promise<T | null> {
        try {
            return await operation();
        } catch (error) {
            switch (errorType) {
                case ErrorType.FILE_SYSTEM:
                    this.handleFileError(error);
                    break;
                case ErrorType.JSON_PARSING:
                    this.handleParsingError(error);
                    break;
                case ErrorType.CONFIGURATION:
                    this.handleConfigurationError(error);
                    break;
                default:
                    this.handleVisualizationError(error, errorContext);
                    break;
            }
            return null;
        }
    }

    /**
     * Validate configuration and return detailed errors
     */
    public validateConfiguration(config: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check required fields
        if (!config.name || typeof config.name !== 'string') {
            errors.push('Configuration name is required and must be a string');
        }

        if (!config.arrayPath || typeof config.arrayPath !== 'string') {
            errors.push('Array path is required and must be a string');
        }

        if (!config.startDatePath || typeof config.startDatePath !== 'string') {
            errors.push('Start date path is required and must be a string');
        }

        if (!config.endDatePath || typeof config.endDatePath !== 'string') {
            errors.push('End date path is required and must be a string');
        }

        if (!config.color || typeof config.color !== 'string') {
            errors.push('Color is required and must be a string');
        } else if (!/^#[0-9A-Fa-f]{6}$/.test(config.color)) {
            errors.push('Color must be a valid hex color (e.g., #1f77b4)');
        }

        if (typeof config.enabled !== 'boolean') {
            errors.push('Enabled flag must be a boolean');
        }

        // Check optional fields
        if (config.yAxisPath && typeof config.yAxisPath !== 'string') {
            errors.push('Y-axis path must be a string if provided');
        }

        if (config.idPath && typeof config.idPath !== 'string') {
            errors.push('ID path must be a string if provided');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate fluent path syntax
     */
    public validateFluentPath(path: string): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!path || typeof path !== 'string') {
            errors.push('Path must be a non-empty string');
            return { isValid: false, errors };
        }

        // Check for invalid characters
        if (/[^a-zA-Z0-9._\[\]]/.test(path)) {
            errors.push('Path contains invalid characters. Use only letters, numbers, dots, and square brackets');
        }

        // Check for proper bracket syntax
        const brackets = path.match(/\[|\]/g);
        if (brackets) {
            if (brackets.length % 2 !== 0) {
                errors.push('Unmatched square brackets in path');
            }

            // Check for valid array indices
            const arrayAccess = path.match(/\[(\d+)\]/g);
            if (arrayAccess) {
                for (const access of arrayAccess) {
                    const index = access.match(/\[(\d+)\]/);
                    if (!index || isNaN(parseInt(index[1]))) {
                        errors.push('Array indices must be valid numbers');
                    }
                }
            }
        }

        // Check for consecutive dots
        if (path.includes('..')) {
            errors.push('Path cannot contain consecutive dots');
        }

        // Check for leading/trailing dots
        if (path.startsWith('.') || path.endsWith('.')) {
            errors.push('Path cannot start or end with a dot');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}