import * as vscode from 'vscode';
import { ArrayConfig, ExtensionSettings } from '../types';

export class ConfigurationManager {
    private static readonly EXTENSION_ID = 'jsonTimelineVisualizer';
    private static readonly CONFIG_KEY = 'configurations';
    
    private _configurations: ArrayConfig[] = [];
    private _settings: ExtensionSettings;

    constructor() {
        this._settings = this.loadSettings();
        this._configurations = this.loadConfigurations();
    }

    /**
     * Get all array configurations
     */
    public getArrayConfigs(): ArrayConfig[] {
        return [...this._configurations];
    }

    /**
     * Set array configurations
     */
    public async setArrayConfigs(configs: ArrayConfig[]): Promise<void> {
        this._configurations = [...configs];
        await this.saveConfigurations();
    }

    /**
     * Add a new array configuration
     */
    public async addArrayConfig(config: ArrayConfig): Promise<void> {
        // Ensure unique name
        const existingIndex = this._configurations.findIndex(c => c.name === config.name);
        if (existingIndex >= 0) {
            this._configurations[existingIndex] = config;
        } else {
            this._configurations.push(config);
        }
        await this.saveConfigurations();
    }

    /**
     * Remove an array configuration
     */
    public async removeArrayConfig(name: string): Promise<void> {
        this._configurations = this._configurations.filter(c => c.name !== name);
        await this.saveConfigurations();
    }

    /**
     * Get configuration by name
     */
    public getArrayConfig(name: string): ArrayConfig | undefined {
        return this._configurations.find(c => c.name === name);
    }

    /**
     * Update a specific configuration
     */
    public async updateArrayConfig(name: string, updates: Partial<ArrayConfig>): Promise<void> {
        const index = this._configurations.findIndex(c => c.name === name);
        if (index >= 0) {
            this._configurations[index] = { ...this._configurations[index], ...updates };
            await this.saveConfigurations();
        }
    }

    /**
     * Get default configurations for common JSON structures
     */
    public getDefaultConfigs(): ArrayConfig[] {
        return [
            {
                name: 'events',
                arrayPath: 'events',
                startDatePath: 'startDate',
                endDatePath: 'endDate',
                yAxisPath: 'priority',
                idPath: 'id',
                color: '#1f77b4',
                enabled: true
            },
            {
                name: 'timeline',
                arrayPath: 'timeline',
                startDatePath: 'start',
                endDatePath: 'end',
                yAxisPath: 'level',
                idPath: 'name',
                color: '#ff7f0e',
                enabled: true
            },
            {
                name: 'tasks',
                arrayPath: 'data.tasks',
                startDatePath: 'startTime',
                endDatePath: 'endTime',
                yAxisPath: 'priority',
                idPath: 'taskId',
                color: '#2ca02c',
                enabled: true
            },
            {
                name: 'deployments',
                arrayPath: 'deployments',
                startDatePath: 'deployedAt',
                endDatePath: 'completedAt',
                yAxisPath: 'environment',
                idPath: 'version',
                color: '#d62728',
                enabled: true
            },
            {
                name: 'projects',
                arrayPath: 'projects',
                startDatePath: 'startDate',
                endDatePath: 'endDate',
                yAxisPath: 'budget',
                idPath: 'projectName',
                color: '#9467bd',
                enabled: true
            }
        ];
    }

    /**
     * Validate a fluent path against sample JSON data
     */
    public validateFluentPath(path: string, json: any): boolean {
        if (!path || !json) {
            return false;
        }

        try {
            const result = this.resolveFluentPath(json, path);
            return result !== undefined;
        } catch {
            return false;
        }
    }

    /**
     * Resolve fluent path (simplified version for validation)
     */
    private resolveFluentPath(obj: any, path: string): any {
        if (!obj || !path) {
            return undefined;
        }

        const parts = path.split('.');
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }

            // Handle array access
            if (part.includes('[') && part.includes(']')) {
                const arrayMatch = part.match(/^([^[]+)\[(\d+)\]$/);
                if (arrayMatch) {
                    const [, arrayName, indexStr] = arrayMatch;
                    const index = parseInt(indexStr, 10);
                    
                    if (current[arrayName] && Array.isArray(current[arrayName])) {
                        current = current[arrayName][index];
                    } else {
                        return undefined;
                    }
                } else {
                    return undefined;
                }
            } else {
                current = current[part];
            }
        }

