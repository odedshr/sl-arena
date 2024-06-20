import { UnitAction } from "../types/Units.js";
function getStats(arena) {
    const stats = {};
    for (let playerId in arena.players) {
        stats[playerId] = Object
            .values(arena.players[playerId].units)
            .filter(unit => unit.action !== UnitAction.dead)
            .length;
    }
    return stats;
}
export default getStats;
