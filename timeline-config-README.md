# Timeline Configuration Guide

## Overview

The `timeline-config.json` file allows you to easily configure how the JSON Timeline Visualizer interprets your JSON data. This file should be placed in your workspace root directory.

## Configuration Structure

```json
{
  "configurations": [
    {
      "name": "events",
      "arrayPath": "events",
      "startDatePath": "startDate",
      "endDatePath": "endDate",
      "yAxisPath": "priority",
      "idPath": "id",
      "color": "#1f77b4",
      "enabled": true
    }
  ]
}
```

## Configuration Properties

### Required Properties

- **`name`** (string): Unique identifier for this configuration
- **`arrayPath`** (string): Path to the array in your JSON (supports dot notation like `data.events`)
- **`startDatePath`** (string): Path to the start date field within each array item
- **`endDatePath`** (string): Path to the end date field within each array item
- **`enabled`** (boolean): Whether this configuration is active

### Optional Properties

- **`yAxisPath`** (string): Path to a field used for Y-axis positioning/grouping
- **`idPath`** (string): Path to a unique identifier field for each item
- **`color`** (string): Hex color code for this data series (e.g., "#1f77b4")

## Path Examples

### Simple Paths
```json
{
  "arrayPath": "events",           // JSON: { "events": [...] }
  "startDatePath": "startDate",    // Item: { "startDate": "2024-01-01" }
  "endDatePath": "endDate"         // Item: { "endDate": "2024-01-02" }
}
```

### Nested Paths
```json
{
  "arrayPath": "data.timeline.events",     // JSON: { "data": { "timeline": { "events": [...] } } }
  "startDatePath": "dates.start",          // Item: { "dates": { "start": "2024-01-01" } }
  "endDatePath": "dates.end",              // Item: { "dates": { "end": "2024-01-02" } }
  "yAxisPath": "metadata.priority"         // Item: { "metadata": { "priority": 5 } }
}
```

## Date Formats Supported

The visualizer supports various date formats:
- ISO 8601: `"2024-01-15T09:00:00Z"`
- Date only: `"2024-01-15"`
- JavaScript Date strings: `"Mon Jan 15 2024"`

## Example Configurations

### Project Timeline
```json
{
  "name": "phases",
  "arrayPath": "phases",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "budget",
  "idPath": "phaseId",
  "color": "#2ca02c",
  "enabled": true
}
```

### Deployment History
```json
{
  "name": "deployments",
  "arrayPath": "deployments",
  "startDatePath": "deployedAt",
  "endDatePath": "completedAt",
  "yAxisPath": "environment",
  "idPath": "version",
  "color": "#d62728",
  "enabled": true
}
```

### Sprint Planning
```json
{
  "name": "sprints",
  "arrayPath": "sprints",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "velocity",
  "idPath": "sprintId",
  "color": "#ff7f0e",
  "enabled": true
}
```

## How to Edit

### Method 1: Command Palette
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Edit Timeline Configuration"
3. Select the command to open the JSON file

### Method 2: Configuration Panel
1. Open the Timeline Visualizer
2. Click the "Configuration" toggle in the header
3. Click "📝 Edit JSON Config" button

### Method 3: Manual
1. Create `timeline-config.json` in your workspace root
2. Copy the example structure above
3. Modify the configurations to match your JSON structure

## Tips

1. **Test Incrementally**: Start with one configuration and test it before adding more
2. **Use Descriptive Names**: Choose clear names that describe your data
3. **Color Coordination**: Use distinct colors for different data series
4. **Path Validation**: The visualizer will show errors if paths don't exist in your JSON
5. **Disable Unused**: Set `enabled: false` for configurations you don't need

## Troubleshooting

- **No data showing**: Check that `arrayPath` points to an actual array in your JSON
- **Missing timeline blocks**: Verify `startDatePath` and `endDatePath` exist and contain valid dates
- **Wrong colors**: Ensure color values are valid hex codes (e.g., "#1f77b4")
- **Configuration not loading**: Make sure the JSON file is valid (use a JSON validator)