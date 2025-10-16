import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

interface TimelineChartProps {
    data: any;
    settings: any;
    onFilterUpdate: (filterData: any) => void;
}

interface ChartDimensions {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
}

enum ZoomLevel {
    YEARS = 'years',
    MONTHS = 'months',
    WEEKS = 'weeks', 
    DAYS = 'days',
    HOURS = 'hours'
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
    data,
    settings,
    onFilterUpdate
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState<ChartDimensions>({
        width: 800,
        height: 400,
        margin: { top: 20, right: 20, bottom: 60, left: 100 }
    });
    const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(ZoomLevel.DAYS);
    const [selectedEntities, setSelectedEntities] = useState<Set<string>>(new Set());

    // Update dimensions on container resize
    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions(prev => ({
                    ...prev,
                    width: Math.max(600, rect.width - 40),
                    height: Math.max(300, settings?.chartSettings?.defaultHeight || 400)
                }));
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [settings]);

    const handleZoomIn = useCallback(() => {
        const levels = Object.values(ZoomLevel);
        const currentIndex = levels.indexOf(zoomLevel);
        if (currentIndex < levels.length - 1) {
            setZoomLevel(levels[currentIndex + 1]);
        }
    }, [zoomLevel]);

    const handleZoomOut = useCallback(() => {
        const levels = Object.values(ZoomLevel);
        const currentIndex = levels.indexOf(zoomLevel);
        if (currentIndex > 0) {
            setZoomLevel(levels[currentIndex - 1]);
        }
    }, [zoomLevel]);

    const handleResetView = useCallback(() => {
        setZoomLevel(ZoomLevel.DAYS);
        setSelectedEntities(new Set());
    }, []);

    if (!data || !data.entities || data.entities.length === 0) {
        return (
            <div className="timeline-chart-container">
                <div className="chart-header">
                    <h3>Timeline Chart</h3>
                </div>
                <div className="timeline-chart-empty">
                    <div className="empty-state-content">
                        <div className="empty-state-icon">📈</div>
                        <h3 className="empty-state-title">No Timeline Data</h3>
                        <p className="empty-state-description">
                            Load JSON files with timeline data to see the interactive chart. 
                            Make sure your JSON contains arrays with start and end date properties.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="timeline-chart-container">
            <div className="chart-header">
                <h3>Timeline Chart</h3>
                <div className="chart-controls">
                    <button 
                        onClick={handleZoomOut}
                        className="chart-control-button"
                        disabled={zoomLevel === ZoomLevel.YEARS}
                    >
                        Zoom Out
                    </button>
                    <span className="zoom-level">({zoomLevel})</span>
                    <button 
                        onClick={handleZoomIn}
                        className="chart-control-button"
                        disabled={zoomLevel === ZoomLevel.HOURS}
                    >
                        Zoom In
                    </button>
                    <button 
                        onClick={handleResetView}
                        className="chart-control-button"
                    >
                        Reset View
                    </button>
                </div>
            </div>
            <div ref={containerRef} className="chart-content">
                <div className="chart-placeholder">
                    <div className="placeholder-content">
                        <h3>📊 Timeline Chart</h3>
                        <p>Entities loaded: {data.entities.length}</p>
                        <p>Arrays: {data.configurations?.filter((c: any) => c.enabled).map((c: any) => c.name).join(', ') || 'None configured'}</p>
                        <p>Zoom level: {zoomLevel}</p>
                        <div className="entity-list">
                            {data.entities.slice(0, 5).map((entity: any, index: number) => (
                                <div key={index} className="entity-preview">
                                    <strong>{entity.id}</strong> - {entity.sourceArray}
                                    <br />
                                    <small>
                                        {new Date(entity.startDate).toLocaleDateString()} → {new Date(entity.endDate).toLocaleDateString()}
                                    </small>
                                </div>
                            ))}
                            {data.entities.length > 5 && (
                                <div className="entity-preview">
                                    <em>... and {data.entities.length - 5} more entities</em>
                                </div>
                            )}
                        </div>
                        <p><em>Interactive D3.js chart will be implemented in the next phase</em></p>
                    </div>
                </div>
            </div>
        </div>
    );
};