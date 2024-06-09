import { InstructionType } from '../common/Instructions/Instruction.js';
import { ArenaStatus } from '../common/types/Arena.js';
import { UnitType } from '../common/types/Units.js';
import { draw } from './canvas.js';
import { default as defaultHandler } from '../common/ai/defaultHandler.js';
import { getPlayerName, updateScoreBoard } from './scoreboard.js';
import inform from './inform.js';
let handle = defaultHandler;
function setHandler(handler) {
    handle = handler;
}
function handleGameStatusUpdate(message, send) {
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
            inform(`Game over. ${findWinner(units)} won.`);
            return;
    }
}
function findWinner(units) {
    const [winningBarrack] = units.filter(unit => unit.type === UnitType.barrack);
    return getPlayerName(winningBarrack.owner);
}
export { handleGameStatusUpdate, setHandler };
