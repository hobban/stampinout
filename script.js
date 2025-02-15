const stampInBtn = document.getElementById("stampInBtn");
const stampOutBtn = document.getElementById("stampOutBtn");
const workLog = document.getElementById("workLog");
const totalHoursEl = document.getElementById("totalHours");
const lunchCountEl = document.getElementById("lunchCount");
const increaseLunchBtn = document.getElementById("increaseLunchBtn");
const decreaseLunchBtn = document.getElementById("decreaseLunchBtn");

let userId = localStorage.getItem("userId");
if (!userId) {
    userId = `user-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("userId", userId);
}

let lunchCount = JSON.parse(localStorage.getItem(`${userId}_lunchCount`)) || 0;
lunchCountEl.textContent = lunchCount;

function updateLunchCount() {
    lunchCountEl.textContent = lunchCount;
    localStorage.setItem(`${userId}_lunchCount`, JSON.stringify(lunchCount));
}

increaseLunchBtn.addEventListener("click", () => {
    lunchCount++;
    updateLunchCount();
});

decreaseLunchBtn.addEventListener("click", () => {
    if (lunchCount > 0) lunchCount--;
    updateLunchCount();
});

let workSessions = JSON.parse(localStorage.getItem("workSessions")) || [];
let isWorking = localStorage.getItem("isWorking") === "true";
let startTime = localStorage.getItem("startTime") ? new Date(localStorage.getItem("startTime")) : null;

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
            <span>${start.toLocaleString()} - ${end ? end.toLocaleString() : "Pågående"} (${(duration / 60).toFixed(2)} h)</span>
            <button class="remove-btn text-white hover:text-red-500" data-index="${index}">×</button>
        `;

        workLog.appendChild(listItem);
    });

    totalHoursEl.textContent = (totalMinutes / 60).toFixed(2);

    if (isWorking) {
        stampInBtn.classList.add("hidden");
        stampOutBtn.classList.remove("hidden");
    } else {
        stampInBtn.classList.remove("hidden");
        stampOutBtn.classList.add("hidden");
    }

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", removeSession);
    });
}

stampInBtn.addEventListener("click", () => {
    if (isWorking) return;

    startTime = new Date();
    localStorage.setItem("startTime", startTime);
    workSessions.push({ start: startTime, end: null });
    isWorking = true;

    localStorage.setItem("workSessions", JSON.stringify(workSessions));
    localStorage.setItem("isWorking", isWorking);
    updateUI();
});

stampOutBtn.addEventListener("click", () => {
    if (!isWorking) return;

    let endTime = new Date();
    let lastSession = workSessions[workSessions.length - 1];
    lastSession.end = endTime;
    localStorage.setItem("workSessions", JSON.stringify(workSessions));
    localStorage.removeItem("startTime");
    isWorking = false;

    localStorage.setItem("isWorking", isWorking);
    updateUI();
});

function removeSession(event) {
    const index = event.target.getAttribute("data-index");
    if (confirm("Är du säker på att du vill ta bort denna tid?")) {
        workSessions.splice(index, 1);
        localStorage.setItem("workSessions", JSON.stringify(workSessions));
        updateUI();
    }
}

updateUI();