        return current;
    }

    /**
     * Generate configuration suggestions based on JSON structure
     */
    public generateConfigSuggestions(json: any): ArrayConfig[] {
        const suggestions: ArrayConfig[] = [];
        const colorPalette = this._settings.chartSettings.colorPalette;
        let colorIndex = 0;

        const findArrays = (obj: any, path: string = '') => {
            if (!obj || typeof obj !== 'object') {
                return;
            }

            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const value = obj[key];
                    const currentPath = path ? `${path}.${key}` : key;

                    if (Array.isArray(value) && value.length > 0) {
                        // Found an array, analyze its structure
                        const sample = value[0];
                        const config = this.analyzeArrayStructure(key, currentPath, sample, colorPalette[colorIndex % colorPalette.length]);
                        if (config) {
                            suggestions.push(config);
                            colorIndex++;
                        }
                    } else if (typeof value === 'object') {
                        // Recurse into nested objects
                        findArrays(value, currentPath);
                    }
                }
            }
        };

        findArrays(json);
        return suggestions;
    }

    /**
     * Analyze array structure to suggest configuration
     */
    private analyzeArrayStructure(name: string, arrayPath: string, sample: any, color: string): ArrayConfig | null {
        if (!sample || typeof sample !== 'object') {
            return null;
        }

        // Look for date-like properties
        const dateFields = this.findDateFields(sample);
        if (dateFields.length < 2) {
            return null; // Need at least start and end dates
        }

        // Look for numeric fields for Y-axis
        const numericFields = this.findNumericFields(sample);
        
        // Look for ID-like fields
        const idFields = this.findIdFields(sample);

        return {
            name,
            arrayPath,
            startDatePath: dateFields[0] || 'startDate',
            endDatePath: dateFields[1] || 'endDate',
            yAxisPath: numericFields[0],
            idPath: idFields[0],
            color,
            enabled: true
        };
    }

    /**
     * Find potential date fields in an object
     */
    private findDateFields(obj: any): string[] {
        const dateFields: string[] = [];
        const dateKeywords = ['date', 'time', 'start', 'end', 'begin', 'finish', 'created', 'updated', 'deployed'];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const lowerKey = key.toLowerCase();

                // Check if key contains date keywords
                const hasDateKeyword = dateKeywords.some(keyword => lowerKey.includes(keyword));
                
                // Check if value looks like a date
                const looksLikeDate = this.looksLikeDate(value);

                if (hasDateKeyword || looksLikeDate) {
                    dateFields.push(key);
                }
            }
        }

        // Sort by preference (start dates first, then end dates)
        return dateFields.sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            
            if (aLower.includes('start') || aLower.includes('begin')) return -1;
            if (bLower.includes('start') || bLower.includes('begin')) return 1;
            if (aLower.includes('end') || aLower.includes('finish')) return -1;
            if (bLower.includes('end') || bLower.includes('finish')) return 1;
            
            return 0;
        });
    }

    /**
     * Find potential numeric fields for Y-axis
     */
    private findNumericFields(obj: any): string[] {
        const numericFields: string[] = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (typeof value === 'number') {
                    numericFields.push(key);
                }
            }
        }

        return numericFields;
    }

    /**
     * Find potential ID fields
     */
    private findIdFields(obj: any): string[] {
        const idFields: string[] = [];
        const idKeywords = ['id', 'name', 'title', 'key', 'identifier', 'uuid'];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const lowerKey = key.toLowerCase();
                if (idKeywords.some(keyword => lowerKey.includes(keyword))) {
                    idFields.push(key);
                }
            }
        }

        return idFields;
    }

    /**
     * Check if a value looks like a date
     */
    private looksLikeDate(value: any): boolean {
        if (!value) return false;

        // Check if it's already a Date
        if (value instanceof Date) return true;

        // Check if it's a timestamp (number)
        if (typeof value === 'number' && value > 946684800000) { // After year 2000
            return true;
        }

        // Check if it's a date string
        if (typeof value === 'string') {
            const dateRegex = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
            return dateRegex.test(value);
        }

        return false;
    }

    /**
     * Load extension settings
     */
    private loadSettings(): ExtensionSettings {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.EXTENSION_ID);
        
        return {
            defaultConfigurations: config.get('defaultConfigurations', []),
            chartSettings: config.get('chartSettings', {
                defaultHeight: 400,
                colorPalette: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
                animationDuration: 300
            }),
            tableSettings: config.get('tableSettings', {
                pageSize: 100,
                enableEditing: true,
                autoSave: false
            }),
            fileSettings: config.get('fileSettings', {
                watchForChanges: true,
                maxFileSize: 10485760, // 10MB
                supportedExtensions: ['.json']
            })
        };
    }

    /**
     * Load configurations from JSON file or VSCode settings
     */
    private loadConfigurations(): ArrayConfig[] {
        // Try to load from workspace JSON file first
        const workspaceConfigs = this.loadFromJsonFile();
        if (workspaceConfigs.length > 0) {
            return workspaceConfigs;
        }

        // Fall back to VSCode settings
        const config = vscode.workspace.getConfiguration(ConfigurationManager.EXTENSION_ID);
        const stored = config.get<ArrayConfig[]>(ConfigurationManager.CONFIG_KEY, []);
        
        // If no stored configurations, return defaults
        if (stored.length === 0) {
            return this.getDefaultConfigs();
        }
        
        return stored;
    }

    /**
     * Load configurations from timeline-config.json file in workspace
     */
    private loadFromJsonFile(): ArrayConfig[] {
        try {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders || workspaceFolders.length === 0) {
                return [];
            }

            const configPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'timeline-config.json');
            const configContent = vscode.workspace.fs.readFile(configPath);
            
            return configContent.then(content => {
                const configData = JSON.parse(content.toString());
                return configData.configurations || [];
            }).catch(() => []);
        } catch (error) {
            return [];
        }
    }

    /**
     * Save configurations to VSCode settings
     */
    private async saveConfigurations(): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.EXTENSION_ID);
        await config.update(ConfigurationManager.CONFIG_KEY, this._configurations, vscode.ConfigurationTarget.Workspace);
    }

    /**
     * Get extension settings
     */
    public getSettings(): ExtensionSettings {
        return { ...this._settings };
    }

    /**
     * Update extension settings
     */
    public async updateSettings(updates: Partial<ExtensionSettings>): Promise<void> {
        const config = vscode.workspace.getConfiguration(ConfigurationManager.EXTENSION_ID);
        
        for (const [key, value] of Object.entries(updates)) {
            await config.update(key, value, vscode.ConfigurationTarget.Workspace);
        }
        
        this._settings = { ...this._settings, ...updates };
    }

    /**
     * Reset configurations to defaults
     */
    public async resetToDefaults(): Promise<void> {
        this._configurations = this.getDefaultConfigs();
        await this.saveConfigurations();
    }

    /**
     * Export configurations as JSON
     */
    public exportConfigurations(): string {
        return JSON.stringify(this._configurations, null, 2);
    }

    /**
     * Import configurations from JSON
     */
    public async importConfigurations(jsonString: string): Promise<void> {
        try {
            const imported = JSON.parse(jsonString) as ArrayConfig[];
            
            // Validate imported configurations
            const valid = imported.filter(config => this.validateConfiguration(config));
            
            if (valid.length > 0) {
                this._configurations = valid;
                await this.saveConfigurations();
            } else {
                throw new Error('No valid configurations found in import data');
            }
        } catch (error) {
            throw new Error(`Failed to import configurations: ${error}`);
        }
    }

    /**
     * Validate a configuration object
     */
    private validateConfiguration(config: any): config is ArrayConfig {
        return (
            config &&
            typeof config.name === 'string' &&
            typeof config.arrayPath === 'string' &&
            typeof config.startDatePath === 'string' &&
            typeof config.endDatePath === 'string' &&
            typeof config.color === 'string' &&
            typeof config.enabled === 'boolean'
        );
    }
}