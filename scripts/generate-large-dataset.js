const fs = require('fs');
const path = require('path');

// Generate large dataset for performance testing
function generateLargeDataset() {
    const events = [];
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-12-31');
    
    const statuses = ['planned', 'in-progress', 'completed', 'cancelled'];
    const priorities = [1, 2, 3, 4, 5];
    const teams = ['Frontend', 'Backend', 'DevOps', 'QA', 'Design', 'Product'];
    
    // Generate 500+ events
    for (let i = 1; i <= 500; i++) {
        const eventStart = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        const duration = Math.random() * 30 * 24 * 60 * 60 * 1000; // Up to 30 days
        const eventEnd = new Date(eventStart.getTime() + duration);
        
        events.push({
            id: `EVENT-${String(i).padStart(3, '0')}`,
            name: `Performance Test Event ${i}`,
            description: `This is a generated event for performance testing purposes. Event number ${i} with various properties.`,
            startDate: eventStart.toISOString(),
            endDate: eventEnd.toISOString(),
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            status: statuses[Math.floor(Math.random() * statuses.length)],
            team: teams[Math.floor(Math.random() * teams.length)],
            estimatedHours: Math.floor(Math.random() * 200) + 1,
            actualHours: Math.floor(Math.random() * 250) + 1,
            budget: Math.floor(Math.random() * 100000) + 5000,
            tags: [`tag-${Math.floor(Math.random() * 20) + 1}`, `category-${Math.floor(Math.random() * 10) + 1}`]
        });
    }
    
    const dataset = {
        events,
        metadata: {
            generated: new Date().toISOString(),
            totalEvents: events.length,
            dateRange: {
                start: startDate.toISOString(),
                end: endDate.toISOString()
            }
        }
    };
    
    return dataset;
}

// Generate and save the dataset
const largeDataset = generateLargeDataset();
const outputPath = path.join(__dirname, '..', 'sample-data', 'performance-test-large.json');
fs.writeFileSync(outputPath, JSON.stringify(largeDataset, null, 2));

console.log(`Generated large dataset with ${largeDataset.events.length} events`);
console.log(`Saved to: ${outputPath}`);