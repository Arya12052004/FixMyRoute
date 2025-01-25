// Initialize the map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Array to store reported issues
const reportedIssues = [];

// Add a click listener to place a marker
map.on('click', (e) => {
    const { lat, lng } = e.latlng;

    // Check if this location is already reported
    const existingIssue = reportedIssues.find(issue => 
        Math.abs(issue.lat - lat) < 0.001 && Math.abs(issue.lng - lng) < 0.001
    );

    if (existingIssue) {
        existingIssue.count++; // Increase count
        alert(`This location has been reported ${existingIssue.count} times.`);
    } else {
        // Prompt user for issue description
        const description = prompt('Describe the road issue:');
        if (description) {
            reportedIssues.push({ lat, lng, description, count: 1 });
            L.marker([lat, lng])
                .addTo(map)
                .bindPopup(`Issue: ${description} (Reported 1 time)`)
                .openPopup();
        }
    }

    console.log('Current Issues:', reportedIssues);
});

function renderReports() {
    const reportsDiv = document.getElementById('reports');
    reportsDiv.innerHTML = '<h2>Reported Issues</h2>';
    reportedIssues.forEach((issue, index) => {
        reportsDiv.innerHTML += `
            <p>${index + 1}. ${issue.description} - Latitude: ${issue.lat.toFixed(4)}, Longitude: ${issue.lng.toFixed(4)} 
            (Reported ${issue.count} times)</p>`;
    });
}

// Call renderReports whenever an issue is added
map.on('click', () => renderReports());

