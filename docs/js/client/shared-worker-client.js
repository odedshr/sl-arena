import { MessageType } from '../common/Messages/Message.js';
import startSharedWorkerServer from './shared-worker-server.js';
let callbackCount = 0;
const callbacks = {};
function handleCallbacks(event) {
    const message = (typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data);
    if (message.callback && callbacks[message.callback]) {
        callbacks[message.callback](message);
        delete callbacks[message.callback];
    }
}
function noServerHandler(event) {
    const message = event.data;
    if (message.type === MessageType.operation_failed && message.reason) {
        startSharedWorkerServer();
    }
}
function connect() {
    callbackCount = 0;
    return new Promise((resolve, reject) => {
        if (!!window.SharedWorker) {
            let worker = new SharedWorker('./js/client/shared-worker.js').port;
            worker.addEventListener('message', handleCallbacks);
            worker.addEventListener('message', noServerHandler);
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
        }
        else {
            reject('Your browser does not support Shared Web Workers.');
        }
    });
}
export default connect;
