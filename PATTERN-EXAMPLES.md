# JSON Pattern Examples

This document shows all the different JSON patterns supported by the Timeline Visualizer and their corresponding configurations.

## Pattern 1: Simple Events Array

```json
{
  "events": [
    {
      "id": "event-1",
      "name": "Project Meeting",
      "startDate": "2024-01-15T09:00:00Z",
      "endDate": "2024-01-15T17:00:00Z",
      "priority": 5
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
  "idPath": "id"
}
```

## Pattern 2: Timeline with Different Field Names

```json
{
  "timeline": [
    {
      "name": "Discovery Phase",
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-02-29T23:59:59Z",
      "level": 1
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "timeline",
  "arrayPath": "timeline",
  "startDatePath": "start",
  "endDatePath": "end",
  "yAxisPath": "level",
  "idPath": "name"
}
```

## Pattern 3: Nested Array Path

```json
{
  "data": {
    "tasks": [
      {
        "taskId": "TASK-001",
        "title": "Setup Environment",
        "startTime": "2024-01-16T09:00:00Z",
        "endTime": "2024-01-18T17:00:00Z",
        "priority": 1
      }
    ]
  }
}
```

**Configuration:**
```json
{
  "name": "tasks",
  "arrayPath": "data.tasks",
  "startDatePath": "startTime",
  "endDatePath": "endTime",
  "yAxisPath": "priority",
  "idPath": "taskId"
}
```

## Pattern 4: Deployments with Environment Grouping

```json
{
  "deployments": [
    {
      "version": "v1.0.0",
      "deployedAt": "2024-01-20T14:30:00Z",
      "completedAt": "2024-01-20T15:45:00Z",
      "environment": "production"
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "deployments",
  "arrayPath": "deployments",
  "startDatePath": "deployedAt",
  "endDatePath": "completedAt",
  "yAxisPath": "environment",
  "idPath": "version"
}
```

## Pattern 5: Projects with Budget Grouping

```json
{
  "projects": [
    {
      "projectName": "Web App",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-06-30T23:59:59Z",
      "budget": 500000
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "projects",
  "arrayPath": "projects",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "budget",
  "idPath": "projectName"
}
```

## Pattern 6: Phases with Numeric Grouping

```json
{
  "phases": [
    {
      "phaseId": "PHASE-1",
      "name": "Planning",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-02-15T23:59:59Z",
      "budget": 150000
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "phases",
  "arrayPath": "phases",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "budget",
  "idPath": "phaseId"
}
```

## Pattern 7: Milestones with Nullable End Dates

```json
{
  "milestones": [
    {
      "milestoneId": "M1",
      "title": "Requirements Done",
      "targetDate": "2024-02-15T17:00:00Z",
      "actualDate": "2024-02-14T16:30:00Z",
      "criticality": 5
    },
    {
      "milestoneId": "M2",
      "title": "Design Complete",
      "targetDate": "2024-04-30T17:00:00Z",
      "actualDate": null,
      "criticality": 4
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "milestones",
  "arrayPath": "milestones",
  "startDatePath": "targetDate",
  "endDatePath": "actualDate",
  "yAxisPath": "criticality",
  "idPath": "milestoneId"
}
```

## Pattern 8: Sprints with Velocity Tracking

```json
{
  "sprints": [
    {
      "sprintId": "SPRINT-001",
      "name": "Foundation",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-29T23:59:59Z",
      "velocity": 32
    }
  ]
}
```

**Configuration:**
```json
{
  "name": "sprints",
  "arrayPath": "sprints",
  "startDatePath": "startDate",
  "endDatePath": "endDate",
  "yAxisPath": "velocity",
  "idPath": "sprintId"
}
```

## Complete Configuration File

Here's a complete `timeline-config.json` that handles all the above patterns:

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
    },
    {
      "name": "timeline",
      "arrayPath": "timeline",
      "startDatePath": "start",
      "endDatePath": "end",
      "yAxisPath": "level",
      "idPath": "name",
      "color": "#ff7f0e",
      "enabled": true
    },
    {
      "name": "tasks",
      "arrayPath": "data.tasks",
      "startDatePath": "startTime",
      "endDatePath": "endTime",
      "yAxisPath": "priority",
      "idPath": "taskId",
      "color": "#2ca02c",
      "enabled": true
    },
    {
      "name": "deployments",
      "arrayPath": "deployments",
      "startDatePath": "deployedAt",
      "endDatePath": "completedAt",
      "yAxisPath": "environment",
      "idPath": "version",
      "color": "#d62728",
      "enabled": true
    },
    {
      "name": "projects",
      "arrayPath": "projects",
      "startDatePath": "startDate",
      "endDatePath": "endDate",
      "yAxisPath": "budget",
      "idPath": "projectName",
      "color": "#9467bd",
      "enabled": true
    },
    {
      "name": "phases",
      "arrayPath": "phases",
      "startDatePath": "startDate",
      "endDatePath": "endDate",
      "yAxisPath": "budget",
      "idPath": "phaseId",
      "color": "#8c564b",
      "enabled": true
    },
    {
      "name": "milestones",
      "arrayPath": "milestones",
      "startDatePath": "targetDate",
      "endDatePath": "actualDate",
      "yAxisPath": "criticality",
      "idPath": "milestoneId",
      "color": "#e377c2",
      "enabled": true
    },
    {
      "name": "sprints",
      "arrayPath": "sprints",
      "startDatePath": "startDate",
      "endDatePath": "endDate",
      "yAxisPath": "velocity",
      "idPath": "sprintId",
      "color": "#7f7f7f",
      "enabled": true
    }
  ]
}
```

## Key Points

1. **Array Paths**: Can be simple (`"events"`) or nested (`"data.tasks"`)
2. **Date Fields**: Support various field names (`startDate`, `start`, `deployedAt`, `targetDate`)
3. **Y-Axis Grouping**: Can be strings (`environment`), numbers (`budget`, `priority`), or any field
4. **ID Fields**: Used for unique identification and labeling
5. **Nullable Dates**: End dates can be `null` for ongoing or planned items
6. **Colors**: Each configuration should have a unique color for visual distinction