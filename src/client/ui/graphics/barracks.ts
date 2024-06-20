import { ActionableUnit, Position } from '../../../common/types/Units.js';
import getImage from './canvas-image.js';
import { drawRectangle } from './shapes.js';

const barracks = [
  getImage('barracks/spr_boulder1.png'),
  getImage('barracks/spr_boulder2.png'),
  getImage('barracks/spr_boulder3.png'),
  getImage('barracks/spr_boulder4.png')
];

const CELL_SIZE = 16;

function drawBarracks(ctx: CanvasRenderingContext2D, barracks: ActionableUnit[], colors: {
  [playerId: string]: string;
}) {
  barracks.forEach((barrack, i) => drawBarrack(ctx, barrack.position, i, colors[barrack.owner]));
}

function drawBarrack(ctx: CanvasRenderingContext2D, position: Position, i: number, color: string) {
  const x = position.x * CELL_SIZE;
  const y = position.y * CELL_SIZE;

  drawRectangle(ctx, x, y, CELL_SIZE, CELL_SIZE, color);
  ctx.drawImage(barracks[i % barracks.length], 0, 0, 64, 64, x, y, CELL_SIZE * 2, CELL_SIZE * 2);
}

export { drawBarracks, drawBarrack } ;