import { InstructionType, SendMethod, UnitCommand } from '../common/Instructions/Instruction.js';
import { GameStateMessage } from '../common/Messages/Message.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { Unit } from '../common/types/Units.js';
import { draw } from './canvas.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js'
import { updateScoreBoard } from './scoreboard.js';

type Handler = (units: Unit[], playerId: number, resources: number) => UnitCommand[];

let handle: Handler = defaultHandler

function setHandler(handler: Handler) {
  handle = handler;
}

function handleGameStatusUpdate(message: GameStateMessage, send: SendMethod) {
  const { playerId, resources, units, status } = message;
  if (status === ArenaStatus.started) {
    draw(units);
    updateScoreBoard(units);

    const commands = handle(units, playerId, resources);
    if (commands.length) {
      send({
        type: InstructionType.unit_command,
        commands
      });
    }
  }
}


export { handleGameStatusUpdate, setHandler }