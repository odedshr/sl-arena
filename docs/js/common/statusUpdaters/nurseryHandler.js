import { UnitAction, UnitType } from '../../common/types/Units.js';
import { addUnit } from '../arena/arena.js';
import getNewPosition from './getNewPosition.js';
import handleDeadUnit from './handleDeadUnit.js';
function handleNurseryUnit(unit, player, grid, dimensions, edge) {
    //return true of unit died (and should be removed from the arena)
    switch (unit.action) {
        case UnitAction.produce:
            if (player.resources > 0) {
                const newUnitPosition = getNewPosition(unit.position, unit.direction, dimensions, edge);
                if (isNewPositionValid(newUnitPosition, unit.position, grid)) {
                    addUnit(player, UnitType.pawn, newUnitPosition, UnitAction.move, unit.direction);
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
function isSamePosition(position1, position2) {
    return position1.x === position2.x && position1.y === position2.y;
}
// return true if unit died (and should be removed from the arena
function isNewPositionValid(position, nurseryPosition, grid) {
    var _a;
    return position !== null &&
        !isSamePosition(nurseryPosition, position) &&
        !(((_a = grid[position.y][position.x][0]) === null || _a === void 0 ? void 0 : _a.type) === UnitType.wall);
}
export default handleNurseryUnit;
