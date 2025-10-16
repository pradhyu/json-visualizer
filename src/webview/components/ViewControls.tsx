import React from 'react';

interface ViewControlsProps {
    showChart: boolean;
    showTable: boolean;
    showConfig: boolean;
    onToggle: (viewType: 'chart' | 'table' | 'config') => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
    showChart,
    showTable,
    showConfig,
    onToggle
}) => {
    return (
        <div className="view-controls">
            <button
                className={`view-toggle ${showChart ? 'active' : ''}`}
                onClick={() => onToggle('chart')}
                title="Toggle Timeline Chart"
            >
                📊 Timeline Chart
            </button>
            <button
                className={`view-toggle ${showTable ? 'active' : ''}`}
                onClick={() => onToggle('table')}
                title="Toggle Data Table"
            >
                📋 Data Table
            </button>
            <button
                className={`view-toggle ${showConfig ? 'active' : ''}`}
                onClick={() => onToggle('config')}
                title="Toggle Configuration Panel"
            >
                ⚙️ Configuration
            </button>
        </div>
    );
};