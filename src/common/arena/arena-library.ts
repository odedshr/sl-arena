import { getRandomArenaId } from '../generators.js';
import { Arena, ArenaName, ArenaStatus, ArenaSpec, EdgeType, ArenaInitialSetup, FogOfWar } from '../types/Arena.js';
import { ActionableUnit, Direction, Position, UnitAction, UnitType, WallElement } from '../types/Units.js';
import { addUnit } from './arena.js';
import { createGrid } from '../../common/util-grid.js';

const specs: { [key: string]: ArenaSpec } = {
  default: {
    maxPlayers: 4,
    resourceProbability: 0.1,
    dimensions: { width: 32, height: 25 },
    features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
    isGameOver: (arena:Arena)=> {
      const players = Object.values(arena.players);
      const playersWithBarracks = players.filter(player => hasAnyBarracksStanding(Object.values(player.units)));
      return playersWithBarracks.length <= 1;
    }
  }
};

function hasAnyBarracksStanding(units: ActionableUnit[]) {
  return units.some(unit => unit.type === UnitType.barrack);
}

const setups: { [key: string]: ArenaInitialSetup } = {
  default: {
    barracks: [{ x: 2, y: 2 }, { x: 30, y: 22 }, { x: 30, y: 2 }, { x: 2, y: 22 }, { x: 16, y: 2 }, { x: 16, y: 22 }, { x: 2, y: 12 }, { x: 30, y: 12 }],
    startingResources: 8,
    obstacles: [wall({ x: 6, y: 10 }, { x: 6, y: 6 }, { x: 10, y: 6 }),
    wall({ x: 22, y: 6 }, { x: 26, y: 6 }, { x: 26, y: 10 }),
    wall({ x: 26, y: 14 }, { x: 26, y: 18 }, { x: 22, y: 18 }),
    wall({ x: 10, y: 18 }, { x: 6, y: 18 }, { x: 6, y: 14 })
    ]
  }
}

function wall(...position: Position[]): WallElement {
  return { type: UnitType.wall, position: (position as Position & Position[]) };
}

function setupArena(arenaName: ArenaName, owner: number): Arena {
  const spec = specs[arenaName];
  if (!spec) {
    throw Error(`Unknown Arena: ${arenaName}`);
  }
  const obstacles = [...setups[arenaName].obstacles]
  return {
    spec,
    name: arenaName,
    id: getRandomArenaId(),
    tick: 0,
    owner,
    players: {},
    status: ArenaStatus.init,
    obstacles,
    resources: [],
    grid: createGrid(spec.dimensions, obstacles)
  }
}

function setupUnits(arena: Arena): void {
  const setup = setups[arena.name];
  if (!setup) {
    throw Error(`Unknown Arena: ${arena.name}`);
  }
  const players = Object.values(arena.players);

  if (players.length > arena.spec.maxPlayers) {
    throw Error(`Too many players for ${arena.name}`);
  }

  players.forEach((player, i) => {
    player.resources = setup.startingResources;
    addUnit(arena, player.id, UnitType.barrack, setup.barracks[i], UnitAction.idle, Direction.north);
  });
}

export { setupArena, setupUnits }
