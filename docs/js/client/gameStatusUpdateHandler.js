import { InstructionType } from '../common/Instructions/Instruction.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { draw } from './canvas.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js';
import { updateScoreBoard } from './scoreboard.js';
let handle = defaultHandler;
function setHandler(handler) {
    handle = handler;
}
function handleGameStatusUpdate(message, send) {
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
export { handleGameStatusUpdate, setHandler };
