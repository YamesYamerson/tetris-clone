import { collide, merge } from './canvas.js';
import { createRandomPiece, rotate } from './pieces.js';
import { updateScore, updateScoreboard } from './ui.js';
import { insults } from '../insults.js';

// Player state
export const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

let holdPiece = null;
let swapped = false;

// Resets the player's piece
export function playerReset(arena, gameState) {
    player.matrix = createRandomPiece();
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        // Store the score and update scoreboard
        updateScoreboard(player.score);
        player.score = 0;
        updateScore(player.score);
        gameState.gameActive = false;

        // Get a random insult
        const insult = insults[Math.floor(Math.random() * insults.length)];
        const gameOverText = `Game Over! ${insult}`;
        
        // Update the overlay content dynamically
        document.getElementById('gameOverOverlay').innerHTML = `
            <div class="overlay-content">
                <p>${gameOverText}</p>
                <button id="restartButton">Restart</button>
            </div>
        `;
        document.getElementById('gameOverOverlay').style.display = 'flex';

        // Add event listener to the restart button inside the overlay
        document.getElementById('restartButton').addEventListener('click', () => {
            document.getElementById('gameOverOverlay').style.display = 'none';
            gameState.gameActive = true;
            playerReset(arena, gameState);
            gameState.update();
        });
    }

    swapped = false;
    return holdPiece;
}

// Moves the player's piece left or right
export function playerMove(dir, arena) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Rotates the player's piece
export function playerRotate(dir, arena) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);

    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

// Drops the player's piece by one row
export function playerDrop(arena, gameState) {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        holdPiece = playerReset(arena, gameState);
        swapped = false;
        arenaSweep(arena);
        updateScore(player.score);
    }
    return holdPiece;
}

// Hard drops the player's piece
export function playerHardDrop(arena, gameState) {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    holdPiece = playerReset(arena, gameState);
    swapped = false;
    arenaSweep(arena);
    updateScore(player.score);
    return holdPiece;
}

// Holds the current piece
export function hold(arena) {
    if (swapped) {
        return holdPiece;
    }

    if (!holdPiece) {
        holdPiece = player.matrix;
        player.matrix = createRandomPiece();
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    } else {
        let temp = player.matrix;
        player.matrix = holdPiece;
        holdPiece = temp;
        player.pos.y = 0;
        player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    }

    swapped = true;
    return holdPiece;
}

// Clears completed lines and updates score
function arenaSweep(arena) {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        rowCount++;
    }

    if (rowCount > 0) {
        player.score += rowCount * 10;
        updateScore(player.score);
    }
} 