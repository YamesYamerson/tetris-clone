// Canvas setup and drawing functions
export const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

// Canvas variables
export const canvas = document.getElementById('tetrisCanvas');
export const context = canvas.getContext('2d');
context.scale(20, 20);

// Hold canvas setup
export const holdCanvas = document.getElementById('holdCanvas');
export const holdContext = holdCanvas.getContext('2d');
holdContext.scale(20, 20);

// Touch event variables
export let touchStartX = 0;
export let touchStartY = 0;
export let touchEndX = 0;
export let touchEndY = 0;

// Draws the game board and the pieces
export function draw(arena, player, holdPiece) {
    // Always draw black background and grid
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    // Only draw game elements if we have a player and arena
    if (player && player.matrix) {
        drawShadow(arena, player);
        drawMatrix(arena, {x: 0, y: 0}, context);
        drawMatrix(player.matrix, player.pos, context);
    }

    // Always draw the hold piece if it exists
    if (holdPiece) {
        drawHoldPiece(holdPiece);
    }
}

// Draws the grid on the canvas
function drawGrid() {
    const gridColor = 'rgba(255, 255, 255, 0.1)';
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
    context.lineWidth = 0.05;
    context.stroke();
}

// Draws the shadow of the player's piece
function drawShadow(arena, player) {
    const shadow = JSON.parse(JSON.stringify(player));
    while (!collide(arena, shadow)) {
        shadow.pos.y++;
    }
    shadow.pos.y--;
    context.fillStyle = 'rgba(255, 255, 255, 0.1)';
    shadow.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillRect(x + shadow.pos.x, y + shadow.pos.y, 1, 1);
            }
        });
    });
}

// Draws the pieces
export function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Draws the held piece in a canvas
export function drawHoldPiece(matrix) {
    holdContext.clearRect(0, 0, holdCanvas.width, holdCanvas.height);

    if (matrix) {
        let minX = matrix[0].length, maxX = 0, minY = matrix.length, maxY = 0;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] !== 0) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }

        const boxWidth = maxX - minX + 1;
        const boxHeight = maxY - minY + 1;
        const offsetX = (4 - boxWidth) / 2;
        const offsetY = (4 - boxHeight) / 2;

        drawMatrix(matrix, { x: offsetX - minX, y: offsetY - minY }, holdContext);
    }
}

// Resize canvas to fit container
export function resizeCanvas() {
    const container = document.getElementById('center-col');
    const rect = container.getBoundingClientRect();
    let availableHeight = rect.height;
    let availableWidth = rect.width;

    let height = Math.min(availableHeight, availableWidth * 2);
    let width = height * 0.5;

    if (width > availableWidth) {
        width = availableWidth;
        height = width * 2;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'block';

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(width / 10, height / 20);

    holdCanvas.width = 80;
    holdCanvas.height = 80;
    holdContext.setTransform(1, 0, 0, 1, 0, 0);
    holdContext.scale(20, 20);
}

// Collision detection
export function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                if (
                    y + o.y < 0 ||
                    y + o.y >= arena.length ||
                    x + o.x < 0 ||
                    x + o.x >= arena[0].length ||
                    (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0
                ) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Merge player piece with arena
export function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
} 