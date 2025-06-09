import { canvas, draw } from './canvas.js';
import { createMatrix } from './pieces.js';
import { player, playerReset, playerMove, playerRotate, playerDrop, playerHardDrop, hold } from './player.js';
import { setupUI, setupTouchControls } from './ui.js';

// Game state
export const gameState = {
    gameActive: false,
    isPaused: false,
    lastTime: 0,
    dropCounter: 0,
    dropInterval: 1000,
    fastDropInterval: 50,
    arena: createMatrix(10, 20),
    player,
    playerReset,
    playerMove,
    playerRotate,
    playerDrop,
    playerHardDrop,
    hold,
    update: null // Will be set after initialization
};

// Updates the game
function update(time = 0) {
    requestAnimationFrame(update);

    if (!gameState.gameActive || gameState.isPaused) {
        return;
    }

    const deltaTime = time - gameState.lastTime;
    gameState.lastTime = time;
    gameState.dropCounter += deltaTime;

    if (gameState.dropCounter > gameState.dropInterval) {
        gameState.playerDrop(gameState.arena);
        gameState.dropCounter = 0;
    }

    draw(gameState.arena, gameState.player, gameState.holdPiece);
}

// Sets up keyboard controls
function setupKeyboardControls() {
    document.addEventListener('keydown', event => {
        if (event.keyCode === 32) { // Spacebar
            event.preventDefault();
        }

        if (gameState.isPaused) {
            if (event.keyCode === 80) { // 'P' key
                gameState.isPaused = !gameState.isPaused;
                document.getElementById('pauseButton').textContent = gameState.isPaused ? 'Resume' : 'Pause';
            }
            return;
        }

        if (event.keyCode === 80) { // 'P' for pause
            gameState.isPaused = !gameState.isPaused;
            document.getElementById('pauseButton').textContent = gameState.isPaused ? 'Resume' : 'Pause';
        }

        if (gameState.isPaused || !gameState.gameActive) {
            return;
        }

        if (event.keyCode === 67) { // 'C' for hold
            gameState.holdPiece = gameState.hold(gameState.arena);
        }

        switch (event.keyCode) {
            case 37: // Left arrow
                gameState.playerMove(-1, gameState.arena);
                break;
            case 39: // Right arrow
                gameState.playerMove(1, gameState.arena);
                break;
            case 38: // Up arrow
                gameState.playerRotate(1, gameState.arena);
                break;
            case 40: // Down arrow
                gameState.dropInterval = gameState.fastDropInterval;
                break;
            case 32: // Spacebar for hard drop
                if (!gameState.isPaused) {
                    gameState.holdPiece = gameState.playerHardDrop(gameState.arena);
                }
                break;
        }
    });

    document.addEventListener('keyup', event => {
        if (event.keyCode === 40) { // Down arrow
            gameState.dropInterval = 1000;
        }
    });
}

// Initialize the game
export function initGame() {
    // Set up the update function in gameState
    gameState.update = update;
    
    // Set up controls
    setupKeyboardControls();
    setupTouchControls(canvas, gameState, gameState.arena);
    setupUI(gameState, gameState.arena);

    // Initial game setup
    gameState.playerReset(gameState.arena);
    update();
} 