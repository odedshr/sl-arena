import { FogOfWar } from "../types/Arena.js";
function getUnits(playerId, arena) {
    const allUnits = [...arena.obstacles, ...arena.resources, ...flattenCollection(arena.players)];
    const player = arena.players[playerId];
    if (!player) {
        return [];
    }
    ;
    const { fogOfWar } = arena.spec.details.features;
    if (fogOfWar === player.type || fogOfWar === FogOfWar.both) {
        return filterUnits(playerId, allUnits);
    }
    return allUnits;
}
function flattenCollection(players) {
    return Object.values(players)
        .reduce((acc, player) => [...acc, ...Object.values(player.units)], []);
}
function distance(position1, position2) {
    return Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
}
;
function filterUnits(playerId, units) {
    // Get units belonging to the current player
    const playerUnits = units.filter(unit => unit.owner === playerId);
    // Filter units based on proximity
    return units.filter(unit => {
        if (unit.owner == playerId || unit.owner === undefined) {
            return true; // Include unit if it belongs to the current player
        }
        const unitPosition = unit.position;
        // Check if there is any player unit within distance <= 5
        for (let playerUnit of playerUnits) {
            if (distance(unitPosition, playerUnit.position) <= 5) {
                return true;
            }
        }
        return false;
    });
}
;
export default getUnits;
