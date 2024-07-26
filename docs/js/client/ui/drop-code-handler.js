var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import inform from './inform.js';
function initDropCodeZone(onUpdate) {
    const dropZone = document.body;
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('hover');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('hover');
    });
    dropZone.addEventListener('drop', (event) => {
        var _a;
        event.preventDefault();
        dropZone.classList.remove('hover');
        const files = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.files;
        if (files && files.length > 0) {
            processFile(files[0], onUpdate);
        }
    });
}
function processFile(file, onUpdate) {
    return __awaiter(this, void 0, void 0, function* () {
        if (file.type === 'text/javascript') {
            processText(yield readFile(file), onUpdate);
        }
        else {
            console.log(`Please drop a javascript file (uploaded file was ${file.type})`);
        }
    });
}
function readFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = (event) => {
                var _a;
                const text = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                resolve(text);
            };
            reader.readAsText(file);
        });
    });
}
function processText(text, onUpdate) {
    try {
        const handler = eval(text);
        if (typeof (handler) !== 'function') {
            throw new Error('Not a function');
        }
        onUpdate(handler);
        inform('Handler updated:\n' + text);
    }
    catch (e) {
        console.error(`
Input file is not a valid handler code.
It should match the signature \`(units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => UnitCommand[]\`.
File content: ${text}
Exception: ${e}`);
        return;
    }
}
export default initDropCodeZone;
