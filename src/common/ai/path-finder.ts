import { Direction, Position } from '../types/Units.js';

const directions = [
  { x: 0, y: -1, direction: Direction.north },
  { x: 1, y: -1, direction: Direction.northEast },
  { x: 1, y: 0, direction: Direction.east },
  { x: 1, y: 1, direction: Direction.southEast },
  { x: 0, y: 1, direction: Direction.south },
  { x: -1, y: 1, direction: Direction.southWest },
  { x: -1, y: 0, direction: Direction.west },
  { x: -1, y: -1, direction: Direction.southWest }
];


// Function to check if a position is within grid boundaries

function isValidPosition(x: number, y: number, width: number, height: number, grid: boolean[][], isLoop: boolean): boolean {
  if (isLoop) {
    y = (y + height) % height;
    x = (x + width) % width;
  }

  if (y < 0 || y >= height || x < 0 || x >= width) {
    return false;
  }

  return !grid[y][x];
}

// Function to get the next position with looping consideration
function getNextPosition(pos: Position, direction: Position, cols: number, rows: number, isLoop: boolean): Position {
  let nextX = pos.x + direction.x;
  let nextY = pos.y + direction.y;

  if (isLoop) {
    if (nextX < 0) nextX = cols - 1;
    else if (nextX >= cols) nextX = 0;
    if (nextY < 0) nextY = rows - 1;
    else if (nextY >= rows) nextY = 0;
  }

  return { x: nextX, y: nextY };
};

function findShortestPath(start: Position, end: Position, grid: boolean[][], isLoop: boolean): number {
  const height = grid.length;
  const width = grid[0].length;

  // BFS setup
  const queue: [Position, number][] = [[start, 0]];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  // BFS loop
  while (queue.length > 0) {
    const [current, distance] = queue.shift()!;

    // Check if we have reached the end position
    if (current.x === end.x && current.y === end.y) {
      return distance;
    }

    // Explore all directions
    for (const dir of directions) {
      const next = getNextPosition(current, dir, width, height, isLoop);

      // Check if the next position is valid and not blocked
      if (isValidPosition(next.x, next.y, width, height, grid, isLoop) && !visited.has(`${next.x},${next.y}`)) {
        queue.push([next, distance + 1]);
        visited.add(`${next.x},${next.y}`);
      }
    }
  }

  // If no path is found, return Infinity
  return Infinity;
}

function getWrappedPosition(y: number, x: number, height: number, width: number, isLoop: boolean): Position {
  return isLoop ? { y: (y + height) % height, x: (x + width) % width } : { y, x };
}

function getNextDirection(start: Position, end: Position, grid: boolean[][], isLoop: boolean): Direction {
  const height = grid.length;
  const width = grid[0].length;

  let minDistance = Infinity;
  let bestDirection = Direction.north;

  for (const direction of directions) {
    const newRow = start.y + direction.y;
    const newCol = start.x + direction.x;

    if (isValidPosition(newRow, newCol, width, height, grid, isLoop)) {
      const wrappedPos = getWrappedPosition(newRow, newCol, height, width, isLoop);
      const distance = Math.abs(wrappedPos.y - end.y) + Math.abs(wrappedPos.x - end.x);
      if (distance < minDistance) {
        minDistance = distance;
        bestDirection = direction.direction;
      }
    }
  }

  return bestDirection;
}

export { findShortestPath, getNextDirection };