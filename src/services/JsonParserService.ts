import { ArrayConfig, TimelineEntity, ParsedJsonData } from '../types';

export class JsonParserService {
    /**
     * Parse a JSON file and extract timeline entities based on configurations
     */
    public async parseFile(filePath: string, content: any, configs: ArrayConfig[]): Promise<ParsedJsonData> {
        const fileName = this.getFileNameFromPath(filePath);
        const entities: TimelineEntity[] = [];

        // First try auto-detection if no configs are enabled or available
        const enabledConfigs = configs.filter(c => c.enabled);
        if (enabledConfigs.length === 0) {
            const autoDetectedEntities = this.autoDetectTimelineArrays(content, filePath, fileName);
            entities.push(...autoDetectedEntities);
        } else {
            // Use provided configurations
            for (const config of enabledConfigs) {
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
        }

        return {
            filePath,
            fileName,
            content,
            entities
        };
    }

    /**
     * Auto-detect timeline arrays in JSON based on common patterns
     */
    public autoDetectTimelineArrays(content: any, filePath: string, fileName: string): TimelineEntity[] {
        const entities: TimelineEntity[] = [];
        
        // Recursively search for arrays that might contain timeline data
        this.searchForTimelineArrays(content, '', entities, filePath, fileName);
        
        return entities;
    }

    /**
     * Recursively search for arrays that contain timeline data
     */
    private searchForTimelineArrays(
        obj: any, 
        currentPath: string, 
        entities: TimelineEntity[], 
        filePath: string, 
        fileName: string
    ): void {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
            const fullPath = currentPath ? `${currentPath}.${key}` : key;
            
            if (Array.isArray(value) && value.length > 0) {
                // Check if this array contains timeline data
                const timelineItems = this.extractTimelineFromArray(value, key, filePath, fileName);
                if (timelineItems.length > 0) {
                    entities.push(...timelineItems);
                }
            } else if (typeof value === 'object' && value !== null) {
                // Recursively search nested objects
                this.searchForTimelineArrays(value, fullPath, entities, filePath, fileName);
            }
        }
    }

    /**
     * Extract timeline entities from an array if it contains valid timeline data
     */
    private extractTimelineFromArray(
        arrayData: any[], 
        arrayName: string, 
        filePath: string, 
        fileName: string
    ): TimelineEntity[] {
        const entities: TimelineEntity[] = [];
        
        for (let i = 0; i < arrayData.length; i++) {
            const item = arrayData[i];
            
            if (!item || typeof item !== 'object') continue;
            
            // Look for date fields with common names
            const dateFields = this.findDateFields(item);
            
            if (dateFields.startDate) {
                try {
                    const entity = this.createAutoDetectedEntity(
                        item, 
                        arrayName, 
                        dateFields, 
                        filePath, 
                        fileName, 
                        i
                    );
                    if (entity) {
                        entities.push(entity);
                    }
                } catch (error) {
                    console.warn(`Failed to create entity from ${arrayName}[${i}]:`, error);
                }
            }
        }
        
        return entities;
    }

    /**
     * Find date fields in an object using common naming patterns
     */
    private findDateFields(item: any): { startDate?: string; endDate?: string } {
        const startPatterns = [
            'startDate', 'start', 'startTime', 'startDateTime', 'begin', 'beginDate',
            'from', 'fromDate', 'createdAt', 'created', 'deployedAt', 'targetDate'
        ];
        
        const endPatterns = [
            'endDate', 'end', 'endTime', 'endDateTime', 'finish', 'finishDate',
            'to', 'toDate', 'completedAt', 'completed', 'actualDate', 'dueDate'
        ];
        
        let startDate: string | undefined;
        let endDate: string | undefined;
        
        // Find start date field
        for (const pattern of startPatterns) {
            if (item[pattern] && this.isValidDate(item[pattern])) {
                startDate = pattern;
                break;
            }
        }
        
        // Find end date field
        for (const pattern of endPatterns) {
            if (item[pattern] && this.isValidDate(item[pattern])) {
                endDate = pattern;
                break;
            }
        }
        
        // If no end date found, use start date as end date (for point-in-time events)
        if (startDate && !endDate) {
            endDate = startDate;
        }
        
        return { startDate, endDate };
    }

