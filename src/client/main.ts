import { Message } from '../common/Messages/Message.js';
import connect from './shared-worker/client.js';

import getControls from './ui/controls.js';
import initDropCodeZone from './ui/drop-code-handler.js';
import inform from './ui/inform.js';
import handle from './message-handler.js';

function initInterface() {
  //@ts-ignore
  window.sl = { connect: connectToServer };
}

async function connectToServer(url: string) {
  const { setMessageHandler, sendInstruction, setCloseHandler } = await connect();

  const controls = getControls(sendInstruction);;
  //@ts-ignore
  window.sl = controls;
  inform('Connected to server, please check `sl` namespace for new options');

  setMessageHandler((event) => handle((typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data) as Message, sendInstruction));

  setCloseHandler(() => {
    console.log('Disconnected from the server');
    initInterface();
  });

  initDropCodeZone(controls.onUpdate);
}

async function init() {
  try {
    await connectToServer(`${location.protocol.replace('/http/', 'ws')}://${location.hostname}:${location.port}`);
  }
  catch (e) {
    inform(`Welcome.\nConnect to a server by typing 'sl.connect("ws://${location.hostname}:${location.port}")' in your console`);
  }
}

init();
