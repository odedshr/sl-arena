import { SendMethod } from '../common/Instructions/Instruction.js';
import { MessageType, Message, GameStateMessage, GameStartedMessage, ArenaCreatedMessage } from '../common/Messages/Message.js';
import { EdgeType } from '../common/types/Arena.js';
import { setCanvasSize, setFactionColors } from './canvas.js';
import { handleGameStatusUpdate } from './gameStatusUpdateHandler.js';
import inform from './inform.js';
import { initScoreBoard } from './scoreboard.js';

function handle(message: Message, send: SendMethod) {
  switch (message.type) {
    case MessageType.arena_created:
      return handleArenaCreated(message as ArenaCreatedMessage);
    case MessageType.game_status:
      return handleGameStatusUpdate(message as GameStateMessage, send);
    case MessageType.game_started:
      return handleGameStarted(message as GameStartedMessage);
    case MessageType.player_joined:
      return inform(`player ${message.playerName} joined`);
    case MessageType.player_left:
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

function handleArenaCreated(message: ArenaCreatedMessage) {
  inform(`arena created, you can invite your friends to the ${message.arenaId}`);
}


function handleGameStarted(message: GameStartedMessage) {
  inform(`Game Started. It's worth knowing that ${getMapEdgeMessage(message.features.edge)}`);

  setCanvasSize(message.dimensions);
  setFactionColors(message.factions);
  initScoreBoard(message.factions);
}

function getMapEdgeMessage(edgeType: EdgeType) {
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