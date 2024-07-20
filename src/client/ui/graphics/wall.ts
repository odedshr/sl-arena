import { Position } from '../../../common/types/Units.js';
import { Grid } from '../../../common/util-grid.js';
import getImage from './canvas-image.js';

const CELL_SIZE = 16;
const IMAGE = getImage('walls.png');
const OFFSET:{[key:number]:Position} = {
  '0': {x:0, y:0},
  '1': {x:1, y:0}, // N
  '10': {x:2, y:0}, // E
  '11': {x:3, y:0}, // EN
  '100': {x:0, y:2}, // S
  '101': {x:1, y:2}, // SN
  '110': {x:2, y:2}, // WS
  '111': {x:3, y:2},  // NWS
  '1000': {x:0, y:1}, // W
  '1001': {x:1, y:1}, // WS
  '1010': {x:2, y:1}, // WE
  '1011': {x:3, y:1}, // WEN
  '1100': {x:0, y:3}, // WS
  '1101': {x:1, y:3}, // WNS
  '1110': {x:2, y:3}, // WES
  '1111': {x:3, y:3}, // WNES
};

function drawWalls(ctx: CanvasRenderingContext2D, obstacles:Grid<number>) {
  obstacles.forEach((row, y) => row.forEach((cell, x) => {
    if (cell > 0) {
      const offset = OFFSET[cell];
      ctx.drawImage(IMAGE, 
        CELL_SIZE * offset.x, CELL_SIZE * offset.y, // offset in source
        CELL_SIZE, CELL_SIZE, // crop section in target
        x * CELL_SIZE, y * CELL_SIZE, // position in output
        CELL_SIZE , CELL_SIZE ); // size on output
    }    
  }));
}

export default drawWalls;