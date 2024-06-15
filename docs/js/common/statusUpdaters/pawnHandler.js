import { UnitAction, UnitType } from '../../common/types/Units.js';
import { moveUnit } from '../arena/arena.js';
import getNewPosition from './getNewPosition.js';
function handlePawnUnit(unit, arena) {
    //return true of unit died (and should be removed from the arena)
    switch (unit.action) {
        case UnitAction.move:
            handleUnitMove(unit, arena);
            break;
        case UnitAction.dead:
            return true;
    }
    return false;
}
function handleUnitMove(unit, arena) {
    const newPosition = getNewPosition(unit.position, unit.direction, arena.spec.dimensions, arena.spec.features.edge);
    if (newPosition === null) {
        // couldn't get new position, probably fell off a map
        unit.action = UnitAction.dead;
        return;
    }
    const { y, x } = newPosition;
    const cell = arena.grid[y][x];
    if ((x === unit.position.x && y === unit.position.y) ||
        (cell.some(unit => (unit.type === UnitType.wall)))) {
        //didn't move, probably hit a map wall edge or an actual wall
        unit.action = UnitAction.idle;
        return;
    }
    else if (cell.some(unit => (unit.type === UnitType.water))) {
        //fell in water
        unit.action = UnitAction.dead;
        return;
    }
    moveUnit(unit, arena, newPosition);
}
export default handlePawnUnit;
