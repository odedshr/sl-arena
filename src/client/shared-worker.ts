// import { InstructionType } from '../common/Instructions/Instruction';
// import { MessageType, ServerStatusMessage } from '../common/Messages/Message';

// shared-worker.ts
let server: MessagePort | undefined;

console.log('here!!');

self.addEventListener('connect', (e: Event) => {
  const port = (e as MessageEvent).ports[0];

  console.log('bbb');

  if (!server) {
    return port.postMessage({ type: 'server_status', status: 'not_connected' });
  }

  port.addEventListener('message', (event: MessageEvent) => {
    const instruction = event.data;

    console.log(instruction);

    if (!server) {
      if (instruction.type !== 'register_server') {
        server = port;
        return port.postMessage({ type: 'server_status', status: 'registered' });
      } else {
        console.log('ccc');
        return port.postMessage({ type: 'server_status', status: 'not_connected' });
      }
    }

    port.postMessage(instruction);
  });

  port.start();
});