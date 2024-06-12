import { Position, Unit } from '../../common/types/Units.js';
import getImage from './canvas-image.js';

const resources = [
  getImage('resources/small_chest_opening.png')
];

const CELL_SIZE = 16;

function drawResources(ctx: CanvasRenderingContext2D, resources: Unit[]) {
  resources.forEach(resource => drawResource(ctx, resource.position));
}

function drawResource(ctx: CanvasRenderingContext2D, position: Position) {
  const x = position.x * CELL_SIZE;
  const y = position.y * CELL_SIZE;

  ctx.drawImage(resources[0], 0, 0, 34, 34, x, y, CELL_SIZE, CELL_SIZE);
}

export default drawResources;