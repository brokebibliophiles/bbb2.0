const fs = require('fs');
const path = require('path');

// Read meetups data
const meetupsData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'meetups.json'), 'utf8'));

// Read template file
const template = fs.readFileSync(path.join(__dirname, 'meetup-template.html'), 'utf8');

// Generate a page for each meetup
meetupsData.forEach((meetup, index) => {
    let pageContent = template.replace('const meetup = null;', `const meetup = ${JSON.stringify(meetup)};`);
    fs.writeFileSync(path.join(__dirname, `meetup-${index + 1}.html`), pageContent);
});

console.log(`Generated ${meetupsData.length} meetup pages.`);