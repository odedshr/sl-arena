import { InstructionType, SendInstructionMethod, StatusUpdateHandler } from '../common/Instructions/Instruction.js';
import { GameStateMessage } from '../common/Messages/Message.js';
import { ArenaStatus, Dimensions, Features } from '../common/types/Arena.js';
import { ActionableUnit, Unit } from '../common/types/Units.js';
import { draw } from './ui/canvas.js';
import { draw as drawMinimap } from './ui/minimap.js';
import { draw as drawGraph } from './ui/graph.js';
import { updateScoreBoard } from './ui/score-board.js';
import inform from './ui/inform.js';
import { getMovingUnits, updateState } from './ui/position-tracker.js';

let handle: StatusUpdateHandler = (units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => ([])

function setHandler(handler: StatusUpdateHandler) {
  handle = handler;
}

function handleGameStatusUpdate(statusUpdate: GameStateMessage, send: SendInstructionMethod) {
  const { playerId, resources, units, stats, status, dimensions, features, message } = statusUpdate;

  updateState(units, playerId);
  const movingUnits = getMovingUnits();

  if (status!==ArenaStatus.init) {
    draw(movingUnits);
    drawMinimap(movingUnits);
    drawGraph(stats);
    updateScoreBoard(stats);
  }
  
  if (message) {
    inform(message);
  }

  if (status===ArenaStatus.started) {
    const commands = handle(units, playerId, resources, dimensions, features);
    if (commands && commands.length) {
      send({
        type: InstructionType.unit_command,
        commands
      });
    }
  }
}

export { handleGameStatusUpdate, setHandler };