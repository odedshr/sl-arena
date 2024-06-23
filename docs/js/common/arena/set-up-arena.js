import { getRandomArenaId } from '../generators.js';
import { ArenaStatus } from '../types/Arena.js';
import { Direction, UnitAction, UnitType } from '../types/Units.js';
import { addUnit } from './arena.js';
import { createGrid } from '../../common/util-grid.js';
import templates from './arena-library.js';
function setupArena(arenaName, owner) {
    const template = templates[arenaName];
    if (!template) {
        throw Error(`Unknown Arena: ${arenaName}`);
    }
    const { initialSetup, spec } = template;
    const obstacles = [...initialSetup.obstacles];
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
        grid: createGrid(template.spec.dimensions, obstacles)
    };
}
function setupUnits(arena) {
    const template = templates[arena.name];
    if (!template) {
        throw Error(`Unknown Arena: ${arena.name}`);
    }
    const players = Object.values(arena.players);
    if (players.length > arena.spec.maxPlayers) {
        throw Error(`Too many players for ${arena.name}`);
    }
    players.forEach((player, i) => {
        player.resources = template.initialSetup.startingResources;
        addUnit(arena, player.id, UnitType.barrack, template.initialSetup.barracks[i], UnitAction.idle, Direction.north);
    });
}
export { setupArena, setupUnits };
