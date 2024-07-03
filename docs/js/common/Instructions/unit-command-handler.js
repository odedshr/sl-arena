import { InstructionType } from './Instruction.js';
import { ArenaStatus } from '../types/Arena.js';
import { Direction, UnitAction, UnitType } from '../types/Units.js';
import { getPlayerArena } from '../arena/arena.js';
import sendFail from './send-fail.js';
function handleUnitCommand(commands, playerId, send) {
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
    return handleCommand(commands, player);
}
const actionRequireDirection = {
    [UnitAction.move]: true,
    [UnitAction.produce]: false,
    [UnitAction.idle]: false,
    [UnitAction.dead]: false
};
function handleCommand(command, player) {
    const { action, unitId, direction } = command;
    if (actionRequireDirection[action]) {
        if (direction === undefined) {
            return sendFail(player.send, InstructionType.unit_command, `missing direction for action ${action}`);
        }
        if (!isValidDirection(direction)) {
            return sendFail(player.send, InstructionType.unit_command, `invalid direction: ${direction}`);
        }
    }
    const unit = player.units[unitId];
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
const validActions = {
    [UnitType.pawn]: [UnitAction.idle, UnitAction.move, UnitAction.dead],
    [UnitType.barrack]: [UnitAction.idle, UnitAction.produce, UnitAction.dead],
};
function isValidAction(action, unitType) {
    return validActions[unitType].includes(action);
}
function isValidDirection(direction) {
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
