import { MessageType } from '../../common/Messages/Message.js';
import { startSharedWorkerServer, WORKER_URL } from './server.js';
let callbackCount = 0;
const callbacks = {};
function handleCallbacks(event) {
    const message = (typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data);
    if (message.callback && callbacks[message.callback]) {
        callbacks[message.callback](message);
        delete callbacks[message.callback];
    }
}
function handleNoServer(event) {
    const message = event.data;
    if (message.type === MessageType.operation_failed && message.reason === 'not_connected') {
        startSharedWorkerServer();
    }
}
function connect() {
    if (!window.SharedWorker) {
        throw Error('Your browser does not support Shared Web Workers.');
    }
    callbackCount = 0;
    return new Promise(resolve => {
        let worker = new SharedWorker(WORKER_URL).port;
        worker.addEventListener('message', handleCallbacks);
        worker.addEventListener('message', handleNoServer);
        worker.start();
        resolve({
            setMessageHandler: (handler) => worker.addEventListener('message', handler),
            setCloseHandler: (handler) => worker.addEventListener('close', handler),
            sendInstruction: (instruction, callback) => {
                if (callback) {
                    callbacks[++callbackCount] = callback;
                    instruction.callback = callbackCount;
                }
                worker.postMessage(Object.assign({ isInstruction: true }, instruction));
            }
        });
    });
}
export default connect;
