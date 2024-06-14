import { Dimensions, EdgeType } from '../types/Arena.js';
import { DetailedPlayer } from '../types/Player.js';
import { ActionableUnit, Position, UnitAction, UnitType } from '../types/Units.js';
import { Grid } from '../util-grid.js';
import { addUnit } from '../arena/arena.js';
import getNewPosition from './getNewPosition.js';

function handleBarrackUnit(unit: ActionableUnit, player: DetailedPlayer, grid: Grid, dimensions: Dimensions, edge: EdgeType) {
  //return true of unit died (and should be removed from the arena)
  switch (unit.action) {
    case UnitAction.produce:
      if (player.resources > 0) {
        addUnit(player, UnitType.pawn, unit.position, UnitAction.move, unit.direction);
        player.resources--;
      }
      if (player.resources === 0) {
        unit.action = UnitAction.idle;
      }
      return false;
    case UnitAction.dead:
      return true;
  }

  return false;
}

function isSamePosition(position1: Position, position2: Position) {
  return position1.x === position2.x && position1.y === position2.y;
}

// return true if unit died (and should be removed from the arena
function isNewPositionValid(position: Position | null, barrackPosition: Position, grid: Grid) {
  return position !== null &&
    !isSamePosition(barrackPosition, position) &&
    !(grid[position.y][position.x][0]?.type === UnitType.wall);
}

export default handleBarrackUnit;