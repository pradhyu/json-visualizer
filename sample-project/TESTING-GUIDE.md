# Testing Guide for Sample Project

## 🧪 Complete Testing Checklist

### 1. Configuration Loading Test
- **Open**: Right-click `sample-project` folder → "Open Directory in Timeline Visualizer"
- **Expected**: Should see 8 configurations in the left panel (events, timeline, tasks, deployments, projects, phases, milestones, sprints)
- **Verify**: Console should show "Loaded configurations from JSON file: [array of config names]"

### 2. Individual File Loading Tests

#### Test A: comprehensive-example.json
- **Load**: Select `comprehensive-example.json` → "Load Selected"
- **Expected**: Should see all 8 data series with different colors
- **Data Count**: Should show ~25+ entities across all series

#### Test B: project-timeline.json  
- **Load**: Select `project-timeline.json` → "Load Selected"
- **Expected**: Should see phases, milestones, and sprints
- **Data Count**: Should show ~12+ entities

#### Test C: deployment-history.json
- **Load**: Select `deployment-history.json` → "Load Selected"  
- **Expected**: Should see deployments and events
- **Data Count**: Should show ~10+ entities

#### Test D: team-schedule.json
- **Load**: Select `team-schedule.json` → "Load Selected"
- **Expected**: Should see timeline, tasks, and projects
- **Data Count**: Should show ~10+ entities

### 3. Multiple File Loading Test
- **Load**: Select ALL JSON files → "Load Selected"
- **Expected**: Combined data from all files
- **Data Count**: Should show 40+ entities total
- **Colors**: Each series should have distinct colors

### 4. Filtering Tests

#### Table Filters (should affect both table AND chart):
- `status` → `completed` (should filter to completed items only)
- `environment` → `production` (should show only production deployments)
- `team` → `Backend` (should show only backend-related items)
- `priority` → `5` (should show only highest priority items)

#### Chart Interactions:
- **Hover**: Should show detailed tooltips
- **Zoom**: Mouse wheel should zoom in/out
- **Pan**: Drag to pan across timeline
- **Click**: Should select/deselect blocks

### 5. Configuration Editing Test
- **Method 1**: Click "Configuration" toggle → "📝 Edit JSON Config"
- **Method 2**: Command Palette → "Edit Timeline Configuration"
- **Expected**: Should open `timeline-config.json` in editor
- **Test Edit**: Change a color, save, reload data → should see new color

### 6. Expected Results Summary

| File | Arrays Found | Entity Count | Key Features |
|------|-------------|--------------|--------------|
| comprehensive-example.json | 8 | ~25 | All patterns |
| project-timeline.json | 3 | ~12 | Phases, milestones, sprints |
| deployment-history.json | 2 | ~10 | Deployments, events |
| team-schedule.json | 3 | ~10 | Timeline, tasks, projects |
| **ALL FILES** | **8 unique** | **~40+** | **Complete dataset** |

### 7. Troubleshooting

#### If no data appears:
1. Check console for "Loaded configurations from JSON file" message
2. Verify `timeline-config.json` exists in sample-project folder
3. Check that JSON files have the expected array structures

#### If some arrays don't load:
1. Check configuration `arrayPath` matches JSON structure
2. Verify `startDatePath` and `endDatePath` exist in data
3. Check for valid date formats in the data

#### If filtering doesn't work:
1. Verify table filters affect both table and chart
2. Check that filtered data appears in both views
3. Clear filters to see all data again

### 8. Success Criteria

✅ **Configuration Loading**: 8 configurations loaded from JSON file  
✅ **Data Loading**: All JSON files load successfully  
✅ **Visualization**: Chart shows colored timeline blocks  
✅ **Table Display**: Table shows all entity data with filters  
✅ **Filtering**: Table filters affect both table and chart  
✅ **Interactions**: Hover, zoom, pan work on chart  
✅ **Config Editing**: Can open and edit timeline-config.json  

If all tests pass, the JSON Timeline Visualizer is working correctly with the sample project!