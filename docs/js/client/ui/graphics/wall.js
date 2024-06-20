import getImage from './canvas-image.js';
const CELL_SIZE = 16;
const images = {
    0: getImage('walls/spr_standalone_pole.png'), // 0000 no walls around
    1: getImage('walls/spr_back_front_fence_ending.png'), // 0001 north
    10: getImage('walls/spr_left_front_fence_ending.png'), // 0010 east
    11: getImage('walls/spr_front_fence_left_backcorner.png'), // 0011 north + east
    100: getImage('walls/spr_up_front_fence_ending.png'), // 0100 south
    101: getImage('walls/spr_side_fence.png'), // 0101 south + north
    110: getImage('walls/spr_front_fence_left_corner.png'), // 0110 south + east
    111: getImage('walls/spr_left_side_fence_three-intersection.png'), // 0111 south + east + north
    1000: getImage('walls/spr_right_front_fence_ending.png'), // 1000 west
    1001: getImage('walls/spr_front_fence_right_backcorner.png'), // 1001 west + north
    1010: getImage('walls/spr_front_fence.png'), // 1010 west + east
    1011: getImage('walls/spr_front_fence_back_three-intersection.png'), // 1011 west + east + north
    1100: getImage('walls/spr_front_fence_right_corner.png'), // 1100 west + south
    1101: getImage('walls/spr_right_side_fence_three-intersection.png'), // 1101 west + south + north
    1110: getImage('walls/spr_front_fence_three-intersection.png'), // 1110 west + south + east
    1111: getImage('walls/spr_fence_four-intersection.png'), // 1111 west + south + east + north
};
function drawWalls(ctx, obstacles) {
    obstacles.forEach((row, y) => row.forEach((cell, x) => {
        if (cell > 0) {
            ctx.drawImage(images[cell], x * CELL_SIZE, y * CELL_SIZE);
        }
    }));
}
export default drawWalls;
