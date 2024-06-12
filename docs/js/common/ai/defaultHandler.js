import { getRandomDirection } from '../generators.js';
import { EdgeType } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../util-grid.js';
import avoidCollisions from './collision-avoidance.js';
import { getPathToNearestTarget } from './path-finder.js';
const handler = (units, playerId, resources, dimensions, features) => {
    const isLoop = features.edge === EdgeType.loop;
    const commands = [];
    const barracks = getMyUnits(UnitType.barrack, units, playerId);
    const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));
    if (barracks.length) {
        barracks.forEach(barrack => { grid[barrack.position.y][barrack.position.x] = true; });
        let barrack = 0;
        while (resources--) {
            commands.push({
                unitId: barracks[barrack++ % barracks.length].id,
                action: UnitAction.produce,
                direction: getRandomDirection()
            });
        }
    }
    const pawns = getMyUnits(UnitType.pawn, units, playerId);
    const potentialTargets = findTargets(units, playerId);
    commands.push(...handlePawns(pawns, potentialTargets, grid, isLoop));
    avoidCollisions(pawns, commands, dimensions, features.edge);
    return commands;
};
function getMyUnits(type, units, playerId) {
    return units.filter(unit => unit.type === type &&
        unit.owner === playerId &&
        unit.action !== UnitAction.dead);
}
function findTargets(units, playerId) {
    return units.filter(unit => (unit.type === UnitType.barrack && unit.owner !== playerId) || (unit.type === UnitType.resource));
}
function toBooleans(grid) {
    return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}
function handlePawns(pawns, potentialTargets, terrain, isLoop) {
    const commands = {};
    for (const pawn of pawns) {
        const bestPath = getPathToNearestTarget(pawn.position, potentialTargets.map(target => target.position), terrain, isLoop);
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
