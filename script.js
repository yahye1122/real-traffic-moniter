// DOM Elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const regionSelect = document.getElementById('region-select');
const trafficDisplay = document.getElementById('traffic-display');
const updateTimeElement = document.getElementById('update-time');
const routeForm = document.getElementById('route-form');
const routeResults = document.getElementById('route-results');
const savedRoutesContainer = document.getElementById('saved-routes-container');
const contactForm = document.getElementById('contact-form');
const contactSuccess = document.getElementById('contact-success');
const startLocation = document.getElementById('start-location');
const endLocation = document.getElementById('end-location');
const startError = document.getElementById('start-error');
const endError = document.getElementById('end-error');
const contactName = document.getElementById('contact-name');
const contactEmail = document.getElementById('contact-email');
const contactMessage = document.getElementById('contact-message');
const contactNameError = document.getElementById('contact-name-error');
const contactEmailError = document.getElementById('contact-email-error');
const contactMessageError = document.getElementById('contact-message-error');

// Traffic Data Simulation
const trafficData = {
    downtown: {
        congestion: 'high',
        avgSpeed: '18 mph',
        incidents: 3,
        delay: '22 min',
        incidentsList: [
            'Multi-vehicle accident on Main St & 5th Ave - expect 15 min delay',
            'Road construction on Elm Street - lane closure until 5 PM',
            'Disabled vehicle on Oak Bridge - right lane blocked'
        ],
        roads: [
            { id: 'downtown-road1', congestion: 'high' },
            { id: 'downtown-road2', congestion: 'medium' },
            { id: 'downtown-road3', congestion: 'low' },
            { id: 'downtown-road4', congestion: 'high' }
        ]
    },
    highway: {
        congestion: 'medium',
        avgSpeed: '45 mph',
        incidents: 1,
        delay: '8 min',
        incidentsList: [
            'Single vehicle accident on Highway 1 North - right shoulder blocked'
        ],
        roads: [
            { id: 'downtown-road1', congestion: 'medium' },
            { id: 'downtown-road2', congestion: 'low' },
            { id: 'downtown-road3', congestion: 'medium' },
            { id: 'downtown-road4', congestion: 'low' }
        ]
    },
    airport: {
        congestion: 'low',
        avgSpeed: '35 mph',
        incidents: 1,
        delay: '5 min',
        incidentsList: [
            'Temporary checkpoint near terminal entrance - minor delays expected'
        ],
        roads: [
            { id: 'downtown-road1', congestion: 'low' },
            { id: 'downtown-road2', congestion: 'low' },
            { id: 'downtown-road3', congestion: 'medium' },
            { id: 'downtown-road4', congestion: 'low' }
        ]
    },
    suburbs: {
        congestion: 'low',
        avgSpeed: '28 mph',
        incidents: 0,
        delay: '2 min',
        incidentsList: [
            'No major incidents reported'
        ],
        roads: [
            { id: 'downtown-road1', congestion: 'low' },
            { id: 'downtown-road2', congestion: 'low' },
            { id: 'downtown-road3', congestion: 'low' },
            { id: 'downtown-road4', congestion: 'low' }
        ]
    },
    industrial: {
        congestion: 'medium',
        avgSpeed: '22 mph',
        incidents: 2,
        delay: '15 min',
        incidentsList: [
            'Truck breakdown on Industrial Parkway - center lane blocked',
            'Railroad crossing malfunction on Factory Road - expect delays'
        ],
        roads: [
            { id: 'downtown-road1', congestion: 'high' },
            { id: 'downtown-road2', congestion: 'medium' },
            { id: 'downtown-road3', congestion: 'medium' },
            { id: 'downtown-road4', congestion: 'high' }
        ]
    }
};

