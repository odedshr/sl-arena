import { SendMethod } from '../Messages/Message.js';
import { Arena, ArenaName } from '../types/Arena.js';
import { colors } from '../generators.js';
import { ActionableUnit, Direction, Position, UnitAction, UnitType } from '../types/Units.js';
import { DetailedPlayer, PlayerType } from '../types/Player.js';
import { setupArena } from './arenaLibrary.js';

const arenas: { [id: string]: Arena } = {}
const playerArena: { [id: number]: string } = {};
const playerUnitCount: { [id: number]: number } = {};

function addArena(arenaName: ArenaName, playerName: string, owner: number, send: SendMethod): string {
  const arena: Arena = setupArena(arenaName, owner)
  arenas[arena.id] = arena;

  addPlayer(arena, owner, playerName, PlayerType.human, send);

  return arena.id;
}

function getArena(arenaId: string): Arena {
  return arenas[arenaId];
}

function addPlayer(arena: Arena, id: number, name: String, type: PlayerType, send: SendMethod) {
  arena.players[id] = {
    type,
    name,
    id,
    color: colors[Object.values(arena.players).length],
    send,
    units: {},
    resources: 0
  } as DetailedPlayer;

  setPlayerArena(id, arena.id);
}

function setPlayerArena(playerId: number, arenaId: string | null) {
  if (arenaId) {
    playerArena[playerId] = arenaId;
    playerUnitCount[playerId] = 0;
  } else {
    delete playerArena[playerId];
    delete playerUnitCount[playerId];
  }
}

function getPlayerArena(playerId: number) {
  if (playerArena[playerId]) {
    return arenas[playerArena[playerId]];
  }

  return null;
}

function forEachArena(callback: (arena: Arena) => void) {
  for (const arenaId in arenas) {
    callback(arenas[arenaId]);
  }
}

function getNewUnitId(playerId: number, unitType: UnitType) {
  return `${unitType}-${playerId}-${playerUnitCount[playerId]++}`;
}

function addUnit(player: DetailedPlayer, type: UnitType, position: Position, action: UnitAction, direction: Direction) {
  const id = getNewUnitId(player.id, type);
  const unit: ActionableUnit = {
    type,
    owner: player.id,
    id,
    position,
    action,
    direction
  } as ActionableUnit
  player.units[id] = unit;
}

export { addArena, getArena, setPlayerArena, getPlayerArena, forEachArena, getNewUnitId, addUnit, addPlayer };