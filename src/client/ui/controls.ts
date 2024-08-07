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
  SendInstructionMethod
} from '../../common/Instructions/Instruction.js';
import { ArenaName } from '../../common/types/Arena.js';
import { setHandler } from '../game-status-update-handler.js';

function createArena(sendInstruction: SendInstructionMethod, playerName: string, arenaName: ArenaName) {
  if (!Object.values(ArenaName).includes(arenaName)) {
    throw Error(`Unknown Arena: ${arenaName}`);
  }

  return new Promise(resolve => {
    const instruction: CreateArenaInstruction = {
      type: InstructionType.arena_create,
      arenaName,
      playerName
    };
    sendInstruction(instruction, resolve);
  });
}

function joinArena(sendInstruction: SendInstructionMethod, arenaId: string, playerName: string) {
  return new Promise(resolve => {
    const instruction: JoinArenaInstruction = {
      type: InstructionType.arena_join,
      arenaId,
      playerName
    };
    sendInstruction(instruction, resolve);
  });
}

function leaveArena(sendInstruction: SendInstructionMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_leave } as LeaveArenaInstruction, resolve));
}

function listUsers(sendInstruction: SendInstructionMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_users } as ListUsersInstruction, resolve));
}

function listUnits(sendInstruction: SendInstructionMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_list_units } as ListUnitsInstruction, resolve));
}

function startGame(sendInstruction: SendInstructionMethod) {
  return new Promise(resolve => sendInstruction({ type: InstructionType.arena_start_game } as StartGameInstruction, resolve));
}

function sendCommands(sendInstruction: SendInstructionMethod, commands: UnitCommand[]) {
  // verify input quality
  sendInstruction({ type: InstructionType.unit_command, commands } as UnitInstructions);
}

function getControls(send: SendInstructionMethod) {
  return {
    createArena: (playerName: string, arenaName?: ArenaName) => createArena(send, playerName, arenaName || ArenaName.default),
    joinArena: (arenaId: string, playerName: string) => joinArena(send, arenaId, playerName),
    leaveArena: () => leaveArena(send),
    listUsers: () => listUsers(send),
    listUnits: () => listUnits(send),
    startGame: () => startGame(send),
    sendCommands: (commands: UnitCommand[]) => sendCommands(send, commands),
    onUpdate: setHandler
  }
}
export default getControls;