// Saved Routes Management
let savedRoutes = JSON.parse(localStorage.getItem('savedRoutes')) || [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set initial time
    updateCurrentTime();
    
    // Set up navigation
    setupNavigation();
    
    // Set up region change event
    regionSelect.addEventListener('change', updateTrafficDisplay);
    
    // Set up route form submission
    routeForm.addEventListener('submit', handleRoutePlanning);
    
    // Set up contact form submission
    contactForm.addEventListener('submit', handleContactForm);
    
    // Set up form validation events
    setupFormValidation();
    
    // Set up saved routes display
    renderSavedRoutes();
    
    // Set up mouseover/mouseout events for traffic elements
    setupTrafficHoverEffects();
    
    // Set up keyup events for contact form
    setupContactFormEvents();
    
    // Initialize with downtown traffic
    updateTrafficDisplay();
    
    // Auto-update traffic data every 30 seconds
    setInterval(updateCurrentTime, 60000);
    setInterval(simulateTrafficUpdate, 30000);
});

// Navigation Functions
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
            
            // Show target section and hide others
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
            
            // Scroll to top when changing sections
            window.scrollTo(0, 0);
        });
    });
}

// Traffic Display Functions
function updateTrafficDisplay() {
    const selectedRegion = regionSelect.value;
    const regionData = trafficData[selectedRegion];
    const regionNames = {
        downtown: 'Downtown',
        highway: 'Highway 1',
        airport: 'Airport Road',
        suburbs: 'Northern Suburbs',
        industrial: 'Industrial Zone'
    };
    
    // Update header
    trafficDisplay.querySelector('.traffic-header h3').textContent = `${regionNames[selectedRegion]} Traffic Overview`;
    
    // Update metrics
    const metrics = trafficDisplay.querySelector('.traffic-metrics');
    metrics.innerHTML = `
        <div class="metric-item congestion-${regionData.congestion}">
            <div class="metric-label">Congestion Level</div>
            <div class="metric-value">${capitalizeFirstLetter(regionData.congestion)}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Average Speed</div>
            <div class="metric-value">${regionData.avgSpeed}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Active Incidents</div>
            <div class="metric-value">${regionData.incidents}</div>
        </div>
        <div class="metric-item">
            <div class="metric-label">Estimated Delay</div>
            <div class="metric-value">${regionData.delay}</div>
        </div>
    `;
    
    // Update incidents list
    const incidentsList = trafficDisplay.querySelector('#incidents-list');
    incidentsList.innerHTML = '';
    regionData.incidentsList.forEach(incident => {
        const li = document.createElement('li');
        li.textContent = incident;
        incidentsList.appendChild(li);
    });
    
    // Update road congestion
    document.querySelectorAll('.road').forEach(road => {
        // Remove all congestion classes
        road.classList.remove('congestion-low', 'congestion-medium', 'congestion-high');
        
        // Find matching road in region data
        const roadData = regionData.roads.find(r => r.id === road.className.split(' ')[0]);
        if (roadData) {
            road.classList.add(`congestion-${roadData.congestion}`);
        }
    });
    
    // Update map background based on congestion
    const mapContainer = document.querySelector('.map-container');
    if (regionData.congestion === 'high') {
        mapContainer.style.background = 'linear-gradient(to bottom right, #d35400 0%, #c0392b 100%)';
    } else if (regionData.congestion === 'medium') {
        mapContainer.style.background = 'linear-gradient(to bottom right, #f39c12 0%, #d35400 100%)';
    } else {
        mapContainer.style.background = 'linear-gradient(to bottom right, #27ae60 0%, #2ecc71 100%)';
    }
}

function updateCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12
    updateTimeElement.textContent = `${hours}:${minutes} ${ampm}`;
}

function simulateTrafficUpdate() {
    // Randomly update traffic conditions for demonstration
    const regions = Object.keys(trafficData);
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    
    // Only update if not currently viewing this region
    if (regionSelect.value !== randomRegion) {
        const congestionLevels = ['low', 'medium', 'high'];
        const randomCongestion = congestionLevels[Math.floor(Math.random() * congestionLevels.length)];
        
        trafficData[randomRegion].congestion = randomCongestion;
        trafficData[randomRegion].avgSpeed = getRandomSpeed(randomCongestion);
        trafficData[randomRegion].delay = getRandomDelay(randomCongestion);
        
        // Update incidents count based on congestion
        if (randomCongestion === 'high') {
            trafficData[randomRegion].incidents = Math.floor(Math.random() * 3) + 2;
        } else if (randomCongestion === 'medium') {
            trafficData[randomRegion].incidents = Math.floor(Math.random() * 2) + 1;
        } else {
            trafficData[randomRegion].incidents = Math.floor(Math.random() * 2);
        }
    }
    
    // If the current displayed region was updated, refresh the display
    if (regionSelect.value === randomRegion) {
        updateTrafficDisplay();
    }
}

