import { getRandomArenaId } from '../generators.js';
import { Arena, ArenaName, ArenaStatus, ArenaSpec, EdgeType, ArenaInitialSetup } from '../types/Arena.js';
import { Direction, Position, UnitAction, UnitType, WallElement } from '../types/Units.js';
import { addUnit } from './arena.js';


const specs: { [key: string]: ArenaSpec } = {
  default: {
    maxPlayers: 8,
    dimensions: { width: 32, height: 25 },
    features: { edge: EdgeType.wall, fogOfWar: false }
  }
};

const setups: { [key: string]: ArenaInitialSetup } = {
  default: {
    barracks: [{ x: 2, y: 2 }, { x: 30, y: 22 }, { x: 30, y: 2 }, { x: 2, y: 22 }, { x: 16, y: 2 }, { x: 16, y: 22 }, { x: 2, y: 12 }, { x: 30, y: 12 }],
    startingResources: 8,
    environment: [wall({ x: 6, y: 10 }, { x: 6, y: 6 }, { x: 10, y: 6 }),
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
  return {
    spec,
    name: arenaName,
    id: getRandomArenaId(),
    owner,
    players: {},
    status: ArenaStatus.init,
    environment: [...setups[arenaName].environment],
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
    addUnit(player, UnitType.barrack, setup.barracks[i], UnitAction.idle, Direction.north);
  });
}

export { setupArena, setupUnits }