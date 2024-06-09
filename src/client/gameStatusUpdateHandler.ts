import { InstructionType, SendMethod, UnitCommand } from '../common/Instructions/Instruction.js';
import { GameStateMessage } from '../common/Messages/Message.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { ActionableUnit, Unit, UnitType } from '../common/types/Units.js';
import { draw } from './canvas.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js'
import { getPlayerName, updateScoreBoard } from './scoreboard.js';
import inform from './inform.js';

type Handler = (units: Unit[], playerId: number, resources: number) => UnitCommand[];

let handle: Handler = defaultHandler

function setHandler(handler: Handler) {
  handle = handler;
}

function handleGameStatusUpdate(message: GameStateMessage, send: SendMethod) {
  const { playerId, resources, units, status } = message;
  switch (status) {
    case ArenaStatus.started:
      draw(units);
      updateScoreBoard(units);

      const commands = handle(units, playerId, resources);
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