    /**
     * Check if a value is a valid date
     */
    private isValidDate(value: any): boolean {
        if (!value) return false;
        
        const date = new Date(value);
        return !isNaN(date.getTime());
    }

    /**
     * Create a timeline entity from auto-detected data
     */
    private createAutoDetectedEntity(
        item: any,
        arrayName: string,
        dateFields: { startDate?: string; endDate?: string },
        filePath: string,
        fileName: string,
        index: number
    ): TimelineEntity | null {
        if (!dateFields.startDate || !dateFields.endDate) return null;
        
        const startDate = new Date(item[dateFields.startDate]);
        const endDate = new Date(item[dateFields.endDate]);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
        
        // Auto-detect ID field
        const idField = this.findIdField(item);
        const id = idField ? item[idField] : `${arrayName}-${index}`;
        
        // Auto-detect Y-axis value
        const yValue = this.findYAxisValue(item);
        
        return {
            id: String(id),
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            sourceArray: arrayName,
            sourceFile: fileName,
            yValue,
            originalData: item
        };
    }

    /**
     * Find ID field using common patterns
     */
    private findIdField(item: any): string | undefined {
        const idPatterns = [
            'id', 'ID', '_id', 'uuid', 'key', 'name', 'title', 'identifier',
            'taskId', 'eventId', 'projectId', 'phaseId', 'sprintId', 'milestoneId',
            'version', 'deploymentId'
        ];
        
        for (const pattern of idPatterns) {
            if (item[pattern] !== undefined && item[pattern] !== null) {
                return pattern;
            }
        }
        
        return undefined;
    }

    /**
     * Find Y-axis value using common patterns
     */
    private findYAxisValue(item: any): any {
        const yPatterns = [
            'priority', 'level', 'status', 'type', 'category', 'environment',
            'team', 'assignee', 'budget', 'cost', 'value', 'importance',
            'criticality', 'severity', 'velocity', 'capacity'
        ];
        
        for (const pattern of yPatterns) {
            if (item[pattern] !== undefined && item[pattern] !== null) {
                return item[pattern];
            }
        }
        
        return undefined;
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
        // Extract start date - REQUIRED
        let startDate: Date | null = null;
        try {
            const startDateValue = this.resolveFluentPath(item, config.startDatePath);
            startDate = this.parseDate(startDateValue);
        } catch (error) {
            console.warn(`Failed to extract start date for ${config.name}[${index}]:`, error);
        }
        
        if (!startDate) {
            console.warn(`Skipping item ${index} in ${config.name}: no valid start date found`);
            return null;
        }

        // Extract end date - REQUIRED (fallback to start date if not found)
        let endDate: Date | null = null;
        try {
            const endDateValue = this.resolveFluentPath(item, config.endDatePath);
            endDate = this.parseDate(endDateValue);
        } catch (error) {
            console.warn(`Failed to extract end date for ${config.name}[${index}]:`, error);
        }
        
        // If no end date, use start date (for point-in-time events)
        if (!endDate) {
            endDate = startDate;
        }

        // Extract optional Y-axis value - OPTIONAL
        let yValue: any = undefined;
        if (config.yAxisPath) {
            try {
                yValue = this.resolveFluentPath(item, config.yAxisPath);
            } catch (error) {
                // Silently ignore Y-axis extraction errors
                yValue = undefined;
            }
        }

        // Extract ID - OPTIONAL (generate if not found)
        let id: string;
        if (config.idPath) {
            try {
                const idValue = this.resolveFluentPath(item, config.idPath);
                id = String(idValue || `${config.name}-${index}`);
            } catch (error) {
                id = `${config.name}-${index}`;
            }
        } else {
            id = `${config.name}-${index}`;
        }

        return {
            id,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
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