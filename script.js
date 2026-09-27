// === UTILITY FUNCTION ===
// এই ফাংশন দিয়ে আমরা কাউন্টডাউনের সময় পজ করব (Promise based delay)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// === DOM ELEMENTS ===
const partCards = document.querySelectorAll('.part-card');
const armBtn = document.getElementById('arm-btn');
const launchBtn = document.getElementById('launch-btn');
const missionControlUI = document.getElementById('mission-control-ui');
const launchView = document.getElementById('launch-sequence-view');

// Telemetry Elements
const massVal = document.getElementById('mass-val');
const fuelVal = document.getElementById('fuel-val');
const twrVal = document.getElementById('twr-val');

// Launch View Elements
// const countdownDisplay = document.querySelector('.countdown-display');
// const hudTime = document.getElementById('hud-time');
// const launchVehicle = document.querySelector('.launch-vehicle-assembly');
// const exhaustPlume = document.querySelector('.exhaust-plume');
// const machDiamond = document.querySelector('.mach-diamond');
// const groundCloud = document.querySelector('.ground-effect-cloud');
// Launch View Elements (Updated IDs)/
// Launch View Elements
const countdownDisplay = document.getElementById('countdown-display');
const hudTime = document.getElementById('hud-time');
const launchVehicle = document.getElementById('launch-vehicle');
const exhaustPlume = document.getElementById('exhaust-plume');
const machDiamond = document.getElementById('mach-diamond'); // এই লাইনটা যোগ করো
const groundCloud = document.getElementById('ground-cloud');     // Changed from querySelector

 // Activate Visual Effects
    launchVehicle.classList.add('shake-structural'); 
    groundCloud.classList.add('smoke-active');       
    exhaustPlume.classList.add('ignition-active');   // আগুন শুরু
    machDiamond.classList.add('mach-active'); 

// === STATE VARIABLES ===
let installedPartsCount = 0;
let currentMass = 0;
const MAX_THRUST = 190000; // Newtons (Example thrust)

// Part Data Map (Realistic Mass in kg)
const partData = {
    fairing: { mass: 1200, name: 'Payload Fairing' },
    stage2: { mass: 3100, name: 'Second Stage' },
    stage1: { mass: 6500, name: 'First Stage' },
    engine: { mass: 1600, name: 'RS-25 Cluster' }
};

// === 1. SYSTEM CLOCK (Top Right) ===
function updateClock() {
    const now = new Date();
    const timeString = now.toUTCString().split(' ')[4];
    document.getElementById('clock').textContent = timeString;
}
setInterval(updateClock, 1000);
updateClock();

// === 2. PART INSTALLATION LOGIC ===
partCards.forEach(card => {
    card.addEventListener('click', () => {
        if (card.classList.contains('installed')) return;

        const partType = card.dataset.partType;
        const targetSlot = document.getElementById(`slot-${partType}`);

        // Update Assembly View
        targetSlot.classList.add('filled');
        
        // Update Inventory View
        card.classList.add('installed');

        // Update Telemetry Data
        currentMass += partData[partType].mass;
        updateTelemetry();

        // Check Assembly Status
        installedPartsCount++;
        if (installedPartsCount === 4) {
            enableArmSequence();
        }
    });
});

// === 3. TELEMETRY UPDATE ===
function updateTelemetry() {
    // Mass Update
    massVal.textContent = currentMass.toLocaleString() + ' KG';

    // Fuel Load Update (Assume Stage 2 has fuel)
    if (document.getElementById('slot-stage2').classList.contains('filled')) {
        fuelVal.textContent = '100 %';
        fuelVal.style.color = '#3fb950'; // Green
    } else {
        fuelVal.textContent = '0 %';
        fuelVal.style.color = '#f85149'; // Red
    }

    // Thrust-to-Weight Ratio (TWR) Update
    if (document.getElementById('slot-engine').classList.contains('filled') && currentMass > 0) {
        const weight = currentMass * 9.81; // Mass * Gravity
        const twr = MAX_THRUST / weight;
        twrVal.textContent = twr.toFixed(2);
        twrVal.style.color = twr > 1 ? '#3fb950' : '#f85149'; // Green if TWR > 1 (Can lift off)
    } else {
        twrVal.textContent = '0.00';
    }
}

// === 4. ARM SYSTEM LOGIC ===
function enableArmSequence() {
    armBtn.disabled = false;
    armBtn.style.animation = 'pulse-dot 1.5s infinite'; // Visual cue to click
}

armBtn.addEventListener('click', () => {
    armBtn.disabled = true;
    armBtn.textContent = 'SYSTEMS ARMED';
    armBtn.style.borderColor = '#3fb950';
    armBtn.style.color = '#3fb950';
    armBtn.style.animation = 'none';
    
    // Enable Launch Button
    launchBtn.disabled = false;
});

// === 5. LAUNCH SEQUENCE LOGIC ===
launchBtn.addEventListener('click', async () => {
    // Transition from Assembly to Launch View
    missionControlUI.style.opacity = '0';
    await delay(800);
    missionControlUI.style.display = 'none';
    launchView.style.display = 'flex';

    // Start the Auto Sequence
    await runLaunchSequence();
});

async function runLaunchSequence() {
    // T-3
    countdownDisplay.textContent = "T-03";
    hudTime.textContent = "T-00:00:03";
    await delay(1000);

    // T-2
    countdownDisplay.textContent = "T-02";
    hudTime.textContent = "T-00:00:02";
    await delay(1000);

    // T-1
    countdownDisplay.textContent = "T-01";
    hudTime.textContent = "T-00:00:01";
    await delay(1000);

    // IGNITION START
    countdownDisplay.textContent = "IGNITION";
    hudTime.textContent = "MAIN ENGINE START";
    countdownDisplay.style.color = '#ff9800'; // Orange for ignition
    countdownDisplay.style.textShadow = '0 0 20px rgba(255, 152, 0, 0.8)';

    // Activate Visual Effects
    launchVehicle.classList.add('shake-structural'); // Rocket vibrating
    groundCloud.classList.add('smoke-active');       // Smoke/Steam from pad
    exhaustPlume.classList.add('ignition-active');   // Fire starts
    machDiamond.classList.add('mach-active');        // Shock diamonds visible

    // Hold down at pad for thrust buildup (Realistic step)
    await delay(3000); 

    // LIFTOFF!
    countdownDisplay.textContent = "LIFTOFF";
    hudTime.textContent = "NOMINAL ASCENT";
    countdownDisplay.style.color = '#3fb950'; // Green for success
    countdownDisplay.style.textShadow = '0 0 20px rgba(63, 185, 80, 0.8)';

    // Remove shake, start translation (Going up)
    launchVehicle.classList.remove('shake-structural');
    launchVehicle.classList.add('launch-takeoff');

    // Wait for rocket to clear the screen
    await delay(6000);

    // Mission Success State
    countdownDisplay.textContent = "MISSION SUCCESS";
    hudTime.textContent = "ORBIT ACHIEVED";
    exhaustPlume.style.opacity = '0'; // Fire fades as it reaches space
    machDiamond.style.opacity = '0';
}