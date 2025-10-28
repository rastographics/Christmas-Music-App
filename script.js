const playBtn = document.getElementById('playBtn');
const audio = document.getElementById('audio');
const statusEl = document.getElementById('status');
const logoImg = document.getElementById('logoImg');

let isPlaying = false;

// Toggle play/pause on button click
playBtn.addEventListener('click', togglePlay);

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play()
            .then(() => {
                isPlaying = true;
            })
            .catch(error => {
                console.error('Error playing audio:', error);
            });
    }
}

// Update status based on audio events
audio.addEventListener('play', () => {
    isPlaying = true;
    statusEl.textContent = '🎄 Playing Christmas Music 🎄';
    logoImg.style.filter = 'brightness(1.2)';
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    statusEl.textContent = '⏸️ Paused - Tap to Resume';
    logoImg.style.filter = 'brightness(1)';
});

audio.addEventListener('waiting', () => {
    statusEl.textContent = '⏳ Buffering...';
});

audio.addEventListener('error', () => {
    statusEl.textContent = '❌ Stream unavailable';
});

// Add more snowflakes dynamically for effect
function addSnowflakes() {
    const snowflakesContainer = document.querySelector('.snowflakes');
    for (let i = 0; i < 5; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.animationDelay = Math.random() * 15 + 's';
        snowflake.style.animationDuration = (10 + Math.random() * 10) + 's';
        snowflakesContainer.appendChild(snowflake);
    }
}

addSnowflakes();

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
