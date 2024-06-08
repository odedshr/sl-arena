import { ActionableUnit, Direction } from '../../common/types/Units';

const directionRotate = {
  [Direction.north]: Direction.northEast,
  [Direction.northEast]: Direction.east,
  [Direction.east]: Direction.southEast,
  [Direction.southEast]: Direction.south,
  [Direction.south]: Direction.southWest,
  [Direction.southWest]: Direction.west,
  [Direction.west]: Direction.northWest,
  [Direction.northWest]: Direction.north,
}

function handleDeadUnit(unit: ActionableUnit): boolean {
  unit.direction = directionRotate[unit.direction];
  return unit.direction === Direction.northEast;
}

export default handleDeadUnit;