import { EdgeType, FogOfWar } from '../types/Arena.js';
import { UnitType } from '../types/Units.js';
const templates = {
    default: {
        spec: {
            maxPlayers: 4,
            resourceProbability: 0.1,
            dimensions: { width: 32, height: 25 },
            features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
            onGameStart: (arena) => (`Game Started. It's worth knowing that ${getMapEdgeMessage(EdgeType.wall)}`),
            onGameOver: (arena) => {
                const winners = findWinners(arena, (player => Object.values(player.units).some(unit => unit.type === UnitType.barrack)));
                return `Game over. ${winners} won.`;
            },
            isGameOver: (arena) => {
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
    },
    tutorial_01: {
        spec: {
            maxPlayers: 1,
            startOnMaxPlayersReached: true,
            resourceProbability: 0,
            dimensions: { width: 5, height: 5 },
            features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
            onGameStart: (arena) => (`
Hello ${arena.players[0].name} and welcome to SL-Arena;
Your first task is to produce a pawn.
For that, you'll need to select your barracks and set the action to \`produce\`.
For that you'll need to find the barracks' unitId (from the \`sl.listUnits()\` command and then \`sl.sendCommands({unitId, action})\` with the appropriate details.
Good luck!`),
            onGameOver: (arena) => (`
Good job! you have a learned how to send commands and produce pawns.
In the next tutorial you'll learn how to move your pawn`),
            isGameOver: (arena) => (Object.values(arena.players[0].units).length > 1),
        },
        initialSetup: {
            barracks: [{ x: 2, y: 2 }],
            startingResources: 1,
            obstacles: []
        }
    },
    tutorial_02: {
        spec: {
            maxPlayers: 1,
            startOnMaxPlayersReached: true,
            resourceProbability: 0,
            dimensions: { width: 5, height: 5 },
            features: { edge: EdgeType.wall, fogOfWar: FogOfWar.both },
            onGameStart: (arena) => (`
Welcome back ${arena.players[0].name}. 
Now that you have a unit, it's time to move it around.
Use the \`move\` command to reach the top-right corner of the screen.
Note that the \`move\` action is followed by one of the eight possible \`direction\` (north, north_east, east and so on)`),
            onGameOver: (arena) => (`
Well done! you've now learned to move units.
In the next tutorial we'll learn to automate our commands`),
            isGameOver: (arena) => {
                if (!arena.players[0].units['pawn-0-1']) {
                    return false;
                }
                const position = arena.players[0].units['pawn-0-1'].position;
                return position.x === 4 && position.y === 0;
            },
        },
        initialSetup: {
            barracks: [{ x: 1, y: 2 }],
            startingResources: 1,
            obstacles: []
        }
    }
};
function hasAnyBarracksStanding(units) {
    return units.some(unit => unit.type === UnitType.barrack);
}
function findWinners(arena, hasWon) {
    const winners = Object.values(arena.players).filter(player => hasWon(player)).map(player => player.name);
    return winners.length ? winners.join(', ') : 'No one';
}
function wall(...position) {
    return { type: UnitType.wall, position: position };
}
function getMapEdgeMessage(edgeType) {
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
