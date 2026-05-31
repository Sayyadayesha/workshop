// Updated Mock Data for MediNear 2.0
const facilitiesData = [
    {
        id: 1,
        name: "City General Hospital",
        type: "Hospital",
        distance: "1.2 km",
        driveTime: "4 mins",
        walkTime: "12 mins",
        status: "24 Hours",
        phone: "+91 9876543210",
        ambulance: true,
        icon: "fa-hospital",
        typeClass: "type-hospital",
        crowdStatus: "High", // High, Med, Low
        ward: true,
        pharmacy: true
    },
    {
        id: 2,
        name: "Apollo Pharmacy",
        type: "Pharmacy",
        distance: "0.8 km",
        driveTime: "2 mins",
        walkTime: "8 mins",
        status: "Open Now",
        phone: "+91 9876543211",
        ambulance: false,
        icon: "fa-capsules",
        typeClass: "type-pharmacy",
        crowdStatus: "Low",
        ward: false,
        pharmacy: true
    },
    {
        id: 3,
        name: "Sunrise Clinic",
        type: "Clinic",
        distance: "2.3 km",
        driveTime: "7 mins",
        walkTime: "22 mins",
        status: "Open Now",
        phone: "+91 9876543212",
        ambulance: false,
        icon: "fa-stethoscope",
        typeClass: "type-clinic",
        crowdStatus: "Med",
        ward: false,
        pharmacy: false
    },
    {
        id: 4,
        name: "LifeLine Emergency Hospital",
        type: "Hospital",
        distance: "3.5 km",
        driveTime: "10 mins",
        walkTime: "35 mins",
        status: "24 Hours",
        phone: "+91 9876543213",
        ambulance: true,
        icon: "fa-hospital",
        typeClass: "type-hospital",
        crowdStatus: "Low",
        ward: true,
        pharmacy: true
    },
    {
        id: 5,
        name: "MedPlus Pharmacy",
        type: "Pharmacy",
        distance: "1.7 km",
        driveTime: "5 mins",
        walkTime: "17 mins",
        status: "Open Now",
        phone: "+91 9876543214",
        ambulance: false,
        icon: "fa-capsules",
        typeClass: "type-pharmacy",
        crowdStatus: "Med",
        ward: false,
        pharmacy: true
    },
    {
        id: 6,
        name: "QuickCare Clinic",
        type: "Clinic",
        distance: "4.1 km",
        driveTime: "12 mins",
        walkTime: "40 mins",
        status: "Open Now",
        phone: "+91 9876543215",
        ambulance: false,
        icon: "fa-stethoscope",
        typeClass: "type-clinic",
        crowdStatus: "Low",
        ward: false,
        pharmacy: false
    }
];

const medicineData = [
    { name: "Paracetamol", pharmacies: ["Apollo Pharmacy (0.8 km)", "MedPlus Pharmacy (1.7 km)"] },
    { name: "Crocin", pharmacies: ["Apollo Pharmacy (0.8 km)"] },
    { name: "Dolo 650", pharmacies: ["MedPlus Pharmacy (1.7 km)"] },
    { name: "Cetirizine", pharmacies: ["Apollo Pharmacy (0.8 km)", "City General Hospital Pharmacy (1.2 km)"] },
    { name: "Insulin", pharmacies: ["City General Hospital Pharmacy (1.2 km)"] }
];

// DOM Elements
const facilitiesGrid = document.getElementById('facilitiesGrid');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const filterPills = document.querySelectorAll('.filter-pill');
const sosOverlay = document.getElementById('sosOverlay');
const medSearchInput = document.getElementById('medicineSearchInput');
const medResults = document.getElementById('medicineResults');

// State
let currentFilter = 'All';
let currentSearch = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    calculateReadinessScores();
    renderFacilities(facilitiesData);
    setupEventListeners();
    animateDashboardCounters();
    loadProfile();
});

// Logic: Calculate Readiness Score
function calculateReadinessScores() {
    facilitiesData.forEach(facility => {
        let score = 0;
        if (facility.ward) score += 40;
        if (facility.ambulance) score += 25;
        if (facility.status === "24 Hours") score += 20;
        if (facility.pharmacy) score += 15;
        // Base score for simply being open
        if (score === 0 && facility.status === "Open Now") score = 30; 
        
        facility.score = score;
        
        if (score >= 80) facility.scoreClass = 'score-high';
        else if (score >= 60) facility.scoreClass = 'score-med';
        else facility.scoreClass = 'score-low';
    });
}

