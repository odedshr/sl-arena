import { getCell } from '../../client/ui/position-tracker.js';
import { StatusUpdateHandler, UnitCommand } from '../Instructions/Instruction.js';
import { getRandomDirection } from '../generators.js';
import { Dimensions, EdgeType, Features } from '../types/Arena.js';
import { ActionableUnit, Position, Unit, UnitAction, UnitType } from '../types/Units.js';
import { Grid } from '../types/Grid.js';
import { WayPoint, getPathToNearestTarget } from './path-finder.js';
import { createGrid } from '../util-grid.js';

const weight: { [key: string]: number } = {
  [UnitType.barrack]: 3,
  [UnitType.resource]: 2,
  [UnitType.pawn]: 1
};

const handler: StatusUpdateHandler = (units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => {
  const isLoop = features.edge === EdgeType.loop;
  const commands: UnitCommand[] = [];
  const grid = toBooleans(createGrid(dimensions, units.filter(unit=>unit.type===UnitType.wall)));

  commands.push(...handleBarracks(getMyUnits(UnitType.barrack, units, playerId), resources));
  commands.push(...handlePawns(getMyUnits(UnitType.pawn, units, playerId), findTargets(units, playerId), grid, isLoop));
  // avoidCollisions(pawns, commands, dimensions, features.edge);

  return commands;
}

function handleBarracks(barracks: ActionableUnit[], resources:number):UnitCommand[] {
  const commands: UnitCommand[] = [];
  barracks.forEach(barrack => { 
    if (resources) {
      commands.push({
        unitId: barrack.id,
        action: UnitAction.produce,
        direction: getRandomDirection()
      });
      resources--;
    }
  });

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

  potentialTargets.sort((a, b)=>weight[b.type] - weight[a.type]);
  for (const target of potentialTargets) {
    assignBestPawnForTarget(target.position, pawns, commands, terrain, isLoop);
  }

  const explorePoints:Position[] = generateEvenlyDistributedPoints(terrain[0].length, terrain.length, pawns.length);
  for (const position of explorePoints) {
    assignBestPawnForTarget(position, pawns, commands, terrain, isLoop);
  }

  return Object.values(commands);
}

function samePosition (p1:Position, p2:Position) {
  return p1.x===p2.x && p1.y===p2.y;
}

function assignBestPawnForTarget(target:Position, pawns: ActionableUnit[], commands: { [unitId: string]: UnitCommand }, terrain: boolean[][], isLoop: boolean) {
  const bestPath = getPathToNearestTarget(target, pawns.map(pawn => pawn.position), terrain, isLoop);
  if (bestPath===undefined || bestPath.length === 0) {
    return;
  }

  const wayPoint = bestPath[bestPath.length-1] as WayPoint;
  const pawn = pawns.find(pawn=>samePosition(pawn.position, wayPoint.position));

  if(pawn) {
    commands[pawn.id] = {
      unitId: pawn.id,
      action: UnitAction.move,
      direction: wayPoint.backward
    }
    pawns.splice(pawns.indexOf(pawn), 1);
  }
}

function generateEvenlyDistributedPoints(width: number, height: number, count: number): Position[] {
  const points: Position[] = [];
  
  // Calculate the number of points per row and per column
  const sqrtCount = Math.sqrt(count);
  const pointsPerRow = Math.ceil(sqrtCount);
  const pointsPerCol = Math.ceil(sqrtCount);

  // Calculate the horizontal and vertical spacing
  const horizontalSpacing = Math.floor(width / (pointsPerRow + 1));
  const verticalSpacing = Math.floor(height / (pointsPerCol + 1));

  let generatedCount = 0;
  
  for (let row = 1; row <= pointsPerCol; row++) {
      for (let col = 1; col <= pointsPerRow; col++) {
          if (generatedCount >= count) {
            break;
          }
          
          points.push({ x: col * horizontalSpacing, y: row * verticalSpacing });
          generatedCount++;
      }
  }

  return points;
}

export default handler;