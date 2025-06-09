import { initGame } from './components/game.js';
import { resizeCanvas } from './components/canvas.js';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up window resize handler
    window.addEventListener('resize', resizeCanvas);
    
    // Initial canvas resize
    resizeCanvas();
    
    // Initialize the game
    initGame();
});
