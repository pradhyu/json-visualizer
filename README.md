# JSON Timeline Visualizer

A powerful VSCode extension that transforms JSON array data into interactive timeline visualizations with comprehensive editing capabilities.

## 🚀 Features

### 📊 Interactive Timeline Visualization
- Display JSON entities as colored timeline blocks
- Latest dates on the left, chronological progression to the right
- Zoom and pan with dynamic axis labels (years → months → weeks → days → hours)
- Hover tooltips with configurable content
- Click to select and filter entities

### 🔧 Flexible Configuration
- **Fluent Path Support**: Use dot notation to access nested JSON structures (`data.events.timeline`)
- **Multiple Array Support**: Visualize multiple arrays from single or multiple JSON files
- **Configurable Properties**: Define start/end dates, Y-axis values, and block identifiers
- **Color Coding**: Automatic color assignment for different array types

### 📁 Multi-File Management
- **Directory Explorer**: Browse and select JSON files with checkboxes
- **Batch Processing**: Load multiple files simultaneously
- **File Watching**: Automatic updates when files change
- **Performance Optimized**: Handle large datasets (500+ entities)

### 📋 Advanced Table Editor
- **Editable Cells**: Modify JSON data directly in the table
- **Column Filtering**: Filter by any column with real-time chart updates
- **Synchronized Views**: Table filters automatically update the timeline
- **Save Changes**: Write modifications back to original JSON files
- **Metadata Columns**: View file source, duration, and calculated fields

### 🎛️ View Management
- **Toggle Views**: Enable/disable timeline chart and table independently
- **Responsive Layout**: Optimal space utilization based on active views
- **Configuration Panel**: Real-time configuration editing with validation

## 📖 Getting Started

### Quick Start
1. **Single File**: Right-click a JSON file → "Open JSON Timeline Visualizer"
2. **Directory**: Right-click a folder → "Open Directory in Timeline Visualizer"
3. **Command Palette**: `Ctrl+Shift+P` → "JSON Timeline: Open Visualizer"

### Sample JSON Structure
```json
{
  "events": [
    {
      "id": "event-1",
      "name": "Project Kickoff",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T17:00:00Z",
      "priority": 1,
      "status": "completed"
    }
  ]
}
```

## ⚙️ Configuration

### Array Configuration
Each array type requires configuration for proper visualization:

| Property | Description | Example |
|----------|-------------|---------|
| **Array Path** | Fluent path to the array | `events`, `data.timeline`, `project.phases` |
| **Start Date Path** | Path to start date property | `startDate`, `start`, `timeline.begin` |
| **End Date Path** | Path to end date property | `endDate`, `end`, `timeline.finish` |
| **Y-Axis Path** | Integer property for vertical positioning | `priority`, `level`, `complexity` |
| **ID Path** | Property for block labels | `id`, `name`, `taskId` |
| **Color** | Hex color for the array type | `#1f77b4`, `#ff7f0e` |

### Supported Date Formats
- **ISO 8601**: `2024-01-15T09:00:00Z`
- **Timestamps**: `1705312800000`
- **Date Only**: `2024-01-15`
- **US Format**: `01/15/2024`

### Configuration Examples

#### Simple Events
```json
{
  "name": "events",
  "arrayPath": "events",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "priority",
  "idPath": "id"
}
```

#### Nested Structure
```json
{
  "name": "milestones",
  "arrayPath": "project.data.timeline.milestones",
  "startDatePath": "start",
  "endDatePath": "end",
  "yAxisPath": "level",
  "idPath": "taskId"
}
```

## 🎯 Use Cases

### Project Management
- **Timeline Visualization**: Project phases, milestones, and deliverables
- **Resource Planning**: Team allocation and availability tracking
- **Sprint Planning**: Development cycles and release schedules

### DevOps & Monitoring
- **Deployment Tracking**: Release timelines and rollback events
- **Incident Management**: Outage duration and resolution tracking
- **Maintenance Windows**: Scheduled downtime and system updates

### Data Analysis
- **Event Correlation**: Identify patterns in temporal data
- **Performance Analysis**: System metrics over time
- **Business Intelligence**: Sales cycles, campaign performance

## 🛠️ Advanced Features

### Performance Optimization
- **Virtual Scrolling**: Handle large datasets efficiently
- **Lazy Loading**: Load files on demand
- **Debounced Updates**: Smooth interactions during zoom/pan
- **Memory Management**: Automatic cleanup of D3 elements

### Error Handling
- **Graceful Degradation**: Comprehensive error boundaries
- **User-Friendly Messages**: Clear error descriptions with suggestions
- **Recovery Options**: Retry mechanisms and fallback states
- **Validation**: Real-time configuration and data validation

### Accessibility
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: ARIA labels and descriptions
- **High Contrast**: VSCode theme integration
- **Focus Management**: Logical tab order

## 📦 Sample Data

The extension includes comprehensive sample data for testing:

- **Simple Events**: Basic timeline with single array
- **Nested Structures**: Complex JSON with deep array paths
- **Multiple Arrays**: Files with 3-5 different array types
- **Large Datasets**: Performance testing with 500+ entities
- **Edge Cases**: Empty arrays, malformed dates, missing properties
- **Real-World Examples**: Project timelines, deployment logs, resource scheduling

## 🔧 Development

### Prerequisites
- Node.js 16.x or higher
- VSCode 1.74.0 or higher

### Setup
```bash
# Clone and install dependencies
npm install

# Compile TypeScript and bundle
npm run compile

# Watch for changes during development
npm run watch

# Run tests
npm test

# Package for distribution
npm run package
```

### Architecture
- **Extension Host**: Main VSCode integration
- **Webview**: React-based UI with D3.js visualization
- **Services**: JSON parsing, configuration management, file operations
- **Error Handling**: Comprehensive error boundaries and recovery

### Testing
```bash
# Run extension in development mode
Press F5 in VSCode

# Load sample data
Open sample-data/ directory in the extension

# Test different configurations
Use sample files with various JSON structures
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Comprehensive guides and examples
- **Community**: Join discussions and share use cases

---

**Made with ❤️ for the VSCode community**# json-visualizer
