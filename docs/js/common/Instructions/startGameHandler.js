import { InstructionType } from './Instruction.js';
import { MessageType } from '../Messages/Message.js';
import handle from '../ai/defaultHandler.js';
import { ArenaStatus } from '../types/Arena.js';
import { PlayerType } from '../types/Player.js';
import { addPlayer, getPlayerArena } from '../arena/arena.js';
import { setupUnits } from '../arena/arenaLibrary.js';
import broadcast from './broadcast.js';
import { sendFail } from './instructionHandler.js';
import handleUnitCommand from './unitCommandHandler.js';
function startGame(playerId, send, callback) {
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
        factions: Object.values(arena.players).map(({ id, name, color }) => ({ id, name, color }))
    }, playerId, callback);
}
function aiMessageHandler(message) {
    if (message.type === MessageType.game_status) {
        const { units, playerId, resources } = message;
        const commands = handle(units, playerId, resources);
        if (commands.length) {
            handleUnitCommand(commands, playerId, aiMessageHandler);
        }
    }
}
export default startGame;
