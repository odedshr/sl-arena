import { Grid } from './Grid.js';
import { DetailedPlayer, PlayerType } from './Player.js';
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

enum FogOfWar {
  none = 'none',
  human = 'human',
  ai = 'ai',
  both = 'both'
};

type Dimensions = {
  width: number,
  height: number
};

type Features = {
  fogOfWar: FogOfWar | PlayerType,
  edge: EdgeType
};

type ArenaDetails = { // ArenaDetails is sent to the client side at the beginning of the game
  dimensions: Dimensions,
  features: Features,
  messages: {
    start: string,
    win: string,
    lose?: string,
    tie?: string
  }
}

// ArenaTemplate is used to provide initial fixed parameters for a new arena
type ArenaSpec = {
  maxPlayers: number,
  startOnMaxPlayersReached?: boolean,
  resourceProbability: number, // a number between 0 and 1
  details: ArenaDetails
  isGameOver: (arena:Arena)=>boolean,
}

type ArenaInitialSetup = {
  barracks: Position[],
  startingResources: number,
  obstacles: Unit[]
};

type ArenaTemplate = {
  spec: ArenaSpec,
  initialSetup: ArenaInitialSetup
};

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

export { Arena,
  ArenaDetails,
  ArenaTemplate,
  ArenaSpec,
  ArenaInitialSetup,
  ArenaName,
  ArenaStatus,
  Dimensions,
  Features,
  EdgeType,
  FogOfWar };