// Logic: SOS Mode
function toggleSOS() {
    sosOverlay.classList.toggle('active');
}

// Global quick locate for SOS
window.quickLocate = function(type) {
    toggleSOS();
    filterFacilities(type.charAt(0).toUpperCase() + type.slice(1));
};

// Setup Event Listeners
function setupEventListeners() {
    // Facility Search
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Medicine Search
    if(medSearchInput) {
        medSearchInput.addEventListener('input', (e) => {
            handleMedicineSearch(e.target.value.toLowerCase());
        });
    }

    // Filter pills
    filterPills.forEach(pill => {
        pill.addEventListener('click', (e) => {
            filterPills.forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            applyFilters();
        });
    });
}

function handleMedicineSearch(query) {
    medResults.innerHTML = '';
    if (!query) {
        medResults.innerHTML = `
            <div class="medicine-placeholder">
                <i class="fa-solid fa-prescription-bottle-medical"></i>
                <p>Search for a medicine to find nearby pharmacies.</p>
            </div>
        `;
        return;
    }

    const matches = medicineData.filter(m => m.name.toLowerCase().includes(query));
    
    if (matches.length === 0) {
        medResults.innerHTML = `<p style="text-align:center; color: var(--text-muted); padding: 1rem;">No matching medicines found in demo data.</p>`;
        return;
    }

    matches.forEach(med => {
        let pharmsHtml = med.pharmacies.map(p => `
            <div class="med-result-card">
                <div class="med-info">
                    <h4>${p.split(' (')[0]}</h4>
                    <p><i class="fa-solid fa-location-dot"></i> ${p.split('(')[1].replace(')','')}</p>
                    <span class="avail-badge">In Stock</span>
                </div>
                <a href="tel:108" class="btn btn-outline-primary btn-sm"><i class="fa-solid fa-phone"></i> Call</a>
            </div>
        `).join('');
        
        medResults.insertAdjacentHTML('beforeend', `
            <div style="margin-bottom: 0.5rem;">
                <h4 style="font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">Results for ${med.name}</h4>
                ${pharmsHtml}
            </div>
        `);
    });
}

// Global filter function
window.filterFacilities = function(filterValue) {
    document.getElementById('search-section').scrollIntoView({ behavior: 'smooth' });
    filterPills.forEach(p => {
        if (p.dataset.filter === filterValue) p.classList.add('active');
        else p.classList.remove('active');
    });
    currentFilter = filterValue;
    applyFilters();
};

function applyFilters() {
    let filteredData = facilitiesData;
    if (currentSearch) {
        filteredData = filteredData.filter(f => f.name.toLowerCase().includes(currentSearch) || f.type.toLowerCase().includes(currentSearch));
    }
    if (currentFilter !== 'All') {
        if (currentFilter === 'Open Now') filteredData = filteredData.filter(f => f.status === 'Open Now' || f.status === '24 Hours');
        else if (currentFilter === '24 Hours') filteredData = filteredData.filter(f => f.status === '24 Hours');
        else if (currentFilter === 'Has Ambulance') filteredData = filteredData.filter(f => f.ambulance === true);
        else filteredData = filteredData.filter(f => f.type === currentFilter);
    }
    renderFacilities(filteredData);
}

