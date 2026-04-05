function updateClock() {
    const clockElement = document.getElementById('clock');
    const reflectionElement = document.getElementById('reflection');
    
    if (!clockElement || !reflectionElement) return;

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    
    // update DOM only if changed
    if (clockElement.textContent !== timeString) {
        clockElement.textContent = timeString;
        reflectionElement.textContent = timeString;
    }
}

// Initial draw
updateClock();

// Set interval to update fast enough to hit exactly the second change
setInterval(updateClock, 200);
