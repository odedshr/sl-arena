import { SendMessageMethod } from '../Messages/Message.js';
import { Arena, ArenaName } from '../types/Arena.js';
import { colors } from '../generators.js';
import { ActionableUnit, Direction, Position, Unit, UnitAction, UnitType } from '../types/Units.js';
import { DetailedPlayer, PlayerType } from '../types/Player.js';
import { setupArena } from './arena-library.js';

const arenas: { [id: string]: Arena } = {}
const playerArena: { [id: number]: string } = {};
const playerUnitCount: { [id: number]: number } = {};

function addArena(arenaName: ArenaName, playerName: string, owner: number, send: SendMessageMethod): string {
  const arena: Arena = setupArena(arenaName, owner)
  arenas[arena.id] = arena;

  addPlayer(arena, owner, playerName, PlayerType.human, send);

  return arena.id;
}

function getArena(arenaId: string): Arena {
  return arenas[arenaId];
}

function addPlayer(arena: Arena, id: number, name: String, type: PlayerType, send: SendMessageMethod) {
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

function addUnit(arena:Arena, playerId:number, type: UnitType, position: Position, action: UnitAction, direction: Direction) {
  const id = getNewUnitId(playerId, type);
  const unit: ActionableUnit = {
    type,
    owner: playerId,
    id,
    position,
    action,
    direction
  } as ActionableUnit

  arena.players[playerId].units[id] = unit;
  arena.grid[position.y][position.x].push(unit);
}

function removeUnit(unit: ActionableUnit, arena: Arena) {
  delete arena.players[unit.owner].units[unit.id];
  removeFromGrid(unit, arena);
}

function moveUnit(unit:Unit, arena: Arena, position:Position) {
  removeFromGrid(unit, arena);
  unit.position = position;
  arena.grid[position.y][position.x].push(unit);
}

function addResource(arena:Arena, type: UnitType, position: Position) {
  const unit = {
    type,
    position
  } as Unit;

  arena.resources.push(unit);
  arena.grid[position.y][position.x].push(unit);
}

function removeResource(arena:Arena, resource: Unit) {
  arena.resources.splice(arena.resources.indexOf(resource), 1);
  removeFromGrid(resource, arena);
}

function removeFromGrid(unit: Unit, arena: Arena) {
  const { x, y } = unit.position;
  const cell = arena.grid[y][x];
  cell.splice(cell.indexOf(unit), 1);
}

export {
  addArena,
  getArena,
  setPlayerArena,
  getPlayerArena,
  forEachArena,
  getNewUnitId,
  addResource,
  removeResource,
  addUnit,
  removeUnit,
  moveUnit,
  addPlayer 
};