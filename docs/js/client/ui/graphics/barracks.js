import getImage from './canvas-image.js';
const image = getImage('barracks.png');
const SEQ_LENGTH = 4;
const CELL_SIZE = 16;
let frameCount = 0;
function drawBarracks(ctx, barracks, colors) {
    barracks.forEach((barrack, i) => drawBarrack(ctx, barrack.position, i, colors[barrack.owner]));
}
function drawBarrack(ctx, position, i, color) {
    const x = position.x * CELL_SIZE;
    const y = position.y * CELL_SIZE;
    ctx.drawImage(image, CELL_SIZE * getFrame(), CELL_SIZE * i, // offset in source
    CELL_SIZE, CELL_SIZE, // crop section in target
    x, y, // position in output
    CELL_SIZE, CELL_SIZE); // size on output
}
function getFrame() {
    if (frameCount === SEQ_LENGTH * 100) {
        frameCount = 0;
    }
    return (Math.floor(frameCount++ / 100) % SEQ_LENGTH);
}
export { drawBarracks, drawBarrack };
