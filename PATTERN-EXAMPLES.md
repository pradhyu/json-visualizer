# JSON Timeline Visualizer - Auto-Detection Patterns

## 🎯 Overview

The JSON Timeline Visualizer now automatically detects timeline data in your JSON files! You only need **startDate** and **endDate** fields - everything else is optional and auto-detected.

## 📋 Required Fields

### Start Date Fields (Auto-detected)
The extension looks for these field names:
- `startDate`, `start`, `startTime`, `startDateTime`
- `begin`, `beginDate`, `from`, `fromDate`
- `createdAt`, `created`, `deployedAt`, `targetDate`

### End Date Fields (Auto-detected)
The extension looks for these field names:
- `endDate`, `end`, `endTime`, `endDateTime`
- `finish`, `finishDate`, `to`, `toDate`
- `completedAt`, `completed`, `actualDate`, `dueDate`

**Note**: If no end date is found, the start date is used (for point-in-time events).

## 🔍 Optional Fields (Auto-detected)

### ID Fields
- `id`, `ID`, `_id`, `uuid`, `key`, `name`, `title`
- `taskId`, `eventId`, `projectId`, `phaseId`, `sprintId`
- `milestoneId`, `version`, `deploymentId`

### Y-Axis Grouping Fields
- `priority`, `level`, `status`, `type`, `category`
- `environment`, `team`, `assignee`, `budget`, `cost`
- `importance`, `criticality`, `severity`, `velocity`

## 📊 JSON Examples

### 1. Simple Events
```json
{
  "events": [
    {
      "id": "meeting-1",
      "name": "Team Meeting",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T10:00:00Z",
      "priority": 3
    }
  ]
}
```

### 2. Flexible Field Names
```json
{
  "tasks": [
    {
      "taskId": "TASK-001",
      "title": "Fix bug",
      "begin": "2024-01-20T09:00:00Z",
      "finish": "2024-01-22T17:00:00Z",
      "assignee": "John Doe"
    }
  ]
}
```

### 3. Point-in-Time Events (No End Date)
```json
{
  "milestones": [
    {
      "name": "Release v1.0",
      "targetDate": "2024-03-15T17:00:00Z",
      "criticality": 5
    }
  ]
}
```

### 4. Nested Arrays
```json
{
  "project": {
    "data": {
      "sprints": [
        {
          "sprintId": "SPRINT-001",
          "start": "2024-01-01T00:00:00Z",
          "end": "2024-01-15T23:59:59Z",
          "velocity": 32
        }
      ]
    }
  }
}
```

### 5. Mixed Field Types
```json
{
  "deployments": [
    {
      "version": "v1.0.0",
      "deployedAt": "2024-02-15T12:00:00Z",
      "completedAt": "2024-02-15T12:45:00Z",
      "environment": "production",
      "status": "success"
    }
  ],
  "meetings": [
    {
      "subject": "Daily Standup",
      "startDate": "2024-01-16T09:00:00Z",
      "endDate": "2024-01-16T09:30:00Z",
      "attendees": 8
    }
  ]
}
```

## 🎨 Array Type Detection

The extension automatically detects the type of timeline data based on the **array key name**:

| Array Key | Detected Type | Color |
|-----------|---------------|-------|
| `events` | Events | Blue |
| `tasks` | Tasks | Green |
| `deployments` | Deployments | Red |
| `milestones` | Milestones | Pink |
| `sprints` | Sprints | Orange |
| `phases` | Phases | Brown |
| `projects` | Projects | Purple |
| `meetings` | Meetings | Gray |
| `releases` | Releases | Cyan |
| *any other* | Custom | Auto-assigned |

## ✅ What Works Automatically

1. **Any array name**: `events`, `tasks`, `custom_timeline`, etc.
2. **Flexible date formats**: ISO 8601, date strings, timestamps
3. **Optional fields**: Missing ID, Y-axis, or other fields won't cause errors
4. **Nested structures**: Arrays anywhere in your JSON hierarchy
5. **Mixed naming**: Different field names in the same file
6. **Point-in-time events**: Events with only start dates

## 🚫 What Doesn't Work

1. **No date fields**: Arrays without any recognizable date fields
2. **Invalid dates**: Fields that can't be parsed as dates
3. **Empty arrays**: Arrays with no items
4. **Non-object items**: Array items that aren't objects

## 🔧 Manual Configuration (Optional)

If auto-detection doesn't work perfectly, you can still create manual configurations:

1. **Command Palette**: "Edit Timeline Configuration"
2. **Configuration Panel**: Click "📝 Edit JSON Config"
3. **Manual file**: Create `timeline-config.json` in workspace

## 🎯 Best Practices

1. **Use standard field names** when possible (`startDate`, `endDate`, `id`)
2. **Include meaningful IDs** for better identification
3. **Add grouping fields** (`priority`, `team`, `status`) for better visualization
4. **Use ISO date format** for consistency
5. **Test with small files** first to verify detection

## 🧪 Testing Auto-Detection

Use the `comprehensive-example.json` file in the sample project to see all patterns in action:
- Multiple array types
- Different field naming conventions
- Nested structures
- Optional fields
- Point-in-time events

The extension will automatically detect and visualize all timeline data without any configuration!