function getRandomSpeed(congestion) {
    switch(congestion) {
        case 'high': return `${Math.floor(Math.random() * 10) + 10} mph`;
        case 'medium': return `${Math.floor(Math.random() * 15) + 25} mph`;
        case 'low': return `${Math.floor(Math.random() * 15) + 40} mph`;
        default: return '30 mph';
    }
}

function getRandomDelay(congestion) {
    switch(congestion) {
        case 'high': return `${Math.floor(Math.random() * 20) + 15} min`;
        case 'medium': return `${Math.floor(Math.random() * 10) + 5} min`;
        case 'low': return `${Math.floor(Math.random() * 5) + 1} min`;
        default: return '5 min';
    }
}

// Route Planning Functions
function handleRoutePlanning(e) {
    e.preventDefault();
    
    // Reset errors
    startError.textContent = '';
    endError.textContent = '';
    
    // Validate form
    let isValid = true;
    if (!startLocation.value.trim()) {
        startError.textContent = 'Starting point is required';
        isValid = false;
    }
    
    if (!endLocation.value.trim()) {
        endError.textContent = 'Destination is required';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Show results
    routeResults.classList.remove('hidden');
    
    // Scroll to results
    routeResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    // Simulate route calculation
    setTimeout(() => {
        // Add save route event listeners
        document.querySelectorAll('.btn-save').forEach(button => {
            button.addEventListener('click', (e) => {
                const routeType = e.target.getAttribute('data-route');
                saveRoute(routeType);
            });
        });
    }, 300);
}

function saveRoute(routeType) {
    // Get route details based on type
    let routeName = '';
    let routePath = '';
    let routeTime = '';
    
    switch(routeType) {
        case 'primary':
            routeName = 'Primary Route';
            routePath = 'Downtown → Central Ave → Highway 1 → Airport Road';
            routeTime = '28 min';
            break;
        case 'alternate':
            routeName = 'Alternate Route';
            routePath = 'Downtown → River Rd → North Blvd → Airport Road';
            routeTime = '35 min';
            break;
        case 'eco':
            routeName = 'Eco Route';
            routePath = 'Downtown → Park Ave → Scenic Drive → Airport Road';
            routeTime = '42 min';
            break;
    }
    
    // Create route object
    const newRoute = {
        id: Date.now(),
        name: routeName,
        start: startLocation.value.trim(),
        end: endLocation.value.trim(),
        path: routePath,
        time: routeTime,
        dateSaved: new Date().toLocaleDateString()
    };
    
    // Add to saved routes array
    savedRoutes.push(newRoute);
    
    // Save to localStorage
    localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
    
    // Re-render saved routes
    renderSavedRoutes();
    
    // Show success message
    alert(`Route "${routeName}" has been saved successfully!`);
}

function renderSavedRoutes() {
    if (savedRoutes.length === 0) {
        savedRoutesContainer.innerHTML = '<div class="no-routes">No saved routes yet. Plan a route and click "Save Route" to store it here.</div>';
        return;
    }
    
    // Sort routes by date saved (newest first)
    savedRoutes.sort((a, b) => new Date(b.dateSaved) - new Date(a.dateSaved));
    
    // Create HTML for saved routes
    let html = '';
    savedRoutes.forEach(route => {
        html += `
            <div class="saved-route-item" data-id="${route.id}">
                <div class="saved-route-info">
                    <div class="saved-route-name">${route.name}</div>
                    <div class="saved-route-path">${route.start} → ${route.end}</div>
                    <div class="saved-route-date">Saved on: ${route.dateSaved}</div>
                </div>
                <div class="saved-route-time">${route.time}</div>
                <div class="route-actions">
                    <button class="btn-edit" data-id="${route.id}">Edit</button>
                    <button class="btn-delete" data-id="${route.id}">Delete</button>
                </div>
            </div>
        `;
    });
    
    savedRoutesContainer.innerHTML = html;
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', handleEditRoute);
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', handleDeleteRoute);
    });
}

