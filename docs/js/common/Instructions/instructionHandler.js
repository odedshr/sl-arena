import { InstructionType } from './Instruction.js';
import { ArenaStatus } from '../types/Arena.js';
import { MessageType } from '../Messages/Message.js';
import { addArena, addPlayer, getArena, getPlayerArena, setPlayerArena } from '../arena/arena.js';
import handleUnitCommand from './unitCommandHandler.js';
import { PlayerType } from '../types/Player.js';
import broadcast from './broadcast.js';
import startGame from './startGameHandler.js';
import sendFail from './sendFail.js';
function handle(instruction, playerId, send) {
    switch (instruction.type) {
        case InstructionType.arena_create:
            return createArena(instruction, playerId, send);
        case InstructionType.arena_join:
            return joinArena(instruction, playerId, send);
        case InstructionType.arena_leave:
            return leaveArena(playerId, instruction.callback);
        case InstructionType.arena_list_users:
            return listPlayers(playerId, send, instruction.callback);
        case InstructionType.arena_list_units:
            return listUnits(playerId, send, instruction.callback);
        case InstructionType.arena_start_game:
            return startGame(playerId, send);
        case InstructionType.unit_command:
            return handleUnitCommand(instruction.commands, playerId, send);
        default:
            //@ts-expect-error
            const unknownType = instruction.type;
            return sendFail(send, unknownType, `unknown instruction`);
    }
}
function createArena(instruction, playerId, send) {
    leaveArena(playerId);
    const { arenaName, playerName, callback } = instruction;
    const arenaId = addArena(arenaName, playerName, playerId, send);
    send({ callback, type: MessageType.arena_created, arenaId });
}
function joinArena(instruction, playerId, send) {
    leaveArena(playerId);
    const { callback, arenaId, playerName } = instruction;
    const arena = getArena(arenaId);
    if (!arena) {
        return sendFail(send, InstructionType.arena_join, `arena doesn't exist`);
    }
    if (arena.status !== ArenaStatus.init) {
        return sendFail(send, InstructionType.arena_join, `arena doesn't accept players`);
    }
    addPlayer(arena, playerId, playerName, PlayerType.human, send);
    broadcast(arena, { type: MessageType.player_joined, playerName }, playerId, callback);
}
function leaveArena(playerId, callback) {
    const arena = getPlayerArena(playerId);
    if (arena) {
        const players = arena.players;
        const playerName = players[playerId].name;
        broadcast(arena, { type: MessageType.player_left, playerName }, playerId, callback);
        delete players[playerId];
        setPlayerArena(playerId, null);
        if (Object.keys(players).length === 0) {
            arena.status = ArenaStatus.finished;
            console.log('Arena left empty');
        }
    }
}
function getPlayerNames(arena) {
    return Object.values(arena.players).map(player => player.name);
}
function listPlayers(playerId, send, callback) {
    const arena = getPlayerArena(playerId);
    if (!arena) {
        return sendFail(send, InstructionType.arena_list_users, 'list-players: not in arena');
    }
    const players = getPlayerNames(arena);
    send({ callback, type: MessageType.arena_player_list, players });
}
function listUnits(playerId, send, callback) {
    const arena = getPlayerArena(playerId);
    if (!arena) {
        return sendFail(send, InstructionType.arena_list_units, `list-units: not in arena`);
    }
    send({ callback, type: MessageType.player_unit_list, units: Object.values(arena.players[playerId].units) });
}
export default handle;
