import { TimelineEntity, ArrayConfig, FilterState, VisualizationData } from '../types';

export class DataTransformationService {
    /**
     * Transform and merge entities from multiple files and configurations
     */
    public transformVisualizationData(
        entities: TimelineEntity[],
        configurations: ArrayConfig[],
        selectedFiles: string[],
        filterState: FilterState
    ): VisualizationData {
        // Filter entities based on selected files
        let filteredEntities = entities.filter(entity => 
            selectedFiles.length === 0 || selectedFiles.includes(entity.sourceFile)
        );

        // Apply configuration filters (enabled arrays only)
        const enabledArrays = configurations
            .filter(config => config.enabled)
            .map(config => config.name);
        
        filteredEntities = filteredEntities.filter(entity =>
            enabledArrays.includes(entity.sourceArray)
        );

        // Apply user filters
        filteredEntities = this.applyFilters(filteredEntities, filterState);

        // Sort entities by start date (latest first as per requirements)
        filteredEntities.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

        return {
            entities: filteredEntities,
            configurations,
            selectedFiles,
            filterState
        };
    }

    /**
     * Apply filters to entities based on filter state
     */
    public applyFilters(entities: TimelineEntity[], filterState: FilterState): TimelineEntity[] {
        let filtered = [...entities];

        // Apply date range filter
        if (filterState.dateRange) {
            filtered = filtered.filter(entity => {
                const entityStart = entity.startDate.getTime();
                const entityEnd = entity.endDate.getTime();
                const filterStart = filterState.dateRange!.start.getTime();
                const filterEnd = filterState.dateRange!.end.getTime();

                // Check if entity overlaps with filter range
                return entityStart <= filterEnd && entityEnd >= filterStart;
            });
        }

        // Apply array type filters
        if (filterState.arrayTypes.length > 0) {
            filtered = filtered.filter(entity =>
                filterState.arrayTypes.includes(entity.sourceArray)
            );
        }

        // Apply column filters
        for (const [column, filterValue] of Object.entries(filterState.columnFilters)) {
            if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
                filtered = this.applyColumnFilter(filtered, column, filterValue);
            }
        }

