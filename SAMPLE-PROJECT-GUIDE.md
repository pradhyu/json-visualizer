# Sample Project Quick Start Guide

## 🚀 Getting Started with the Sample Project

The `sample-project` directory contains realistic JSON timeline data that demonstrates all the features of the JSON Timeline Visualizer.

### 📁 What's Included

- **`project-timeline.json`** - Project phases, milestones, and sprints
- **`deployment-history.json`** - Deployment history and events  
- **`team-schedule.json`** - Team schedules, tasks, and projects
- **`comprehensive-example.json`** - Complete example with all data types
- **`timeline-config.json`** - Pre-configured settings for all data types

### 🎯 JSON Structure Pattern

All files follow the pattern: **Array Key = Object Type**

```json
{
  "events": [...],        // Objects of type "events"
  "tasks": [...],         // Objects of type "tasks"  
  "deployments": [...],   // Objects of type "deployments"
  "projects": [...]       // Objects of type "projects"
}
```

### 🎯 How to Use

1. **Open the Sample Directory**:
   - Right-click on the `sample-project` folder in VS Code Explorer
   - Select "Open Directory in Timeline Visualizer"

2. **Browse and Load Files**:
   - Use the File Explorer panel on the left
   - Select one or multiple JSON files
   - Click "Load Selected" to visualize the data

3. **Test Filtering** (This is now fixed!):
   - Type in any table column filter box
   - Watch both the table AND chart update in real-time
   - Try filtering by: status, team, environment, priority

### 🧪 Try These Filters

| Column | Filter Value | What You'll See |
|--------|-------------|-----------------|
| `status` | `completed` | Only finished items |
| `environment` | `production` | Only production deployments |
| `assignee` | `Backend` | Only backend team tasks |
| `priority` | `5` | Only highest priority items |
| `team` | `Frontend` | Only frontend team projects |

### 🎨 Visual Features

- **Color-coded series**: Each data type has its own color
- **Interactive tooltips**: Hover over timeline blocks for details
- **Zoom and pan**: Mouse wheel to zoom, drag to pan
- **Date format**: All dates shown in yyyy-mm-dd format
- **Synchronized filtering**: Table filters affect both views

### ⚙️ Configuration

The sample includes a pre-configured `timeline-config.json` that shows:
- How to handle nested paths (`data.tasks`)
- Different date field names (`startDate`, `deployedAt`, `start`)
- Various Y-axis groupings (budget, priority, environment)
- Custom color schemes

### 🔧 Customization

1. **Edit Configuration**: 
   - Click "Configuration" toggle → "📝 Edit JSON Config"
   - Or use Command Palette: "Edit Timeline Configuration"

2. **Modify Sample Data**:
   - Edit any JSON file to see changes immediately
   - Add new arrays or modify existing ones

### 📊 Expected Results

When you load the sample data, you should see:
- **8 different data series** with distinct colors
- **Timeline spanning 2024** with various project activities
- **Filterable table** with 20+ columns of data
- **Interactive chart** that responds to table filters

This sample project represents a realistic software development timeline with multiple teams, deployments, and project phases - perfect for testing all visualizer features!