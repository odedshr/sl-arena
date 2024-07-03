import { Arena, FogOfWar } from "../types/Arena.js";
import { DetailedPlayer } from "../types/Player.js";
import { ActionableUnit, Position, Unit } from "../types/Units.js";

function getUnits(playerId:number, arena:Arena):Unit[] {
    const allUnits = [...arena.obstacles, ...arena.resources, ...flattenCollection(arena.players)];   
    const player = arena.players[playerId];
    
    if (!player) {
        return [];
    };

    const { fogOfWar } = arena.spec.features
    if (fogOfWar === player.type || fogOfWar === FogOfWar.both) {
        return filterUnits(playerId, allUnits as ActionableUnit[]);
    }

    return allUnits;
} 

function flattenCollection(players: { [playerId: number]: DetailedPlayer }) {
    return Object.values(players)
    .reduce((acc, player) => [...acc, ...Object.values(player.units)], [] as Unit[]);
}

function distance (position1:Position, position2:Position): number {
    return Math.sqrt(Math.pow(position1.x - position2.x, 2) + Math.pow(position1.y - position2.y, 2));
};

function filterUnits (playerId: number, units: ActionableUnit[]): Unit[] {
    // Get units belonging to the current player
    const playerUnits = units.filter(unit => unit.owner === playerId);

    // Filter units based on proximity
    return units.filter(unit => {
        if (unit.owner == playerId || unit.owner===undefined) {
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
};

export default getUnits;