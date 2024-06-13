import { InstructionType, SendMethod, StatusUpdateHandler } from '../common/Instructions/Instruction.js';
import { GameStateMessage } from '../common/Messages/Message.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { ActionableUnit, UnitType } from '../common/types/Units.js';
import { draw } from './canvas.js';
import { draw as drawMinimap } from './minimap.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js'
import { getPlayerName, updateScoreBoard } from './scoreboard.js';
import inform from './inform.js';

let handle: StatusUpdateHandler = defaultHandler

function setHandler(handler: StatusUpdateHandler) {
  handle = handler;
}

function handleGameStatusUpdate(message: GameStateMessage, send: SendMethod) {
  const { playerId, resources, units, status, dimensions, features } = message;
  switch (status) {
    case ArenaStatus.started:
      draw(units);
      drawMinimap(units);
      updateScoreBoard(units);

      const commands = handle(units, playerId, resources, dimensions, features);
      if (commands.length) {
        send({
          type: InstructionType.unit_command,
          commands
        });
      }
      return;

    case ArenaStatus.finished:
      draw(units);
      updateScoreBoard(units);

      inform(`Game over. ${findWinner(units as ActionableUnit[])} won.`);
      return
  }
}

function findWinner(units: ActionableUnit[]) {
  const [winningBarrack] = units.filter(unit => unit.type === UnitType.barrack);
  return getPlayerName(winningBarrack.owner);
}


export { handleGameStatusUpdate, setHandler }