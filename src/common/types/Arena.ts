import { Grid } from './Grid.js';
import { DetailedPlayer } from './Player.js';
import { Position, Unit } from './Units.js';

enum ArenaName {
  default = 'default'
};

enum ArenaStatus {
  init = 'init',
  started = 'started',
  finished = 'finished'
};

enum EdgeType {
  death = 'death',
  wall = 'wall',
  loop = 'loop'
}

type Dimensions = {
  width: number,
  height: number
};

type Features = {
  fogOfWar: boolean,
  edge: EdgeType
};

// ArenaTemplate is used to provide initial fixed parameters for a new arena
type ArenaSpec = {
  maxPlayers: number,
  resourceProbability: number, // a number between 0 and 1
  dimensions: Dimensions,
  features: Features
}

type ArenaInitialSetup = {
  barracks: Position[],
  startingResources: number,
  obstacles: Unit[]
}

type Arena = {
  tick: number,
  id: string,
  owner: number,
  name: ArenaName,
  spec: ArenaSpec;
  players: { [playerId: number]: DetailedPlayer },
  status: ArenaStatus;
  obstacles: Unit[];
  resources: Unit[];
  grid: Grid<Unit[]>;
};

export { Arena, ArenaSpec, ArenaInitialSetup, ArenaName, ArenaStatus, Dimensions, Features, EdgeType };