function handleEditRoute(e) {
    const routeId = parseInt(e.target.getAttribute('data-id'));
    const route = savedRoutes.find(r => r.id === routeId);
    
    if (route) {
        const newName = prompt('Enter a new name for this route:', route.name);
        if (newName && newName.trim() !== '') {
            route.name = newName.trim();
            localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
            renderSavedRoutes();
            alert('Route name updated successfully!');
        }
    }
}

function handleDeleteRoute(e) {
    const routeId = parseInt(e.target.getAttribute('data-id'));
    
    if (confirm('Are you sure you want to delete this saved route?')) {
        savedRoutes = savedRoutes.filter(route => route.id !== routeId);
        localStorage.setItem('savedRoutes', JSON.stringify(savedRoutes));
        renderSavedRoutes();
        alert('Route deleted successfully!');
    }
}

// Contact Form Functions
function setupFormValidation() {
    // Start location validation
    startLocation.addEventListener('blur', () => {
        if (!startLocation.value.trim()) {
            startError.textContent = 'Starting point is required';
        } else {
            startError.textContent = '';
        }
    });
    
    // End location validation
    endLocation.addEventListener('blur', () => {
        if (!endLocation.value.trim()) {
            endError.textContent = 'Destination is required';
        } else {
            endError.textContent = '';
        }
    });
}

function setupContactFormEvents() {
    // Email validation on keyup
    contactEmail.addEventListener('keyup', () => {
        validateEmail();
    });
    
    // Name validation on blur
    contactName.addEventListener('blur', () => {
        if (!contactName.value.trim()) {
            contactNameError.textContent = 'Name is required';
        } else {
            contactNameError.textContent = '';
        }
    });
    
    // Message validation on blur
    contactMessage.addEventListener('blur', () => {
        if (!contactMessage.value.trim()) {
            contactMessageError.textContent = 'Message is required';
        } else {
            contactMessageError.textContent = '';
        }
    });
}

function validateEmail() {
    const email = contactEmail.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        contactEmailError.textContent = 'Email is required';
        return false;
    }
    
    if (!emailRegex.test(email)) {
        contactEmailError.textContent = 'Please enter a valid email address';
        return false;
    }
    
    contactEmailError.textContent = '';
    return true;
}

function handleContactForm(e) {
    e.preventDefault();
    
    // Reset errors
    contactNameError.textContent = '';
    contactEmailError.textContent = '';
    contactMessageError.textContent = '';
    
    // Validate form
    let isValid = true;
    
    if (!contactName.value.trim()) {
        contactNameError.textContent = 'Name is required';
        isValid = false;
    }
    
    if (!validateEmail()) {
        isValid = false;
    }
    
    if (!contactMessage.value.trim()) {
        contactMessageError.textContent = 'Message is required';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Simulate form submission
    contactForm.reset();
    contactSuccess.classList.remove('hidden');
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        contactSuccess.classList.add('hidden');
    }, 5000);
    
    // Scroll to success message
    contactSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Traffic Hover Effects
function setupTrafficHoverEffects() {
    // Mouseover/mouseout for metric items
    document.querySelectorAll('.metric-item').forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'translateY(-3px)';
            item.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
        });
        
        item.addEventListener('mouseout', () => {
            item.style.transform = 'translateY(0)';
            item.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Mouseover/mouseout for route options
    document.querySelectorAll('.route-option').forEach(route => {
        route.addEventListener('mouseover', () => {
            route.style.transform = 'translateX(5px)';
            route.style.boxShadow = '0 6px 8px rgba(0, 0, 0, 0.15)';
        });
        
        route.addEventListener('mouseout', () => {
            route.style.transform = 'translateX(0)';
            route.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Mouseover/mouseout for incidents
    document.querySelectorAll('.incident').forEach(incident => {
        incident.addEventListener('mouseover', () => {
            incident.style.transform = 'scale(1.3)';
            incident.style.zIndex = '20';
        });
        
        incident.addEventListener('mouseout', () => {
            incident.style.transform = 'scale(1)';
            incident.style.zIndex = '10';
        });
    });
}

// Utility Functions
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}