import { InstructionType } from './Instruction.js';
import { ArenaStatus } from '../types/Arena.js';
import { Direction, UnitAction, UnitType } from '../types/Units.js';
import { getPlayerArena } from '../arena/arena.js';
import { sendFail } from './instructionHandler.js';
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
function handleCommand(command, player) {
    if (!isValidDirection(command.direction)) {
        return sendFail(player.send, InstructionType.unit_command, `invalid direction: ${command.direction}`);
    }
    const unit = player.units[command.unitId];
    if (!unit) {
        return sendFail(player.send, InstructionType.unit_command, `invalid unit: ${command.unitId}`);
    }
    if (unit.action === UnitAction.dead) {
        return sendFail(player.send, InstructionType.unit_command, `unit is dead`);
    }
    if (!isValidAction(command.action, unit.type)) {
        return sendFail(player.send, InstructionType.unit_command, `invalid action: ${command.action}`);
    }
    unit.action = command.action;
    unit.direction = command.direction;
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
