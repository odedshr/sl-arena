import handle from '../../common/Instructions/instructionHandler.js';
import { MessageType } from '../../common/Messages/Message.js';
import { INTERVAL, KEEP_ALIVE } from '../../common/config.js';
import updateState from '../../common/stateUpdaters/stateUpdater.js';
const WORKER_URL = `${location.href.replace(/\/.*\.html/, '')}js/client/shared-worker/worker.js`;
const SERVER_CONSOLE_STYLE = 'background-color:black;color:white;font-family:courier;width:100%;';
function startSharedWorkerServer() {
    console.log('%cThis tab will serve as your server, don\'t close it while running the game!', SERVER_CONSOLE_STYLE);
    const users = {};
    let worker = new SharedWorker(WORKER_URL).port;
    worker.start();
    worker.postMessage({ type: 'register_server' });
    worker.addEventListener('message', (event) => {
        if (event.data.type === 'operation_failed' && event.data.reason === 'not_connected') {
            return;
        }
        if (event.data.type === 'client_connect') {
            const { clientId } = event.data;
            users[clientId] = {
                send: (content) => worker.postMessage({ target: clientId, content }),
                heartbeat: setInterval(() => users[clientId].send({ type: MessageType.ping }), KEEP_ALIVE),
            };
            console.log(`%cNew client user-${clientId} connected`, SERVER_CONSOLE_STYLE);
            return;
        }
        const wrappedInstruction = event.data;
        handle(event.data, wrappedInstruction.clientId, users[+wrappedInstruction.clientId].send);
    });
    setInterval(updateState, INTERVAL);
}
export default startSharedWorkerServer;
export { WORKER_URL, startSharedWorkerServer };
