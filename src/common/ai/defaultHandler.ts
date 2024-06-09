import { StatusUpdateHandler, UnitCommand } from '../Instructions/Instruction.js';
import { getRandomDirection } from '../generators.js';
import { Dimensions, EdgeType, Features } from '../types/Arena.js';
import { ActionableUnit, Unit, UnitAction, UnitType } from '../types/Units.js';
import createGrid, { Grid } from '../util-grid.js';
import { findShortestPath, getNextDirection } from './path-finder.js';

const handler: StatusUpdateHandler = (units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => {
  const isLoop = features.edge === EdgeType.loop;
  const commands: UnitCommand[] = [];
  const barrack = units.find(unit => unit.type === UnitType.barrack && (unit as ActionableUnit).owner === playerId) as ActionableUnit;
  const grid = toBooleans(createGrid(dimensions, units.filter(unit => unit.type === UnitType.wall)));

  if (barrack && resources > 0) {
    commands.push({
      unitId: barrack.id,
      action: UnitAction.produce,
      direction: getRandomDirection()
    })
  }

  const pawns = units.filter(unit => unit.type === UnitType.pawn && (unit as ActionableUnit).owner === playerId) as ActionableUnit[];
  const enemyBarracks = units.filter(unit => unit.type === UnitType.barrack && (unit as ActionableUnit).owner !== playerId) as ActionableUnit[];
  handlePawns(pawns, playerId, enemyBarracks, grid, isLoop);
  return commands;
}

function toBooleans(grid: Grid): boolean[][] {
  return grid.map(row => row.map(cell => (cell !== undefined && cell.length > 0)));
}

function handlePawns(pawns: ActionableUnit[], playerId: number, enemyBarracks: ActionableUnit[], terrain: boolean[][], isLoop: boolean) {
  const commands: { [unitId: string]: UnitCommand } = {};
  for (const pawn of pawns) {
    const closestEnemyBarrack = findClosestEnemyBarrack(pawn, enemyBarracks, terrain, isLoop);

    if (closestEnemyBarrack) {
      pawn.direction = getNextDirection(pawn.position, closestEnemyBarrack.position, terrain, isLoop);

      commands[pawn.id] = {
        unitId: pawn.id,
        action: UnitAction.move,
        direction: pawn.direction
      }
    }
  }

  return Object.values(commands);
}

// Function to find the closest enemy barrack
const findClosestEnemyBarrack = (pawn: ActionableUnit, barracks: Unit[], grid: boolean[][], isLoop: boolean): Unit | undefined => {
  const start = pawn.position;
  let closestBarrack: Unit | undefined = undefined;
  let shortestDistance = Infinity;

  for (const barrack of barracks) {
    const distance = findShortestPath(start, barrack.position, grid, isLoop);
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestBarrack = barrack;
    }
  }

  return closestBarrack;
};


export default handler;