// --- CONFIGURATION ---
const imageList = ['mountain.jpg', 'city.jpg', 'forest.jpg', 'space.jpg'];
const bgFolder = '/resources/backgrounds/'; 

const fontList = [
    { name: 'Bebas Neue (Bold)',    value: "'Bebas Neue', sans-serif" },
    { name: 'Inter (Modern)',       value: "'Inter', sans-serif" },
    { name: 'Lato (Clean)',         value: "'Lato', sans-serif" },
    { name: 'Oswald (Strong)',      value: "'Oswald', sans-serif" },
    { name: 'Raleway (Elegant)',    value: "'Raleway', sans-serif" },
    { name: 'Playfair (Classic)',   value: "'Playfair Display', serif" }
];

const searchEngines = {
    google: { url: "https://www.google.com/search?q=", domain: "google.com" },
    duckduckgo: { url: "https://duckduckgo.com/?q=", domain: "duckduckgo.com" },
    yahoo: { url: "https://search.yahoo.com/search?p=", domain: "yahoo.com" },
    yandex: { url: "https://yandex.com/search/?text=", domain: "yandex.com" }
};

// --- DOM ELEMENTS ---
const bgContainer = document.getElementById('bg');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const closeBtn = document.getElementById('close-btn');
const bgGrid = document.getElementById('bg-grid');
const fontSelector = document.getElementById('font-selector');
const uploadBtn = document.getElementById('upload-btn');
const fileInput = document.getElementById('custom-file-input');

// Clock
const clockMain = document.getElementById('clock-main');
const clockSeconds = document.getElementById('clock-seconds');
const clockAmPm = document.getElementById('clock-ampm');
const clockWrapper = document.getElementById('clock-wrapper');
const greetingEl = document.getElementById('greeting');

// Toggles
const timeToggle = document.getElementById('time-toggle');
const secondsToggle = document.getElementById('seconds-toggle');
const ampmToggle = document.getElementById('ampm-toggle');
const ampmRow = document.getElementById('ampm-row');

// Search & Shortcuts
const searchInput = document.getElementById('search-input');
const searchSelector = document.getElementById('search-engine-selector');
const searchIcon = document.getElementById('search-icon');
const shortcutsDock = document.getElementById('shortcuts-dock');

// --- SEARCH LOGIC ---
function updateSearchUI(engineKey) {
    const engine = searchEngines[engineKey] || searchEngines['google'];
    const engineName = engineKey.charAt(0).toUpperCase() + engineKey.slice(1);
    searchInput.placeholder = `Search with ${engineName}`;
    searchIcon.src = `https://www.google.com/s2/favicons?domain=${engine.domain}&sz=64`;
}

if (searchInput && searchSelector) {
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                const key = localStorage.getItem('search_engine') || 'google';
                const url = searchEngines[key].url + encodeURIComponent(query);
                window.location.href = url; 
            }
        }
    });
    searchSelector.addEventListener('change', (e) => {
        localStorage.setItem('search_engine', e.target.value);
        updateSearchUI(e.target.value);
    });
    const savedEngine = localStorage.getItem('search_engine') || 'google';
    searchSelector.value = savedEngine;
    updateSearchUI(savedEngine);
}

// --- SHORTCUTS LOGIC ---
// --- 2. SHORTCUTS LOGIC ---
function getShortcuts() {
    try {
        const saved = localStorage.getItem('shortcuts');
        // Check if saved is valid JSON, otherwise return empty array
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error("Error reading shortcuts:", e);
        return [];
    }
}

function saveShortcuts(list) {
    try {
        localStorage.setItem('shortcuts', JSON.stringify(list));
        renderShortcuts(); // Re-render immediately after saving
    } catch (e) {
        alert("Failed to save shortcut! Storage might be full.");
    }
}

function renderShortcuts() {
    if (!shortcutsDock) return;
    shortcutsDock.innerHTML = '';
    
    // Get fresh list
    const list = getShortcuts();

    list.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'shortcut-item';
        div.title = "Right Click to Delete"; 
        
        const iconUrl = `https://www.google.com/s2/favicons?domain=${item.url}&sz=64`;
        
        // Safe DOM creation (No innerHTML)
        const iconDiv = document.createElement('div');
        iconDiv.className = 'shortcut-icon';
        const img = document.createElement('img');
        img.src = iconUrl;
        img.alt = 'icon';
        iconDiv.appendChild(img);

        const labelDiv = document.createElement('div');
        labelDiv.className = 'shortcut-label';
        labelDiv.textContent = item.name;

        div.appendChild(iconDiv);
        div.appendChild(labelDiv);

        div.addEventListener('click', () => window.location.href = item.url);
        div.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if(confirm(`Delete ${item.name}?`)) {
                const currentList = getShortcuts();
                currentList.splice(index, 1);
                saveShortcuts(currentList);
            }
        });
        shortcutsDock.appendChild(div);
    });

    // Add Button (Only if less than 5 items)
    if (list.length < 5) {
        const addBtn = document.createElement('div');
        addBtn.className = 'shortcut-item';
        
        // --- THE FIX: Replaced innerHTML with createElement ---
        const addIconDiv = document.createElement('div');
        addIconDiv.className = 'shortcut-icon add-shortcut-btn';
        addIconDiv.textContent = '+';
        
        const addLabelDiv = document.createElement('div');
        addLabelDiv.className = 'shortcut-label';
        addLabelDiv.textContent = 'Add';
        
        addBtn.appendChild(addIconDiv);
        addBtn.appendChild(addLabelDiv);
        // -------------------------------------------------------
        
        addBtn.addEventListener('click', () => {
            const name = prompt("Name (e.g. YouTube):");
            if (!name) return;
            
            let url = prompt("Enter URL (e.g. youtube.com):");
            if (!url) return;
            
            if (!url.startsWith('http')) url = 'https://' + url;
            
            const currentList = getShortcuts();
            currentList.push({ name, url });
            saveShortcuts(currentList);
        });
        
        shortcutsDock.appendChild(addBtn);
    }
}

