import { MessageType } from '../common/Messages/Message.js';
import { FogOfWar } from '../common/types/Arena.js';
import { setCanvasSize, setFactionColors as setCanvasColors } from './ui/canvas.js';
import { handleGameStatusUpdate } from './game-status-update-handler.js';
import inform from './ui/inform.js';
import { setCanvasSize as setMiniMapSize, setFactionColors as setMiniMapColors } from './ui/minimap.js';
import { setFactionColors as setGraphColors } from './ui/graph.js';
import { initScoreBoard } from './ui/score-board.js';
import { initGrid } from './ui/position-tracker.js';
function handle(message, send) {
    switch (message.type) {
        case MessageType.arena_created:
            return handleArenaCreated(message);
        case MessageType.game_status:
            return handleGameStatusUpdate(message, send);
        case MessageType.game_started:
            return handleGameStarted(message);
        case MessageType.player_joined:
            return handleArenaJoined(message);
        case MessageType.player_left:
            setArenaName('');
            return inform(`player ${message.playerName} left`);
        case MessageType.player_unit_list:
            return console.log(message.units);
        case MessageType.operation_failed:
            if (message.reason !== 'not_connected') {
                inform(JSON.stringify(message));
            }
            return;
        case MessageType.ping:
            // do nothing  
            return;
        default:
            console.error(message);
    }
}
function handleArenaCreated(message) {
    inform(`arena created, you can invite your friends to the %c${message.arenaId}`, 'display:inline-block;background-color:darkblue;color:white;');
    const arenaNameElement = document.getElementById('arena-name');
    setArenaName(message.arenaId);
}
function handleArenaJoined(message) {
    inform(`player ${message.playerName} joined`);
    setArenaName(message.arenaId);
}
function setArenaName(name) {
    const arenaNameElement = document.getElementById('arena-name');
    if (arenaNameElement) {
        arenaNameElement.innerHTML = name;
    }
}
function handleGameStarted(message) {
    inform(message.startMessage);
    const { factions, dimensions } = message;
    const fogOfWar = message.features.fogOfWar;
    setFactionColors(factions);
    initScoreBoard(factions);
    setCanvasSize(dimensions);
    setMiniMapSize(dimensions);
    initGrid(dimensions, fogOfWar === FogOfWar.both || fogOfWar === FogOfWar.human);
}
function setFactionColors(factions) {
    const factionColor = factions.reduce((acc, faction) => { acc[faction.id] = faction.color; return acc; }, {});
    setCanvasColors(factionColor);
    setMiniMapColors(factionColor);
    setGraphColors(factionColor);
}
export default handle;
