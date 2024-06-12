import { MessageType } from '../Messages/Message.js';
import { ArenaStatus } from '../types/Arena.js';
import { UnitAction, UnitType } from '../types/Units.js';
import createGrid from '../../common/util-grid.js';
import { addResource, forEachArena } from '../arena/arena.js';
import handleBarrackUnit from './barracksHandler.js';
import handlePawnUnit from './pawnHandler.js';
function updateState() {
    forEachArena(arena => {
        if (arena.status === ArenaStatus.started) {
            const dimensions = arena.spec.dimensions;
            const players = Object.values(arena.players);
            const units = flattenCollection(arena.players);
            let grid = createGrid(dimensions, [...arena.environment, ...units]);
            players.forEach(player => updatePlayer(player, grid, arena));
            // update grid with new unit positions
            grid = createGrid(dimensions, [...arena.environment, ...units]);
            handleConflicts(grid, arena);
            if (!checkGameOver(arena)) {
                addResources(grid, arena);
            }
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
    return arena.status === ArenaStatus.finished;
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
function handleConflicts(grid, arena) {
    grid.forEach(row => row.forEach(cell => {
        if (cell.length > 1) {
            const actionableUnits = getActionableUnits(cell);
            const resource = cell.find(unit => unit.type === UnitType.resource);
            if (resource) {
                actionableUnits.forEach(unit => arena.players[unit.owner].resources++);
                arena.environment.splice(arena.environment.indexOf(resource), 1);
            }
            if (new Set(actionableUnits.map(unit => unit.owner)).size > 1) {
                actionableUnits.forEach(unit => { unit.action = UnitAction.dead; });
            }
        }
    }));
}
function getActionableUnits(units) {
    return units.filter(unit => unit.owner !== undefined);
}
function addResources(grid, arena) {
    if (Math.random() > arena.spec.resourceProbability) {
        const { width, height } = arena.spec.dimensions;
        let attempts = 100;
        while (attempts--) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            if (grid[y][x].length === 0) {
                addResource(arena.environment, UnitType.resource, { x, y });
                break;
            }
        }
    }
}
function flattenCollection(players) {
    return Object.values(players)
        .reduce((acc, player) => [...acc, ...Object.values(player.units)], []);
}
export default updateState;
