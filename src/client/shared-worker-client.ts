import { Instruction } from '../common/Instructions/Instruction.js';
import { Message, MessageType, OperationErrorMessage } from '../common/Messages/Message.js';
import startSharedWorkerServer from './shared-worker-server.js';

type MessageHandler = (ev: MessageEvent<any>) => any;
type Callback = (message: Message) => void;

type ServerControls = {
  setMessageHandler: (handler: MessageHandler) => void;
  setCloseHandler: (handler: () => void) => void;
  sendInstruction: (instruction: Instruction, callback?: Callback) => void;
}

let callbackCount = 0;
const callbacks: { [key: string]: Callback } = {};

function handleCallbacks(event: MessageEvent<any>) {
  const message = (typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data) as Message;
  if (message.callback && callbacks[message.callback]) {
    callbacks[message.callback](message);
    delete callbacks[message.callback];
  }
}

function noServerHandler(event: MessageEvent<any>) {
  const message = event.data as Message;
  if (message.type === MessageType.operation_failed && (message as OperationErrorMessage).reason) {
    startSharedWorkerServer();
  }
}

function connect(): Promise<ServerControls> {
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
          worker.postMessage({ isInstruction: true, ...instruction });
        }
      });
    } else {
      reject('Your browser does not support Shared Web Workers.');
    }
  });
}

export default connect;