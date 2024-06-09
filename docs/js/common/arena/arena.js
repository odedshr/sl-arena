import { colors } from '../generators.js';
import { PlayerType } from '../types/Player.js';
import { setupArena } from './arenaLibrary.js';
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
function addUnit(player, type, position, action, direction) {
    const id = getNewUnitId(player.id, type);
    const unit = {
        type,
        owner: player.id,
        id,
        position,
        action,
        direction
    };
    player.units[id] = unit;
}
export { addArena, getArena, setPlayerArena, getPlayerArena, forEachArena, getNewUnitId, addUnit, addPlayer };
