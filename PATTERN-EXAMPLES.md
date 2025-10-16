# JSON Timeline Visualizer - Pattern Examples

## 🎯 Core Pattern: Array Key = Object Type

The JSON Timeline Visualizer follows a simple, intuitive pattern:

**The array key in your JSON becomes the object type in the visualizer.**

## ✅ Correct Pattern Examples

### Example 1: Simple Event Timeline
```json
{
  "events": [
    {
      "id": "meeting-001",
      "name": "Team Standup",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T09:30:00Z",
      "priority": 3
    }
  ]
}
```
**Result**: Objects are displayed as type "events" 🎉

### Example 2: Project Management
```json
{
  "tasks": [
    {
      "taskId": "TASK-001",
      "title": "Setup Database",
      "startTime": "2024-01-16T09:00:00Z",
      "endTime": "2024-01-18T17:00:00Z",
      "priority": 1
    }
  ],
  "deployments": [
    {
      "version": "v1.0.0",
      "deployedAt": "2024-02-10T10:00:00Z",
      "completedAt": "2024-02-10T10:30:00Z",
      "environment": "production"
    }
  ]
}
```
**Result**: 
- Objects from `tasks` array → type "tasks" 🎉
- Objects from `deployments` array → type "deployments" 🎉

### Example 3: Multiple Project Phases
```json
{
  "phases": [
    {
      "phaseId": "DESIGN",
      "name": "UI/UX Design Phase",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-03-31T23:59:59Z",
      "budget": 150000
    }
  ],
  "milestones": [
    {
      "milestoneId": "M1",
      "title": "Design Complete",
      "targetDate": "2024-03-31T17:00:00Z",
      "actualDate": "2024-04-02T16:30:00Z",
      "criticality": 5
    }
  ]
}
```
**Result**:
- Objects from `phases` array → type "phases" 🎉
- Objects from `milestones` array → type "milestones" 🎉

## 🔧 Configuration Matching

Your `timeline-config.json` should match the array keys:

```json
{
  "configurations": [
    {
      "name": "events",           // ← Matches JSON key "events"
      "arrayPath": "events",      // ← Points to the array
      "startDatePath": "startDate",
      "endDatePath": "endDate",
      "yAxisPath": "priority",
      "idPath": "id",
      "color": "#1f77b4",
      "enabled": true
    },
    {
      "name": "tasks",            // ← Matches JSON key "tasks"
      "arrayPath": "tasks",       // ← Points to the array
      "startDatePath": "startTime",
      "endDatePath": "endTime",
      "yAxisPath": "priority",
      "idPath": "taskId",
      "color": "#2ca02c",
      "enabled": true
    }
  ]
}
```

## 🎨 Visual Result

When you load the JSON, you'll see:
- **Timeline Chart**: Different colored blocks for each object type
- **Data Table**: `_sourceArray` column shows the object type
- **Filters**: You can filter by object type using the `_sourceArray` column
- **Legend**: Each type gets its own color and label

## 📋 Best Practices

1. **Use Descriptive Array Names**: `events`, `tasks`, `deployments`, `milestones`
2. **Keep Names Consistent**: If you use `events` in one file, use `events` in all files
3. **Avoid Nested Arrays**: Put arrays at the top level when possible
4. **Match Configuration Names**: Ensure config `name` matches JSON array key

## 🚫 What to Avoid

### ❌ Nested Arrays (Harder to Configure)
```json
{
  "data": {
    "timeline": {
      "events": [...]  // Requires arrayPath: "data.timeline.events"
    }
  }
}
```

### ❌ Generic Array Names
```json
{
  "items": [...],     // Not descriptive
  "data": [...],      // Too generic
  "list": [...]       // Unclear purpose
}
```

### ❌ Mismatched Configuration
```json
// JSON has "events" but config name is "meetings"
{
  "name": "meetings",      // ❌ Doesn't match
  "arrayPath": "events"    // ❌ Confusing
}
```

## ✅ Perfect Example

```json
{
  "events": [
    {
      "id": "event-001",
      "name": "Project Kickoff",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T11:00:00Z",
      "priority": 5,
      "type": "meeting"
    }
  ],
  "tasks": [
    {
      "taskId": "TASK-001",
      "title": "Setup Environment",
      "startTime": "2024-01-16T09:00:00Z",
      "endTime": "2024-01-18T17:00:00Z",
      "priority": 1,
      "assignee": "John Doe"
    }
  ],
  "deployments": [
    {
      "version": "v1.0.0",
      "deployedAt": "2024-02-10T10:00:00Z",
      "completedAt": "2024-02-10T10:30:00Z",
      "environment": "production",
      "status": "success"
    }
  ]
}
```

**This creates three distinct object types that are easy to identify, filter, and visualize!** 🎉