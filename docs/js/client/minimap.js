import { INTERVAL } from '../common/config.js';
import { UnitType } from '../common/types/Units.js';
import { drawCircle, drawRectangle } from './graphics/shapes.js';
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('minimap');
const ctx = canvas.getContext('2d');
const factionColor = {};
const oldPositions = new Map();
let movingUnits = [];
let unitByType = {};
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
function setMiniMapSize(newDimensions) {
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
function draw(units) {
    movingUnits.forEach(unit => oldPositions.set(unit.id, unit.position));
    movingUnits = [];
    unitByType = {
        [UnitType.barrack]: [],
        [UnitType.wall]: [],
        [UnitType.resource]: [],
    };
    units.forEach(unit => {
        if (unit.type === UnitType.pawn) {
            movingUnits.push(unit);
        }
        else {
            if (!unitByType[unit.type]) {
                unitByType[unit.type] = [];
            }
            unitByType[unit.type].push(unit);
        }
    });
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
    drawWalls(ctx, unitByType[UnitType.wall]);
    drawResources(ctx, unitByType[UnitType.resource]);
    drawBarracks(ctx, unitByType[UnitType.barrack], factionColor);
    movingUnits.forEach(unit => {
        const startPos = oldPositions.get(unit.id);
        const x = startPos ? startPos.x + (unit.position.x - startPos.x) * progress : unit.position.x;
        const y = startPos ? startPos.y + (unit.position.y - startPos.y) * progress : unit.position.y;
        drawPawn(ctx, { x, y }, factionColor[unit.owner]);
    });
}
function setFactionColors(factions) {
    factions.forEach(faction => { factionColor[faction.id] = faction.color; });
}
function drawWalls(ctx, walls) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    walls.forEach(wall => {
        for (let i = 0; i < wall.position.length - 1; i++) {
            ctx.beginPath();
            ctx.moveTo(wall.position[i].x, wall.position[i].y);
            ctx.lineTo(wall.position[i + 1].x, wall.position[i + 1].y);
            ctx.stroke();
        }
    });
}
function drawBarracks(ctx, barracks, factionColor) {
    barracks.forEach(barrack => drawRectangle(ctx, barrack.position.x, barrack.position.y, 1, 1, factionColor[barrack.owner]));
}
function drawResources(ctx, resources) {
    resources.forEach(resource => drawRectangle(ctx, resource.position.x, resource.position.y, 0.5, 0.5, 'black'));
}
function drawPawn(ctx, position, color) {
    drawCircle(ctx, position.x, position.y, 0.25, color);
}
export { setMiniMapSize, setFactionColors, draw };
