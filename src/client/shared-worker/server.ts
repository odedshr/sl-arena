import { Instruction } from '../../common/Instructions/Instruction.js';
import handle from '../../common/Instructions/instructionHandler.js';
import { Message, MessageType, PingMessage, SendMethod } from '../../common/Messages/Message.js';
import { INTERVAL, KEEP_ALIVE } from '../../common/config.js';
import updateState from '../../common/statusUpdaters/stateUpdater.js';

type WrappedInstruction = Instruction & { clientId: number };
type ConnectToServerMessage = { type: 'server_connect', clientId: number };

const WORKER_URL = `${location.href.replace(/\/.*\.html/, '')}js/client/shared-worker/worker.js`;

function startSharedWorkerServer() {
  const users: { [userId: number]: { send: SendMethod, heartbeat: NodeJS.Timeout } } = {};

  let worker = new SharedWorker(WORKER_URL).port;
  worker.start();
  worker.postMessage({ type: 'register_server' });

  worker.addEventListener('message', (event: MessageEvent<any>) => {
    if (event.data.type === 'operation_failed' && event.data.reason === 'not_connected') {
      return;
    }

    if (event.data.type === 'client_connect') {
      const { clientId } = event.data as ConnectToServerMessage;
      users[clientId] = {
        send: (content: Message) => worker.postMessage({ target: clientId, content }),
        heartbeat: setInterval(() => users[clientId].send({ type: MessageType.ping } as PingMessage), KEEP_ALIVE),
      };
      console.log(`%cNew client user-${clientId} connected`, 'background-color:black;color:white;font-family:courier;width:100%;');
      return;
    }

    const wrappedInstruction = (event.data as WrappedInstruction);
    handle(event.data as Instruction, wrappedInstruction.clientId, users[+wrappedInstruction.clientId].send)
  });

  setInterval(updateState, INTERVAL);
}

export default startSharedWorkerServer;
export { WORKER_URL, startSharedWorkerServer };