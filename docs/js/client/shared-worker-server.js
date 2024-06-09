import handle from '../common/Instructions/instructionHandler.js';
import { MessageType } from '../common/Messages/Message.js';
import { INTERVAL, KEEP_ALIVE } from '../common/config.js';
import updateState from '../common/statusUpdaters/stateUpdater.js';
function startSharedWorkerServer() {
    const users = {};
    let worker = new SharedWorker('./js/client/shared-worker.js').port;
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
            console.log(`New client user-${clientId} connected`);
            return;
        }
        const wrappedInstruction = event.data;
        if (!users[+wrappedInstruction.clientId].send) {
            console.log(wrappedInstruction, users);
        }
        else {
            handle(event.data, wrappedInstruction.clientId, users[+wrappedInstruction.clientId].send);
        }
    });
    setInterval(updateState, INTERVAL);
}
export default startSharedWorkerServer;
