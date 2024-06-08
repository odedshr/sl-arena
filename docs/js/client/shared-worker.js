"use strict";
let server;
self.addEventListener('connect', (e) => {
    const port = e.ports[0];
    console.log('Shared worker: connection established', e);
    if (!server) {
        port.postMessage({ type: 'server_status', status: 'not_connected' });
    }
    port.addEventListener('message', (event) => {
        const instruction = event.data;
        console.log('Shared worker: received message', instruction.type, server);
        if (!server) {
            if (instruction.type === 'register_server') {
                server = port;
            }
            return port.postMessage({ type: 'server_status', status: server ? 'registered' : 'not_connected' });
        }
        server.postMessage(instruction);
    });
    port.addEventListener('close', () => {
        console.log('Shared worker: connection closed');
        if (port === server) {
            server = undefined;
        }
    });
    port.start();
});
