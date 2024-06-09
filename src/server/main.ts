
import { Message, MessageType, PingMessage, SendMethod } from '../common/Messages/Message.js';
import { Instruction, InstructionType } from '../common/Instructions/Instruction.js';

import updateState from '../common/statusUpdaters/stateUpdater.js';
import startHttpServer from './httpServer.js';
import startWSServer from './wsServer.js';
import handle from '../common/Instructions/instructionHandler.js';
import { INTERVAL, KEEP_ALIVE } from '../common/config.js';

const users: { [userId: number]: { send: SendMethod, heartbeat: NodeJS.Timeout } } = {};
const hostname = 'localhost';
const port = 3000;

async function setupServer(hostname: string, port: number) {
  const httpServer = await startHttpServer(hostname, port);

  startWSServer(
    httpServer,

    //onConnected
    (id: number, send: (message: string) => void) => {
      users[id] = {
        send: (message: Message) => send(JSON.stringify(message)),
        heartbeat: setInterval(() => users[id].send({ type: MessageType.ping } as PingMessage), KEEP_ALIVE),
      };
      console.log(`New client user-${id} connected`);
    },

    //onMessageFromClient
    (id: number, clientMessage: string) => handle(JSON.parse(clientMessage) as Instruction, id, users[id].send),

    //onDisconnect
    (id: number) => {
      console.log(`closing connection user-${id}`);
      handle({ type: InstructionType.arena_leave }, id, users[id].send);
      clearInterval(users[id].heartbeat);
      delete users[id];
    },

    //onError
    (error: Error) => console.error(`WebSocket error: ${error}`)
  )
}

setInterval(updateState, INTERVAL);
setupServer(hostname, port);