// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js';
import { getDatabase, ref, push, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js';

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
const database = getDatabase(app);

// Initialize the map
const map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors',
}).addTo(map);

// Array to store reported issues
let reportedIssues = [];
let markers = {}; // Store markers for deletion

// Add a click listener to place a marker
map.on('click', (e) => {
    const { lat, lng } = e.latlng;
    const description = prompt('Describe the road issue:');
    if (description) {
        addReport(lat, lng, description);
    }
});

// Function to add a report to Firebase
function addReport(lat, lng, description) {
    const reportRef = ref(database, 'reports');
    const newReportRef = push(reportRef);
    const reportData = { lat, lng, description };

    set(newReportRef, reportData)
        .then(() => console.log('Report saved successfully'))
        .catch((error) => console.error('Error saving report:', error));
}

// Function to delete a report from Firebase
function deleteReport(reportId) {
    const reportRef = ref(database, `reports/${reportId}`);
    remove(reportRef)
        .then(() => {
            console.log('Report deleted successfully');
            if (markers[reportId]) {
                map.removeLayer(markers[reportId]); // Remove marker from map
                delete markers[reportId];
            }
        })
        .catch((error) => console.error('Error deleting report:', error));
}

// Function to render reports on the page
function renderReports() {
    const reportList = document.getElementById('report-list');
    reportList.innerHTML = '';

    reportedIssues.forEach((issue) => {
        const listItem = document.createElement('div');
        listItem.classList.add('report-item');

        listItem.innerHTML = `
            <p>${issue.description} - Lat: ${issue.lat.toFixed(4)}, Lng: ${issue.lng.toFixed(4)}</p>
            <button class="delete-btn" data-id="${issue.id}">Delete</button>
        `;

        reportList.appendChild(listItem);
    });

    // Add delete functionality
    document.querySelectorAll('.delete-btn').forEach((button) => {
        button.addEventListener('click', () => {
            const reportId = button.getAttribute('data-id');
            deleteReport(reportId);
        });
    });
}

// Function to load reports from Firebase and display them
function getReports() {
    const reportsRef = ref(database, 'reports');
    onValue(reportsRef, (snapshot) => {
        const reports = snapshot.val();
        reportedIssues = [];

        if (reports) {
            for (const id in reports) {
                const report = { id, ...reports[id] };
                reportedIssues.push(report);

                // Add marker to the map if not already added
                if (!markers[id]) {
                    const marker = L.marker([report.lat, report.lng])
                        .addTo(map)
                        .bindPopup(report.description);
                    markers[id] = marker;
                }
            }
        }

        renderReports();
    });
}

// Load reports on page load
getReports();
