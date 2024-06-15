import { Dimensions, EdgeType } from '../../common/types/Arena.js';
import { ActionableUnit, Direction, Position, Unit, UnitAction, UnitType } from '../../common/types/Units.js';
import { Grid } from '../../common/util-grid.js';
import getNewPosition from './getNewPosition.js';

function handlePawnUnit(unit: ActionableUnit, grid: Grid, dimensions: Dimensions, edge: EdgeType): boolean {
  //return true of unit died (and should be removed from the arena)
  switch (unit.action) {
    case UnitAction.move:
      handleUnitMove(unit, grid, dimensions, edge);
      break;
    case UnitAction.dead:
      return true;
  }

  return false;
}

function handleUnitMove(unit: ActionableUnit, grid: Grid, dimensions: Dimensions, edge: EdgeType) {
  const newPosition = getNewPosition(unit.position, unit.direction, dimensions, edge);
  if (newPosition === null) {
    // couldn't get new position, probably fell off a map
    unit.action = UnitAction.dead;
    unit.direction = Direction.north;
    return;
  } else if ((newPosition.x === unit.position.x && newPosition.y === unit.position.y) ||
    (grid[newPosition.y][newPosition.x][0]?.type === UnitType.wall)) {
    //didn't move, probably hit a map wall edge or an actual wall
    unit.action = UnitAction.idle;
    return;
  } else if (grid[newPosition.y][newPosition.x][0]?.type === UnitType.water) {
    //fell in water
    unit.action = UnitAction.dead;
    return;
  }

  moveUnit(unit, grid, newPosition);
}

function moveUnit(unit:Unit, grid:Grid, position:Position) {
  removeUnitFromGrid(unit, grid);
  unit.position = position;
  grid[position.y][position.x].push(unit);
}

function removeUnitFromGrid(unit:Unit, grid:Grid) {
  const {y,x} = unit.position;
  grid[y][x].splice(grid[y][x].indexOf(unit), 1);
}

export default handlePawnUnit;