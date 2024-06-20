import { Dimensions } from '../types/Arena.js';
import { Direction, Position } from '../types/Units.js';

type WayPoint = {
  distance: number;
  forward: Direction;
  backward: Direction;
  origin: Position;
  position: Position;
}

const directions = [
  { x: 0, y: -1, forward: Direction.north, backward: Direction.south },
  { x: 1, y: -1, forward: Direction.northEast, backward: Direction.southWest },
  { x: 1, y: 0, forward: Direction.east, backward: Direction.west },
  { x: 1, y: 1, forward: Direction.southEast, backward: Direction.northWest },
  { x: 0, y: 1, forward: Direction.south, backward: Direction.north },
  { x: -1, y: 1, forward: Direction.southWest, backward: Direction.northEast },
  { x: -1, y: 0, forward: Direction.west, backward: Direction.east },
  { x: -1, y: -1, forward: Direction.southWest, backward: Direction.northEast }
];

// Function to check if a position is within grid boundaries and not occupied by obstacles
function isValidPosition(position:Position, dimensions:Dimensions, obstacles: boolean[][], isLoop: boolean): boolean {
  const { width, height } = dimensions;
  let { x, y } = position;

  if (isLoop) {
    y = (y + height) % height;
    x = (x + width) % width;
  }

  if (y < 0 || y >= height || x < 0 || x >= width) {
    return false;
  }

  return !obstacles[y][x];
}

// Function to get the next position with looping consideration
function getNextPosition(pos: Position, towards: Position, dimensions:Dimensions, isLoop: boolean): Position {
  let nextX = pos.x + towards.x;
  let nextY = pos.y + towards.y;

  if (isLoop) {
    const { width, height } = dimensions;

    nextY = (nextY + height) % height;
    nextX = (nextX + width) % width;
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
  const dimensions = { width, height };
  const waypoints = getWayPointGrid(dimensions);
  const destinations = toPositionSet(targets);
  const queue = [start];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length || queue.length > 5000) {
    const current = queue.shift()!;
    if (destinations.has(`${current.x}, ${current.y}`)) {
      return getPath(waypoints, current);
    }

    const currentWayPoint = (waypoints[current.y][current.x] || { distance: 0 }) as WayPoint;
    // Explore all directions
    for (const dir of directions) {
      const next = getNextPosition(current, dir, dimensions, isLoop);

      // Check if the next position is valid and not blocked
      if (
        !visited.has(`${next.x},${next.y}`) &&
        isValidPosition(next, dimensions, terrain, isLoop)
      ) {
        queue.push(next);
        waypoints[next.y][next.x] = {
          distance: currentWayPoint.distance + 1,
          forward: dir.forward,
          backward: dir.backward,
          origin: current,
          position: next
        };
        visited.add(`${next.x},${next.y}`);
      }
    }
  }

  return [];
}

export { getPathToNearestTarget, WayPoint, isValidPosition, getNextPosition };