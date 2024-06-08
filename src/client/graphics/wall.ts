import { Dimensions } from '../../common/types/Arena';
import { WallElement } from '../../common/types/Units';
import createGrid, { Grid, GridRow } from '../../common/util-grid.js';

const CELL_SIZE = 16;

const images: { [key: number]: HTMLImageElement } = {
  0: getImage('/graphics/walls/spr_standalone_pole.png'),                         // 0000 no walls around
  1: getImage('/graphics/walls/spr_back_front_fence_ending.png'),               // 0001 north
  10: getImage('/graphics/walls/spr_left_front_fence_ending.png'),              // 0010 east
  11: getImage('/graphics/walls/spr_front_fence_left_backcorner.png'),          // 0011 north + east
  100: getImage('/graphics/walls/spr_up_front_fence_ending.png'),               // 0100 south
  101: getImage('/graphics/walls/spr_side_fence.png'),                          // 0101 south + north
  110: getImage('/graphics/walls/spr_front_fence_left_corner.png'),             // 0110 south + east
  111: getImage('/graphics/walls/spr_left_side_fence_three-intersection.png'),  // 0111 south + east + north
  1000: getImage('/graphics/walls/spr_right_front_fence_ending.png'),           // 1000 west
  1001: getImage('/graphics/walls/spr_front_fence_right_backcorner.png'),       // 1001 west + north
  1010: getImage('/graphics/walls/spr_front_fence.png'),                        // 1010 west + east
  1011: getImage('/graphics/walls/spr_front_fence_back_three-intersection.png'),// 1011 west + east + north
  1100: getImage('/graphics/walls/spr_front_fence_right_corner.png'),           // 1100 west + south
  1101: getImage('/graphics/walls/spr_right_side_fence_three-intersection.png'),// 1101 west + south + north
  1110: getImage('/graphics/walls/spr_front_fence_three-intersection.png'),     // 1110 west + south + east
  1111: getImage('/graphics/walls/spr_fence_four-intersection.png'),            // 1111 west + south + east + north
};

function drawWalls(ctx: CanvasRenderingContext2D, dimensions: Dimensions, walls: WallElement[]) {
  const grid = createGrid(dimensions, walls);

  grid.forEach((row, y) => row.forEach((cell, x) => {
    if (!cell || !cell.length) {
      return null;
    }
    const imageCode = getImageCode(grid, row, x, y)
    ctx.drawImage(images[imageCode], x * CELL_SIZE, y * CELL_SIZE);
  }));
}

function getImageCode(grid: Grid, row: GridRow, x: number, y: number) {
  let value = 0;
  if (y - 1 >= 0 && grid[y - 1][x].length) {
    value += 1;
  }
  if (x + 1 < row.length && grid[y][x + 1].length) {
    value += 10;
  }
  if (y + 1 < grid.length && grid[y + 1][x].length) {
    value += 100;
  }
  if (x - 1 >= 0 && grid[y][x - 1].length) {
    value += 1000;
  }

  return value;
}

function getImage(src: string) {
  const image = new Image();
  image.src = src;
  return image;
}

export default drawWalls;