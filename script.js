document.addEventListener("DOMContentLoaded", () => {
    const stampInBtn = document.getElementById("stampInBtn");
    const stampOutBtn = document.getElementById("stampOutBtn");
    const workLog = document.getElementById("workLog");
    const totalHoursEl = document.getElementById("totalHours");
    const totalWageEl = document.getElementById("totalWage");
    const wageInput = document.getElementById("wageInput");
    const lunchCountEl = document.getElementById("lunchCount");
    const increaseLunchBtn = document.getElementById("increaseLunchBtn");
    const decreaseLunchBtn = document.getElementById("decreaseLunchBtn");
    const wageToggle = document.getElementById("toggleWage");
    const lunchToggle = document.getElementById("toggleLunch");
    const settingsBtn = document.getElementById("settingsBtn");
    const settingsPanel = document.getElementById("settingsPanel");
    const wageSection = document.getElementById("wageSection");
    const lunchSection = document.getElementById("lunchSection");

    let workSessions = JSON.parse(localStorage.getItem("workSessions")) || [];
    if (!Array.isArray(workSessions)) workSessions = [];
    
    let isWorking = localStorage.getItem("isWorking") === "true";
    let lunchCount = JSON.parse(localStorage.getItem("lunchCount")) || 0;
    let hourlyWage = parseFloat(localStorage.getItem("hourlyWage")) || 0;

    lunchCountEl.textContent = lunchCount;
    wageInput.value = hourlyWage;

    increaseLunchBtn.addEventListener("click", () => {
        lunchCount++;
        lunchCountEl.textContent = lunchCount;
        localStorage.setItem("lunchCount", JSON.stringify(lunchCount));
    });
    
    decreaseLunchBtn.addEventListener("click", () => {
        if (lunchCount > 0) lunchCount--;
        lunchCountEl.textContent = lunchCount;
        localStorage.setItem("lunchCount", JSON.stringify(lunchCount));
    });

    wageInput.addEventListener("input", () => {
        hourlyWage = parseFloat(wageInput.value) || 0;
        localStorage.setItem("hourlyWage", hourlyWage);
        updateUI();
    });

    function formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        let hours = Math.floor(minutes / 60);
        let remainingMinutes = minutes % 60;
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes} min` : `${hours}h`;
    }

    function calculateTotalWage(totalMinutes) {
        let hoursWorked = totalMinutes / 60;
        return (hoursWorked * hourlyWage).toFixed(2);
    }

    function updateUI() {
        workLog.innerHTML = "";
        let totalMinutes = 0;
    
        workSessions.forEach((session, index) => {
            let start = new Date(session.start);
            let end = session.end ? new Date(session.end) : null;
            let duration = end ? Math.round((end - start) / 60000) : 0;
            totalMinutes += duration;
    
            let listItem = document.createElement("li");
            listItem.classList.add("log-item", "flex", "justify-between", "items-center");
            listItem.innerHTML = `
                <span>${start.toLocaleDateString()} ${start.toLocaleTimeString()} - 
                ${end ? end.toLocaleTimeString() : "Pågående"} (${formatTime(duration)})</span>
                <button class="delete-btn text-gray-400 hover:text-red-500" data-index="${index}">&times;</button>
            `;
            workLog.appendChild(listItem);
        });
    
        totalHoursEl.textContent = formatTime(totalMinutes);
        totalWageEl.textContent = calculateTotalWage(totalMinutes) + " ";
        
        isWorking = localStorage.getItem("isWorking") === "true";
    
        stampInBtn.classList.toggle("hidden", isWorking);
        stampOutBtn.classList.toggle("hidden", !isWorking);
    }
    

    workLog.addEventListener("click", (event) => {
        if (event.target.classList.contains("delete-btn")) {
            const index = event.target.getAttribute("data-index");
            workSessions.splice(index, 1);
            localStorage.setItem("workSessions", JSON.stringify(workSessions));
            updateUI();
        }
    });

    stampInBtn.addEventListener("click", () => {
        if (isWorking) return;
        workSessions.push({ start: new Date().toISOString(), end: null });
        localStorage.setItem("workSessions", JSON.stringify(workSessions));
        localStorage.setItem("isWorking", "true");
        isWorking = true; // Ensure the status is updated correctly
        updateUI();
    });

    stampOutBtn.addEventListener("click", () => {
        if (!isWorking) return;
    
        let lastSession = workSessions[workSessions.length - 1];
        if (lastSession && !lastSession.end) {
            lastSession.end = new Date().toISOString();
        }
    
        localStorage.setItem("workSessions", JSON.stringify(workSessions));
        localStorage.setItem("isWorking", "false");
        isWorking = false; // Ensure the status is updated correctly
        updateUI();
    });
    

    settingsBtn.addEventListener("click", () => {
        settingsPanel.classList.toggle("hidden");
    });
    
    wageToggle.addEventListener("change", () => {
        localStorage.setItem("showWage", JSON.stringify(wageToggle.checked));
        wageSection.classList.toggle("hidden", !wageToggle.checked);
    });

    lunchToggle.addEventListener("change", () => {
        localStorage.setItem("showLunch", JSON.stringify(lunchToggle.checked));
        lunchSection.classList.toggle("hidden", !lunchToggle.checked);
    });

    updateUI();
});

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    const day = now.toLocaleDateString('sv-SE', { weekday: 'long' });
    const date = now.toLocaleDateString('sv-SE', { day: '2-digit', month: 'long', year: 'numeric' });

    document.getElementById('clock').textContent = timeString;
    document.getElementById('date').textContent = `${day}, ${date}`;
}

setInterval(updateClock, 1000);
updateClock();

function checkScreenSize() {
    const clock = document.getElementById("clock");
    if (window.innerWidth < 768) {
        clock.style.display = "none";  // Dölj på mobil
    } else {
        clock.style.display = "block"; // Visa på större skärmar
    }
}

checkScreenSize();
window.addEventListener("resize", checkScreenSize);