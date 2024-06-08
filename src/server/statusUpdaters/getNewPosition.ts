import { Dimensions, EdgeType } from '../../common/types/Arena';
import { Direction, Position } from '../../common/types/Units';

const positionDelta: { [key: string]: Position } = {
  [Direction.north]: { x: 0, y: -1 },
  [Direction.northEast]: { x: 1, y: -1 },
  [Direction.east]: { x: 1, y: 0 },
  [Direction.southEast]: { x: 1, y: 1 },
  [Direction.south]: { x: 0, y: 1 },
  [Direction.southWest]: { x: -1, y: 1 },
  [Direction.west]: { x: -1, y: 0 },
  [Direction.northWest]: { x: -1, y: -1 },
};

function getNewPosition(position: Position, direction: Direction, dimensions: Dimensions, edge: EdgeType): Position | null {
  const newPosition = { ...position };

  newPosition.x += positionDelta[direction].x
  if (newPosition.x < 0 || newPosition.x >= dimensions.width) {
    switch (edge) {
      case EdgeType.loop:
        newPosition.x = (newPosition.x + dimensions.width) % dimensions.width;
        break;
      case EdgeType.wall:
        newPosition.x = position.x;
        break;
      case EdgeType.death:
        return null;
    }
  }
  newPosition.y += positionDelta[direction].y
  if (newPosition.y < 0 || newPosition.y >= dimensions.height) {
    switch (edge) {
      case EdgeType.loop:
        newPosition.y = (newPosition.y + dimensions.height) % dimensions.height;
        break;
      case EdgeType.wall:
        newPosition.y = position.y;
        break;
      case EdgeType.death:
        return null;
    }
  }

  return newPosition;
}

export default getNewPosition;