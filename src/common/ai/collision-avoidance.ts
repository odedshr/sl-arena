import { UnitCommand } from '../Instructions/Instruction';
import getNewPosition from '../statusUpdaters/getNewPosition';
import { Dimensions, EdgeType } from '../types/Arena';
import { ActionableUnit, Position, UnitAction } from '../types/Units';

function getEmptyGrid(dimensions: Dimensions): (number | undefined)[][] {
  const grid: (number | undefined)[][] = [];
  for (let i = 0; i < dimensions.width; i++) {
    grid.push([]);
    for (let j = 0; j < dimensions.height; j++) {
      grid[i].push(undefined);
    }
  }
  return grid;
}

function getUnitPosition(position: Position, command: UnitCommand, dimensions: Dimensions, edge: EdgeType) {
  if (command.action === UnitAction.move) {
    return getNewPosition(position, command.direction, dimensions, edge);
  }

  return position;
}

function avoidCollisions(units: ActionableUnit[], commands: UnitCommand[], dimensions: Dimensions, edge: EdgeType) {
  // iterate through all commands, place the units on a grid and verify they don't collide- if a unit is about to collide, change its action to idle
  const grid = getEmptyGrid(dimensions)
  for (const unit of units) {
    const unitPosition = getUnitPosition(unit.position, commands[unit.id], dimensions, edge);
    if (unitPosition && grid[unitPosition.y][unitPosition.x] !== undefined) {
      commands[unit.id].action = UnitAction.idle;
    }
  }

  return commands;
}

export default avoidCollisions;