import { Instruction } from "../common/Instructions/Instruction.js";
import { Message } from '../common/Messages/Message.js';

type MessageHandler = (this: WebSocket, ev: MessageEvent<any>) => any;

type ServerControls = {
  setMessageHandler: (handler: MessageHandler) => void;
  setCloseHandler: (handler: () => void) => void;
  sendInstruction: (instruction: Instruction, callback?: Callback) => void;
}

type Callback = (message: Message) => void;
let callbackCount = 0;
const callbacks: { [key: string]: Callback } = {};
function handleCallbacks(event: MessageEvent<any>) {
  const message = JSON.parse(event.data) as Message;
  if (message.callback && callbacks[message.callback]) {
    callbacks[message.callback](message);
    delete callbacks[message.callback];
  }
}

function connect(url: string): Promise<ServerControls> {
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