let seconds = 5;
const countdownEl = document.getElementById('countdown');

if (countdownEl) {
    const timer = setInterval(() => {
        seconds--;
        countdownEl.textContent = seconds;
        if (seconds <= 0) {
            clearInterval(timer);
            window.location.href = 'index.html';
        }
    }, 1000);
}
