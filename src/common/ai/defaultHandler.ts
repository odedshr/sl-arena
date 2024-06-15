import { StatusUpdateHandler, UnitCommand } from '../Instructions/Instruction.js';
import { getRandomDirection } from '../generators.js';
import { Dimensions, EdgeType, Features } from '../types/Arena.js';
import { ActionableUnit, Unit, UnitAction, UnitType } from '../types/Units.js';
import createGrid, { Grid } from '../util-grid.js';
import avoidCollisions from './collision-avoidance.js';
import { WayPoint, getPathToNearestTarget } from './path-finder.js';

const handler: StatusUpdateHandler = (units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => {
  const isLoop = features.edge === EdgeType.loop;
  const commands: UnitCommand[] = [];
  const barracks = getMyUnits(UnitType.barrack, units, playerId);
  const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));

  if (barracks.length) {
    barracks.forEach(barrack => { grid[barrack.position.y][barrack.position.x] = true; });
    let barrack = 0;
    while (resources--) {
      commands.push({
        unitId: barracks[barrack++ % barracks.length].id,
        action: UnitAction.produce,
        direction: getRandomDirection()
      });
    }
  }

  const pawns = getMyUnits(UnitType.pawn, units, playerId);
  const potentialTargets = findTargets(units, playerId);

  commands.push(...handlePawns(pawns, potentialTargets, grid, isLoop));
  avoidCollisions(pawns, commands, dimensions, features.edge);

  return commands;
}

function getMyUnits(type: UnitType, units: Unit[], playerId: number) {
  return (units as ActionableUnit[]).filter(unit => 
    unit.type === type &&
    unit.owner === playerId &&
    unit.action !== UnitAction.dead);
}
function findTargets(units: Unit[], playerId: number) {
  return units.filter(unit => (unit.type === UnitType.barrack && (unit as ActionableUnit).owner !== playerId) || (
    unit.type === UnitType.resource
  ));
}

function toBooleans(grid: Grid<Unit[]>): boolean[][] {
  return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}

function handlePawns(pawns: ActionableUnit[], potentialTargets: Unit[], terrain: boolean[][], isLoop: boolean) {
  const commands: { [unitId: string]: UnitCommand } = {};
  for (const pawn of pawns) {
    const bestPath = getPathToNearestTarget(pawn.position, potentialTargets.map(target => target.position), terrain, isLoop);

    if (bestPath.length) {
      commands[pawn.id] = {
        unitId: pawn.id,
        action: UnitAction.move,
        direction: (bestPath[0] as WayPoint).direction
      }
    } else {
      commands[pawn.id] = {
        unitId: pawn.id,
        action: UnitAction.idle,
        direction: pawn.direction
      }
    }
  }

  return Object.values(commands);
}

export default handler;