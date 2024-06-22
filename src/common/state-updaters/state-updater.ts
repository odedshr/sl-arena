import { GameStateMessage, MessageType } from '../Messages/Message.js';
import { Arena, ArenaStatus } from '../types/Arena.js';
import { DetailedPlayer } from '../types/Player.js';
import { ActionableUnit, Unit, UnitAction, UnitType } from '../types/Units.js';
import { addResource, forEachArena, removeResource, removeUnit } from '../arena/arena.js';

import handleBarrackUnit from './barracks-handler.js';
import handlePawnUnit from './pawn-handler.js';
import getUnits from './get-units.js';
import getStats from './get-stats.js';

function updateState() {
  forEachArena(arena => {
    arena.tick++;
    if (arena.status === ArenaStatus.started) {
      removeDeadUnits(arena);

      handleConflicts(arena);

      Object.values(arena.players).forEach(player => updatePlayer(player, arena));

      collectResources(arena);

      if (!checkGameOver(arena)) {
        addResources(arena);
      }

      sendUpdateToPlayers(arena);
    }
  });
}

function removeDeadUnits(arena:Arena) {
  Object.values(arena.players).forEach(player => {
    Object.values(player.units).forEach(unit => {
      if (unit.action === UnitAction.dead) {
        removeUnit(unit, arena);
      }
    });
  });
}

function updatePlayer(player: DetailedPlayer, arena: Arena) {
  const units = Object.values(player.units).filter(unit => unit.action !== UnitAction.dead);
  if (hasAnyBarracksStanding(units)) {
    units.forEach(unit => handleUnitByType(unit, arena));
  } else {
    units.forEach(unit => { unit.action = UnitAction.dead; });
  }
}

function hasAnyBarracksStanding(units: ActionableUnit[]) {
  return units.some(unit => unit.type === UnitType.barrack);
}

function handleUnitByType(unit: ActionableUnit, arena: Arena) {
  switch (unit.type) {
    case UnitType.pawn:
      handlePawnUnit(unit, arena);
    case UnitType.barrack:
      handleBarrackUnit(unit, arena);
  }
}

function checkGameOver(arena: Arena) {
  if (arena.spec.isGameOver(arena)) {
    arena.status = ArenaStatus.finished;
  }

  return arena.status === ArenaStatus.finished;
}

function sendUpdateToPlayers(arena: Arena) {
  const stats = getStats(arena);
  
  Object.values(arena.players).forEach(player => player.send({
    type: MessageType.game_status,
    status: arena.status,
    playerId: player.id,
    resources: player.resources,
    units: getUnits(player.id, arena),
    dimensions: arena.spec.dimensions,
    features: arena.spec.features,
    stats,
    tick: arena.tick
  } as GameStateMessage));
}

function handleConflicts(arena:Arena) {
  arena.grid.forEach(row => row.forEach(cell => {
    if (cell.length > 1) {
      const actionableUnits = getActionableUnits(cell);

      if (new Set(actionableUnits.map(unit => (unit as ActionableUnit).owner)).size > 1) {
        actionableUnits.forEach(unit => { unit.action = UnitAction.dead; });
      }
    }
  }))
}

function collectResources(arena:Arena) {
  arena.resources.forEach(resource => {
    const {x,y} = resource.position;
    const cell = arena.grid[y][x];

    if (cell.length > 1) {
      const actionableUnits = getActionableUnits(cell);
      actionableUnits.forEach(unit => arena.players[unit.owner].resources++ );
      removeResource(arena, resource);
    }
  });

}

function getActionableUnits(units: Unit[]) {
  return units.filter(unit=>(unit as ActionableUnit).owner!==undefined) as ActionableUnit[];
}

function addResources(arena:Arena) {
  if (Math.random() < arena.spec.resourceProbability) {
    const { width, height } =arena.spec.dimensions;
    let attempts = 100;
    while (attempts--) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (arena.grid[y][x].length === 0) {
        addResource(arena, UnitType.resource, { x, y });
        break;
      }
    }
  }
}

// setInterval(updateState, 1000
export default updateState;