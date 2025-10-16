# Usage Examples

This document provides real-world examples of using the JSON Timeline Visualizer for different scenarios.

## Project Management

### Agile Sprint Planning

**Use Case**: Visualize sprint timelines, milestones, and deliverables

**JSON Structure:**
```json
{
  "sprints": [
    {
      "sprintId": "SPRINT-001",
      "name": "User Authentication",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-01-29T23:59:59Z",
      "velocity": 25,
      "status": "completed"
    },
    {
      "sprintId": "SPRINT-002",
      "name": "Product Catalog",
      "startDate": "2024-01-30T00:00:00Z",
      "endDate": "2024-02-13T23:59:59Z",
      "velocity": 30,
      "status": "in-progress"
    }
  ],
  "milestones": [
    {
      "milestoneId": "M1",
      "title": "MVP Release",
      "targetDate": "2024-03-15T17:00:00Z",
      "actualDate": null,
      "criticality": 5
    }
  ]
}
```

**Configuration:**
```json
[
  {
    "name": "sprints",
    "arrayPath": "sprints",
    "startDatePath": "startDate",
    "endDatePath": "endDate",
    "yAxisPath": "velocity",
    "idPath": "sprintId",
    "color": "#2ca02c",
    "enabled": true
  },
  {
    "name": "milestones",
    "arrayPath": "milestones",
    "startDatePath": "targetDate",
    "endDatePath": "actualDate",
    "yAxisPath": "criticality",
    "idPath": "milestoneId",
    "color": "#d62728",
    "enabled": true
  }
]
```

### Resource Allocation

**Use Case**: Track team member assignments and availability

**JSON Structure:**
```json
{
  "resources": [
    {
      "resourceId": "DEV-001",
      "name": "Senior Developer - Alice",
      "allocation": "Project Alpha",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-03-31T23:59:59Z",
      "utilization": 100,
      "skillLevel": 5
    },
    {
      "resourceId": "QA-001",
      "name": "QA Engineer - Bob",
      "allocation": "Project Beta",
      "startDate": "2024-02-01T00:00:00Z",
      "endDate": "2024-05-31T23:59:59Z",
      "utilization": 75,
      "skillLevel": 4
    }
  ]
}
```

## DevOps & Operations

### Deployment Timeline

**Use Case**: Track deployments, rollbacks, and maintenance windows

**JSON Structure:**
```json
{
  "deployments": [
    {
      "deploymentId": "DEPLOY-001",
      "service": "user-service",
      "version": "v2.1.0",
      "environment": "production",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T10:15:00Z",
      "status": "success",
      "duration": 15
    }
  ],
  "maintenanceWindows": [
    {
      "windowId": "MAINT-001",
      "description": "Database Upgrade",
      "startTime": "2024-01-25T02:00:00Z",
      "endTime": "2024-01-25T06:00:00Z",
      "impact": 2,
      "plannedBy": "DBA Team"
    }
  ],
  "incidents": [
    {
      "incidentId": "INC-001",
      "title": "Database Connection Timeout",
      "startDate": "2024-01-18T15:30:00Z",
      "endDate": "2024-01-18T16:45:00Z",
      "severity": 3,
      "affectedUsers": 1250
    }
  ]
}
```

### System Monitoring

**Use Case**: Visualize system events, alerts, and performance incidents

**JSON Structure:**
```json
{
  "systemEvents": [
    {
      "eventId": "SYS-001",
      "type": "server_restart",
      "timestamp": "2024-01-15T03:30:00Z",
      "endTimestamp": "2024-01-15T03:35:00Z",
      "severity": 2,
      "server": "web-01"
    }
  ],
  "alerts": [
    {
      "alertId": "ALERT-001",
      "message": "High CPU Usage",
      "triggeredAt": "2024-01-15T15:30:00Z",
      "resolvedAt": "2024-01-15T16:15:00Z",
      "priority": 3,
      "source": "monitoring-system"
    }
  ]
}
```

## Business Analytics

### Marketing Campaigns

**Use Case**: Track campaign performance and overlap analysis

**JSON Structure:**
```json
{
  "campaigns": [
    {
      "campaignId": "CAMP-001",
      "name": "Q1 Product Launch",
      "startDate": "2024-01-15T00:00:00Z",
      "endDate": "2024-03-31T23:59:59Z",
      "budget": 50000,
      "channel": "digital",
      "performance": 85
    },
    {
      "campaignId": "CAMP-002",
      "name": "Valentine's Day Special",
      "startDate": "2024-02-01T00:00:00Z",
      "endDate": "2024-02-14T23:59:59Z",
      "budget": 25000,
      "channel": "social",
      "performance": 92
    }
  ]
}
```

### Sales Cycles

**Use Case**: Analyze sales pipeline and deal progression

