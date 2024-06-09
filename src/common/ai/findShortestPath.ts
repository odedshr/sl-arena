import { Position } from '../types/Units';

// Directions: up, right, down, left
const directions = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
];

// Function to check if a position is within grid boundaries
function isValid(x: number, y: number, cols: number, rows: number): boolean {
  return x >= 0 && x < cols && y >= 0 && y < rows;
};

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
  const rows = grid.length;
  const cols = grid[0].length;

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
      const next = getNextPosition(current, dir, cols, rows, isLoop);

      // Check if the next position is valid and not blocked
      if (isValid(next.x, next.y, rows, rows) && !grid[next.y][next.x] && !visited.has(`${next.x},${next.y}`)) {
        queue.push([next, distance + 1]);
        visited.add(`${next.x},${next.y}`);
      }
    }
  }

  // If no path is found, return Infinity
  return Infinity;
}

export default findShortestPath;