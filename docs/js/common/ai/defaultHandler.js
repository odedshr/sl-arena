import { getRandomDirection } from '../generators.js';
import { Direction, UnitAction, UnitType } from '../types/Units.js';
function handle(units, playerId, resources) {
    const commands = [];
    const barrack = units.find(unit => unit.type === UnitType.barrack && unit.owner === playerId);
    if (barrack && resources > 0) {
        commands.push({
            unitId: barrack.id,
            action: UnitAction.produce,
            direction: getRandomDirection()
        });
    }
    const pawns = units.filter(unit => unit.type === UnitType.pawn && unit.owner === playerId);
    const enemybarracks = units.filter(unit => unit.type === UnitType.barrack && unit.owner !== playerId);
    handlePawns(pawns, playerId, enemybarracks);
    return commands;
}
function handlePawns(pawns, playerId, enemybarracks) {
    const commands = {};
    for (const pawn of pawns) {
        const closestEnemybarrack = findClosestEnemybarrack(pawn, enemybarracks);
        if (closestEnemybarrack) {
            pawn.direction = getDirectionToTarget(pawn, closestEnemybarrack);
            commands[pawn.id] = {
                unitId: pawn.id,
                action: UnitAction.move,
                direction: pawn.direction
            };
        }
    }
    return Object.values(commands);
}
function getDirectionToTarget(source, target) {
    const xDiff = target.position.x - source.position.x;
    const yDiff = target.position.y - source.position.y;
    if (xDiff > 0) {
        if (yDiff < 0) {
            return Direction.northEast;
        }
        else if (yDiff > 0) {
            return Direction.southEast;
        }
        return Direction.east;
    }
    else if (xDiff < 0) {
        if (yDiff < 0) {
            return Direction.northWest;
        }
        else if (yDiff > 0) {
            return Direction.southWest;
        }
        return Direction.west;
    }
    else if (yDiff < 0) {
        return Direction.north;
    }
    return Direction.south;
}
// // Utility function to check if two positions are equal
// const arePositionsEqual = (pos1: Position, pos2: Position): boolean => {
//   return pos1.x === pos1.x && pos1.y === pos2.y;
// };
// Function to find the closest enemy barrack
const findClosestEnemybarrack = (pawn, barracks) => {
    let closestbarrack = undefined;
    let minDistance = Infinity;
    for (const u of barracks) {
        const distance = Math.abs(pawn.position.x - u.position.x) + Math.abs(pawn.position.y - u.position.y);
        if (distance < minDistance) {
            minDistance = distance;
            closestbarrack = u;
        }
    }
    return closestbarrack;
};
// // Main function to handle unit commands
// function handleTemp(units: Unit[], playerId: number): UnitCommand[] {
//   const commands: UnitCommand[] = [];
//   for (const unit of units) {
//     if (unit.owner !== playerId || unit.type === 'barrack') continue;
//     const currentPos = unit.position;
//     let newDirection: Direction = unit.direction;
//     let newPosition = getNewPosition(currentPos, newDirection);
//     // Check for collisions with other units of the same player
//     let collision = units.some(u => u.owner === playerId && arePositionsEqual(newPosition, u.position));
//     if (collision) {
//       // Try to find an alternative direction to avoid collision
//       const directions: Direction[] = ['north', 'south', 'east', 'west'];
//       for (const direction of directions) {
//         newPosition = getNewPosition(currentPos, direction);
//         collision = units.some(u => u.owner === playerId && arePositionsEqual(newPosition, u.position));
//         if (!collision) {
//           newDirection = direction;
//           break;
//         }
//       }
//     }
//     // Check for collision with other units in general (not only same player)
//     collision = units.some(u => arePositionsEqual(newPosition, u.position));
//     if (collision) {
//       // Stay in place if collision cannot be avoided
//       commands.push({ unitId: unit.id, action: 'stay', direction: unit.direction });
//     } else {
//       // Move towards the closest enemy barrack if no collision
//       const enemybarrack = findClosestEnemybarrack(unit, units);
//       if (enemybarrack) {
//         const xDiff = enemybarrack.position.x - currentPos.x;
//         const yDiff = enemybarrack.position.y - currentPos.y;
//         if (Math.abs(xDiff) > Math.abs(yDiff)) {
//           newDirection = xDiff > 0 ? 'east' : 'west';
//         } else {
//           newDirection = yDiff > 0 ? 'south' : 'north';
//         }
//         newPosition = getNewPosition(currentPos, newDirection);
//       }
//       commands.push({ unitId: unit.id, action: 'move', direction: newDirection });
//     }
//   }
//   return commands;
// }
export default handle;
