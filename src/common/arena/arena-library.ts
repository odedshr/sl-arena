import { Arena, EdgeType, FogOfWar, ArenaTemplate } from '../types/Arena.js';
import { ActionableUnit, Position, UnitType, WallElement } from '../types/Units.js';

const templates: { [name:string]: ArenaTemplate} = {
  default: {
    spec: {
      maxPlayers: 4,
      resourceProbability: 0.1,
      dimensions: { width: 32, height: 25 },
      features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
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
}

function hasAnyBarracksStanding(units: ActionableUnit[]) {
  return units.some(unit => unit.type === UnitType.barrack);
}

function wall(...position: Position[]): WallElement {
  return { type: UnitType.wall, position: (position as Position & Position[]) };
}

export default templates;
