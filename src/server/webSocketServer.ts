import http from 'http';
import WebSocket, { WebSocketServer, AddressInfo } from 'ws';

let connectionCount = 0;

function startWSServer(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
  onConnected: (userId: number, send: (message: string) => void) => void,
  onMessage: (userId: number, clientMessage: string) => void,
  onDisconnected: (userId: number) => void,
  onError: (error: Error) => void
) {
  const wss = new WebSocketServer({ server });

  const addressInfo = server.address() as AddressInfo;
  console.log(`WebSocket server is running on wss://${addressInfo.address === '::1' ? 'localhost' : addressInfo.address}:${addressInfo.port}`);

  wss.on('connection', (ws) => {
    const userId = ++connectionCount;

    onConnected(userId, (message: string) => ws.send(message));

    ws.on('message', (clientMessage: string) => onMessage(userId, clientMessage));

    ws.on('close', () => onDisconnected(userId));

    ws.on('error', onError);
  });
}

export default startWSServer;