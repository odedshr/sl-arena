import { UnitAction, UnitType } from '../types/Units.js';
import { addUnit } from '../arena/arena.js';
function handleBarrackUnit(unit, arena) {
    const player = arena.players[unit.owner];
    if (unit.action === UnitAction.produce) {
        if (player.resources > 0) {
            addUnit(arena, unit.owner, UnitType.pawn, unit.position, UnitAction.move, unit.direction);
            player.resources--;
        }
        if (player.resources === 0) {
            unit.action = UnitAction.idle;
        }
    }
}
export default handleBarrackUnit;
