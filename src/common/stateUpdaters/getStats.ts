import { Arena } from "../types/Arena.js";
import { UnitAction } from "../types/Units.js";

function getStats(arena:Arena) {
    const stats:{[key:number]:number} = {}
    
    for (let playerId in arena.players) {
        stats[playerId] = Object
            .values(arena.players[playerId].units)
            .filter(unit=>unit.action!==UnitAction.dead)
            .length;
    }

    return stats;
}

export default getStats;