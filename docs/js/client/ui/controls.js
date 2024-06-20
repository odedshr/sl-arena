import { InstructionType } from '../../common/Instructions/Instruction.js';
import { ArenaName } from '../../common/types/Arena.js';
import { setHandler } from '../game-status-update-handler.js';
function createArena(sendInstruction, playerName) {
    return new Promise(resolve => {
        const instruction = {
            type: InstructionType.arena_create,
            arenaName: ArenaName.default,
            playerName
        };
        sendInstruction(instruction, resolve);
    });
}
function joinArena(sendInstruction, arenaId, playerName) {
    return new Promise(resolve => {
        const instruction = {
            type: InstructionType.arena_join,
            arenaId,
            playerName
        };
        sendInstruction(instruction, resolve);
    });
}
function leaveArena(sendInstruction) {
    return new Promise(resolve => sendInstruction({ type: InstructionType.arena_leave }, resolve));
}
function listUsers(sendInstruction) {
    return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_users }, resolve));
}
function listUnits(sendInstruction) {
    return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_units }, resolve));
}
function startGame(sendInstruction) {
    return new Promise(resolve => sendInstruction({ type: InstructionType.arena_start_game }, resolve));
}
function sendOrders(sendInstruction, commands) {
    // verify input quality
    sendInstruction({ type: InstructionType.unit_command, commands });
}
function getControls(send) {
    return {
        createArena: (playerName) => createArena(send, playerName),
        joinArena: (arenaId, playerName) => joinArena(send, arenaId, playerName),
        leaveArena: () => leaveArena(send),
        listUsers: () => listUsers(send),
        listUnits: () => listUnits(send),
        startGame: () => startGame(send),
        sendOrders: (commands) => sendOrders(send, commands),
        onUpdate: setHandler
    };
}
export default getControls;
