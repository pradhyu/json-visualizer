# Sample E-commerce Project Timeline

This directory contains sample JSON files that demonstrate the JSON Timeline Visualizer extension capabilities.

## Files Included

### 1. `project-timeline.json`
Contains project phases, milestones, and sprints for an e-commerce platform development project.

**Data Arrays:**
- `phases`: Major project phases (Planning, Design, Backend, Frontend, Testing)
- `milestones`: Key project milestones with target and actual dates
- `sprints`: Development sprints with velocity tracking

### 2. `deployment-history.json`
Contains deployment history and related events.

**Data Arrays:**
- `deployments`: Version deployments across different environments
- `events`: Deployment-related events and hotfixes

### 3. `team-schedule.json`
Contains team schedules, tasks, and project information.

**Data Arrays:**
- `timeline`: Team sprint schedules and deliverables
- `data.tasks`: Individual development tasks with assignments
- `projects`: High-level project information with budgets

### 4. `timeline-config.json`
Configuration file that defines how to interpret the JSON data for timeline visualization.

## How to Use

1. **Open Directory**: Right-click on the `sample-project` folder in VS Code Explorer
2. **Select**: "Open Directory in Timeline Visualizer"
3. **Browse Files**: Use the file explorer in the visualizer to select and load different JSON files
4. **Filter Data**: Use the table column filters to focus on specific data
5. **Interact**: Hover, click, and zoom on the timeline chart

## Features Demonstrated

- **Multiple Array Types**: Different data structures in the same project
- **Date Formats**: Various ISO date formats and null handling
- **Nested Paths**: Configuration for nested JSON structures (e.g., `data.tasks`)
- **Y-Axis Grouping**: Different grouping strategies (budget, priority, environment)
- **Color Coding**: Distinct colors for each data series
- **Filtering**: Table filters that sync with chart display

## Configuration Examples

The `timeline-config.json` shows how to configure:
- Simple array paths: `"phases"`
- Nested array paths: `"data.tasks"`
- Different date field names: `"startDate"`, `"deployedAt"`, `"start"`
- Various Y-axis groupings: budget amounts, priority levels, environment names
- Custom colors for visual distinction

## Try These Actions

1. **Load Multiple Files**: Select multiple JSON files to see combined timeline
2. **Filter by Status**: Use table filters to show only "completed" or "in-progress" items
3. **Filter by Team**: Filter tasks by assignee or team
4. **Filter by Environment**: In deployment data, filter by "production" or "staging"
5. **Date Range Focus**: Use chart zoom to focus on specific time periods
6. **Edit Configuration**: Use "Edit JSON Config" to modify array configurations

This sample project demonstrates a realistic software development timeline with multiple data sources and perspectives.