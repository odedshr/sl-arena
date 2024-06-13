import { GameStateMessage, MessageType } from '../Messages/Message.js';
import { Arena, ArenaStatus } from '../types/Arena.js';
import { DetailedPlayer } from '../../common/types/Player.js';
import { ActionableUnit, Unit, UnitAction, UnitType } from '../types/Units.js';
import createGrid, { Grid } from '../../common/util-grid.js';
import { addResource, forEachArena } from '../arena/arena.js';
import handleBarrackUnit from './barracksHandler.js';
import handlePawnUnit from './pawnHandler.js';

function updateState() {
  forEachArena(arena => {
    if (arena.status === ArenaStatus.started) {
      removeDeadUnits(arena);
      const dimensions = arena.spec.dimensions;
      const players = Object.values(arena.players);
      const units = flattenCollection(arena.players);
      let grid = createGrid(dimensions, [...arena.environment, ...units]);

      handleConflicts(grid, arena);

      // update grid with new unit positions
      grid = createGrid(dimensions, [...arena.environment, ...units]);

      players.forEach(player => updatePlayer(player, grid, arena));
      
      if (!checkGameOver(arena)) {
        addResources(grid, arena);
      }

      sendUpdateToPlayers(arena);
    }
  });
}

function removeDeadUnits(arena:Arena) {
  Object.values(arena.players).forEach(player => {
    Object.values(player.units).forEach(unit => {
      if (unit.action === UnitAction.dead) {
        delete player.units[(unit).id];
      }
    });
  });
}

function updatePlayer(player: DetailedPlayer, grid: Grid, arena: Arena) {
  const units = Object.values(player.units).filter(unit => unit.action !== UnitAction.dead);
  if (hasAnyBarracksStanding(units)) {
    units.forEach(unit => handleUnitByType(unit, grid, player, arena));
  } else {
    units.forEach(unit => { unit.action = UnitAction.dead; });
  }
}

function hasAnyBarracksStanding(units: ActionableUnit[]) {
  return units.some(unit => unit.type === UnitType.barrack);
}

function handleUnitByType(unit: ActionableUnit, grid: Grid, player: DetailedPlayer, arena: Arena) {
  switch (unit.type) {
    case UnitType.pawn:
      handlePawnUnit(unit, grid, arena.spec.dimensions, arena.spec.features.edge);
    case UnitType.barrack:
      handleBarrackUnit(unit, player, grid, arena.spec.dimensions, arena.spec.features.edge);
  }
}

function checkGameOver(arena: Arena) {
  const players = Object.values(arena.players);
  const playersWithBarracks = players.filter(player => hasAnyBarracksStanding(Object.values(player.units)));

  if (playersWithBarracks.length === 1) {
    arena.status = ArenaStatus.finished;
  }

  return arena.status === ArenaStatus.finished;
}

function sendUpdateToPlayers(arena: Arena) {
  Object.values(arena.players).forEach(player => player.send({
    type: MessageType.game_status,
    status: arena.status,
    playerId: player.id,
    resources: player.resources,
    units: [...arena.environment, ...flattenCollection(arena.players)],
    dimensions: arena.spec.dimensions,
    features: arena.spec.features
  } as GameStateMessage));
}

function handleConflicts(grid: Grid, arena:Arena) {
  grid.forEach(row => row.forEach(cell => {
    if (cell.length > 1) {
      const actionableUnits = getActionableUnits(cell);

      const resource = cell.find(unit=>unit.type===UnitType.resource);
      if (resource) {
        actionableUnits.forEach(unit => arena.players[unit.owner].resources++ );
        arena.environment.splice(arena.environment.indexOf(resource), 1);
      }

      if (new Set(actionableUnits.map(unit => (unit as ActionableUnit).owner)).size > 1) {
        actionableUnits.forEach(unit => { unit.action = UnitAction.dead; });
      }
    }
  }))
}

function getActionableUnits(units: Unit[]) {
  return units.filter(unit=>(unit as ActionableUnit).owner!==undefined) as ActionableUnit[];
}

function addResources(grid:Grid, arena:Arena) {
  if (Math.random() > arena.spec.resourceProbability) {
    const { width, height } =arena.spec.dimensions;
    let attempts = 100;
    while (attempts--) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (grid[y][x].length === 0) {
        addResource(arena.environment, UnitType.resource, { x, y});
        break;
      }
    }
  }
}

function flattenCollection(players: { [playerId: number]: DetailedPlayer }) {
  return Object.values(players)
    .reduce((acc, player) => [...acc, ...Object.values(player.units)], [] as Unit[]);
}


export default updateState;