// UI-related functions

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

// Sets up UI event listeners
export function setupUI(gameState, arena) {
    const startButton = document.getElementById('startButton');
    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');

    // Event Listener for Start Button
    startButton.addEventListener('click', () => {
        if (!gameState.gameActive) {
            gameState.gameActive = true;
            gameState.lastTime = 0;
            gameState.playerReset(arena);
            gameState.update();
        }
    });

    // Event Listener for Pause Button
    pauseButton.addEventListener('click', () => {
        if (!gameState.gameActive) return;
        gameState.isPaused = !gameState.isPaused;
        pauseButton.textContent = gameState.isPaused ? 'Resume' : 'Pause';
    });

    // Event Listener for Reset Button
    resetButton.addEventListener('click', () => {
        gameState.gameActive = true;
        gameState.isPaused = false;

        arena.forEach(row => row.fill(0));
        gameState.player.score = 0;
        gameState.playerReset(arena);
        updateScore(gameState.player.score);
        
        gameState.lastTime = 0;
        gameState.update();
    });
}

// Sets up touch controls
export function setupTouchControls(canvas, gameState, arena) {
    canvas.addEventListener('touchstart', handleTouchStart, false);
    canvas.addEventListener('touchmove', handleTouchMove, false);
    canvas.addEventListener('touchend', handleTouchEnd, false);

    function handleTouchStart(event) {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
    }

    function handleTouchMove(event) {
        touchEndX = event.touches[0].clientX;
        touchEndY = event.touches[0].clientY;
    }

    function handleTouchEnd(event) {
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        const swipeThreshold = 20;

        if (absDx > swipeThreshold || absDy > swipeThreshold) {
            event.preventDefault();

            if (absDx > absDy) {
                if (dx > 0) {
                    gameState.playerMove(1, arena);
                } else {
                    gameState.playerMove(-1, arena);
                }
            } else {
                if (dy > 0) {
                    gameState.playerDrop(arena);
                } else {
                    gameState.playerRotate(1, arena);
                }
            }
        }
    }
} 