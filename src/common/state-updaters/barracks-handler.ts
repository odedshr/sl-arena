import { Arena } from '../types/Arena.js';
import { DetailedPlayer } from '../types/Player.js';
import { ActionableUnit, Direction, UnitAction, UnitType } from '../types/Units.js';
import { addUnit } from '../arena/arena.js';

function handleBarrackUnit(unit: ActionableUnit, arena:Arena) {
  const player = arena.players[unit.owner] as DetailedPlayer;

  if (unit.action===UnitAction.produce) {
    if (player.resources > 0) {
      addUnit(arena, unit.owner, UnitType.pawn, unit.position, UnitAction.idle, unit.direction || Direction.north);
      player.resources--;
    }
    if (player.resources === 0) {
      unit.action = UnitAction.idle;
    }
  }
}

export default handleBarrackUnit;