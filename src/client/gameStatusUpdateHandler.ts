import { InstructionType, SendInstructionMethod, StatusUpdateHandler } from '../common/Instructions/Instruction.js';
import { GameStateMessage } from '../common/Messages/Message.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { ActionableUnit, UnitType } from '../common/types/Units.js';
import { draw } from './ui/canvas.js';
import { draw as drawMinimap } from './ui/minimap.js';
import { draw as drawGraph } from './ui/graph.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js'
import { getPlayerName, updateScoreBoard } from './ui/scoreboard.js';
import inform from './ui/inform.js';
import { getMovingUnits, updateState } from './ui/position-tracker.js';

let handle: StatusUpdateHandler = defaultHandler

function setHandler(handler: StatusUpdateHandler) {
  handle = handler;
}

function handleGameStatusUpdate(message: GameStateMessage, send: SendInstructionMethod) {
  const { playerId, resources, units, stats, status, dimensions, features } = message;

  updateState(units, playerId);
  const movingUnits = getMovingUnits();

  if (status!==ArenaStatus.init) {
    draw(movingUnits);
    drawMinimap(movingUnits);
    drawGraph(stats);
    updateScoreBoard(stats);
  }
  switch (status) {
    case ArenaStatus.started:
      const commands = handle(units, playerId, resources, dimensions, features);
      if (commands.length) {
        send({
          type: InstructionType.unit_command,
          commands
        });
      }
      return;

    case ArenaStatus.finished:
      inform(`Game over. ${findWinner(units as ActionableUnit[])} won.`);
      return
  }
}

function findWinner(units: ActionableUnit[]) {
  const winningBarrack = units.find(unit => unit.type === UnitType.barrack);
  return winningBarrack ? getPlayerName(winningBarrack.owner) : 'No one';
}


export { handleGameStatusUpdate, setHandler };