import { INTERVAL } from '../../common/config.js';
import { UnitType } from '../../common/types/Units.js';
import { drawBarrack } from './graphics/barracks.js';
import drawPawn from './graphics/pawn.js';
import { drawResource } from './graphics/resource.js';
import drawWalls from './graphics/wall.js';
import { getObstacleCodes, getStaticElements, isFogged } from './position-tracker.js';
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 16;
let movingUnits = [];
let factionColor = {};
const animationDuration = INTERVAL;
let animationStartTime = 0;
let dimensions = getElementDimensions(canvas.parentElement);
if (!ctx) {
    throw new Error('2D context not supported or canvas already initialized');
}
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
applyCanvasSize(dimensions);
drawGrid(CELL_SIZE);
function getElementDimensions(element) {
    const { width, height } = element.getBoundingClientRect();
    return { width: Math.floor(width / CELL_SIZE) - 1, height: Math.floor(height / CELL_SIZE) - 1 };
}
function setCanvasSize(newDimensions) {
    dimensions = newDimensions;
    applyCanvasSize(dimensions);
}
function applyCanvasSize(dimensions) {
    const { width, height } = dimensions;
    ctx.canvas.width = canvas.width = width * CELL_SIZE;
    ctx.canvas.height = canvas.height = height * CELL_SIZE;
}
function drawGrid(cellSize) {
    const width = dimensions.width * CELL_SIZE;
    const height = dimensions.height * CELL_SIZE;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = '#cccccc'; // Light gray color for grid lines
    ctx.lineWidth = 1;
    // Draw vertical lines
    for (let x = 0; x <= width; x += cellSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    // Draw horizontal lines
    for (let y = 0; y <= height; y += cellSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function draw(updatedMovingUnits) {
    movingUnits = updatedMovingUnits;
    animationStartTime = performance.now();
    animate();
}
function animate(x) {
    const timestamp = performance.now();
    const progress = (timestamp - animationStartTime) / animationDuration;
    if (progress < 1) {
        drawFrame(progress);
        requestAnimationFrame(animate);
    }
    else {
        drawFrame(1); // Ensure the final position is rendered
    }
}
function drawFrame(progress) {
    clearCanvas();
    drawGrid(CELL_SIZE);
    drawWalls(ctx, getObstacleCodes());
    getStaticElements().forEach(row => row.forEach(cell => cell.forEach(element => {
        if (element.type === UnitType.resource) {
            drawResource(ctx, element.position);
        }
        if (element.type === UnitType.barrack) {
            const owner = element.owner;
            drawBarrack(ctx, element.position, owner, factionColor[owner]);
        }
    })));
    movingUnits.forEach(unit => {
        const startPos = unit.oldPosition;
        const x = startPos ? startPos.x + (unit.position.x - startPos.x) * progress : unit.position.x;
        const y = startPos ? startPos.y + (unit.position.y - startPos.y) * progress : unit.position.y;
        drawPawn(ctx, { x, y }, unit.action, unit.direction, factionColor[unit.owner]);
    });
    applyFogOfWar();
}
function setFactionColors(colors) { factionColor = colors; }
function applyFogOfWar() {
    // Cover with fog of war
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black for fog
    for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
            if (isFogged({ x, y })) {
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE); // Draw fog pixel by pixel
            }
        }
    }
    ctx.restore();
}
export { setCanvasSize, setFactionColors, draw };