function renderFacilities(data) {
    facilitiesGrid.innerHTML = '';
    
    if (data.length === 0) {
        facilitiesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">
                <i class="fa-solid fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No facilities found matching your criteria.</p>
            </div>
        `;
        resultsCount.textContent = '0 Results';
        return;
    }

    resultsCount.textContent = `${data.length} Result${data.length !== 1 ? 's' : ''}`;

    data.forEach(f => {
        let crowdClass = 'crowd-low';
        if (f.crowdStatus === 'Med') crowdClass = 'crowd-med';
        if (f.crowdStatus === 'High') crowdClass = 'crowd-high';

        const cardHTML = `
            <div class="facility-card">
                <div class="crowd-badge ${crowdClass}" title="Estimated Crowd Level">${f.crowdStatus} Crowd</div>
                
                <div class="facility-header">
                    <div class="facility-icon-wrap ${f.typeClass}">
                        <i class="fa-solid ${f.icon}"></i>
                    </div>
                    <div class="facility-info">
                        <h3>${f.name}</h3>
                        <div class="type-subtitle">${f.type} • ${f.distance} away</div>
                    </div>
                </div>
                
                <div class="facility-metrics">
                    <div class="metric-item"><i class="fa-solid fa-car"></i> ${f.driveTime}</div>
                    <div class="metric-item"><i class="fa-solid fa-person-walking"></i> ${f.walkTime}</div>
                </div>

                <div class="facility-tags">
                    ${f.status === '24 Hours' ? '<span class="tag tag-24h">24 Hours</span>' : '<span class="tag tag-open">Open Now</span>'}
                    ${f.ambulance ? '<span class="tag tag-amb"><i class="fa-solid fa-truck-medical"></i> Ambulance</span>' : ''}
                </div>

                <div class="facility-readiness">
                    <div class="readiness-header">
                        <span>Readiness Score</span>
                        <span>${f.score}/100</span>
                    </div>
                    <div class="readiness-bar-bg ${f.scoreClass}">
                        <div class="readiness-bar-fill" style="width: ${f.score}%"></div>
                    </div>
                </div>

                <div class="facility-footer">
                    <a href="tel:${f.phone.replace(/[^0-9+]/g, '')}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Call Now</a>
                    <button class="btn btn-outline-primary" style="flex: 0.5;"><i class="fa-solid fa-location-arrow"></i></button>
                </div>
            </div>
        `;
        facilitiesGrid.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// Logic: Dashboard Counter Animation
function animateDashboardCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 20;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0;
        
        const updateCount = () => {
            const inc = target / speed;
            if (count < target) {
                count += inc;
                counter.innerText = Math.ceil(count);
                setTimeout(updateCount, 50);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// Logic: Family Emergency Profile
function loadProfile() {
    const profileData = JSON.parse(localStorage.getItem('mediNearProfile'));
    if (profileData) {
        document.getElementById('profName').value = profileData.name;
        document.getElementById('profBlood').value = profileData.blood;
        document.getElementById('profContact').value = profileData.contact;
        document.getElementById('profPhone').value = profileData.phone;
        document.getElementById('profAllergies').value = profileData.allergies;
        document.getElementById('profConditions').value = profileData.conditions;
        // Update dashboard contact counter if saved
        document.getElementById('contactCounter').innerText = "1";
    }
}

window.toggleEditProfile = function() {
    const inputs = document.querySelectorAll('.profile-form input');
    inputs.forEach(input => input.disabled = false);
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('saveProfileBtn').style.display = 'inline-flex';
};

window.saveProfile = function() {
    const profileData = {
        name: document.getElementById('profName').value,
        blood: document.getElementById('profBlood').value,
        contact: document.getElementById('profContact').value,
        phone: document.getElementById('profPhone').value,
        allergies: document.getElementById('profAllergies').value,
        conditions: document.getElementById('profConditions').value
    };
    
    localStorage.setItem('mediNearProfile', JSON.stringify(profileData));
    
    // Disable inputs
    const inputs = document.querySelectorAll('.profile-form input');
    inputs.forEach(input => input.disabled = true);
    
    document.getElementById('editProfileBtn').style.display = 'inline-flex';
    document.getElementById('saveProfileBtn').style.display = 'none';
    
    // Animate contact counter to 1
    const contactCounter = document.getElementById('contactCounter');
    contactCounter.setAttribute('data-target', '1');
    contactCounter.innerText = "1";
    
    alert("Emergency Profile Saved successfully.");
};

// Logic: Chatbot
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatInput = document.getElementById('chatInput');

window.toggleChat = function() {
    chatbotWindow.classList.toggle('active');
    if (chatbotWindow.classList.contains('active')) {
        chatInput.focus();
    }
};

window.handleChatKeyPress = function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
};

window.sendMessage = function() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message
    appendMessage(text, 'user-msg');
    chatInput.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        let response = "I'm sorry, I am a demo bot. For medical emergencies, please use the SOS button or call 108 immediately.";
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('fever')) {
            response = "For a high fever, please stay hydrated and visit the nearest clinic. You can use the 'Quick Medical Guidance' section to find clinics.";
        } else if (lowerText.includes('chest pain') || lowerText.includes('heart')) {
            response = "CRITICAL: Please call an ambulance immediately or rush to the nearest Emergency Hospital!";
        } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
            response = "Hello! How can MediBot help you today?";
        }
        
        appendMessage(response, 'bot-msg');
    }, 800);
};

function appendMessage(text, className) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${className}`;
    msgDiv.innerText = text;
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}
