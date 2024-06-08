import { Instruction, InstructionType, CreateArenaInstruction, JoinArenaInstruction, UnitInstructions, LeaveArenaInstruction, ListUsersInstruction, ListUnitsInstruction } from '../../common/Instructions/Instruction.js';
import { Arena, ArenaStatus } from '../../common/types/Arena.js';
import { MessageType, ArenaCreatedMessage, PlayerJoinedMessage, OperationErrorMessage, PlayerLeftMessage, PlayerListMessage, SendMethod, UnitListMessage } from '../../common/Messages/Message.js';
import { addArena, addPlayer, getArena, getPlayerArena, setPlayerArena } from '../arena.js';
import handleUnitCommand from './unitCommandHandler.js';
import { colors } from '../../common/generators.js';
import { DetailedPlayer, PlayerType } from '../../common/types/Player.js';
import { ActionableUnit } from '../../common/types/Units.js';
import broadcast from './broadcast.js';
import startGame from './startGameHandler.js';

function handle(instruction: Instruction, playerId: number, send: SendMethod) {
  switch (instruction.type) {
    case InstructionType.arena_create:
      return createArena(instruction as CreateArenaInstruction, playerId, send);
    case InstructionType.arena_join:
      return joinArena(instruction as JoinArenaInstruction, playerId, send);
    case InstructionType.arena_leave:
      return leaveArena(playerId, (instruction as LeaveArenaInstruction).callback);
    case InstructionType.arena_list_users:
      return listPlayers(playerId, send, (instruction as ListUsersInstruction).callback);
    case InstructionType.arena_list_units:
      return listUnits(playerId, send, (instruction as ListUnitsInstruction).callback);
    case InstructionType.arena_start_game:
      return startGame(playerId, send);
    case InstructionType.unit_command:
      return handleUnitCommand((instruction as UnitInstructions).commands, playerId, send);
    default:
      //@ts-expect-error
      const unknownType = instruction.type;
      return sendFail(send, unknownType, `unknown instruction`);
  }
}

function createArena(instruction: CreateArenaInstruction, playerId: number, send: SendMethod) {
  leaveArena(playerId);
  const { arenaName, playerName, callback } = instruction;

  const arenaId = addArena(arenaName, playerName, playerId, send);
  send({ callback, type: MessageType.arena_created, arenaId } as ArenaCreatedMessage);
}

function joinArena(instruction: JoinArenaInstruction, playerId: number, send: SendMethod) {
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

  broadcast(arena, { type: MessageType.player_joined, playerName } as PlayerJoinedMessage, playerId, callback);
}

function leaveArena(playerId: number, callback?: number) {
  const arena = getPlayerArena(playerId);
  if (arena) {
    const players = arena.players;
    const playerName = players[playerId].name;
    broadcast(arena, { type: MessageType.player_left, playerName } as PlayerLeftMessage, playerId, callback);
    delete players[playerId];
    setPlayerArena(playerId, null);

    if (Object.keys(players).length === 0) {
      arena.status = ArenaStatus.finished;
      console.log('Arena left empty');
    }
  }
}

function getPlayerNames(arena: Arena) {
  return Object.values(arena.players).map(player => player.name);
}

function listPlayers(playerId: number, send: SendMethod, callback?: number) {
  const arena = getPlayerArena(playerId);
  if (!arena) {
    return sendFail(send, InstructionType.arena_list_users, 'list-players: not in arena');
  }
  const players = getPlayerNames(arena);
  send({ callback, type: MessageType.arena_player_list, players } as PlayerListMessage);
}


function listUnits(playerId: number, send: SendMethod, callback?: number) {
  const arena = getPlayerArena(playerId);
  if (!arena) {
    return sendFail(send, InstructionType.arena_list_units, `list-units: not in arena`);
  }
  send({ callback, type: MessageType.player_unit_list, units: Object.values(arena.players[playerId].units) as ActionableUnit[] } as UnitListMessage);
}

function sendFail(send: SendMethod, instruction: InstructionType, reason: string, callback?: number) {
  return send({ callback, type: MessageType.operation_failed, instruction, reason: reason } as OperationErrorMessage)
}

export default handle;
export { sendFail };