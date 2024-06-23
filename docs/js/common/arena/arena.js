import { colors } from '../generators.js';
import { PlayerType } from '../types/Player.js';
import { setupArena } from './set-up-arena.js';
const arenas = {};
const playerArena = {};
const playerUnitCount = {};
function addArena(arenaName, playerName, owner, send) {
    const arena = setupArena(arenaName, owner);
    arenas[arena.id] = arena;
    addPlayer(arena, owner, playerName, PlayerType.human, send);
    return arena.id;
}
function getArena(arenaId) {
    return arenas[arenaId];
}
function addPlayer(arena, id, name, type, send) {
    arena.players[id] = {
        type,
        name,
        id,
        color: colors[Object.values(arena.players).length],
        send,
        units: {},
        resources: 0
    };
    setPlayerArena(id, arena.id);
}
function setPlayerArena(playerId, arenaId) {
    if (arenaId) {
        playerArena[playerId] = arenaId;
        playerUnitCount[playerId] = 0;
    }
    else {
        delete playerArena[playerId];
        delete playerUnitCount[playerId];
    }
}
function getPlayerArena(playerId) {
    if (playerArena[playerId]) {
        return arenas[playerArena[playerId]];
    }
    return null;
}
function forEachArena(callback) {
    for (const arenaId in arenas) {
        callback(arenas[arenaId]);
    }
}
function getNewUnitId(playerId, unitType) {
    return `${unitType}-${playerId}-${playerUnitCount[playerId]++}`;
}
function addUnit(arena, playerId, type, position, action, direction) {
    const id = getNewUnitId(playerId, type);
    const unit = {
        type,
        owner: playerId,
        id,
        position,
        action,
        direction
    };
    arena.players[playerId].units[id] = unit;
    arena.grid[position.y][position.x].push(unit);
}
function removeUnit(unit, arena) {
    delete arena.players[unit.owner].units[unit.id];
    removeFromGrid(unit, arena);
}
function moveUnit(unit, arena, position) {
    removeFromGrid(unit, arena);
    unit.position = position;
    arena.grid[position.y][position.x].push(unit);
}
function addResource(arena, type, position) {
    const unit = {
        type,
        position
    };
    arena.resources.push(unit);
    arena.grid[position.y][position.x].push(unit);
}
function removeResource(arena, resource) {
    arena.resources.splice(arena.resources.indexOf(resource), 1);
    removeFromGrid(resource, arena);
}
function removeFromGrid(unit, arena) {
    const { x, y } = unit.position;
    const cell = arena.grid[y][x];
    cell.splice(cell.indexOf(unit), 1);
}
export { addArena, getArena, setPlayerArena, getPlayerArena, forEachArena, getNewUnitId, addResource, removeResource, addUnit, removeUnit, moveUnit, addPlayer };