// --- BACKGROUND LOGIC ---
function createThumb(type, displayName, val) {
    if (!bgGrid) return;
    const img = document.createElement('img');
    img.className = 'bg-thumb'; img.title = displayName; img.dataset.val = val;
    if (type === 'random') img.src = 'https://placehold.co/200x150/333/FFF?text=Shuffle';
    else if (type === 'custom') img.src = val; 
    else img.src = `${bgFolder}${val}`;
    img.addEventListener('click', () => {
        localStorage.setItem('bg_preference', val);
        updateGridSelection(); setBackground();
    });
    bgGrid.appendChild(img);
}
createThumb('random', 'Shuffle', 'random');
imageList.forEach(file => createThumb('file', file, file));
const savedCustom = localStorage.getItem('custom_bg_data');
if (savedCustom) createThumb('custom', 'Uploaded Image', savedCustom);

function updateGridSelection() {
    const currentPref = localStorage.getItem('bg_preference') || 'random';
    document.querySelectorAll('.bg-thumb').forEach(img => {
        if (img.dataset.val === currentPref || (currentPref === 'custom' && img.dataset.val.startsWith('data:'))) img.classList.add('selected');
        else img.classList.remove('selected');
    });
}
function setBackground() {
    if (!bgContainer) return;
    const savedPref = localStorage.getItem('bg_preference') || 'random';
    let imageToUse = '';
    if (savedPref === 'random') {
        const idx = Math.floor(Math.random() * imageList.length);
        imageToUse = `url('${bgFolder}${imageList[idx]}')`;
    } else if (savedPref.startsWith('data:')) imageToUse = `url('${savedPref}')`;
    else imageToUse = `url('${bgFolder}${savedPref}')`;
    bgContainer.style.backgroundImage = imageToUse;
}
if (uploadBtn && fileInput) {
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || file.size > 4 * 1024 * 1024) return alert("Image too large!");
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            localStorage.setItem('custom_bg_data', base64);
            localStorage.setItem('bg_preference', base64);
            bgGrid.innerHTML = ''; 
            createThumb('random', 'Shuffle', 'random');
            imageList.forEach(f => createThumb('file', f, f));
            createThumb('custom', 'Uploaded Image', base64);
            updateGridSelection(); setBackground();
        };
        reader.readAsDataURL(file);
    });
}

// --- CLOCK & TOGGLE LOGIC ---
fontList.forEach(font => {
    const option = document.createElement('option');
    option.value = font.value; option.textContent = font.name;
    fontSelector.appendChild(option);
});
fontSelector.addEventListener('change', (e) => {
    localStorage.setItem('font_preference', e.target.value);
    setFont();
});
function setFont() {
    const val = localStorage.getItem('font_preference') || fontList[0].value;
    fontSelector.value = val;
    clockWrapper.style.fontFamily = val;
}

// Toggles Init
timeToggle.checked = localStorage.getItem('is24Hour') === 'true';
secondsToggle.checked = localStorage.getItem('showSeconds') === 'true';
ampmToggle.checked = localStorage.getItem('showAmPm') === 'true';

timeToggle.addEventListener('change', (e) => { localStorage.setItem('is24Hour', e.target.checked); updateClock(); });
secondsToggle.addEventListener('change', (e) => { localStorage.setItem('showSeconds', e.target.checked); updateClock(); });
ampmToggle.addEventListener('change', (e) => { localStorage.setItem('showAmPm', e.target.checked); updateClock(); });

function updateClock() {
    if (!clockMain) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const is24 = timeToggle.checked;
    const showSec = secondsToggle.checked;
    const showAmPm = ampmToggle.checked;
    let amPmStr = '';

    if (!is24) {
        amPmStr = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;
        ampmRow.classList.remove('disabled');
        ampmToggle.disabled = false;
    } else {
        ampmRow.classList.add('disabled');
        ampmToggle.disabled = true;
    }

    clockMain.textContent = `${hours}:${minutes}`;
    clockSeconds.textContent = showSec ? seconds : '';
    clockSeconds.style.display = showSec ? 'block' : 'none';
    
    if (!is24 && showAmPm) {
        clockAmPm.textContent = amPmStr;
        clockAmPm.style.display = 'block';
    } else {
        clockAmPm.style.display = 'none';
    }
}

async function fetchQuote() {
    if (!greetingEl) return;
    try {
        const res = await fetch('https://dummyjson.com/quotes/random');
        const data = await res.json();
        greetingEl.textContent = `“${data.quote}”`;
    } catch (e) { greetingEl.textContent = "“Make it work, make it right, make it fast.”"; }
}

// --- INIT ---
try {
    setBackground(); updateGridSelection(); setFont(); fetchQuote(); renderShortcuts(); updateClock();
    setInterval(updateClock, 1000);
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));
        closeBtn.addEventListener('click', () => settingsPanel.classList.add('hidden'));
    }
} catch (error) { console.error("Init Error", error); }