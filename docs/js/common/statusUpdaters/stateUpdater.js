import { MessageType } from '../Messages/Message.js';
import { ArenaStatus } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../../common/util-grid.js';
import { forEachArena } from '../arena/arena.js';
import handleNurseryUnit from './nurseryHandler.js';
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
            sendUpdateToPlayers(arena);
        }
    });
}
function updatePlayer(player, grid, arena) {
    if (player.name)
        Object.values(player.units).forEach(unit => updateUnit(unit, grid, player, arena));
}
function updateUnit(unit, grid, player, arena) {
    if (handleUnitByType(unit, grid, player, arena)) {
        // unit died
        delete player.units[unit.id];
    }
}
function handleUnitByType(unit, grid, player, arena) {
    switch (unit.type) {
        case UnitType.pawn:
            return handlePawnUnit(unit, grid, arena.spec.dimensions, arena.spec.features.edge);
        case UnitType.nursery:
            return handleNurseryUnit(unit, player, grid, arena.spec.dimensions, arena.spec.features.edge);
    }
    return false;
}
function sendUpdateToPlayers(arena) {
    Object.values(arena.players).forEach(player => player.send({
        type: MessageType.game_status,
        status: arena.status,
        playerId: player.id,
        resources: player.resources,
        units: [...arena.environment, ...flattenCollection(arena.players)]
    }));
}
function handleConflicts(grid) {
    grid.forEach(row => row.forEach(cell => {
        if (cell.length > 1) {
            cell.forEach(unit => {
                if (unit.type === UnitType.pawn || unit.type === UnitType.nursery) {
                    unit.action = UnitAction.dead;
                }
            });
        }
    }));
}
function flattenCollection(players) {
    return Object.values(players)
        .reduce((acc, player) => [...acc, ...Object.values(player.units)], []);
}
export default updateState;
