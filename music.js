// ===================================================
// Background Music Interactivity (script1.js)
// ===================================================

/**
 * Audio Engine Configuration
 * Uses the local wedding audio asset path
 */
const weddingAudioSrc = "ach_roum_tok_min_ach_roum_sok.mp3";

// Create HTMLAudioElement instance
const weddingAudio = new Audio(weddingAudioSrc);
weddingAudio.loop = true; // Ensures continuous looping throughout guest review
weddingAudio.volume = 0.4; // Set elegant ambient volume threshold (40%)

// Create Floating Audio Control Interface Button
const audioBtn = document.createElement('button');
audioBtn.id = 'weddingAudioToggleBtn';
audioBtn.innerHTML = '🎵 '; // Initial Native Khmer Button Prompt Label

// Apply inline layout styling to cleanly position the controller on screen
Object.assign(audioBtn.style, {
    position: 'fixed',
    bottom: '80px', // Sits safely above the default "Scroll to Top" button placement
    right: '20px',
    zIndex: '1000',
    backgroundColor: '#800020', // Matches your --ceremony-red theme signature
    color: '#ffffff',
    border: '2px solid #c5a059', // Matches your --heritage-gold accent line
    borderRadius: '50px',
    padding: '10px 18px',
    fontFamily: "'Hanuman', serif",
    fontSize: '0.88rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(128, 0, 32, 0.3)',
    transition: 'all 0.3s ease-in-out'
});

// Emulate CSS hover states dynamically
audioBtn.onmouseover = () => {
    audioBtn.style.transform = 'scale(1.05)';
    audioBtn.style.backgroundColor = '#ffffff';
    audioBtn.style.color = '#800020';
};
audioBtn.onmouseout = () => {
    audioBtn.style.transform = 'scale(1)';
    audioBtn.style.backgroundColor = '#800020';
    audioBtn.style.color = '#ffffff';
};

/**
 * Toggle Audio Playback Status
 */
function toggleWeddingMusic() {
    if (weddingAudio.paused) {
        weddingAudio.play()
            .then(() => {
                audioBtn.innerHTML = '🔇'; // Update label to "Mute Music"
                audioBtn.style.borderColor = '#800020';
            })
            .catch(error => {
                console.log("Autoplay context restricted by browser security policies.", error);
                // Graceful fallback: silently keep the button state ready instead of alerting
                audioBtn.innerHTML = '🎵 ';
                audioBtn.style.borderColor = '#c5a059';
            });
    } else {
        weddingAudio.pause();
        audioBtn.innerHTML = '🎵 '; // Revert back to "Play Music"
        audioBtn.style.borderColor = '#c5a059';
    }
}

// Bind native click event handler directly
audioBtn.addEventListener('click', toggleWeddingMusic);

// Inject component inside the document layout context dynamically once loaded
document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(audioBtn);
    
    // User Interaction Trigger: Attempts to start music smoothly upon the first real window interaction
    const initiateAutoplay = () => {
        if (weddingAudio.paused && audioBtn.innerHTML === '🎵 ') {
            weddingAudio.play()
                .then(() => {
                    audioBtn.innerHTML = '🔇';
                    audioBtn.style.borderColor = '#800020';
                })
                .catch(() => {
                    // Safe catch if browser still enforces restriction until direct button click
                    console.log("Ambient autoplay deferred to explicit user toggle.");
                });
        }
    };

    // Listen to first click across the layout to unlock the web audio sandbox profile cleanly
    document.body.addEventListener('click', initiateAutoplay, { once: true });
});
