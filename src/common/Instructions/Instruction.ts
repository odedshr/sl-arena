import { Message } from '../Messages/Message.js';
import { ArenaName, Dimensions, Features } from '../types/Arena.js';
import { Direction, Unit, UnitAction } from '../types/Units.js';

enum InstructionType {
  register_server = 'register_server',
  arena_list_users = 'arena_list_users',
  arena_start_game = 'arena_start_game',
  arena_create = 'arena_create',
  arena_join = 'arena_join',
  arena_leave = 'arena_leave',
  unit_command = 'unit_command',
  arena_list_units = 'arena_list_units'
}

type CreateArenaInstruction = {
  callback?: number;
  type: InstructionType.arena_create;
  arenaName: ArenaName,
  playerName: string;
}

type JoinArenaInstruction = {
  callback?: number;
  type: InstructionType.arena_join;
  arenaId: string;
  playerName: string
}

type LeaveArenaInstruction = { callback?: number; type: InstructionType.arena_leave }
type ListUsersInstruction = { callback?: number; type: InstructionType.arena_list_users; }
type ListUnitsInstruction = { callback?: number; type: InstructionType.arena_list_units; }
type StartGameInstruction = { callback?: number; type: InstructionType.arena_start_game; }

type UnitCommand = { unitId: string, action: UnitAction, direction: Direction };
type UnitInstructions = { callback?: number; type: InstructionType.unit_command, commands: UnitCommand[] };

type StatusUpdateHandler = (units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => UnitCommand[];

type Instruction = CreateArenaInstruction
  | JoinArenaInstruction
  | LeaveArenaInstruction
  | ListUsersInstruction
  | ListUnitsInstruction
  | StartGameInstruction
  | UnitInstructions;

type SendInstructionMethod = (instruction: Instruction, callback?: (message: Message) => void) => void;

export {
  InstructionType,
  Instruction,
  CreateArenaInstruction,
  JoinArenaInstruction,
  LeaveArenaInstruction,
  ListUsersInstruction,
  ListUnitsInstruction,
  StartGameInstruction,
  UnitInstructions,
  UnitCommand,
  SendInstructionMethod,
  StatusUpdateHandler
};