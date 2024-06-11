import { Direction, UnitAction, UnitType } from '../../common/types/Units.js';
import getNewPosition from './getNewPosition.js';
function handlePawnUnit(unit, grid, dimensions, edge) {
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
function handleUnitMove(unit, grid, dimensions, edge) {
    var _a, _b;
    const newPosition = getNewPosition(unit.position, unit.direction, dimensions, edge);
    if (newPosition === null) {
        // couldn't get new position, probably fell off a map
        unit.action = UnitAction.dead;
        unit.direction = Direction.north;
        return;
    }
    else if ((newPosition.x === unit.position.x && newPosition.y === unit.position.y) ||
        (((_a = grid[newPosition.y][newPosition.x][0]) === null || _a === void 0 ? void 0 : _a.type) === UnitType.wall)) {
        //didn't move, probably hit a map wall edge or an actual wall
        unit.action = UnitAction.idle;
        return;
    }
    else if (((_b = grid[newPosition.y][newPosition.x][0]) === null || _b === void 0 ? void 0 : _b.type) === UnitType.water) {
        //fell in water
        unit.action = UnitAction.dead;
        return;
    }
    unit.position = newPosition;
}
export default handlePawnUnit;
