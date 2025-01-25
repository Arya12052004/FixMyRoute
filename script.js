// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, push, set, onValue } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC63W4jPchqZNKNnYqC3qYaWs37YODXfUQ",
    authDomain: "fixmyroute-51b94.firebaseapp.com",
    databaseURL: "https://fixmyroute-51b94-default-rtdb.firebaseio.com",
    projectId: "fixmyroute-51b94",
    storageBucket: "fixmyroute-51b94.appspot.com",
    messagingSenderId: "63914466762",
    appId: "1:63914466762:web:0ec8d7e0b3583146170333",
    measurementId: "G-V4HYMGZCRK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database
const database = getDatabase(app);

// Initialize the map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Array to store reported issues (to render on page)
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

            // Save report to Firebase
            addReport(lat, lng, description);
        }
    }

    console.log('Current Issues:', reportedIssues);
    renderReports();
});

// Function to render reports on the page
function renderReports() {
    const reportsDiv = document.getElementById('reports');
    reportsDiv.innerHTML = '<h2>Reported Issues</h2>';
    reportedIssues.forEach((issue, index) => {
        reportsDiv.innerHTML += `
            <p>${index + 1}. ${issue.description} - Latitude: ${issue.lat.toFixed(4)}, Longitude: ${issue.lng.toFixed(4)} 
            (Reported ${issue.count} times)</p>`;
    });
}

// Function to add a report to Firebase
function addReport(lat, lng, description) {
    const reportRef = ref(database, 'reports');
    const newReportRef = push(reportRef); // Generate a unique key for each report
    const reportData = { lat, lng, description, count: 1 };

    set(newReportRef, reportData)
        .then(() => {
            console.log('Report saved successfully');
        })
        .catch((error) => {
            console.error('Error saving report:', error);
        });
}

// Function to load reports from Firebase and display them
function getReports() {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
        const reports = snapshot.val();
        if (reports) {
            for (const id in reports) {
                const { lat, lng, description } = reports[id];
                console.log(`Lat: ${lat}, Lng: ${lng}, Desc: ${description}`);
                // Add marker to the map
                L.marker([lat, lng]).addTo(map).bindPopup(description);
                // Add report to local array to render on page
                reportedIssues.push({ lat, lng, description, count: 1 });
            }
        }
        renderReports();  // Call to render reports after data is loaded
    });
}

// Load reports on page load
getReports();