        return filtered;
    }

    /**
     * Apply a specific column filter
     */
    private applyColumnFilter(entities: TimelineEntity[], column: string, filterValue: any): TimelineEntity[] {
        return entities.filter(entity => {
            let value: any;

            // Handle special columns
            switch (column) {
                case 'id':
                    value = entity.id;
                    break;
                case 'startDate':
                    value = entity.startDate;
                    break;
                case 'endDate':
                    value = entity.endDate;
                    break;
                case 'yValue':
                    value = entity.yValue;
                    break;
                case 'sourceArray':
                    value = entity.sourceArray;
                    break;
                case 'sourceFile':
                    value = entity.sourceFile;
                    break;
                default:
                    // Try to get value from original data
                    value = this.getNestedValue(entity.originalData, column);
                    break;
            }

            return this.matchesFilter(value, filterValue);
        });
    }

    /**
     * Check if a value matches a filter
     */
    private matchesFilter(value: any, filterValue: any): boolean {
        if (value === undefined || value === null) {
            return false;
        }

        // Handle different filter types
        if (typeof filterValue === 'string') {
            const stringValue = String(value).toLowerCase();
            const filterString = filterValue.toLowerCase();
            return stringValue.includes(filterString);
        }

        if (typeof filterValue === 'number') {
            return Number(value) === filterValue;
        }

        if (filterValue instanceof Date) {
            if (value instanceof Date) {
                return value.getTime() === filterValue.getTime();
            }
            return false;
        }

        if (Array.isArray(filterValue)) {
            return filterValue.includes(value);
        }

        return String(value) === String(filterValue);
    }

    /**
     * Get nested value from object using dot notation
     */
    private getNestedValue(obj: any, path: string): any {
        if (!obj || !path) {
            return undefined;
        }

        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    /**
     * Group entities by array type for visualization
     */
    public groupEntitiesByArray(entities: TimelineEntity[]): Map<string, TimelineEntity[]> {
        const groups = new Map<string, TimelineEntity[]>();

        for (const entity of entities) {
            const arrayName = entity.sourceArray;
            if (!groups.has(arrayName)) {
                groups.set(arrayName, []);
            }
            groups.get(arrayName)!.push(entity);
        }

        return groups;
    }

    /**
     * Calculate date range for entities
     */
    public calculateDateRange(entities: TimelineEntity[]): { start: Date; end: Date } | null {
        if (entities.length === 0) {
            return null;
        }

        let minDate = entities[0].startDate;
        let maxDate = entities[0].endDate;

        for (const entity of entities) {
            if (entity.startDate < minDate) {
                minDate = entity.startDate;
            }
            if (entity.endDate > maxDate) {
                maxDate = entity.endDate;
            }
        }

        return { start: minDate, end: maxDate };
    }

    /**
     * Calculate Y-axis range for entities
     */
    public calculateYAxisRange(entities: TimelineEntity[]): { min: number; max: number } | null {
        const yValues = entities
            .map(entity => entity.yValue)
            .filter(value => typeof value === 'number') as number[];

        if (yValues.length === 0) {
            return null;
        }

        return {
            min: Math.min(...yValues),
            max: Math.max(...yValues)
        };
    }

    /**
     * Generate table data for AG-Grid
     */
    public generateTableData(entities: TimelineEntity[]): any[] {
        return entities.map(entity => {
            // Flatten original data and add entity metadata
            const flatData = this.flattenObject(entity.originalData);
            
            return {
                ...flatData,
                _id: entity.id,
                _startDate: entity.startDate,
                _endDate: entity.endDate,
                _yValue: entity.yValue,
                _sourceArray: entity.sourceArray,
                _sourceFile: entity.sourceFile,
                _duration: entity.endDate.getTime() - entity.startDate.getTime()
            };
        });
    }

    /**
     * Flatten nested object for table display
     */
    private flattenObject(obj: any, prefix: string = ''): any {
        const flattened: any = {};

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
                    // Recursively flatten nested objects
                    Object.assign(flattened, this.flattenObject(value, newKey));
                } else {
                    // Keep primitive values and arrays as-is
                    flattened[newKey] = value;
                }
            }
        }

        return flattened;
    }

    /**
     * Get unique values for a column (for filter options)
     */
    public getUniqueColumnValues(entities: TimelineEntity[], column: string): any[] {
        const values = new Set<any>();

        for (const entity of entities) {
            let value: any;

            switch (column) {
                case 'sourceArray':
                    value = entity.sourceArray;
                    break;
                case 'sourceFile':
                    value = entity.sourceFile;
                    break;
                default:
                    value = this.getNestedValue(entity.originalData, column);
                    break;
            }

            if (value !== undefined && value !== null) {
                values.add(value);
            }
        }

        return Array.from(values).sort();
    }

    /**
     * Validate entity data integrity
     */
    public validateEntities(entities: TimelineEntity[]): { valid: TimelineEntity[]; invalid: any[] } {
        const valid: TimelineEntity[] = [];
        const invalid: any[] = [];

        for (const entity of entities) {
            const errors: string[] = [];

            // Validate required fields
            if (!entity.id) {
                errors.push('Missing ID');
            }

            if (!entity.startDate || !(entity.startDate instanceof Date) || isNaN(entity.startDate.getTime())) {
                errors.push('Invalid start date');
            }

            if (!entity.endDate || !(entity.endDate instanceof Date) || isNaN(entity.endDate.getTime())) {
                errors.push('Invalid end date');
            }

            if (entity.startDate && entity.endDate && entity.startDate >= entity.endDate) {
                errors.push('Start date must be before end date');
            }

            if (!entity.sourceArray) {
                errors.push('Missing source array');
            }

            if (!entity.sourceFile) {
                errors.push('Missing source file');
            }

            if (errors.length === 0) {
                valid.push(entity);
            } else {
                invalid.push({ entity, errors });
            }
        }

        return { valid, invalid };
    }

    /**
     * Merge entities from multiple sources while handling duplicates
     */
    public mergeEntities(entityGroups: TimelineEntity[][]): TimelineEntity[] {
        const merged: TimelineEntity[] = [];
        const seen = new Set<string>();

        for (const group of entityGroups) {
            for (const entity of group) {
                // Create unique key based on content and source
                const key = `${entity.sourceFile}:${entity.sourceArray}:${entity.id}`;
                
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(entity);
                }
            }
        }

        return merged;
    }
}