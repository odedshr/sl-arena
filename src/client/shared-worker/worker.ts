type Message = { type: string, isInstruction?: boolean, target: number, content: any }

let server: MessagePort | undefined;
const clients: { [userId: number]: MessagePort } = {};
let connectionCount = 0;

self.addEventListener('connect', (e: Event) => {
  const port = (e as MessageEvent).ports[0];
  const clientId = connectionCount++
  clients[clientId] = port;

  console.log(`user ${clientId} connected`);

  // for any client trying to connect before server was initialized, send a message letting them know
  if (!server) {
    port.postMessage({ type: 'operation_failed', reason: 'not_connected' });
  } else {
    server.postMessage({ type: 'client_connect', clientId });
  }

  port.addEventListener('message', (event: MessageEvent) => {
    const message = event.data as Message;

    if (!server) {
      if (message.type === 'register_server') {
        console.log(`user ${clientId} is now the server`);
        server = port;
        server.onmessageerror = () => {
          console.log('Shared worker: connection closed');
          if (port === server) {
            server = undefined;
          }
        }
        Object.keys(clients)
          .filter(id => (+id !== clientId)) // don't connect the server itself
          .forEach(clientId => server?.postMessage({ type: 'client_connect', clientId }));
        return;
      }

      return port.postMessage({ type: 'operation_failed', reason: 'not_connected' });
    }

    if (message.isInstruction) {
      server.postMessage({ clientId, ...message });
    } else {
      clients[message.target].postMessage(message.content);
    }
  });

  port.start();
});