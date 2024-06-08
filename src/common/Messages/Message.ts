import { InstructionType } from '../Instructions/Instruction';
import { ArenaStatus, Dimensions, Features } from '../types/Arena';
import Player from '../types/Player';
import { ActionableUnit, Unit } from '../types/Units';

enum MessageType {
  ping = 'ping',
  arena_created = 'arena_created',
  player_joined = 'player_joined',
  operation_failed = 'operation_failed',
  player_left = 'player_left',
  arena_player_list = 'arena_player_list',
  player_unit_list = 'player_unit_list',
  game_started = 'game_started',
  game_status = 'game_status',
}

type PingMessage = {
  type: MessageType.ping;
}


type ArenaCreatedMessage = {
  type: MessageType.arena_created;
  arenaId: string;
};

type PlayerJoinedMessage = {
  type: MessageType.player_joined;
  playerName: string;
};

type OperationErrorMessage = {
  type: MessageType.operation_failed;
  instruction: InstructionType;
  reason: string;
};

type PlayerLeftMessage = {
  type: MessageType.player_left;
  playerName: string;
};

type PlayerListMessage = {
  type: MessageType.arena_player_list;
  players: string[];
};

type UnitListMessage = {
  type: MessageType.player_unit_list;
  units: ActionableUnit[];
};

type GameStartedMessage = {
  type: MessageType.game_started;
  dimensions: Dimensions;
  features: Features;
  factions: Player[];
}

type GameStateMessage = {
  type: MessageType.game_status;
  playerId: number;
  resources: number;
  status: ArenaStatus;
  units: Unit[];
}

type MessageUnion = PingMessage |
  ArenaCreatedMessage |
  PlayerJoinedMessage |
  OperationErrorMessage |
  PlayerLeftMessage |
  PlayerListMessage |
  UnitListMessage |
  GameStateMessage |
  GameStartedMessage;
type Message = { callback?: number } & MessageUnion


type SendMethod = (message: Message) => void

export {
  MessageType,
  Message,
  PingMessage,
  ArenaCreatedMessage,
  PlayerJoinedMessage,
  OperationErrorMessage,
  PlayerLeftMessage,
  PlayerListMessage,
  UnitListMessage,
  GameStartedMessage,
  GameStateMessage,
  SendMethod
};