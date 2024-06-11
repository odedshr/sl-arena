import { getRandomDirection } from '../generators.js';
import { EdgeType } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../util-grid.js';
import avoidCollisions from './collision-avoidance.js';
import { getPathToNearestTarget } from './path-finder.js';
const handler = (units, playerId, resources, dimensions, features) => {
    const isLoop = features.edge === EdgeType.loop;
    const commands = [];
    const barracks = units.filter(unit => unit.type === UnitType.barrack && unit.owner === playerId);
    const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));
    if (barracks.length) {
        barracks.forEach(barrack => { grid[barrack.position.y][barrack.position.x] = true; });
        if (resources > 0) {
            commands.push({
                unitId: barracks[0].id,
                action: UnitAction.produce,
                direction: getRandomDirection()
            });
        }
    }
    const pawns = units.filter(unit => unit.type === UnitType.pawn && unit.owner === playerId);
    const enemyBarracks = units.filter(unit => unit.type === UnitType.barrack && unit.owner !== playerId);
    commands.push(...handlePawns(pawns, enemyBarracks, grid, isLoop));
    avoidCollisions(pawns, commands, dimensions, features.edge);
    return commands;
};
function toBooleans(grid) {
    return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}
function handlePawns(pawns, enemyBarracks, terrain, isLoop) {
    const commands = {};
    for (const pawn of pawns) {
        const bestPath = getPathToNearestTarget(pawn.position, enemyBarracks.map(barrack => barrack.position), terrain, isLoop);
        if (bestPath.length) {
            commands[pawn.id] = {
                unitId: pawn.id,
                action: UnitAction.move,
                direction: bestPath[0].direction
            };
        }
        else {
            commands[pawn.id] = {
                unitId: pawn.id,
                action: UnitAction.idle,
                direction: pawn.direction
            };
        }
    }
    return Object.values(commands);
}
export default handler;
