import { InstructionType, UnitCommand } from './Instruction.js';
import { SendMessageMethod } from '../Messages/Message.js';
import { ArenaStatus } from '../types/Arena.js';
import { DetailedPlayer } from '../types/Player.js';
import { ActionableUnit, Direction, UnitAction, UnitType } from '../types/Units.js';
import { getPlayerArena } from '../arena/arena.js';
import sendFail from './send-fail.js';

function handleUnitCommand(commands: UnitCommand[], playerId: number, send: SendMessageMethod) {
  const arena = getPlayerArena(playerId);

  if (!arena) {
    return sendFail(send, InstructionType.unit_command, `Not in arena`);
  }

  if (arena.status !== ArenaStatus.started) {
    return sendFail(send, InstructionType.unit_command, `Game not in progress`);
  }

  const player = arena.players[playerId];

  if (Array.isArray(commands)) {
    return commands.forEach(command => handleCommand(command, player));
  }

  return handleCommand(commands as UnitCommand, player)
}

const actionRequireDirection:{[key:string]:boolean} = {
  [UnitAction.move]: true,
  [UnitAction.produce]: false,
  [UnitAction.idle]: false,
  [UnitAction.dead]: false
};

function handleCommand(command: UnitCommand, player: DetailedPlayer) {
  const { action, unitId, direction } = command;
  if (actionRequireDirection[action]) {
    if (direction===undefined) {
      return sendFail(player.send, InstructionType.unit_command, `missing direction for action ${action}`);
    }
    if (!isValidDirection(direction)) {
      return sendFail(player.send, InstructionType.unit_command, `invalid direction: ${direction}`);
    }
  }

  const unit = player.units[unitId] as ActionableUnit;

  if (!unit) {
    return sendFail(player.send, InstructionType.unit_command, `invalid unit: ${unitId}`);
  }

  if (unit.action === UnitAction.dead) {
    return sendFail(player.send, InstructionType.unit_command, `unit is dead`);
  }

  if (!isValidAction(action, unit.type)) {
    return sendFail(player.send, InstructionType.unit_command, `invalid action: ${action}`);
  }

  unit.action = action;
  unit.direction = direction;
}

const validActions: { [key: string]: UnitAction[] } = {
  [UnitType.pawn]: [UnitAction.idle, UnitAction.move, UnitAction.dead],
  [UnitType.barrack]: [UnitAction.idle, UnitAction.produce, UnitAction.dead],
}

function isValidAction(action: UnitAction, unitType: UnitType): boolean {
  return validActions[unitType].includes(action);
}

function isValidDirection(direction: Direction): boolean {
  return [Direction.north,
  Direction.northEast,
  Direction.east,
  Direction.southEast,
  Direction.south,
  Direction.southWest,
  Direction.west,
  Direction.northWest].includes(direction);
}

export default handleUnitCommand;