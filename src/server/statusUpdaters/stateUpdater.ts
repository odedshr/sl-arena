import { GameStateMessage, MessageType } from '../../common/Messages/Message.js';
import { Arena, ArenaStatus } from '../../common/types/Arena.js';
import { DetailedPlayer } from '../../common/types/Player.js';
import { ActionableUnit, Unit, UnitAction, UnitType } from '../../common/types/Units.js';
import createGrid, { Grid } from '../../common/util-grid.js';
import { forEachArena } from '../arena.js';
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

function updatePlayer(player: DetailedPlayer, grid: Grid, arena: Arena) {
  if (player.name)
    Object.values(player.units).forEach(unit => updateUnit(unit, grid, player, arena));
}

function updateUnit(unit: Unit, grid: Grid, player: DetailedPlayer, arena: Arena) {
  if (handleUnitByType(unit, grid, player, arena)) {
    // unit died
    delete player.units[(unit as ActionableUnit).id];
  }
}

function handleUnitByType(unit: Unit, grid: Grid, player: DetailedPlayer, arena: Arena) {
  switch (unit.type) {
    case UnitType.pawn:
      return handlePawnUnit(unit as ActionableUnit, grid, arena.spec.dimensions, arena.spec.features.edge);
    case UnitType.nursery:
      return handleNurseryUnit(unit as ActionableUnit, player, grid, arena.spec.dimensions, arena.spec.features.edge);
  }
  return false;
}

function sendUpdateToPlayers(arena: Arena) {
  Object.values(arena.players).forEach(player => player.send({
    type: MessageType.game_status,
    status: arena.status,
    playerId: player.id,
    resources: player.resources,
    units: [...arena.environment, ...flattenCollection(arena.players)]
  } as GameStateMessage));
}

function handleConflicts(grid: Grid) {
  grid.forEach(row => row.forEach(cell => {
    if (cell.length > 1) {
      cell.forEach(unit => {
        if (unit.type === UnitType.pawn || unit.type === UnitType.nursery) {
          (unit as ActionableUnit).action = UnitAction.dead;
        }
      });
    }
  }))
}

function flattenCollection(players: { [playerId: number]: DetailedPlayer }) {
  return Object.values(players)
    .reduce((acc, player) => [...acc, ...Object.values(player.units)], [] as Unit[]);
}


export default updateState;