var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import connect from './shared-worker-api.js';
import getControls from './controls.js';
import inform from './inform.js';
import handle from './messageHandler.js';
function initInterface() {
    //@ts-ignore
    window.sl = { connect: connectToServer };
}
function connectToServer(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { setMessageHandler, sendInstruction, setCloseHandler } = yield connect();
        //@ts-ignore
        window.sl = getControls(sendInstruction);
        inform('Connected to server, please check `sl` namespace for new options');
        setMessageHandler((event) => handle((typeof (event.data) === 'string' ? JSON.parse(event.data) : event.data), sendInstruction));
        setCloseHandler(() => {
            console.log('Disconnected from the server');
            initInterface();
        });
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield connectToServer(`${location.protocol.replace('/http/', 'ws')}://${location.hostname}:${location.port}`);
        }
        catch (e) {
            inform(`Welcome.\nConnect to a server by typing 'sl.connect("ws://${location.hostname}:${location.port}")' in your console`);
        }
    });
}
init();
