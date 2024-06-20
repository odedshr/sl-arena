import getNewPosition from '../state-updaters/get-new-position.js';
import { UnitAction } from '../types/Units.js';
function getEmptyGrid(dimensions) {
    const grid = [];
    for (let i = 0; i < dimensions.width; i++) {
        grid.push([]);
        for (let j = 0; j < dimensions.height; j++) {
            grid[i].push(undefined);
        }
    }
    return grid;
}
function getUnitPosition(position, command, dimensions, edge) {
    if (command.action === UnitAction.move) {
        return getNewPosition(position, command.direction, dimensions, edge);
    }
    return position;
}
function avoidCollisions(units, commands, dimensions, edge) {
    // iterate through all commands, place the units on a grid and verify they don't collide- if a unit is about to collide, change its action to idle
    const grid = getEmptyGrid(dimensions);
    units.forEach((unit) => {
        const command = commands.find(command => command.unitId === unit.id);
        if (command) {
            const unitPosition = getUnitPosition(unit.position, command, dimensions, edge);
            if (unitPosition && grid[unitPosition.y][unitPosition.x] !== undefined) {
                command.action = UnitAction.idle;
            }
        }
    });
    return commands;
}
export default avoidCollisions;
