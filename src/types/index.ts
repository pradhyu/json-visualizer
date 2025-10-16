// Core data types for the JSON Timeline Visualizer

export interface ArrayConfig {
  name: string;
  arrayPath: string;
  startDatePath: string;
  endDatePath: string;
  yAxisPath?: string;
  idPath?: string;
  color: string;
  enabled: boolean;
}

export interface TimelineEntity {
  id: string;
  startDate: string;
  endDate: string;
  yValue?: any;
  sourceArray: string;
  sourceFile: string;
  originalData: any;
}

export interface ParsedJsonData {
  filePath: string;
  fileName: string;
  content: any;
  entities: TimelineEntity[];
}

export interface VisualizationData {
  entities: TimelineEntity[];
  configurations: ArrayConfig[];
  selectedFiles: string[];
  filterState: FilterState;
}

export interface FilterState {
  columnFilters: Record<string, any>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  arrayTypes: string[];
}

export interface ChartState {
  zoomLevel: ZoomLevel;
  panOffset: number;
  selectedEntities: string[];
  hoveredEntity?: string;
}

export enum ZoomLevel {
  YEARS = 'years',
  MONTHS = 'months',
  WEEKS = 'weeks',
  DAYS = 'days',
  HOURS = 'hours'
}

export interface ChartConfig {
  width: number;
  height: number;
  showLabels: boolean;
  tooltipFields: string[];
  dateFormat: string;
}

export interface ExtensionSettings {
  defaultConfigurations: ArrayConfig[];
  chartSettings: {
    defaultHeight: number;
    colorPalette: string[];
    animationDuration: number;
  };
  tableSettings: {
    pageSize: number;
    enableEditing: boolean;
    autoSave: boolean;
  };
  fileSettings: {
    watchForChanges: boolean;
    maxFileSize: number;
    supportedExtensions: string[];
  };
}