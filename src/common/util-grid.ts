import { Dimensions } from './types/Arena.js';
import { Position, Unit, UnitType, WallElement } from './types/Units.js';

type GridCell = Unit[];
type GridRow = GridCell[];
type Grid = GridRow[];

function createGrid(dimensions: Dimensions, units: Unit[]): Grid {
  const grid = getEmptyGrid(dimensions);
  //Array.from({ length: dimensions.height }, () => Array(dimensions.width).fill([]));

  units.forEach(unit => {
    if (unit.type === UnitType.wall) {
      const { position } = (unit as WallElement);
      for (let i = 0; i < ((position as Position[]).length - 1); i++) {
        markLineOnGrid(position[i], position[i + 1], p => setCell(p, unit, grid));
      }
    } else {
      setCell(unit.position, unit, grid)
    }
  });

  return grid;
}

function getEmptyGrid(dimensions: Dimensions) {
  const grid: Grid = [];
  const { width, height } = dimensions;
  for (let y = 0; y < height; y++) {
    const gridRow: GridRow = [];
    for (let x = 0; x < width; x++) {
      gridRow.push([])
    }
    grid.push(gridRow);
  }
  return grid;
}

function setCell(position: Position, unit: Unit, grid: Grid) {
  if (!grid[position.y][position.x]) {
    grid[position.y][position.x] = [];
  }
  grid[position.y][position.x].push(unit);
}

function markLineOnGrid(lineStart: Position, lineEnd: Position, markCell: (position: Position) => void): void {
  const x0 = Math.floor(lineStart.x);
  const y0 = Math.floor(lineStart.y);
  const x1 = Math.floor(lineEnd.x);
  const y1 = Math.floor(lineEnd.y);

  markCell({ x: x0, y: y0 });

  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let sx = (x0 < x1) ? 1 : -1;
  let sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;

  let x = x0;
  let y = y0;

  while (!(x === x1 && y === y1)) {
    markCell({ x, y });
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }

  markCell({ x: x1, y: y1 });
}

export default createGrid;
export { GridRow, Grid };