import React, { useState, useCallback } from 'react';

interface ConfigurationPanelProps {
    configurations: any[];
    settings: any;
    onConfigurationUpdate: (config: any) => void;
}

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    configurations,
    settings,
    onConfigurationUpdate
}) => {
    const [editingConfig, setEditingConfig] = useState<any>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const defaultConfig = {
        name: '',
        arrayPath: '',
        startDatePath: '',
        endDatePath: '',
        yAxisPath: '',
        idPath: '',
        color: '#1f77b4',
        enabled: true
    };

    const handleEdit = useCallback((config: any) => {
        setEditingConfig({ ...config });
        setShowAddForm(false);
    }, []);

    const handleSave = useCallback(() => {
        if (editingConfig) {
            onConfigurationUpdate(editingConfig);
            setEditingConfig(null);
        }
    }, [editingConfig, onConfigurationUpdate]);

    const handleCancel = useCallback(() => {
        setEditingConfig(null);
        setShowAddForm(false);
    }, []);

    const handleAddNew = useCallback(() => {
        setEditingConfig({ ...defaultConfig });
        setShowAddForm(true);
    }, []);

    const handleFieldChange = useCallback((field: string, value: any) => {
        setEditingConfig((prev: any) => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleToggleEnabled = useCallback((config: any) => {
        onConfigurationUpdate({
            ...config,
            enabled: !config.enabled
        });
    }, [onConfigurationUpdate]);

    return (
        <div className="configuration-panel">
            <h3>Array Configurations</h3>
            
            <div className="config-actions">
                <button 
                    onClick={handleAddNew}
                    className="add-config-button"
                    disabled={editingConfig !== null}
                >
                    + Add Configuration
                </button>
                <button 
                    onClick={() => {
                        // Send message to open config file
                        (window as any).vscodeApi?.postMessage({
                            type: 'openConfigFile'
                        });
                    }}
                    className="edit-json-button"
                    title="Edit timeline-config.json file directly"
                >
                    📝 Edit JSON Config
                </button>
            </div>

            <div className="config-list">
                {configurations.map((config, index) => (
                    <div key={index} className={`config-item ${!config.enabled ? 'disabled' : ''}`}>
                        <div className="config-header">
                            <label className="config-toggle">
                                <input
                                    type="checkbox"
                                    checked={config.enabled}
                                    onChange={() => handleToggleEnabled(config)}
                                />
                                <span className="config-name">{config.name}</span>
                            </label>
                            <div className="config-color" style={{ backgroundColor: config.color }}></div>
                            <button 
                                onClick={() => handleEdit(config)}
                                className="edit-button"
                                disabled={editingConfig !== null}
                            >
                                Edit
                            </button>
                        </div>
                        
                        <div className="config-details">
                            <div className="config-path">Array: {config.arrayPath}</div>
                            <div className="config-path">Start: {config.startDatePath}</div>
                            <div className="config-path">End: {config.endDatePath}</div>
                            {config.yAxisPath && (
                                <div className="config-path">Y-Axis: {config.yAxisPath}</div>
                            )}
                            {config.idPath && (
                                <div className="config-path">ID: {config.idPath}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {editingConfig && (
                <div className="config-editor">
                    <h4>{showAddForm ? 'Add New Configuration' : 'Edit Configuration'}</h4>
                    
                    <div className="form-group">
                        <label>Name:</label>
                        <input
                            type="text"
                            value={editingConfig.name}
                            onChange={(e) => handleFieldChange('name', e.target.value)}
                            placeholder="Configuration name"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Array Path:</label>
                        <input
                            type="text"
                            value={editingConfig.arrayPath}
                            onChange={(e) => handleFieldChange('arrayPath', e.target.value)}
                            placeholder="e.g., data.events"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Start Date Path:</label>
                        <input
                            type="text"
                            value={editingConfig.startDatePath}
                            onChange={(e) => handleFieldChange('startDatePath', e.target.value)}
                            placeholder="e.g., startDate"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>End Date Path:</label>
                        <input
                            type="text"
                            value={editingConfig.endDatePath}
                            onChange={(e) => handleFieldChange('endDatePath', e.target.value)}
                            placeholder="e.g., endDate"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Y-Axis Path (optional):</label>
                        <input
                            type="text"
                            value={editingConfig.yAxisPath || ''}
                            onChange={(e) => handleFieldChange('yAxisPath', e.target.value)}
                            placeholder="e.g., priority"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>ID Path (optional):</label>
                        <input
                            type="text"
                            value={editingConfig.idPath || ''}
                            onChange={(e) => handleFieldChange('idPath', e.target.value)}
                            placeholder="e.g., id"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Color:</label>
                        <input
                            type="color"
                            value={editingConfig.color}
                            onChange={(e) => handleFieldChange('color', e.target.value)}
                        />
                    </div>
                    
                    <div className="form-actions">
                        <button onClick={handleSave} className="save-button">
                            Save
                        </button>
                        <button onClick={handleCancel} className="cancel-button">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};