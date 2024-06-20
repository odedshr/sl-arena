import { INTERVAL } from '../../common/config.js';
import distance from '../../common/distance.js';
import { Dimensions } from '../../common/types/Arena.js';
import { Grid } from '../../common/types/Grid.js';
import { ActionableUnit, MovingUnit, Position, Unit, UnitType, WallElement } from '../../common/types/Units.js';
import { drawCircle, drawRectangle } from './graphics/shapes.js';
import { getObstacles, getStaticElements, isFogged } from './position-tracker.js';

// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('minimap') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

let movingUnits: MovingUnit[] = [];
let factionColor: { [playerId: string]: string } = {};

const animationDuration = INTERVAL;
let animationStartTime: number = 0;

let dimensions: Dimensions = getElementDimensions(canvas as HTMLElement);

if (!ctx) {
  throw new Error('2D context not supported or canvas already initialized');
}

ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
applyCanvasSize(dimensions);

function getElementDimensions(element: HTMLElement) {
  const { width, height } = element.getBoundingClientRect();
  return { width, height };
}

function setCanvasSize(newDimensions: Dimensions) {
  dimensions = newDimensions
  applyCanvasSize(dimensions);
}

function applyCanvasSize(dimensions: Dimensions) {
  const { width, height } = dimensions;
  const canvasWidth = canvas.getBoundingClientRect().width;
  const canvasHeight = canvasWidth * (height/width)
  
  // Calculate the height based on the aspect ratio and the new width
  canvas.style.height = `${canvasHeight}px`;

  // Get the 2D drawing context (if not already done)
  ctx.canvas.width = canvasWidth;
  ctx.canvas.height = canvasHeight;

  ctx.scale(canvasWidth/width, canvasHeight/height);
}

function clearCanvas(): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function draw(updatedMovingUnits:MovingUnit[]) {
  movingUnits = updatedMovingUnits;

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

  drawObstacles(ctx, getObstacles() as WallElement[]);
  
  getStaticElements().forEach(row=>row.forEach(cell=>cell.forEach(element=> {
    if (element.type === UnitType.resource) {
      drawResource(ctx, element);
    }
    if (element.type === UnitType.barrack) {
      const barrack = (element as ActionableUnit);
      drawBarrack(ctx, barrack, factionColor);
    }
  })));
  
  movingUnits.forEach(unit => {
    const startPos = unit.oldPosition!;
    const x = startPos ? startPos.x + (unit.position.x - startPos.x) * progress : unit.position.x;
    const y = startPos ? startPos.y + (unit.position.y - startPos.y) * progress : unit.position.y;

    drawPawn(ctx, { x, y }, factionColor[unit.owner]);
  });

  applyFogOfWar();
}

function setFactionColors(colors: { [playerId: string]: string }) { factionColor = colors; }

function drawObstacles(ctx: CanvasRenderingContext2D, obstacles:WallElement[]) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';

  obstacles.forEach(wall => {
    for (let i=0;i<wall.position.length-1;i++) {
      ctx.beginPath();
      ctx.moveTo(wall.position[i].x, wall.position[i].y);
      ctx.lineTo(wall.position[i + 1].x, wall.position[i + 1].y);
      ctx.stroke();
    }
  });
}

function drawBarrack(ctx: CanvasRenderingContext2D, barrack: ActionableUnit, factionColor: { [playerId: string]: string }) {
  drawRectangle(ctx, barrack.position.x, barrack.position.y,1,1,factionColor[barrack.owner])
}

function drawResource(ctx: CanvasRenderingContext2D, resource: Unit) {
  drawRectangle(ctx, resource.position.x, resource.position.y,0.5,0.5,'black')
}

function drawPawn(ctx: CanvasRenderingContext2D, position: Position, color: string) {
  drawCircle(ctx, position.x, position.y, 0.25, color);
}

function applyFogOfWar() {
      // Cover with fog of war
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Semi-transparent black for fog
  
      for (let x = 0; x < dimensions.width; x++) {
          for (let y = 0; y < dimensions.height; y++) {
            if (isFogged({x,y})) {
              ctx.fillRect(x, y, 1, 1); // Draw fog pixel by pixel
            }
          }
      }
  
      ctx.restore();
}

export { setCanvasSize, setFactionColors, draw };