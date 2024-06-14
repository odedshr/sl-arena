import { UnitAction, UnitType } from '../types/Units.js';
import { addUnit } from '../arena/arena.js';
function handleBarrackUnit(unit, player, grid, dimensions, edge) {
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
function isSamePosition(position1, position2) {
    return position1.x === position2.x && position1.y === position2.y;
}
// return true if unit died (and should be removed from the arena
function isNewPositionValid(position, barrackPosition, grid) {
    var _a;
    return position !== null &&
        !isSamePosition(barrackPosition, position) &&
        !(((_a = grid[position.y][position.x][0]) === null || _a === void 0 ? void 0 : _a.type) === UnitType.wall);
}
export default handleBarrackUnit;
