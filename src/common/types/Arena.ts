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
  dimensions: Dimensions,
  features: Features,
}

type ArenaInitialSetup = {
  nurseries: Position[],
  startingResources: number,
  environment: Unit[]
}

type Arena = {
  id: string,
  owner: number,
  name: ArenaName,
  spec: ArenaSpec;
  players: { [playerId: number]: DetailedPlayer },
  status: ArenaStatus;
  environment: Unit[];
};

export { Arena, ArenaSpec, ArenaInitialSetup, ArenaName, ArenaStatus, Dimensions, Features, EdgeType };