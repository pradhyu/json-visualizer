# Configuration Guide

This guide explains how to configure the JSON Timeline Visualizer for different JSON structures and use cases.

## Basic Configuration

Each array type in your JSON requires a configuration that tells the extension:
- Where to find the array
- Which properties contain start and end dates
- Optional properties for Y-axis positioning and block labels

### Configuration Properties

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `name` | Yes | Unique identifier for this configuration | `"events"`, `"milestones"` |
| `arrayPath` | Yes | Fluent path to the array | `"events"`, `"data.timeline"` |
| `startDatePath` | Yes | Path to start date property | `"startDate"`, `"begin"` |
| `endDatePath` | Yes | Path to end date property | `"endDate"`, `"finish"` |
| `yAxisPath` | No | Path to numeric property for Y positioning | `"priority"`, `"level"` |
| `idPath` | No | Path to property used for block labels | `"id"`, `"name"` |
| `color` | Yes | Hex color for this array type | `"#1f77b4"` |
| `enabled` | Yes | Whether this configuration is active | `true` |

## Fluent Path Notation

Fluent paths use dot notation to access nested properties:

### Simple Property Access
```json
{
  "events": [...] // Path: "events"
}
```

### Nested Object Access
```json
{
  "project": {
    "timeline": {
      "events": [...] // Path: "project.timeline.events"
    }
  }
}
```

### Array Index Access
```json
{
  "data": [
    {
      "events": [...] // Path: "data[0].events"
    }
  ]
}
```

## Configuration Examples

### 1. Simple Events Structure

**JSON:**
```json
{
  "events": [
    {
      "id": "event-1",
      "name": "Project Kickoff",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T17:00:00Z",
      "priority": 1
    }
  ]
}
```

**Configuration:**
```json
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
```

### 2. Nested Timeline Structure

**JSON:**
```json
{
  "project": {
    "data": {
      "timeline": {
        "milestones": [
          {
            "taskId": "MILESTONE-001",
            "title": "MVP Release",
            "start": "2024-01-01",
            "end": "2024-03-31",
            "level": 5
          }
        ]
      }
    }
  }
}
```

**Configuration:**
```json
{
  "name": "milestones",
  "arrayPath": "project.data.timeline.milestones",
  "startDatePath": "start",
  "endDatePath": "end",
  "yAxisPath": "level",
  "idPath": "taskId",
  "color": "#ff7f0e",
  "enabled": true
}
```

### 3. Multiple Arrays in One File

**JSON:**
```json
{
  "deployments": [
    {
      "version": "v1.0.0",
      "deployedAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T11:15:00Z",
      "environment": 1
    }
  ],
  "incidents": [
    {
      "incidentId": "INC-001",
      "startDate": "2024-01-18T15:30:00Z",
      "endDate": "2024-01-18T16:45:00Z",
      "severity": 3
    }
  ]
}
```

**Configurations:**
```json
[
  {
    "name": "deployments",
    "arrayPath": "deployments",
    "startDatePath": "deployedAt",
    "endDatePath": "completedAt",
    "yAxisPath": "environment",
    "idPath": "version",
    "color": "#2ca02c",
    "enabled": true
  },
  {
    "name": "incidents",
    "arrayPath": "incidents",
    "startDatePath": "startDate",
    "endDatePath": "endDate",
    "yAxisPath": "severity",
    "idPath": "incidentId",
    "color": "#d62728",
    "enabled": true
  }
]
```

## Supported Date Formats

The extension automatically detects and parses various date formats:

### ISO 8601 (Recommended)
```json
{
  "startDate": "2024-01-15T09:00:00Z",
  "endDate": "2024-01-15T17:00:00.000Z"
}
```

### Unix Timestamps
```json
{
  "startTime": 1705312800000,
  "endTime": 1705341600000
}
```

### Date-Only Formats
```json
{
  "start": "2024-01-15",
  "end": "2024-01-16"
}
```

### US Date Format
```json
{
  "startDate": "01/15/2024",
  "endDate": "01/16/2024"
}
```

## Configuration Management

### Adding Configurations
1. Open the Configuration Panel (toggle in header)
2. Click "Add Configuration"
3. Fill in the required fields
4. Click "Save"

### Editing Configurations
1. Click "Edit" next to any configuration
2. Modify the fields as needed
3. Click "Save"

### Enabling/Disabling
Use the checkbox next to each configuration name to enable or disable it without deleting.

### Validation
The extension validates configurations in real-time:
- **Path Validation**: Checks if fluent paths exist in loaded JSON
- **Date Validation**: Verifies date properties contain valid dates
- **Color Validation**: Ensures colors are valid hex codes

## Best Practices

### 1. Naming Conventions
- Use descriptive names: `"project-milestones"` instead of `"array1"`
- Keep names short but clear
- Use consistent naming across related configurations

### 2. Color Selection
- Use distinct colors for different array types
- Consider colorblind-friendly palettes
- Maintain consistency with your organization's color scheme

### 3. Y-Axis Properties
- Choose numeric properties that provide meaningful vertical separation
- Consider using priority, severity, or level fields
- Ensure the property exists in most/all array items

### 4. Performance Considerations
- For large datasets, consider filtering at the JSON level first
- Use date ranges to limit the scope of visualization
- Disable unused configurations to improve performance

## Troubleshooting

### Common Issues

**Configuration not working?**
- Check that the fluent path exactly matches your JSON structure
- Verify date properties contain valid date values
- Ensure the array path points to an actual array

**Dates not parsing correctly?**
- Check the supported date formats above
- Ensure date strings are properly formatted
- Consider converting to ISO 8601 format for best compatibility

**Performance issues?**
- Reduce the number of entities being visualized
- Use date range filters
- Disable unused array configurations

**Empty visualization?**
- Verify your JSON contains the expected arrays
- Check that date properties are not null or empty
- Ensure at least one configuration is enabled

### Getting Help

1. Check the error messages in the extension
2. Review the sample data for working examples
3. Validate your JSON structure
4. Report issues with sample data that reproduces the problem