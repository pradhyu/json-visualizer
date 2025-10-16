# Testing the JSON Timeline Visualizer Extension

## Quick Test Steps

1. **Launch Extension Development Host**
   - Press `F5` in VSCode
   - This opens a new VSCode window with the extension loaded

2. **Test with Sample Data**
   - In the new window, open the `sample-data` folder
   - Right-click on `simple-events.json`
   - Select "Open JSON Timeline Visualizer"

3. **Verify Core Features**
   - ✅ Extension opens in a webview panel
   - ✅ Timeline chart displays colored blocks
   - ✅ Data table shows JSON entries
   - ✅ View toggles work (chart/table/config checkboxes)
   - ✅ File explorer shows JSON files with checkboxes

4. **Test Directory Mode**
   - Right-click on the `sample-data` folder
   - Select "Open Directory in Timeline Visualizer"
   - Use checkboxes to select multiple JSON files
   - Click "Load Selected" to visualize multiple files

5. **Test Interactive Features**
   - **Timeline Chart**: Zoom in/out, pan, hover over blocks
   - **Data Table**: Filter columns, edit cells, save changes
   - **Configuration**: Toggle config panel, edit array configurations

## Expected Results

### Timeline Chart
- Colored blocks representing timeline entities
- Latest dates on the left, older dates on the right
- Zoom controls that change axis labels (days → weeks → months)
- Hover tooltips showing entity details
- Keyboard navigation support

### Data Table
- Tabular view of JSON data with metadata columns
- Column filtering that updates the chart
- Editable cells for non-metadata columns
- Save button to persist changes

### File Management
- Directory explorer with JSON file checkboxes
- Multi-file loading capability
- File watching for automatic updates

## Sample Data Files

- `simple-events.json` - Basic timeline with single array
- `multiple-arrays.json` - Multiple array types in one file
- `nested-timeline.json` - Complex nested JSON structure
- `performance-test-large.json` - Large dataset (500+ entities)
- `edge-cases.json` - Edge cases and error conditions
- `directory-test/` - Multiple files for directory testing

## Troubleshooting

If the extension doesn't work:
1. Check the VSCode Developer Console (Help → Toggle Developer Tools)
2. Look for error messages in the console
3. Verify the extension is activated (check Extensions panel)
4. Try reloading the Extension Development Host window

## Configuration Testing

Test different configurations with the sample data:
1. Open Configuration panel (toggle checkbox)
2. Edit existing configurations or add new ones
3. Test different fluent paths like:
   - `events` (simple array)
   - `project.data.timeline.milestones` (nested)
   - `deployments` vs `incidents` (multiple arrays)

The extension should handle all these scenarios gracefully with proper error handling and user feedback.