import {
  InstructionType,
  CreateArenaInstruction,
  JoinArenaInstruction,
  LeaveArenaInstruction,
  ListUsersInstruction,
  ListUnitsInstruction,
  StartGameInstruction,
  UnitCommand,
  UnitInstructions,
  SendMethod
} from '../common/Instructions/Instruction.js';
import { ArenaName } from '../common/types/Arena.js';
import { setHandler } from './gameStatusUpdateHandler.js';

function createArena(sendInstruction: SendMethod, playerName: string) {
  return new Promise(resolve => {
    const instruction: CreateArenaInstruction = {
      type: InstructionType.arena_create,
      arenaName: ArenaName.default,
      playerName
    };
    sendInstruction(instruction, resolve);
  });
}

function joinArena(sendInstruction: SendMethod, arenaId: string, playerName: string) {
  return new Promise(resolve => {
    const instruction: JoinArenaInstruction = {
      type: InstructionType.arena_join,
      arenaId,
      playerName
    };
    sendInstruction(instruction, resolve);
  });
}

function leaveArena(sendInstruction: SendMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_leave } as LeaveArenaInstruction, resolve));
}

function listUsers(sendInstruction: SendMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_users } as ListUsersInstruction, resolve));
}

function listUnits(sendInstruction: SendMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_units } as ListUnitsInstruction, resolve));
}

function startGame(sendInstruction: SendMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_start_game } as StartGameInstruction, resolve));
}

function sendOrders(sendInstruction: SendMethod, commands: UnitCommand[]) {
  // verify input quality
  sendInstruction({ type: InstructionType.unit_command, commands } as UnitInstructions);
}

function getControls(send: SendMethod) {
  return {
    createArena: (playerName: string) => createArena(send, playerName),
    joinArena: (arenaId: string, playerName: string) => joinArena(send, arenaId, playerName),
    leaveArena: () => leaveArena(send),
    listUsers: () => listUsers(send),
    listUnits: () => listUnits(send),
    startGame: () => startGame(send),
    sendOrders: (commands: UnitCommand[]) => sendOrders(send, commands),
    onUpdate: setHandler
  }
}
export default getControls;