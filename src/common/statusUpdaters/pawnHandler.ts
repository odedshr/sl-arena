import { Dimensions, EdgeType } from '../../common/types/Arena.js';
import { ActionableUnit, Direction, Position, UnitAction, UnitType } from '../../common/types/Units.js';
import { Grid } from '../../common/util-grid.js';
import getNewPosition from './getNewPosition.js';
import handleDeadUnit from './handleDeadUnit.js';

function handlePawnUnit(unit: ActionableUnit, grid: Grid, dimensions: Dimensions, edge: EdgeType): boolean {
  //return true of unit died (and should be removed from the arena)
  switch (unit.action) {
    case UnitAction.move:
      handleUnitMove(unit, grid, dimensions, edge);
      break;
    case UnitAction.dead:
      return handleDeadUnit(unit);
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
  } else if (newPosition.x === unit.position.x && newPosition.y === unit.position.y) {
    //didn't move, probably hit a map wall edge
    unit.action = UnitAction.idle;
    return;
  } else if (grid[newPosition.y][newPosition.x][0]?.type === UnitType.wall) {
    //hit a wall
    unit.action = grid[newPosition.y][newPosition.x][0]?.onBump || UnitAction.idle
    return;
  }
  unit.position = (newPosition as Position);
}

export default handlePawnUnit;