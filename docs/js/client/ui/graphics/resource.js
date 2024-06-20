import getImage from './canvas-image.js';
const resources = [
    getImage('resources/small_chest_opening.png')
];
const CELL_SIZE = 16;
function drawResources(ctx, resources) {
    resources.forEach(resource => drawResource(ctx, resource.position));
}
function drawResource(ctx, position) {
    const x = position.x * CELL_SIZE;
    const y = position.y * CELL_SIZE;
    ctx.drawImage(resources[0], 0, 0, 34, 34, x, y, CELL_SIZE, CELL_SIZE);
}
export { drawResources, drawResource };
