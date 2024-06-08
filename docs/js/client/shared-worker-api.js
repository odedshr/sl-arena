let callbackCount = 0;
const callbacks = {};
function handleCallbacks(event) {
    const message = (typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data);
    if (message.callback && callbacks[message.callback]) {
        callbacks[message.callback](message);
        delete callbacks[message.callback];
    }
}
function handleInstruction(event) {
    console.log('>>> got instruction:', event);
}
// This is a fallback for browsers that don't support SharedWorker (IE
function noServerHandler(event) {
    let worker = new SharedWorker('./js/client/shared-worker.js').port;
    worker.addEventListener('message', handleInstruction);
    worker.start();
    worker.postMessage({ type: 'register_server' });
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
                    worker.postMessage(instruction);
                }
            });
        }
        else {
            reject('Your browser does not support Shared Web Workers.');
        }
    });
}
export default connect;
