import { ArrayConfig, TimelineEntity, ParsedJsonData } from '../types';

export class JsonParserService {
    /**
     * Parse a JSON file and extract timeline entities based on configurations
     */
    public async parseFile(filePath: string, content: any, configs: ArrayConfig[]): Promise<ParsedJsonData> {
        const fileName = this.getFileNameFromPath(filePath);
        const entities: TimelineEntity[] = [];

        for (const config of configs) {
            if (!config.enabled) continue;

            try {
                const arrayData = this.resolveFluentPath(content, config.arrayPath);
                if (Array.isArray(arrayData)) {
                    const configEntities = this.extractArrayData(arrayData, config, filePath, fileName);
                    entities.push(...configEntities);
                }
            } catch (error) {
                console.warn(`Failed to extract data for config ${config.name}:`, error);
            }
        }

        return {
            filePath,
            fileName,
            content,
            entities
        };
    }

    /**
     * Extract timeline entities from an array using the provided configuration
     */
    public extractArrayData(
        arrayData: any[], 
        config: ArrayConfig, 
        filePath: string, 
        fileName: string
    ): TimelineEntity[] {
        const entities: TimelineEntity[] = [];

        for (let i = 0; i < arrayData.length; i++) {
            const item = arrayData[i];
            
            try {
                const entity = this.createTimelineEntity(item, config, filePath, fileName, i);
                if (entity) {
                    entities.push(entity);
                }
            } catch (error) {
                console.warn(`Failed to create entity from item ${i} in ${config.name}:`, error);
            }
        }

        return entities;
    }

    /**
     * Create a timeline entity from a single array item
     */
    private createTimelineEntity(
        item: any, 
        config: ArrayConfig, 
        filePath: string, 
        fileName: string, 
        index: number
    ): TimelineEntity | null {
        // Extract start date
        const startDateValue = this.resolveFluentPath(item, config.startDatePath);
        const startDate = this.parseDate(startDateValue);
        if (!startDate) {
            console.warn(`Invalid start date for item ${index}: ${startDateValue}`);
            return null;
        }

        // Extract end date
        const endDateValue = this.resolveFluentPath(item, config.endDatePath);
        const endDate = this.parseDate(endDateValue);
        if (!endDate) {
            console.warn(`Invalid end date for item ${index}: ${endDateValue}`);
            return null;
        }

        // Extract optional Y-axis value
        let yValue: number | undefined;
        if (config.yAxisPath) {
            const yAxisValue = this.resolveFluentPath(item, config.yAxisPath);
            if (typeof yAxisValue === 'number') {
                yValue = yAxisValue;
            } else if (typeof yAxisValue === 'string') {
                const parsed = parseFloat(yAxisValue);
                if (!isNaN(parsed)) {
                    yValue = parsed;
                }
            }
        }

        // Extract ID
        let id: string;
        if (config.idPath) {
            const idValue = this.resolveFluentPath(item, config.idPath);
            id = String(idValue || `${config.name}-${index}`);
        } else {
            id = `${config.name}-${index}`;
        }

        return {
            id,
            startDate,
            endDate,
            yValue,
            sourceArray: config.name,
            sourceFile: fileName,
            originalData: item
        };
    }

    /**
     * Resolve a fluent path (dot notation) against an object
     * Examples: "data.events", "timeline.items[0].date", "user.profile.name"
     */
    public resolveFluentPath(obj: any, path: string): any {
        if (!obj || !path) {
            return undefined;
        }

        // Handle simple property access
        if (!path.includes('.') && !path.includes('[')) {
            return obj[path];
        }

        // Split path by dots, but handle array notation
        const parts = this.parseFluentPath(path);
        let current = obj;

        for (const part of parts) {
            if (current === null || current === undefined) {
                return undefined;
            }

            // Handle array access like "items[0]"
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
                // Simple property access
                current = current[part];
            }
        }

        return current;
    }

    /**
     * Parse a fluent path into its component parts
     */
    private parseFluentPath(path: string): string[] {
        const parts: string[] = [];
        let current = '';
        let inBrackets = false;

        for (let i = 0; i < path.length; i++) {
            const char = path[i];

            if (char === '[') {
                inBrackets = true;
                current += char;
            } else if (char === ']') {
                inBrackets = false;
                current += char;
            } else if (char === '.' && !inBrackets) {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }

        if (current) {
            parts.push(current);
        }

        return parts;
    }

    /**
     * Parse various date formats into Date objects
     */
    public parseDate(dateValue: any): Date | null {
        if (!dateValue) {
            return null;
        }

        // If already a Date object
        if (dateValue instanceof Date) {
            return isNaN(dateValue.getTime()) ? null : dateValue;
        }

        // If it's a number (timestamp)
        if (typeof dateValue === 'number') {
            const date = new Date(dateValue);
            return isNaN(date.getTime()) ? null : date;
        }

        // If it's a string
        if (typeof dateValue === 'string') {
            // Try ISO format first
            let date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
                return date;
            }

            // Try parsing as timestamp
            const timestamp = parseInt(dateValue, 10);
            if (!isNaN(timestamp)) {
                date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    return date;
                }
            }

            // Try common date formats
            const formats = [
                /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
                /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
                /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
            ];

            for (const format of formats) {
                if (format.test(dateValue)) {
                    date = new Date(dateValue);
                    if (!isNaN(date.getTime())) {
                        return date;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Validate if a date format is supported
     */
    public validateDateFormat(dateString: string): boolean {
        return this.parseDate(dateString) !== null;
    }

    /**
     * Extract filename from file path
     */
    private getFileNameFromPath(filePath: string): string {
        return filePath.split('/').pop() || filePath.split('\\').pop() || filePath;
    }

    /**
     * Validate a fluent path against a sample object
     */
    public validateFluentPath(obj: any, path: string): boolean {
        try {
            const result = this.resolveFluentPath(obj, path);
            return result !== undefined;
        } catch {
            return false;
        }
    }

    /**
     * Get all possible paths in an object (for configuration assistance)
     */
    public getAvailablePaths(obj: any, maxDepth: number = 3): string[] {
        const paths: string[] = [];
        
        const traverse = (current: any, currentPath: string, depth: number) => {
            if (depth > maxDepth || current === null || current === undefined) {
                return;
            }

            if (typeof current === 'object' && !Array.isArray(current)) {
                for (const key in current) {
                    if (current.hasOwnProperty(key)) {
                        const newPath = currentPath ? `${currentPath}.${key}` : key;
                        paths.push(newPath);
                        traverse(current[key], newPath, depth + 1);
                    }
                }
            } else if (Array.isArray(current) && current.length > 0) {
                // Add array path
                paths.push(currentPath);
                // Sample first item for structure
                const samplePath = `${currentPath}[0]`;
                paths.push(samplePath);
                traverse(current[0], samplePath, depth + 1);
            }
        };

        traverse(obj, '', 0);
        return paths.filter(path => path.length > 0);
    }
}