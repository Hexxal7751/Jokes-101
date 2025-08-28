const synth = window.speechSynthesis;
let ttsEnabled = true;
let punchlineDelay = 0;

document.addEventListener("DOMContentLoaded", () => {
    showLoadingScreen();
    updateToggleUI();
    initializeDelay();
    updateDelayValue();
    initParticles();
    initThemeSelector();
});

// Loading Screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 800);
    }, 2500);
}

// Fullscreen Toggle
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Share Joke Function
async function shareJoke() {
    const shareButton = document.getElementById('shareButton');
    const notification = document.getElementById('shareNotification');
    
    // Disable button during processing
    shareButton.disabled = true;
    shareButton.querySelector('.button-text').textContent = 'Creating Image...';
    
    try {
        // Create a temporary container for the share image
        const shareContainer = createShareContainer();
        document.body.appendChild(shareContainer);
        
        // Generate image using html2canvas
        const canvas = await html2canvas(shareContainer, {
            backgroundColor: null,
            scale: 2,
            useCORS: true,
            allowTaint: true,
            width: 800,
            height: 600
        });
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            try {
                // Copy to clipboard
                await navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]);
                
                // Show success notification
                showShareNotification();
                
            } catch (err) {
                console.error('Failed to copy to clipboard:', err);
                // Fallback: download the image
                downloadImage(canvas);
            }
            
            // Cleanup
            document.body.removeChild(shareContainer);
            
            // Re-enable button
            shareButton.disabled = false;
            shareButton.querySelector('.button-text').textContent = 'Share Joke';
        }, 'image/png');
        
    } catch (error) {
        console.error('Error generating share image:', error);
        
        // Re-enable button
        shareButton.disabled = false;
        shareButton.querySelector('.button-text').textContent = 'Share Joke';
    }
}

