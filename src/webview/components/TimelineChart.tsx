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
        // Reset D3 zoom transform
        if (containerRef.current) {
            const svg = d3.select(containerRef.current).select('svg');
            if (!svg.empty()) {
                const zoom = d3.zoom().on('zoom', null);
                (svg as any).call(zoom.transform, d3.zoomIdentity);
            }
        }
    }, []);

    // D3.js chart rendering
    useEffect(() => {
        if (!data || !data.entities || data.entities.length === 0 || !containerRef.current) {
            return;
        }

        // Clear previous chart
        d3.select(containerRef.current).selectAll('*').remove();

        const entities = data.entities;
        const configurations = data.configurations || [];
        
        // Set up dimensions
        const margin = dimensions.margin;
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(containerRef.current)
            .append('svg')
            .attr('width', dimensions.width)
            .attr('height', dimensions.height);

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Parse dates and create scales
        const parseTime = d3.timeParse('%Y-%m-%dT%H:%M:%S.%LZ');
        const parseTimeAlt = d3.timeParse('%Y-%m-%dT%H:%M:%SZ');
        
        const parsedEntities = entities.map((d: any) => ({
            ...d,
            startDate: parseTime(d.startDate) || parseTimeAlt(d.startDate) || new Date(d.startDate),
            endDate: parseTime(d.endDate) || parseTimeAlt(d.endDate) || new Date(d.endDate)
        }));

        // Create scales
        const dateExtent = d3.extent(parsedEntities.flatMap((d: any) => [d.startDate, d.endDate]));
        const defaultDomain: [Date, Date] = [new Date(), new Date()];
        const xScale = d3.scaleTime()
            .domain(dateExtent && dateExtent[0] && dateExtent[1] ? (dateExtent as unknown as [Date, Date]) : defaultDomain)
            .range([0, width]);

        // Group entities by source array for Y positioning
        const arrayGroups = d3.group(parsedEntities, (d: any) => d.sourceArray);
        const yScale = d3.scaleBand()
            .domain(Array.from(arrayGroups.keys()))
            .range([0, height])
            .padding(0.1);

        // Color scale
        const colorScale = d3.scaleOrdinal()
            .domain(Array.from(arrayGroups.keys()))
            .range(configurations.map((c: any) => c.color).concat(d3.schemeCategory10));

        // Create axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat('%Y-%m-%d') as any);
        
        const yAxis = d3.axisLeft(yScale);

        // Add axes
        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis as any);

        g.append('g')
            .attr('class', 'y-axis')
            .call(yAxis as any);

        // Add grid lines
        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale)
                .tickSize(-height)
                .tickFormat('' as any) as any
            );

        // Create tooltip
        const tooltip = d3.select('body').append('div')
            .attr('class', 'timeline-tooltip')
            .style('position', 'absolute')
            .style('visibility', 'hidden')
            .style('background-color', 'var(--vscode-editor-hoverHighlightBackground)')
            .style('color', 'var(--vscode-foreground)')
            .style('border', '1px solid var(--vscode-panel-border)')
            .style('border-radius', '4px')
            .style('padding', '8px')
            .style('font-size', '12px')
            .style('z-index', '1000');

        // Add timeline blocks
        const blocks = g.selectAll('.timeline-block')
            .data(parsedEntities)
            .enter()
            .append('g')
            .attr('class', 'timeline-block')
            .style('cursor', 'pointer');

        blocks.append('rect')
            .attr('class', 'block-rect')
            .attr('x', (d: any) => xScale(d.startDate))
            .attr('y', (d: any) => yScale(d.sourceArray) || 0)
            .attr('width', (d: any) => Math.max(2, xScale(d.endDate) - xScale(d.startDate)))
            .attr('height', yScale.bandwidth())
            .attr('fill', (d: any) => colorScale(d.sourceArray) as string)
            .attr('stroke', 'var(--vscode-panel-border)')
            .attr('stroke-width', 1)
            .attr('rx', 2);

        // Add labels to blocks
        blocks.append('text')
            .attr('class', 'block-label')
            .attr('x', (d: any) => xScale(d.startDate) + 4)
            .attr('y', (d: any) => (yScale(d.sourceArray) || 0) + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .style('font-size', '11px')
            .style('fill', 'var(--vscode-foreground)')
            .style('pointer-events', 'none')
            .text((d: any) => {
                const blockWidth = xScale(d.endDate) - xScale(d.startDate);
                const text = d.id || d.name || 'Item';
                return blockWidth > 60 ? text : '';
            });

        // Add hover interactions
        blocks
            .on('mouseover', function(event: any, d: any) {
                d3.select(this).select('.block-rect')
                    .attr('stroke-width', 2)
                    .style('filter', 'brightness(1.1)');

                const tooltipContent = `
                    <strong>${d.id || d.name || 'Item'}</strong><br/>
                    <strong>Array:</strong> ${d.sourceArray}<br/>
                    <strong>Start:</strong> ${d.startDate.toLocaleString()}<br/>
                    <strong>End:</strong> ${d.endDate.toLocaleString()}<br/>
                    <strong>Duration:</strong> ${Math.round((d.endDate - d.startDate) / (1000 * 60 * 60 * 24))} days
                    ${d.yValue !== undefined ? `<br/><strong>Value:</strong> ${d.yValue}` : ''}
                `;

                tooltip.html(tooltipContent)
                    .style('visibility', 'visible');
            })
            .on('mousemove', function(event: any) {
                tooltip
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');
            })
            .on('mouseout', function() {
                d3.select(this).select('.block-rect')
                    .attr('stroke-width', 1)
                    .style('filter', 'none');

                tooltip.style('visibility', 'hidden');
            })
            .on('click', function(event: any, d: any) {
                const newSelected = new Set(selectedEntities);
                if (newSelected.has(d.id)) {
                    newSelected.delete(d.id);
                } else {
                    newSelected.add(d.id);
                }
                setSelectedEntities(newSelected);
                
                // Update visual selection
                d3.select(this).select('.block-rect')
                    .attr('stroke-width', newSelected.has(d.id) ? 3 : 1)
                    .attr('stroke', newSelected.has(d.id) ? 'var(--vscode-focusBorder)' : 'var(--vscode-panel-border)');
            });

        // Add zoom and pan
        const zoom = d3.zoom()
            .scaleExtent([0.1, 10])
            .on('zoom', (event: any) => {
                const { transform } = event;
                
                // Update x scale
                const newXScale = transform.rescaleX(xScale);
                
                // Update x axis
                g.select('.x-axis').call(d3.axisBottom(newXScale).tickFormat(d3.timeFormat('%Y-%m-%d') as any) as any);
                
                // Update grid
                g.select('.grid').call(
                    d3.axisBottom(newXScale)
                        .tickSize(-height)
                        .tickFormat('' as any) as any
                );
                
                // Update blocks
                blocks.select('.block-rect')
                    .attr('x', (d: any) => newXScale(d.startDate))
                    .attr('width', (d: any) => Math.max(2, newXScale(d.endDate) - newXScale(d.startDate)));
                
                blocks.select('.block-label')
                    .attr('x', (d: any) => newXScale(d.startDate) + 4)
                    .text((d: any) => {
                        const blockWidth = newXScale(d.endDate) - newXScale(d.startDate);
                        const text = d.id || d.name || 'Item';
                        return blockWidth > 60 ? text : '';
                    });
            });

        svg.call(zoom as any);

        // Cleanup function
        return () => {
            tooltip.remove();
        };

    }, [data, dimensions, selectedEntities]);

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
                {/* D3.js chart will be rendered here */}
            </div>
        </div>
    );
};