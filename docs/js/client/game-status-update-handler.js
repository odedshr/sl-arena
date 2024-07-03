import { InstructionType } from '../common/Instructions/Instruction.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { draw } from './ui/canvas.js';
import { draw as drawMinimap } from './ui/minimap.js';
import { draw as drawGraph } from './ui/graph.js';
import { updateScoreBoard } from './ui/score-board.js';
import inform from './ui/inform.js';
import { getMovingUnits, updateState } from './ui/position-tracker.js';
let handle = (units, playerId, resources, dimensions, features) => ([]);
function setHandler(handler) {
    handle = handler;
}
function handleGameStatusUpdate(statusUpdate, send) {
    const { playerId, resources, units, stats, status, dimensions, features, message } = statusUpdate;
    updateState(units, playerId);
    const movingUnits = getMovingUnits();
    if (status !== ArenaStatus.init) {
        draw(movingUnits);
        drawMinimap(movingUnits);
        drawGraph(stats);
        updateScoreBoard(stats);
    }
    if (message) {
        inform(message);
    }
    if (status === ArenaStatus.started) {
        const commands = handle(units, playerId, resources, dimensions, features);
        if (commands.length) {
            send({
                type: InstructionType.unit_command,
                commands
            });
        }
    }
}
export { handleGameStatusUpdate, setHandler };
