import { getRandomDirection } from '../generators.js';
import { EdgeType } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../util-grid.js';
import { findShortestPath, getNextDirection } from './path-finder.js';
const handler = (units, playerId, resources, dimensions, features) => {
    const isLoop = features.edge === EdgeType.loop;
    const commands = [];
    const barrack = units.find(unit => unit.type === UnitType.barrack && unit.owner === playerId);
    const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));
    if (barrack && resources > 0) {
        commands.push({
            unitId: barrack.id,
            action: UnitAction.produce,
            direction: getRandomDirection()
        });
    }
    const pawns = units.filter(unit => unit.type === UnitType.pawn && unit.owner === playerId);
    const enemyBarracks = units.filter(unit => unit.type === UnitType.barrack && unit.owner !== playerId);
    handlePawns(pawns, playerId, enemyBarracks, grid, isLoop);
    return commands;
};
function toBooleans(grid) {
    return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}
function handlePawns(pawns, playerId, enemyBarracks, terrain, isLoop) {
    const commands = {};
    for (const pawn of pawns) {
        const closestEnemyBarrack = findClosestEnemyBarrack(pawn, enemyBarracks, terrain, isLoop);
        if (closestEnemyBarrack) {
            pawn.direction = getNextDirection(pawn.position, closestEnemyBarrack.position, terrain, isLoop);
            commands[pawn.id] = {
                unitId: pawn.id,
                action: UnitAction.move,
                direction: pawn.direction
            };
        }
    }
    return Object.values(commands);
}
// Function to find the closest enemy barrack
const findClosestEnemyBarrack = (pawn, barracks, grid, isLoop) => {
    const start = pawn.position;
    let closestBarrack = undefined;
    let shortestDistance = Infinity;
    for (const barrack of barracks) {
        const distance = findShortestPath(start, barrack.position, grid, isLoop);
        if (distance < shortestDistance) {
            shortestDistance = distance;
            closestBarrack = barrack;
        }
    }
    return closestBarrack;
};
export default handler;
