import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface DataTableProps {
    data: any;
    settings: any;
    onFilterUpdate: (filterData: any) => void;
    onDataSave: (data: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
    data,
    settings,
    onFilterUpdate,
    onDataSave
}) => {
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [editedData, setEditedData] = useState<Record<string, any>>({});
    const [hasChanges, setHasChanges] = useState(false);

    // Generate table data from entities
    const processedData = useMemo(() => {
        if (!data || !data.entities) return [];

        return data.entities.map((entity: any, index: number) => {
            // Flatten the original data and add metadata
            const flattened: any = {
                _index: index,
                _id: entity.id,
                _startDate: entity.startDate,
                _endDate: entity.endDate,
                _sourceArray: entity.sourceArray,
                _sourceFile: entity.sourceFile,
                _duration: new Date(entity.endDate).getTime() - new Date(entity.startDate).getTime()
            };

            if (entity.yValue !== undefined) {
                flattened._yValue = entity.yValue;
            }

            // Add original data properties
            if (entity.originalData && typeof entity.originalData === 'object') {
                Object.keys(entity.originalData).forEach(key => {
                    flattened[key] = entity.originalData[key];
                });
            }

            return flattened;
        });
    }, [data]);

    // Get unique column names
    const columns = useMemo(() => {
        if (processedData.length === 0) return [];

        const allKeys = new Set<string>();
        processedData.forEach((row: any) => {
            Object.keys(row).forEach(key => allKeys.add(key));
        });

        return Array.from(allKeys).sort((a, b) => {
            // Sort metadata columns first
            if (a.startsWith('_') && !b.startsWith('_')) return -1;
            if (!a.startsWith('_') && b.startsWith('_')) return 1;
            return a.localeCompare(b);
        });
    }, [processedData]);

    // Apply filters
    const filteredData = useMemo(() => {
        if (Object.keys(filters).length === 0) return processedData;

        return processedData.filter((row: any) => {
            return Object.entries(filters).every(([column, filterValue]) => {
                if (!filterValue) return true;
                
                const cellValue = row[column];
                if (cellValue === undefined || cellValue === null) return false;
                
                const stringValue = String(cellValue).toLowerCase();
                const filterString = filterValue.toLowerCase();
                
                return stringValue.includes(filterString);
            });
        });
    }, [processedData, filters]);

    const handleFilterChange = useCallback((column: string, value: string) => {
        const newFilters = { ...filters };
        if (value) {
            newFilters[column] = value;
        } else {
            delete newFilters[column];
        }
        setFilters(newFilters);
        
        // Notify parent about filter changes for chart synchronization
        onFilterUpdate({ columnFilters: newFilters });
    }, [filters, onFilterUpdate]);

    const handleCellEdit = useCallback((rowIndex: number, column: string, value: any) => {
        const key = `${rowIndex}-${column}`;
        setEditedData(prev => ({
            ...prev,
            [key]: value
        }));
        setHasChanges(true);
    }, []);

    const handleSave = useCallback(() => {
        if (!hasChanges) return;

        console.log('Saving changes:', editedData);
        onDataSave(editedData);
        setEditedData({});
        setHasChanges(false);
    }, [hasChanges, editedData, onDataSave]);

    const formatCellValue = useCallback((value: any, column: string) => {
        if (value === null || value === undefined) return '';
        
        if (column.includes('Date') || column.includes('_startDate') || column.includes('_endDate')) {
            if (value instanceof Date) {
                return value.toLocaleString();
            }
            if (typeof value === 'string' || typeof value === 'number') {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleString();
                }
            }
        }
        
        if (column === '_duration') {
            const ms = Number(value);
            if (!isNaN(ms)) {
                const days = Math.floor(ms / (1000 * 60 * 60 * 24));
                const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                
                if (days > 0) return `${days}d ${hours}h ${minutes}m`;
                if (hours > 0) return `${hours}h ${minutes}m`;
                return `${minutes}m`;
            }
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        return String(value);
    }, []);

    if (!data || !data.entities || data.entities.length === 0) {
        return (
            <div className="data-table-container">
                <div className="table-header">
                    <h3>Data Table</h3>
                </div>
                <div className="data-table-empty">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">📋</div>
                        <h3 className="empty-state-title">No Table Data</h3>
                        <p className="empty-state-description">
                            Load JSON files with timeline data to see the editable table. 
                            You can filter, edit, and save changes to your JSON data here.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <div className="table-header">
                <h3>Data Table</h3>
                <div className="table-controls">
                    <span className="row-count">
                        Showing {filteredData.length} of {processedData.length} rows
                    </span>
                    {hasChanges && (
                        <button onClick={handleSave} className="save-button">
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
            
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map(column => (
                                <th key={column}>
                                    <div className="column-header">
                                        <span className="column-name">{column}</span>
                                        <input
                                            type="text"
                                            placeholder="Filter..."
                                            value={filters[column] || ''}
                                            onChange={(e) => handleFilterChange(column, e.target.value)}
                                            className="column-filter"
                                        />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((row: any, rowIndex: number) => (
                            <tr key={rowIndex}>
                                {columns.map(column => {
                                    const cellKey = `${rowIndex}-${column}`;
                                    const originalValue = row[column];
                                    const editedValue = editedData[cellKey];
                                    const displayValue = editedValue !== undefined ? editedValue : originalValue;
                                    const isEdited = editedValue !== undefined;
                                    const isMetadata = column.startsWith('_');
                                    
                                    return (
                                        <td key={column} className={isEdited ? 'edited' : ''}>
                                            {isMetadata ? (
                                                <span className="metadata-cell">
                                                    {formatCellValue(displayValue, column)}
                                                </span>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={formatCellValue(displayValue, column)}
                                                    onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                                                    className="cell-input"
                                                />
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};