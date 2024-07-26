import { StatusUpdateHandler } from '../../common/Instructions/Instruction.js';
import inform from './inform.js';

function initDropCodeZone(onUpdate: (handler:StatusUpdateHandler)=>void) {
    const dropZone = document.body as HTMLElement;

    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropZone.classList.add('hover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('hover');
    });

    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        dropZone.classList.remove('hover');
        
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            processFile(files[0], onUpdate)
        }
    });
}

async function processFile(file:File, onUpdate: (handler:StatusUpdateHandler)=>void) {
    if (file.type === 'text/javascript') {
        processText(await readFile(file), onUpdate);
    } else {
        console.log(`Please drop a javascript file (uploaded file was ${file.type})`);
    }
}

async function readFile(file: File) {
    return new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            resolve(text);
        };
        reader.readAsText(file);
    });
}

function processText(text: string, onUpdate: (handler:StatusUpdateHandler)=>void) {
    try {
        const handler = eval(text) as StatusUpdateHandler
        
        if(typeof(handler) !== 'function') {
            throw new Error('Not a function');
        }

        onUpdate(handler);
        inform('Handler updated:\n'+text);
    } catch (e) {
        console.error(`
Input file is not a valid handler code.
It should match the signature \`(units: Unit[], playerId: number, resources: number, dimensions: Dimensions, features: Features) => UnitCommand[]\`.
File content: ${text}
Exception: ${e}`);
        return;
    }
}

export default initDropCodeZone;