// UI-related functions

import { updateScoreboard } from './scoreboard.js';

// Scoreboard state
const scores = [];

// Updates the player's score display
export function updateScore(score) {
    document.getElementById('score').textContent = score;
}

// Updates the scoreboard display
export function updateScoreboard(score) {
    const scoreList = document.getElementById('score-list');
    if (!scoreList) return;
    
    scores.push(score);
    scoreList.innerHTML = '';
    scores.slice().reverse().forEach((score, i) => {
        const li = document.createElement('li');
        li.textContent = `Game ${scores.length - i}: ${score}`;
        scoreList.appendChild(li);
    });
}

// Sets up UI controls
export function setupUI(gameState, arena) {
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const overlay = document.getElementById('gameOverOverlay');

    startButton.addEventListener('click', () => {
        if (!gameState.gameActive) {
            gameState.gameActive = true;
            gameState.isPaused = false;
            gameState.arena.forEach(row => row.fill(0));
            gameState.player.score = 0;
            updateScore(gameState.player.score);
            gameState.holdPiece = gameState.playerReset(arena, gameState);
            startButton.textContent = 'Restart';
            pauseButton.textContent = 'Pause';
            overlay.style.display = 'none';
        } else {
            // Restart the game
            gameState.gameActive = true;
            gameState.isPaused = false;
            gameState.arena.forEach(row => row.fill(0));
            gameState.player.score = 0;
            updateScore(gameState.player.score);
            gameState.holdPiece = gameState.playerReset(arena, gameState);
            overlay.style.display = 'none';
        }
    });

    pauseButton.addEventListener('click', () => {
        if (gameState.gameActive) {
            gameState.isPaused = !gameState.isPaused;
            pauseButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
        }
    });

    resetButton.addEventListener('click', () => {
        gameState.gameActive = false;
        gameState.isPaused = false;
        gameState.arena.forEach(row => row.fill(0));
        gameState.player.score = 0;
        updateScore(gameState.player.score);
        gameState.holdPiece = gameState.playerReset(arena, gameState);
        startButton.textContent = 'Start';
        pauseButton.textContent = 'Pause';
        overlay.style.display = 'none';
    });
}

// Sets up touch controls
export function setupTouchControls(canvas, gameState, arena) {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchStartTime = 0;
    let touchEndTime = 0;
    let isSwiping = false;
    let swipeTimeout = null;

    canvas.addEventListener('touchstart', (e) => {
        if (!gameState.gameActive || gameState.isPaused) return;
        
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
        isSwiping = true;

        // Clear any existing swipe timeout
        if (swipeTimeout) {
            clearTimeout(swipeTimeout);
        }

        // Set a timeout to detect taps
        swipeTimeout = setTimeout(() => {
            if (isSwiping) {
                gameState.holdPiece = gameState.hold(arena);
                isSwiping = false;
            }
        }, 200);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!gameState.gameActive || gameState.isPaused || !isSwiping) return;
        
        e.preventDefault();
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const deltaTime = Date.now() - touchStartTime;

        // If we've moved enough to be a swipe
        if (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30) {
            isSwiping = false;
            if (swipeTimeout) {
                clearTimeout(swipeTimeout);
            }

            // Determine if it's a horizontal or vertical swipe
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    gameState.playerMove(1, arena);
                } else {
                    gameState.playerMove(-1, arena);
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    // Down swipe - hard drop
                    gameState.holdPiece = gameState.playerHardDrop(arena, gameState);
                } else {
                    // Up swipe - rotate
                    gameState.playerRotate(1, arena);
                }
            }

            // Reset touch positions for next swipe
            touchStartX = touchEndX;
            touchStartY = touchEndY;
            touchStartTime = Date.now();
            isSwiping = true;
        }
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        isSwiping = false;
        if (swipeTimeout) {
            clearTimeout(swipeTimeout);
        }
    }, { passive: false });
} 