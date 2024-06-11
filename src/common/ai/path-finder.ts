import { Dimensions } from '../types/Arena.js';
import { Direction, Position } from '../types/Units.js';

type WayPoint = {
  distance: number;
  direction: Direction;
  origin: Position
}

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

function getWayPointGrid(dimensions: Dimensions): (WayPoint | undefined)[][] {
  const height = dimensions.height;
  const width = dimensions.width;
  return new Array(height).fill(0).map(() => new Array(width).fill(undefined));
}

function toPositionSet(positions: Position[]): Set<string> {
  const set = new Set<string>();
  for (const position of positions) {
    set.add(`${position.x}, ${position.y}`);
  }
  return set;
}

function getPath(grid: (WayPoint | undefined)[][], end: Position): WayPoint[] {
  const path: WayPoint[] = [];
  let current: WayPoint | undefined = grid[end.y][end.x];

  while (current) {
    path.unshift(current);
    current = grid[current.origin.y][current.origin.x];
  }

  return path;
}

function getPathToNearestTarget(start: Position, targets: Position[], terrain: boolean[][], isLoop: boolean): WayPoint[] {
  const height = terrain.length;
  const width = terrain[0].length;
  const waypoints = getWayPointGrid({ width, height });
  const destinations = toPositionSet(targets);
  const queue = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length || queue.length > 1000) {
    const current = queue.shift()!;
    if (destinations.has(`${current.x}, ${current.y}`)) {
      return getPath(waypoints, current);
    }

    const currentWayPoint = (waypoints[current.y][current.x] || { distance: 0 }) as WayPoint;
    // Explore all directions
    for (const dir of directions) {
      const next = getNextPosition(current, dir, width, height, isLoop);

      // Check if the next position is valid and not blocked
      if (
        !visited.has(`${next.x},${next.y}`) &&
        isValidPosition(next.x, next.y, width, height, terrain, isLoop)
      ) {
        queue.push(next);
        waypoints[next.y][next.x] = {
          distance: currentWayPoint.distance + 1,
          direction: dir.direction,
          origin: current
        };
        visited.add(`${next.x},${next.y}`);
      }
    }
  }

  return [];
}

export { getPathToNearestTarget, WayPoint };