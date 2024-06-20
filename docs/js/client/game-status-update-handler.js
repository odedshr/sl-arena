import { InstructionType } from '../common/Instructions/Instruction.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { UnitType } from '../common/types/Units.js';
import { draw } from './ui/canvas.js';
import { draw as drawMinimap } from './ui/minimap.js';
import { draw as drawGraph } from './ui/graph.js';
import { default as defaultHandler } from '../common/ai/default-handler.js';
import { getPlayerName, updateScoreBoard } from './ui/score-board.js';
import inform from './ui/inform.js';
import { getMovingUnits, updateState } from './ui/position-tracker.js';
let handle = defaultHandler;
function setHandler(handler) {
    handle = handler;
}
function handleGameStatusUpdate(message, send) {
    const { playerId, resources, units, stats, status, dimensions, features } = message;
    updateState(units, playerId);
    const movingUnits = getMovingUnits();
    if (status !== ArenaStatus.init) {
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
            inform(`Game over. ${findWinner(units)} won.`);
            return;
    }
}
function findWinner(units) {
    const winningBarrack = units.find(unit => unit.type === UnitType.barrack);
    return winningBarrack ? getPlayerName(winningBarrack.owner) : 'No one';
}
export { handleGameStatusUpdate, setHandler };
