let callbackCount = 0;
const callbacks = {};
function handleCallbacks(event) {
    const message = JSON.parse(event.data);
    if (message.callback && callbacks[message.callback]) {
        callbacks[message.callback](message);
        delete callbacks[message.callback];
    }
}
function connect(url) {
    return new Promise(resolve => {
        const ws = new WebSocket(url);
        ws.addEventListener("message", handleCallbacks);
        ws.addEventListener("open", () => {
            resolve({
                setMessageHandler: (handler) => ws.addEventListener("message", handler),
                setCloseHandler: (handler) => ws.addEventListener("close", handler),
                sendInstruction: (instruction, callback) => {
                    if (callback) {
                        callbacks[++callbackCount] = callback;
                        instruction.callback = callbackCount;
                    }
                    ws.send(JSON.stringify(instruction));
                }
            });
        });
    });
}
export default connect;