function createShareContainer() {
    const container = document.createElement('div');
    container.style.cssText = `
        position: absolute;
        top: -10000px;
        left: -10000px;
        width: 800px;
        height: 600px;
        padding: 40px;
        box-sizing: border-box;
        font-family: 'Poppins', sans-serif;
        overflow: hidden;
    `;
    
    // Get current theme background
    const currentTheme = document.body.className || 'default';
    const themeStyles = getThemeBackground(currentTheme);
    
    container.style.background = themeStyles.background;
    container.style.color = themeStyles.color;
    
    // Get joke content
    const jokeText = document.getElementById('joke').textContent;
    const punchlineText = document.getElementById('punchline').textContent;
    
    container.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 25px;
            padding: 50px;
            margin: 30px;
            text-align: center;
            box-shadow: 
                0 20px 40px rgba(0, 0, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(20px);
            position: relative;
            overflow: hidden;
        ">
            <!-- Decorative gradient overlay -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #6366f1, #ec4899, #f59e0b, #10b981);
                border-radius: 25px 25px 0 0;
            "></div>
            
            <!-- Header -->
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 15px;
                margin-bottom: 30px;
            ">
                <div style="
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #6366f1, #ec4899);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
                ">😂</div>
                <div style="
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
                ">Jokes 101</div>
            </div>
            
            <!-- Joke Content -->
            <div style="
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 20px;
                padding: 35px;
                margin: 25px 0;
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 15px;
                    left: 20px;
                    font-size: 30px;
                    opacity: 0.3;
                    color: #ffd700;
                ">"</div>
                
                <div style="
                    font-size: 18px;
                    line-height: 1.5;
                    margin-bottom: 20px;
                    color: rgba(255, 255, 255, 0.95);
                    font-weight: 500;
                ">${jokeText}</div>
                
                <div style="
                    font-size: 20px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #ffd700, #f59e0b);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    line-height: 1.4;
                    text-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
                ">${punchlineText}</div>
                
                <div style="
                    position: absolute;
                    bottom: 15px;
                    right: 20px;
                    font-size: 30px;
                    opacity: 0.3;
                    color: #ffd700;
                ">"</div>
            </div>
            
            <!-- Footer -->
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <div style="
                    font-size: 11px;
                    opacity: 0.6;
                    color: rgba(255, 255, 255, 0.8);
                ">Premium AI Comedy</div>
                <div style="
                    font-size: 13px;
                    font-weight: 600;
                    background: linear-gradient(135deg, #6366f1, #ec4899);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                ">jokes101.netlify.app</div>
            </div>
        </div>
    `;
    
    return container;
}

function getThemeBackground(theme) {
    const themes = {
        'default': {
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#ffffff'
        },
        'dgreen-dblue': {
            background: 'linear-gradient(135deg, #264432, #16213e)',
            color: '#ffffff'
        },
        'violet-pink': {
            background: 'linear-gradient(135deg, #8e44ad, #f39c12)',
            color: '#ffffff'
        },
        'orange-red': {
            background: 'linear-gradient(135deg, #ff7e00, #b71c1c)',
            color: '#ffffff'
        },
        'dpurple-eblue': {
            background: 'linear-gradient(135deg, #4a148c, #0d47a1)',
            color: '#ffffff'
        },
        'red-dpurple': {
            background: 'linear-gradient(135deg, #ff0000, #6a0dad)',
            color: '#ffffff'
        },
        'pinkdw-qpink': {
            background: 'linear-gradient(135deg, #F1D0C7, #f09cb1)',
            color: '#3B2F2F'
        },
        'dlavender-magentah': {
            background: 'linear-gradient(135deg, #A2769C, #9E456F)',
            color: '#F4F0F0'
        }
    };
    
    return themes[theme] || themes['default'];
}

function downloadImage(canvas) {
    const link = document.createElement('a');
    link.download = 'jokes101-joke.png';
    link.href = canvas.toDataURL();
    link.click();
}

function showShareNotification() {
    const notification = document.getElementById('shareNotification');
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Theme Selector
function initThemeSelector() {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            // Remove active class from all options
            themeOptions.forEach(opt => opt.classList.remove('active'));
            // Add active class to clicked option
            option.classList.add('active');
            // Change theme
            const theme = option.dataset.theme;
            changeTheme(theme);
        });
    });
    
    // Set default theme as active
    document.querySelector('[data-theme="default"]').classList.add('active');
}

document.getElementById('ttsToggle').addEventListener('click', () => {
    ttsEnabled = !ttsEnabled;
    punchlineDelay = ttsEnabled ? 0 : 2500;
    const delaySlider = document.getElementById('delaySlider');
    delaySlider.value = punchlineDelay;
    updateToggleUI();
    updateDelayValue();
    
    // Add haptic feedback (if supported)
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    // Add visual feedback
    const toggle = document.getElementById('ttsToggle');
    toggle.style.transform = 'scale(0.95)';
    setTimeout(() => {
        toggle.style.transform = 'scale(1)';
    }, 150);
});

    const delaySlider = document.getElementById('delaySlider');
    const delayValue = document.getElementById('delayValue');

    delaySlider.addEventListener('input', () => {
        punchlineDelay = delaySlider.value;
        delayValue.innerText = `${punchlineDelay / 1000}s`;
    });

    function initializeDelay() {
        punchlineDelay = ttsEnabled ? 0 : 2500;
        delaySlider.value = punchlineDelay;
    }

    function updateToggleUI() {
        const toggleCheckbox = document.getElementById('ttsToggle');
        const statusText = document.getElementById('statusText');
        toggleCheckbox.classList.toggle('checked', ttsEnabled);
        statusText.innerText = `TTS: ${ttsEnabled ? 'Enabled' : 'Disabled'}`;
        statusText.className = ttsEnabled ? 'status-text status-enabled' : 'status-text status-disabled';
    }

    function updateDelayValue() {
        delayValue.innerText = `${punchlineDelay / 1000}s`;
    }

async function getJoke() {
    const jokeText = document.getElementById("joke");
    const punchlineText = document.getElementById("punchline");
    const jokebutton = document.getElementById("jokebutton");
    const jokeStatus = document.getElementById("jokeStatus");
    const buttonText = jokebutton.querySelector('.button-text');
    const buttonIcon = jokebutton.querySelector('.button-icon');

    // Reset states
    jokeText.classList.remove("visible");
    punchlineText.classList.remove("visible");
    punchlineText.innerText = "";
    jokebutton.disabled = true;
    
    // Hide share container when generating new joke
    const shareContainer = document.getElementById("shareContainer");
    shareContainer.style.display = 'none';
    
    // Update UI for loading state
    buttonText.textContent = "Loading...";
    buttonIcon.className = "fas fa-spinner button-icon";
    jokeStatus.innerHTML = '<span class="status-dot loading"></span><span class="status-text">Fetching comedy gold...</span>';

    try {
        const response = await fetch('https://official-joke-api.appspot.com/jokes/random');
        const joke = await response.json();
        
        // Update joke text
        jokeText.innerHTML = `<span class="joke-setup">${joke.setup}</span>`;
        
        // Update status
        jokeStatus.innerHTML = '<span class="status-dot"></span><span class="status-text">Ready to laugh!</span>';
        
        setTimeout(() => {
            jokeText.classList.add("visible");
            
            // Add sparkle effect
            createSparkleEffect(jokeText);

            if (ttsEnabled) {
                speak(joke.setup, () => {
                    setTimeout(() => {
                        revealPunchline(joke.punchline);
                    }, punchlineDelay); 
                });
            } else {
                setTimeout(() => {
                    revealPunchline(joke.punchline);
                }, punchlineDelay);
            }
        }, 500);

    } catch (error) {
        jokeText.innerHTML = '<span class="error-text">Oops! Our comedy servers are taking a break. Try again!</span>';
        jokeStatus.innerHTML = '<span class="status-dot error"></span><span class="status-text">Connection failed</span>';
        jokebutton.disabled = false;
        buttonText.textContent = "Try Again";
        buttonIcon.className = "fas fa-redo button-icon";
    }
}

// Sparkle Effect
function createSparkleEffect(element) {
    const sparkles = [];
    const sparkleCount = 12;
    
    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #ffd700;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleFloat 2s ease-out forwards;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 10px #ffd700;
        `;
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        sparkles.push(sparkle);
    }
    
    setTimeout(() => {
        sparkles.forEach(sparkle => sparkle.remove());
    }, 2000);
}

// Add sparkle animation CSS
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleFloat {
        0% {
            opacity: 0;
            transform: translateY(0px) scale(0);
        }
        50% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
        }
        100% {
            opacity: 0;
            transform: translateY(-40px) scale(0);
        }
    }
    
    .status-dot.loading {
        background: #f59e0b;
        animation: loadingPulse 1s ease-in-out infinite;
    }
    
    .status-dot.error {
        background: #ef4444;
        animation: errorPulse 1s ease-in-out infinite;
    }
    
    @keyframes loadingPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
    }
    
    @keyframes errorPulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
    }
    
    .error-text {
        color: #fca5a5;
        font-style: italic;
    }
    
    .joke-setup {
        display: inline-block;
        animation: textReveal 0.8s ease-out;
    }
    
    @keyframes textReveal {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(sparkleStyle);

    function speak(text, callback) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => callback();
        synth.speak(utterance);
    }

