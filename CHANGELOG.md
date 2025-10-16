# Changelog

All notable changes to the JSON Timeline Visualizer extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-16

### Added
- **Interactive Timeline Visualization**
  - D3.js-powered timeline charts with zoom and pan capabilities
  - Color-coded blocks for different array types
  - Configurable block labels and tooltips
  - Dynamic axis labels based on zoom level (years → months → weeks → days → hours)

- **Flexible JSON Configuration**
  - Fluent path notation for nested JSON structures
  - Support for multiple arrays in single files
  - Configurable start/end date paths and Y-axis properties
  - Real-time configuration validation and suggestions

- **Multi-File Management**
  - Directory explorer with file selection checkboxes
  - Batch loading of multiple JSON files
  - File watching for automatic updates
  - Performance optimization for large datasets (500+ entities)

- **Advanced Table Editor**
  - Editable cells with real-time JSON modification
  - Column filtering with chart synchronization
  - Save changes back to original JSON files
  - Metadata columns (duration, file source, etc.)

- **Comprehensive Error Handling**
  - Error boundaries for graceful failure recovery
  - User-friendly error messages with suggestions
  - Loading states and empty state management
  - Validation for configuration and data integrity

- **Sample Data & Testing**
  - Comprehensive sample JSON files for various use cases
  - Performance test data with 500+ entities
  - Edge case handling (empty arrays, malformed dates)
  - Real-world examples (project timelines, deployment logs)

### Technical Features
- **Architecture**: VSCode extension with React webview and D3.js visualization
- **Build System**: Webpack with TypeScript compilation
- **Error Recovery**: Comprehensive error boundaries and fallback states
- **Performance**: Virtual scrolling, lazy loading, and debounced updates
- **Accessibility**: Keyboard navigation, screen reader support, high contrast mode

### Supported Date Formats
- ISO 8601: `2024-01-15T09:00:00Z`
- Timestamps: `1705312800000`
- Date only: `2024-01-15`
- US format: `01/15/2024`

### Use Cases
- Project management and timeline visualization
- DevOps deployment and incident tracking
- Data analysis and event correlation
- Resource scheduling and capacity planning

## [Unreleased]

### Planned Features
- Export timeline as PNG/SVG
- Advanced filtering and search capabilities
- Custom color themes and styling
- Integration with external data sources
- Collaborative features and sharing
- Advanced analytics and insights