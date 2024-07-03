import { Arena, EdgeType, FogOfWar, ArenaTemplate } from '../types/Arena.js';
import { ActionableUnit, Position, UnitType, WallElement } from '../types/Units.js';

const templates: { [name:string]: ArenaTemplate} = {
  default: {
    spec: {
      maxPlayers: 4,
      resourceProbability: 0.1,
      details: {
        dimensions: { width: 32, height: 25 },
        features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
        messages: {
          start: `Game Started. It's worth knowing that ${getMapEdgeMessage(EdgeType.wall)}`,
          win: '{playerName} won!',
          lose: '{playerName} lost!',
          tie: 'Tie!'
        }
      },
      isGameOver: (arena:Arena)=> {
        const players = Object.values(arena.players);
        const playersWithBarracks = players.filter(player => hasAnyBarracksStanding(Object.values(player.units)));
        return playersWithBarracks.length <= 1;
      }
    },
    initialSetup: {
      barracks: [{ x: 2, y: 2 }, { x: 30, y: 22 }, { x: 30, y: 2 }, { x: 2, y: 22 }, { x: 16, y: 2 }, { x: 16, y: 22 }, { x: 2, y: 12 }, { x: 30, y: 12 }],
      startingResources: 8,
      obstacles: [
        wall({ x: 6, y: 10 }, { x: 6, y: 6 }, { x: 10, y: 6 }),
        wall({ x: 22, y: 6 }, { x: 26, y: 6 }, { x: 26, y: 10 }),
        wall({ x: 26, y: 14 }, { x: 26, y: 18 }, { x: 22, y: 18 }),
        wall({ x: 10, y: 18 }, { x: 6, y: 18 }, { x: 6, y: 14 })
      ]
    }
  }
};
templates['tutorial-01'] = {
  spec: {
    maxPlayers: 1,
    startOnMaxPlayersReached: true,
    resourceProbability: 0,
    details: {
      dimensions: { width: 5, height: 5 },
      features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
      messages: {
        start: `Hello and welcome to SL-Arena;
     Your first task is to produce a pawn.
     For that, you'll need to select your barracks and set the action to "produce".
     For that you'll need to find the barracks' unit-id (from the sl.listUnits() command and then sendCommand with the appropriate details.
     Good luck!`,
        win: `Good job! you have a learned how to send commands and produce pawns.
        In the next tutorial you'll learn how to move your pawn`
      }
    },
    isGameOver: (arena:Arena)=> (Object.values(arena.players[0].units).length > 1),
  },
  initialSetup: {
    barracks: [{ x: 2, y: 2 }],
    startingResources: 1,
    obstacles: []
  }
    
}

function hasAnyBarracksStanding(units: ActionableUnit[]) {
  return units.some(unit => unit.type === UnitType.barrack);
}

function wall(...position: Position[]): WallElement {
  return { type: UnitType.wall, position: (position as Position & Position[]) };
}

function getMapEdgeMessage(edgeType: EdgeType) {
  switch (edgeType) {
    case EdgeType.wall:
      return `the map's edge is a wall`;
    case EdgeType.death:
      return `you need to be careful not to fall off the map`;
    case EdgeType.loop:
      return `the world is round`;
  }
}

export default templates;