function revealPunchline(punchline) {
    const punchlineText = document.getElementById("punchline");
    const jokebutton = document.getElementById("jokebutton");
    const shareButton = document.getElementById("shareButton");
    const buttonText = jokebutton.querySelector('.button-text');
    const buttonIcon = jokebutton.querySelector('.button-icon');
    
    punchlineText.innerHTML = `<span class="punchline-content">${punchline}</span>`;
    punchlineText.classList.add("visible");
    
    // Add celebration effect
    createCelebrationEffect();
    
    // Show share container after punchline is revealed
    setTimeout(() => {
        const shareContainer = document.getElementById('shareContainer');
        shareContainer.style.display = 'flex';
    }, 800);
    
    if (ttsEnabled) {
        speak(punchline, () => {
            jokebutton.disabled = false;
            buttonText.textContent = "Generate Joke";
            buttonIcon.className = "fas fa-magic button-icon";
        });
    } else {
        jokebutton.disabled = false;
        buttonText.textContent = "Generate Joke";
        buttonIcon.className = "fas fa-magic button-icon";
    }
}

// Celebration Effect
function createCelebrationEffect() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
    const particles = [];
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: 8px;
            height: 8px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: 50%;
            top: 50%;
            animation: celebrate 3s ease-out forwards;
        `;
        
        particle.style.setProperty('--random-x', (Math.random() - 0.5) * 400 + 'px');
        particle.style.setProperty('--random-y', (Math.random() - 0.5) * 400 + 'px');
        particle.style.setProperty('--delay', Math.random() * 0.5 + 's');
        
        document.body.appendChild(particle);
        particles.push(particle);
    }
    
    setTimeout(() => {
        particles.forEach(particle => particle.remove());
    }, 3000);
}

// Add celebration animation CSS
const celebrationStyle = document.createElement('style');
celebrationStyle.textContent = `
    @keyframes celebrate {
        0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(0);
        }
        20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        100% {
            opacity: 0;
            transform: translate(calc(-50% + var(--random-x)), calc(-50% + var(--random-y))) scale(0);
        }
    }
    
    .punchline-content {
        display: inline-block;
        animation: punchlineReveal 0.6s ease-out;
    }
    
    @keyframes punchlineReveal {
        from {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
        }
        to {
            opacity: 1;
            transform: scale(1) translateY(0);
        }
    }
