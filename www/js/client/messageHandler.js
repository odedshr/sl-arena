import { MessageType } from '../common/Messages/Message.js';
import { EdgeType } from '../common/types/Arena.js';
import { setCanvasSize, setFactionColors } from './canvas.js';
import { handleGameStatusUpdate } from './gameStatusUpdateHandler.js';
import inform from './inform.js';
import { initScoreBoard } from './scoreboard.js';
function handle(message, send) {
    switch (message.type) {
        case MessageType.arena_created:
            return handleArenaCreated(message);
        case MessageType.game_status:
            return handleGameStatusUpdate(message, send);
        case MessageType.game_started:
            return handleGameStarted(message);
        case MessageType.player_joined:
            return inform(`player ${message.playerName} joined`);
        case MessageType.player_left:
            return inform(`player ${message.playerName} left`);
        case MessageType.player_unit_list:
            return console.log(message.units);
        case MessageType.ping:
            // do nothing  
            return;
        default:
            console.error(message);
    }
}
function handleArenaCreated(message) {
    inform(`arena created, you can invite your friends to the ${message.arenaId}`);
}
function handleGameStarted(message) {
    inform(`Game Started. It's worth knowing that ${getMapEdgeMessage(message.features.edge)}`);
    setCanvasSize(message.dimensions);
    setFactionColors(message.factions);
    initScoreBoard(message.factions);
}
function getMapEdgeMessage(edgeType) {
    switch (edgeType) {
        case EdgeType.wall:
            return `the map's edge is a wall`;
        case EdgeType.death:
            return `you need to be careful not to fall off the map`;
        case EdgeType.loop:
            return `the world is round`;
    }
}
export default handle;
