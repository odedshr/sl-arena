import { INTERVAL } from '../common/config.js';
import { Dimensions } from '../common/types/Arena.js';
import Player from '../common/types/Player.js';
import { ActionableUnit, Position, Unit, UnitType, WallElement } from '../common/types/Units.js';
import drawNursery from './graphics/nursery.js';
import drawPawn from './graphics/pawn.js';
import drawWalls from './graphics/wall.js';

// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('map') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
const CELL_SIZE = 16;
const factionColor: { [playerId: string]: string } = {};
const oldPositions: Map<string, Position> = new Map();
let movingUnits: ActionableUnit[] = [];
let unitByType: { [unitType: string]: Unit[] } = {};

const animationDuration = INTERVAL;
let animationStartTime: number = 0;

let dimensions: Dimensions = getElementDimensions(canvas.parentElement as HTMLElement);

if (!ctx) {
  throw new Error('2D context not supported or canvas already initialized');
}

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
applyCanvasSize(dimensions);
drawGrid(CELL_SIZE);

function getElementDimensions(element: HTMLElement) {
  const { width, height } = element.getBoundingClientRect();
  return { width: Math.floor(width / CELL_SIZE) - 1, height: Math.floor(height / CELL_SIZE) - 1 };
}

function setCanvasSize(newDimensions: Dimensions) {
  dimensions = newDimensions
  applyCanvasSize(dimensions);
}

function applyCanvasSize(dimensions: Dimensions) {
  const { width, height } = dimensions;

  ctx.canvas.width = canvas.width = width * CELL_SIZE;
  ctx.canvas.height = canvas.height = height * CELL_SIZE;
}

function drawGrid(cellSize: number) {
  const width = dimensions.width * CELL_SIZE
  const height = dimensions.height * CELL_SIZE

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

function clearCanvas(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw(units: Unit[]) {
  movingUnits.forEach(unit => oldPositions.set(unit.id, unit.position));

  movingUnits = [];
  unitByType = {
    [UnitType.nursery]: [],
    [UnitType.wall]: [],
  };
  units.forEach(unit => {
    if (unit.type === UnitType.pawn) {
      movingUnits.push(unit as ActionableUnit);
    } else {
      if (!unitByType[unit.type]) {
        unitByType[unit.type] = [];
      }
      unitByType[unit.type].push(unit);
    }
  });

  animationStartTime = performance.now();
  animate();
}

function animate(x?: number): void {
  const timestamp = performance.now();

  const progress = (timestamp - animationStartTime) / animationDuration;
  if (progress < 1) {
    drawFrame(progress);
    requestAnimationFrame(animate);
  } else {
    drawFrame(1); // Ensure the final position is rendered
  }
}

function drawFrame(progress: number) {
  clearCanvas();
  drawGrid(CELL_SIZE);

  drawWalls(ctx, dimensions, unitByType[UnitType.wall] as WallElement[]);
  drawNursery(ctx, unitByType[UnitType.nursery] as ActionableUnit[], factionColor);

  movingUnits.forEach(unit => {
    const startPos = oldPositions.get(unit.id)!;
    const x = startPos ? startPos.x + (unit.position.x - startPos.x) * progress : unit.position.x;
    const y = startPos ? startPos.y + (unit.position.y - startPos.y) * progress : unit.position.y;

    drawPawn(ctx, { x, y }, unit.action, unit.direction, factionColor[unit.owner]);
  });
}

function setFactionColors(factions: Player[]) {
  factions.forEach(faction => { factionColor[faction.id] = faction.color; });
}

export { setCanvasSize, setFactionColors, draw };