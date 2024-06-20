const BAR_WIDTH = 1;
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('graph');
const ctx = canvas.getContext('2d');
let factionColor = {};
const stack = [];
if (!ctx) {
    throw new Error('2D context not supported or canvas already initialized');
}
initCanvas();
function initCanvas() {
    const { width, height } = canvas.getBoundingClientRect();
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.scale(1, 1);
}
function setFactionColors(colors) { factionColor = colors; }
function draw(stats) {
    stack.push(stats);
    if ((stack.length * BAR_WIDTH) > canvas.width) {
        stack.shift();
    }
    refresh(ctx, stack);
}
function refresh(ctx, stack) {
    const { height } = canvas;
    ctx.clearRect(0, 0, canvas.width, height);
    stack.forEach((layer, col) => {
        const entries = Object.entries(layer);
        const sum = entries.reduce((acc, [_, count]) => acc + count, 0);
        let acc = 0;
        entries.forEach(([playerId, count]) => {
            ctx.fillStyle = factionColor[playerId];
            const part = height * (count / sum);
            ctx.fillRect(col, acc, BAR_WIDTH, acc + part);
            acc += part;
        });
    });
}
export { setFactionColors, draw };
