const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');
context.scale(20, 20); // Make each block 20x20 pixels on the canvas

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
//Creates the pieces for the game
function createPiece(type) {
    if (type === 'T') {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'L') {
        return [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0],
        ];
    } else if (type === 'J') {
        return [
            [4, 0, 0],
            [4, 4, 4],
            [0, 0, 0],
        ];
    } else if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    }
}
//Checks for collision
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
//Merges the player's piece with the game board
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
//Checks for full lines and clears them, also shifts arena down
function arenaSweep() {
    let rowCount = 0;
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                console.log(`Row ${y} is not full.`);
                continue outer;
            }
        }

        console.log(`Clearing full row ${y}`);
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        rowCount++;
    }

    if (rowCount > 0) {
        player.score += rowCount * 10;
        updateScore();
        console.log(`Cleared ${rowCount} rows, score: ${player.score}`);
    }
}

function playerDrop() {
    console.log("Player dropped");
    player.pos.y++;
    if (collide(arena, player)) {
        console.log("Collision detected");
        player.pos.y--; // Move the piece back up
        merge(arena, player); // Merge it with the arena
        console.log("Before arenaSweep");
        arenaSweep(); // Check and clear any full lines
        console.log("After arenaSweep");
        playerReset(); // Reset the player's piece
        updateScore(); // Update the score
    }
    dropCounter = 0;
}

function playerReset() {
    console.log("Resetting player");
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        console.log("Game over detected");
        arena.forEach(row => row.fill(0));
        player.score = 0;
        updateScore();
    }
}


//Resets the player's piece
function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(pieces.length * Math.random())]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                    (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0; // Reset score when there's a collision at the top
        updateScore(); // We will implement this function to update the UI
    }
}

// Be sure to declare updateScore function
function updateScore() {
    // Implement logic to update the player's score on the screen
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

// Moves the player's piece left or right
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}
// Rotates the player's piece
function playerRotate(dir) {
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
//Draws the game board and the pieces
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height); // Draw the game background
    drawGrid(); // Draw the grid
    drawShadow(); // Draw the piece shadow with reduced opacity
    drawMatrix(arena, {x: 0, y: 0}); // Draw the static blocks in the arena
    drawMatrix(player.matrix, player.pos); // Draw the moving piece
}
//Draws a grid on the canvas
function drawGrid() {
    const gridColor = 'rgba(255, 255, 255, 0.1)'; // Light grid color for subtlety
    context.beginPath();
    for (let i = 0; i <= canvas.width / 20; i++) {
        context.moveTo(i, 0);
        context.lineTo(i, canvas.height / 20);
    }
    for (let j = 0; j <= canvas.height / 20; j++) {
        context.moveTo(0, j);
        context.lineTo(canvas.width / 20, j);
    }
    context.strokeStyle = gridColor;
    context.lineWidth = 0.05; // Thin lines for the grid, considering the scale
    context.stroke();
}
// Draws the shadow of the player's piece
function drawShadow() {
    const shadow = JSON.parse(JSON.stringify(player)); // Deep copy the player object
    while (!collide(arena, shadow)) {
        shadow.pos.y++;
    }
    shadow.pos.y--; // Move back to the last non-colliding position
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    shadow.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                // Draw a semi-transparent block for the shadow
                context.fillRect(x + shadow.pos.x, y + shadow.pos.y, 1, 1);
            }
        });
    });
}
//Draws the pieces
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Variables for the game loop
let lastTime = 0;
let dropCounter = 0;
let dropInterval = 1000; // Normal drop speed in milliseconds
const fastDropInterval = 50; // Fast drop speed when down arrow is held down
// Updates the game
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}
// Function to hard drop the player's piece
function playerHardDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--; // Move the piece back up to the last valid position
    merge(arena, player); // Merge it with the arena
    arenaSweep(); // Check and clear any full lines
    playerReset(); // Reset the player's piece
    updateScore(); // Update the score
}

// Colors for the pieces
const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];
//Creates the game board
const arena = createMatrix(12, 20);
const player = {
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};
//Controls for key push events
document.addEventListener('keydown', event => {
    if (event.keyCode === 37) { // Left arrow
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right arrow
        playerMove(1);
    } else if (event.keyCode === 38) { // Up arrow
        playerRotate(1);
    } else if (event.keyCode === 40) { // Down arrow
        dropInterval = 50; // Set for fast drop
    } else if (event.keyCode === 32) { // Spacebar for hard drop
        playerHardDrop();
    }
});
//Controls for key release events
document.addEventListener('keyup', event => {
    if (event.keyCode === 40) { // Down arrow
        dropInterval = 1000; // Reset to normal drop speed
    }
});

playerReset();
update();
