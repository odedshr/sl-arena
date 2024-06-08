import { InstructionType } from '../../common/Instructions/Instruction';
import { GameStartedMessage, Message, MessageType, SendMethod } from '../../common/Messages/Message';
import handle from '../../common/ai/defaultHandler';
import { ArenaStatus } from '../../common/types/Arena';
import Player, { PlayerType } from '../../common/types/Player';
import { addPlayer, getPlayerArena } from '../arena';
import { setupUnits } from '../arenaLibrary';
import broadcast from './broadcast';
import { sendFail } from './instructionHandler';
import handleUnitCommand from './unitCommandHandler';

function startGame(playerId: number, send: SendMethod, callback?: number) {
  const arena = getPlayerArena(playerId);
  if (!arena) {
    return sendFail(send, InstructionType.arena_start_game, `start-game: not in arena`);
  }

  if (arena.status !== ArenaStatus.init) {
    return sendFail(send, InstructionType.arena_start_game, `start-game: game already started`);
  }

  let playerCount = Object.keys(arena.players).length;

  while (playerCount++ < 8) {
    addPlayer(arena, ++playerId, `ai-${playerId}`, PlayerType.ai, aiMessageHandler);
  }

  setupUnits(arena);
  arena.status = ArenaStatus.started;

  broadcast(arena, {
    type: MessageType.game_started,
    dimensions: arena.spec.dimensions,
    features: arena.spec.features,
    factions: Object.values(arena.players).map(({ id, name, color }) => ({ id, name, color } as Player))
  } as GameStartedMessage, playerId, callback);
}

function aiMessageHandler(message: Message) {
  if (message.type === MessageType.game_status) {
    const { units, playerId, resources } = message;
    const commands = handle(units, playerId, resources);
    if (commands.length) {
      handleUnitCommand(
        commands,
        playerId,
        aiMessageHandler
      );
    }

  }
}

export default startGame;