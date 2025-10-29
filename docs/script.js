const playBtn = document.getElementById('playBtn');
const audio = document.getElementById('audio');
const statusEl = document.getElementById('status');
const logoImg = document.getElementById('logoImg');
const nowPlayingEl = document.getElementById('nowPlaying');
const progressBarEl = document.getElementById('progressBar');
const progressMeterEl = document.getElementById('progressMeter');

let isPlaying = false;
let fetchInterval;
let localElapsed = 0;
let localDuration = 0;
let playedAt = 0;
let trackInterval;
let currentArtist = '';
let currentTitle = '';
let songInfoError = false;

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
    // Start fetching song info
    fetchCurrentSong();
    if (fetchInterval) clearInterval(fetchInterval);
    fetchInterval = setInterval(fetchCurrentSong, 10000);
    // Start local elapsed tracking
    if (!trackInterval) trackInterval = setInterval(updateElapsed, 1000);
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    statusEl.textContent = '⏸️ Paused - Tap to Resume';
    logoImg.style.filter = 'brightness(1)';
    // Stop fetching song info
    if (fetchInterval) {
        clearInterval(fetchInterval);
        fetchInterval = null;
    }
    // Stop local elapsed tracking
    if (trackInterval) {
        clearInterval(trackInterval);
        trackInterval = null;
    }
    nowPlayingEl.textContent = '';
});

audio.addEventListener('waiting', () => {
    statusEl.textContent = '⏳ Buffering...';
});

audio.addEventListener('canplay', () => {
    if (isPlaying) {
        statusEl.textContent = '🎄 Playing Christmas Music 🎄';
    }
});

audio.addEventListener('error', () => {
    statusEl.textContent = '❌ Stream unavailable';
    // Stop fetching song info
    if (fetchInterval) {
        clearInterval(fetchInterval);
        fetchInterval = null;
    }
    // Stop local elapsed tracking
    if (trackInterval) {
        clearInterval(trackInterval);
        trackInterval = null;
    }
    nowPlayingEl.textContent = '';
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

function updateDisplay() {
    if (currentArtist && currentTitle) {
        const elapsedMin = Math.floor(localElapsed / 60);
        const elapsedSec = Math.floor(localElapsed % 60).toString().padStart(2, '0');
        const durationMin = Math.floor(localDuration / 60);
        const durationSec = Math.floor(localDuration % 60).toString().padStart(2, '0');
        nowPlayingEl.innerHTML = `
                <div class="artist">${currentArtist}</div>
                <div class="title">${currentTitle}</div>
                <div class="time"> ${elapsedMin}:${elapsedSec} / ${durationMin}:${durationSec}</div>`;

        // Update progress bar
        const progressPercent = localDuration > 0 ? (localElapsed / localDuration) * 100 : 0;
        progressBarEl.style.width = `${Math.min(progressPercent, 100)}%`;
        progressMeterEl.style.opacity = '1';
    } else {
        nowPlayingEl.textContent = songInfoError ? 'Unable to load song info' : 'No song data available';
        // Hide progress bar when no song info
        progressBarEl.style.width = '0%';
        progressMeterEl.style.opacity = '0';
    }
}

function updateElapsed() {
    if (playedAt > 0) {
        const currentTime = Math.floor(Date.now() / 1000);
        localElapsed = currentTime - playedAt;
    } else {
        localElapsed++;
    }
    updateDisplay();
}

function fetchCurrentSong() {
    fetch('https://stream.radio.nwbbc.com/api/nowplaying/christmas', {
        cache: 'no-store'
    })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            if (data.now_playing && data.now_playing.song) {
                const song = data.now_playing.song;
                currentArtist = song.artist;
                currentTitle = song.title;
                playedAt = data.now_playing.played_at || 0;
                localDuration = data.now_playing.duration || 0;
                if (playedAt > 0) {
                    const currentTime = Math.floor(Date.now() / 1000);
                    localElapsed = currentTime - playedAt;
                } else {
                    localElapsed = data.now_playing.elapsed || 0;
                }
                const now = new Date();
                const hours = now.getHours();
                const period = hours >= 12 ? 'pm' : 'am';
                const displayHours = (hours % 12 || 12).toString();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const seconds = now.getSeconds().toString().padStart(2, '0');
                const timestamp = `${displayHours}:${minutes}:${seconds}${period}`;
                console.log(`${timestamp}, Elapsed: ${localElapsed}`);
                songInfoError = false;
                updateDisplay();
            } else {
                currentArtist = '';
                currentTitle = '';
                localElapsed = 0;
                localDuration = 0;
                playedAt = 0;
                songInfoError = false;
                updateDisplay();
            }
        })
        .catch(error => {
            console.error('Error fetching song info:', error);
            currentArtist = '';
            currentTitle = '';
            localElapsed = 0;
            localDuration = 0;
            playedAt = 0;
            songInfoError = true;
            updateDisplay();
        });
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}
