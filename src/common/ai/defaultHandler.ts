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
  const barracks = units.filter(unit => unit.type === UnitType.barrack && (unit as ActionableUnit).owner === playerId) as ActionableUnit[];
  const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));

  if (barracks.length) {
    barracks.forEach(barrack => { grid[barrack.position.y][barrack.position.x] = true; });
    if (resources > 0) {
      commands.push({
        unitId: barracks[0].id,
        action: UnitAction.produce,
        direction: getRandomDirection()
      });
    }
  }

  const pawns = units.filter(unit => unit.type === UnitType.pawn && (unit as ActionableUnit).owner === playerId) as ActionableUnit[];
  const enemyBarracks = units.filter(unit => unit.type === UnitType.barrack && (unit as ActionableUnit).owner !== playerId) as ActionableUnit[];

  commands.push(...handlePawns(pawns, enemyBarracks, grid, isLoop));
  avoidCollisions(pawns, commands, dimensions, features.edge);

  return commands;
}

function toBooleans(grid: Grid): boolean[][] {
  return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}

function handlePawns(pawns: ActionableUnit[], enemyBarracks: ActionableUnit[], terrain: boolean[][], isLoop: boolean) {
  const commands: { [unitId: string]: UnitCommand } = {};
  for (const pawn of pawns) {
    const bestPath = getPathToNearestTarget(pawn.position, enemyBarracks.map(barrack => barrack.position), terrain, isLoop);

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