**JSON Structure:**
```json
{
  "deals": [
    {
      "dealId": "DEAL-001",
      "company": "Acme Corp",
      "stage": "negotiation",
      "startDate": "2024-01-10T00:00:00Z",
      "expectedClose": "2024-02-15T00:00:00Z",
      "value": 150000,
      "probability": 75
    }
  ],
  "opportunities": [
    {
      "opportunityId": "OPP-001",
      "source": "inbound",
      "createdDate": "2024-01-05T00:00:00Z",
      "qualifiedDate": "2024-01-12T00:00:00Z",
      "score": 85,
      "region": "north-america"
    }
  ]
}
```

## Advanced Use Cases

### Multi-Level Project Hierarchy

**Use Case**: Visualize projects, phases, and tasks in a hierarchical timeline

**JSON Structure:**
```json
{
  "projects": [
    {
      "projectId": "PROJ-001",
      "name": "E-commerce Platform",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-12-31T23:59:59Z",
      "budget": 1000000,
      "priority": 1
    }
  ],
  "phases": [
    {
      "phaseId": "PHASE-001",
      "projectId": "PROJ-001",
      "name": "Discovery & Planning",
      "startDate": "2024-01-01T00:00:00Z",
      "endDate": "2024-02-29T23:59:59Z",
      "budget": 200000,
      "complexity": 2
    }
  ],
  "tasks": [
    {
      "taskId": "TASK-001",
      "phaseId": "PHASE-001",
      "name": "Requirements Gathering",
      "startDate": "2024-01-01T09:00:00Z",
      "endDate": "2024-01-15T17:00:00Z",
      "assignee": "John Doe",
      "effort": 80
    }
  ]
}
```

### Event Correlation Analysis

**Use Case**: Correlate different types of events to identify patterns

**JSON Structure:**
```json
{
  "userSessions": [
    {
      "sessionId": "SESSION-001",
      "userId": "user123",
      "startTime": "2024-01-15T09:00:00Z",
      "endTime": "2024-01-15T10:30:00Z",
      "duration": 90,
      "pages": 15
    }
  ],
  "purchases": [
    {
      "orderId": "ORDER-001",
      "userId": "user123",
      "orderTime": "2024-01-15T10:15:00Z",
      "completedTime": "2024-01-15T10:18:00Z",
      "amount": 299.99,
      "items": 3
    }
  ],
  "supportTickets": [
    {
      "ticketId": "TICKET-001",
      "userId": "user123",
      "createdAt": "2024-01-16T14:20:00Z",
      "resolvedAt": "2024-01-16T15:45:00Z",
      "priority": 2,
      "category": "billing"
    }
  ]
}
```

## Configuration Tips

### 1. Color Coding Strategy
- **By Priority**: Use red for high priority, yellow for medium, green for low
- **By Status**: Use green for completed, blue for in-progress, gray for planned
- **By Team**: Assign consistent colors to different teams or departments
- **By Type**: Use distinct colors for different event types

### 2. Y-Axis Selection
- **Priority/Severity**: Natural ordering for importance-based visualization
- **Team Size**: Shows resource allocation
- **Budget/Value**: Financial impact visualization
- **Performance Metrics**: KPI-based positioning

### 3. Multi-File Strategies
- **By Time Period**: Separate files for different quarters or years
- **By Department**: Different teams maintain their own JSON files
- **By Project**: Each project has its own timeline file
- **By Environment**: Separate dev, staging, and production timelines

## Workflow Examples

### 1. Sprint Review Preparation
1. Load sprint data from project management tool export
2. Configure sprints, tasks, and milestones
3. Filter by current quarter
4. Identify overlapping work and dependencies
5. Export insights for team discussion

### 2. Incident Post-Mortem
1. Gather deployment, incident, and alert data
2. Configure timeline to show all event types
3. Zoom to incident timeframe
4. Correlate deployments with incidents
5. Document timeline for root cause analysis

### 3. Resource Planning
1. Load current resource allocation data
2. Add planned project timelines
3. Identify resource conflicts and gaps
4. Adjust allocations in table view
5. Save updated resource plan

### 4. Performance Analysis
1. Import system metrics and events
2. Configure different metric types
3. Filter by time range of interest
4. Identify patterns and correlations
5. Generate reports for stakeholders

## Best Practices

### Data Preparation
- **Consistent Formats**: Use ISO 8601 dates when possible
- **Complete Data**: Ensure all required fields are populated
- **Validation**: Validate JSON structure before loading
- **Backup**: Keep original files before editing

### Visualization Setup
- **Start Simple**: Begin with one array type, add complexity gradually
- **Test Configurations**: Use sample data to verify configurations
- **Color Consistency**: Maintain consistent color schemes across files
- **Performance**: Monitor performance with large datasets

### Analysis Workflow
- **Filter First**: Use table filters to focus on relevant data
- **Zoom Appropriately**: Choose the right time granularity for your analysis
- **Save Changes**: Regularly save configuration and data modifications
- **Document Insights**: Keep notes on findings and decisions