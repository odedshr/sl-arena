import { MessageType } from '../Messages/Message.js';
import { ArenaStatus } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../../common/util-grid.js';
import { forEachArena } from '../arena/arena.js';
import handleBarrackUnit from './barracksHandler.js';
import handlePawnUnit from './pawnHandler.js';
function updateState() {
    forEachArena(arena => {
        if (arena.status === ArenaStatus.started) {
            const dimensions = arena.spec.dimensions;
            const players = Object.values(arena.players);
            const units = flattenCollection(arena.players);
            const grid = createGrid(dimensions, [...arena.environment, ...units]);
            players.forEach(player => updatePlayer(player, grid, arena));
            handleConflicts(createGrid(dimensions, units));
            checkGameOver(arena);
            sendUpdateToPlayers(arena);
        }
    });
}
function updatePlayer(player, grid, arena) {
    Object.values(player.units).forEach(unit => updateUnit(unit, grid, player, arena));
    killAllUnitsIfNoBarracksRemaining(Object.values(player.units));
}
function hasAnyBarracksStanding(units) {
    return units.some(unit => unit.type === UnitType.barrack);
}
function killAllUnitsIfNoBarracksRemaining(units) {
    if (!hasAnyBarracksStanding(units)) {
        units.forEach(unit => { unit.action = UnitAction.dead; });
    }
}
function updateUnit(unit, grid, player, arena) {
    if (handleUnitByType(unit, grid, player, arena)) {
        // unit died
        delete player.units[(unit).id];
    }
}
function handleUnitByType(unit, grid, player, arena) {
    switch (unit.type) {
        case UnitType.pawn:
            return handlePawnUnit(unit, grid, arena.spec.dimensions, arena.spec.features.edge);
        case UnitType.barrack:
            const isDead = handleBarrackUnit(unit, player, grid, arena.spec.dimensions, arena.spec.features.edge);
            // if the barrack was destroyed, kill all other units
            if (!isDead && (unit.action === UnitAction.dead)) {
                Object.values(player.units).forEach(unit => { unit.action = UnitAction.dead; });
            }
            return isDead;
    }
    return false;
}
function checkGameOver(arena) {
    const players = Object.values(arena.players);
    const playersWithBarracks = players.filter(player => hasAnyBarracksStanding(Object.values(player.units)));
    if (playersWithBarracks.length === 1) {
        arena.status = ArenaStatus.finished;
    }
}
function sendUpdateToPlayers(arena) {
    Object.values(arena.players).forEach(player => player.send({
        type: MessageType.game_status,
        status: arena.status,
        playerId: player.id,
        resources: player.resources,
        units: [...arena.environment, ...flattenCollection(arena.players)],
        dimensions: arena.spec.dimensions,
        features: arena.spec.features
    }));
}
function handleConflicts(grid) {
    grid.forEach(row => row.forEach(cell => {
        if (cell.length > 1 && (new Set(cell.map(unit => unit.owner)).size > 1)) {
            cell.forEach(unit => {
                unit.action = UnitAction.dead;
            });
        }
    }));
}
function flattenCollection(players) {
    return Object.values(players)
        .reduce((acc, player) => [...acc, ...Object.values(player.units)], []);
}
export default updateState;
