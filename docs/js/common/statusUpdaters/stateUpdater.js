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
            removeDeadUnits(grid, arena);
            handleConflicts(grid, arena);
            players.forEach(player => updatePlayer(player, grid, arena));
            collectResources(grid, arena);
            if (!checkGameOver(arena)) {
                addResources(grid, arena);
            }
            sendUpdateToPlayers(arena);
        }
    });
}
function removeDeadUnits(grid, arena) {
    Object.values(arena.players).forEach(player => {
        Object.values(player.units).forEach(unit => {
            if (unit.action === UnitAction.dead) {
                removeUnit(unit, arena, grid);
            }
        });
    });
}
function updatePlayer(player, grid, arena) {
    const units = Object.values(player.units).filter(unit => unit.action !== UnitAction.dead);
    if (hasAnyBarracksStanding(units)) {
        units.forEach(unit => handleUnitByType(unit, grid, player, arena));
    }
    else {
        units.forEach(unit => { unit.action = UnitAction.dead; });
    }
}
function hasAnyBarracksStanding(units) {
    return units.some(unit => unit.type === UnitType.barrack);
}
function handleUnitByType(unit, grid, player, arena) {
    switch (unit.type) {
        case UnitType.pawn:
            handlePawnUnit(unit, grid, arena.spec.dimensions, arena.spec.features.edge);
        case UnitType.barrack:
            handleBarrackUnit(unit, player, grid, arena.spec.dimensions, arena.spec.features.edge);
    }
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
            if (new Set(actionableUnits.map(unit => unit.owner)).size > 1) {
                actionableUnits.forEach(unit => { unit.action = UnitAction.dead; });
            }
        }
    }));
}
function collectResources(grid, arena) {
    grid.forEach(row => row.forEach(cell => {
        if (cell.length > 1) {
            const resource = cell.find(unit => unit.type === UnitType.resource);
            if (resource) {
                const actionableUnits = getActionableUnits(cell);
                actionableUnits.forEach(unit => arena.players[unit.owner].resources++);
                arena.environment.splice(arena.environment.indexOf(resource), 1);
                cell.splice(cell.indexOf(resource), 1);
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
function removeUnit(unit, arena, grid) {
    delete arena.players[unit.owner].units[unit.id];
    removeUnitFromGrid(unit, grid);
}
function removeUnitFromGrid(unit, grid) {
    const { y, x } = unit.position;
    grid[y][x].splice(grid[y][x].indexOf(unit), 1);
}
// setInterval(updateState, 1000
export default updateState;
