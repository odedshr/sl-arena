import { InstructionType } from './Instruction.js';
import { MessageType } from '../Messages/Message.js';
import handle from '../ai/default-handler.js';
import { ArenaStatus } from '../types/Arena.js';
import { PlayerType } from '../types/Player.js';
import { addPlayer, getPlayerArena } from '../arena/arena.js';
import { setupUnits } from '../arena/set-up-arena.js';
import broadcast from './broadcast.js';
import sendFail from './send-fail.js';
import handleUnitCommand from './unit-command-handler.js';
function startGame(playerId, send, callback) {
    const arena = getPlayerArena(playerId);
    if (!arena) {
        return sendFail(send, InstructionType.arena_start_game, `start-game: not in arena`);
    }
    if (arena.status !== ArenaStatus.init) {
        return sendFail(send, InstructionType.arena_start_game, `start-game: game already started`);
    }
    let playerIds = Object.keys(arena.players);
    let aiPlayerCount = arena.spec.maxPlayers - playerIds.length;
    let nextPlayerId = Math.max(...playerIds.map(n => +n));
    while (aiPlayerCount--) {
        addPlayer(arena, ++nextPlayerId, `ai-${nextPlayerId}`, PlayerType.ai, aiMessageHandler);
    }
    setupUnits(arena);
    arena.status = ArenaStatus.started;
    const { dimensions, features, onGameStart } = arena.spec;
    broadcast(arena, {
        type: MessageType.game_started,
        dimensions,
        features,
        startMessage: onGameStart(arena),
        factions: Object.values(arena.players).map(({ id, name, color }) => ({ id, name, color }))
    }, playerId, callback);
}
function aiMessageHandler(message) {
    if (message.type === MessageType.game_status) {
        const { units, playerId, resources, dimensions, features } = message;
        const commands = handle(units, playerId, resources, dimensions, features);
        if (commands.length) {
            handleUnitCommand(commands, playerId, aiMessageHandler);
        }
    }
}
export default startGame;
