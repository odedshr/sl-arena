import { ActionableUnit, Position } from '../../common/types/Units.js';
import { drawRectangle } from './shapes.js';

const nurseries = [
  getImage('../graphics/nursery/spr_boulder1.png'),
  getImage('../graphics/nursery/spr_boulder2.png'),
  getImage('../graphics/nursery/spr_boulder3.png'),
  getImage('../graphics/nursery/spr_boulder4.png')
];

const CELL_SIZE = 16;

function drawNurseries(ctx: CanvasRenderingContext2D, nurseries: ActionableUnit[], colors: {
  [playerId: string]: string;
}) {
  nurseries.forEach((nursery, i) => drawNursery(ctx, nursery.position, i, colors[nursery.owner]));
}

function drawNursery(ctx: CanvasRenderingContext2D, position: Position, i: number, color: string) {
  const x = position.x * CELL_SIZE;
  const y = position.y * CELL_SIZE;

  drawRectangle(ctx, x, y, CELL_SIZE, CELL_SIZE, color);
  ctx.drawImage(nurseries[i % nurseries.length], 0, 0, 64, 64, x, y, CELL_SIZE * 2, CELL_SIZE * 2);
}

function getImage(src: string) {
  const image = new Image();
  image.src = src;
  return image;
}

export default drawNurseries;