`;
document.head.appendChild(celebrationStyle);

    function toggleSettingsPane() {
        document.getElementById('settingsPane').classList.toggle("active");
    }

    // Function to toggle Credits pane
    function toggleCredits() {
        const creditsPane = document.getElementById("creditsPane");
        if (creditsPane.style.display === "none" || creditsPane.style.display === "") {
            creditsPane.style.display = "block";
            creditsPane.style.opacity = "1";
            showConfetti(); // Trigger confetti animation
        } else {
            creditsPane.style.display = "none";
        }
    }

    // Confetti animation function
    function showConfetti() {
        const confettiCount = 100;
        const confettiColors = ["#ff0", "#0ff", "#f0f", "#ff5733", "#33ff57", "#3357ff"];
        const confettiContainer = document.createElement("div");
        confettiContainer.style.position = "fixed";
        confettiContainer.style.top = "0";
        confettiContainer.style.left = "0";
        confettiContainer.style.width = "100%";
        confettiContainer.style.height = "100%";
        confettiContainer.style.pointerEvents = "none";
        confettiContainer.style.zIndex = "999";
        document.body.appendChild(confettiContainer);

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("div");
            confetti.style.position = "absolute";
            confetti.style.width = "10px";
            confetti.style.height = "10px";
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            confetti.style.borderRadius = "50%";
            confetti.style.top = `${Math.random() * 100}vh`;
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.opacity = "0";
            confetti.style.animation = `confettiFall 2s ease-out forwards`;
            confettiContainer.appendChild(confetti);
        }

        // Remove confetti after animation
        setTimeout(() => {
            confettiContainer.remove();
        }, 2000);
    }

    // Confetti fall animation
    const style = document.createElement("style");
    style.innerHTML = `
        @keyframes confettiFall {
            0% {
                transform: translateY(-100vh) rotate(0);
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

function changeTheme(selectedTheme) {
    document.body.classList.remove('dgreen-dblue', 'violet-pink', 'orange-red', 'dpurple-eblue', 'red-dpurple', 'pinkdw-qpink', 'dlavender-magentah');

    if (selectedTheme && selectedTheme !== 'default') {
        document.body.classList.add(selectedTheme);
    }
    
    // Add ripple effect to theme selection
    createRippleEffect();
}

// Ripple Effect
function createRippleEffect() {
    const ripples = document.querySelectorAll('.theme-ripple');
    ripples.forEach(ripple => ripple.remove());
    
    const ripple = document.createElement('div');
    ripple.className = 'theme-ripple';
    ripple.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
        transform: translate(-50%, -50%);
        animation: rippleExpand 1s ease-out forwards;
        pointer-events: none;
        z-index: 9998;
    `;
    
    document.body.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
}

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes rippleExpand {
        to {
            width: 100vw;
            height: 100vw;
            opacity: 0;
        }
    }
`;
document.head.appendChild(rippleStyle);

// Enhanced Particle Animation
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];
    let animationId;

    const mouse = {
        x: null,
        y: null,
        radius: Math.min(canvas.height, canvas.width) / 15
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    class Particle {
        constructor(x, y, directionX, directionY, size, color, opacity) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
            this.opacity = opacity;
            this.originalOpacity = opacity;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            
            // Create gradient for particles
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, `rgba(${this.color}, ${this.opacity})`);
            gradient.addColorStop(1, `rgba(${this.color}, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.fill();
        }

        update() {
            // Bounce off walls
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction
            if (mouse.x && mouse.y) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    // Repel particles from mouse
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let maxDistance = mouse.radius;
                    let force = (maxDistance - distance) / maxDistance;
                    let directionX = forceDirectionX * force * -1;
                    let directionY = forceDirectionY * force * -1;
                    
                    this.x += directionX * 3;
                    this.y += directionY * 3;
                    
                    // Increase opacity near mouse
                    this.opacity = Math.min(this.originalOpacity * 2, 0.8);
                } else {
                    this.opacity = this.originalOpacity;
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    function init() {
        particlesArray = [];
        let numberOfParticles = Math.floor((canvas.height * canvas.width) / 12000);
        
        const colors = [
            '255, 255, 255',
            '99, 102, 241',
            '236, 72, 153',
            '245, 158, 11',
            '16, 185, 129'
        ];
        
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 3) + 1;
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            let directionX = (Math.random() * 2) - 1;
            let directionY = (Math.random() * 2) - 1;
            let color = colors[Math.floor(Math.random() * colors.length)];
            let opacity = Math.random() * 0.5 + 0.2;
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color, opacity));
        }
    }

    function animate() {
        animationId = requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        
        connect();
    }

    function connect() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    let opacity = 1 - (distance / 120);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        mouse.radius = Math.min(canvas.height, canvas.width) / 15;
        init();
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    init();
    animate();
    
    // Return cleanup function
    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };
}