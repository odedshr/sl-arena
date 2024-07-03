import { INTERVAL } from '../../common/config.js';
import { UnitType } from '../../common/types/Units.js';
import { drawCircle, drawRectangle } from './graphics/shapes.js';
import { getObstacles, getStaticElements, isFogged } from './position-tracker.js';
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('minimap');
const ctx = canvas.getContext('2d');
let movingUnits = [];
let factionColor = {};
const animationDuration = INTERVAL;
let animationStartTime = 0;
let dimensions = getElementDimensions(canvas);
if (!ctx) {
    throw new Error('2D context not supported or canvas already initialized');
}
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
applyCanvasSize(dimensions);
function getElementDimensions(element) {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
}
function setCanvasSize(newDimensions) {
    dimensions = newDimensions;
    applyCanvasSize(dimensions);
}
function applyCanvasSize(dimensions) {
    const { width, height } = dimensions;
    const canvasWidth = canvas.getBoundingClientRect().width;
    const canvasHeight = canvasWidth * (height / width);
    // Calculate the height based on the aspect ratio and the new width
    canvas.style.height = `${canvasHeight}px`;
    // Get the 2D drawing context (if not already done)
    ctx.canvas.width = canvasWidth;
    ctx.canvas.height = canvasHeight;
    ctx.scale(canvasWidth / width, canvasHeight / height);
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
    drawObstacles(ctx, getObstacles());
    getStaticElements().forEach(row => row.forEach(cell => cell.forEach(element => {
        if (element.type === UnitType.resource) {
            drawResource(ctx, element);
        }
        if (element.type === UnitType.barrack) {
            const barrack = element;
            drawBarrack(ctx, barrack, factionColor);
        }
    })));
    movingUnits.forEach(unit => {
        const startPos = unit.oldPosition;
        const x = startPos ? startPos.x + (unit.position.x - startPos.x) * progress : unit.position.x;
        const y = startPos ? startPos.y + (unit.position.y - startPos.y) * progress : unit.position.y;
        drawPawn(ctx, { x, y }, factionColor[unit.owner]);
    });
    applyFogOfWar();
}
function setFactionColors(colors) { factionColor = colors; }
function drawObstacles(ctx, obstacles) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    obstacles.forEach(wall => {
        for (let i = 0; i < wall.position.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(wall.position[i].x, wall.position[i].y);
            ctx.lineTo(wall.position[i + 1].x, wall.position[i + 1].y);
            ctx.stroke();
        }
    });
}
function drawBarrack(ctx, barrack, factionColor) {
    drawRectangle(ctx, barrack.position.x, barrack.position.y, 1, 1, factionColor[barrack.owner]);
}
function drawResource(ctx, resource) {
    drawRectangle(ctx, resource.position.x, resource.position.y, 0.5, 0.5, 'black');
}
function drawPawn(ctx, position, color) {
    ctx.lineWidth = 0.1;
    ctx.strokeStyle = 'white';
    drawCircle(ctx, position.x + 0.5, position.y + 0.5, 0.25, color);
    ctx.stroke();
}
function applyFogOfWar() {
    // Cover with fog of war
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black for fog
    for (let x = 0; x < dimensions.width; x++) {
        for (let y = 0; y < dimensions.height; y++) {
            if (isFogged({ x, y })) {
                ctx.fillRect(x, y, 1, 1); // Draw fog pixel by pixel
            }
        }
    }
    ctx.restore();
}
export { setCanvasSize, setFactionColors, draw };
