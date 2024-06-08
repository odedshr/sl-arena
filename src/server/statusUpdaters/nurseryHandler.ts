import { Dimensions, EdgeType } from '../../common/types/Arena';
import { DetailedPlayer } from '../../common/types/Player';
import { ActionableUnit, Position, UnitAction, UnitType } from '../../common/types/Units';
import { Grid } from '../../common/util-grid';
import { addUnit } from '../arena';
import getNewPosition from './getNewPosition';
import handleDeadUnit from './handleDeadUnit';

function handleNurseryUnit(unit: ActionableUnit, player: DetailedPlayer, grid: Grid, dimensions: Dimensions, edge: EdgeType) {
  //return true of unit died (and should be removed from the arena)
  switch (unit.action) {
    case UnitAction.produce:
      if (player.resources > 0) {
        const newUnitPosition = getNewPosition(unit.position, unit.direction, dimensions, edge)
        if (isNewPositionValid(newUnitPosition, unit.position, grid)) {
          addUnit(player, UnitType.pawn, newUnitPosition as Position, UnitAction.move, unit.direction);
          player.resources--;
        }
      }
      if (player.resources === 0) {
        unit.action = UnitAction.idle;
      }

      break;
    case UnitAction.dead:
      return handleDeadUnit(unit);
  }

  return false;
}

function isSamePosition(position1: Position, position2: Position) {
  return position1.x === position2.x && position1.y === position2.y;
}

// return true if unit died (and should be removed from the arena
function isNewPositionValid(position: Position | null, nurseryPosition: Position, grid: Grid) {
  return position !== null &&
    !isSamePosition(nurseryPosition, position) &&
    !(grid[position.y][position.x][0]?.type === UnitType.wall);
}

export default handleNurseryUnit;