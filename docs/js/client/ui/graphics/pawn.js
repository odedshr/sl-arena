import { Direction, UnitAction } from '../../../common/types/Units.js';
import getImage from './canvas-image.js';
import { drawEllipse } from './shapes.js';
const moveLeft = getImage('pawn/move/spr_player_left_move.png');
const moveRight = getImage('pawn/move/spr_player_right_move.png');
const moveUp = getImage('pawn/move/spr_player_back_move.png');
const moveDown = getImage('pawn/move/spr_player_front_move.png');
const attackLeft = getImage('pawn/attack/spr_player_left_attack.png');
const attackRight = getImage('pawn/attack/spr_player_right_attack.png');
const attackUp = getImage('pawn/attack/spr_player_back_attack.png');
const attackDown = getImage('pawn/attack/spr_player_front_attack.png');
const idleLeft = getImage('pawn/idle/spr_player_left_idle.png');
const idleRight = getImage('pawn/idle/spr_player_right_idle.png');
const idleUp = getImage('pawn/idle/spr_player_back_idle.png');
const idleDown = getImage('pawn/idle/spr_player_front_idle.png');
const dead = getImage('pawn/hit/spr_player_death.png');
const spriteMap = {
    [UnitAction.move]: {
        [Direction.north]: moveUp,
        [Direction.south]: moveDown,
        [Direction.northEast]: moveRight,
        [Direction.east]: moveRight,
        [Direction.southEast]: moveRight,
        [Direction.northWest]: moveLeft,
        [Direction.west]: moveLeft,
        [Direction.southWest]: moveLeft,
    },
    [UnitAction.attack]: {
        [Direction.north]: attackUp,
        [Direction.south]: attackDown,
        [Direction.northEast]: attackRight,
        [Direction.east]: attackRight,
        [Direction.southEast]: attackRight,
        [Direction.northWest]: attackLeft,
        [Direction.west]: attackLeft,
        [Direction.southWest]: attackLeft,
    },
    [UnitAction.idle]: {
        [Direction.north]: idleUp,
        [Direction.south]: idleDown,
        [Direction.northEast]: idleRight,
        [Direction.east]: idleRight,
        [Direction.southEast]: idleRight,
        [Direction.northWest]: idleLeft,
        [Direction.west]: idleLeft,
        [Direction.southWest]: idleLeft,
    },
    [UnitAction.dead]: {
        [Direction.north]: dead,
        [Direction.south]: dead,
        [Direction.northEast]: dead,
        [Direction.east]: dead,
        [Direction.southEast]: dead,
        [Direction.northWest]: dead,
        [Direction.west]: dead,
        [Direction.southWest]: dead,
    },
};
const SEQ_LENGTH = 6;
const CELL_SIZE = 16;
const FRAME_WIDTH = 64;
let frameCount = 0;
function drawPawn(ctx, position, action, direction, color) {
    const x = position.x * CELL_SIZE;
    const y = position.y * CELL_SIZE;
    if (!action) {
        console.error('pawn with no action');
        action = UnitAction.idle;
    }
    if (!direction) {
        console.error('pawn with no direction');
        direction = Direction.north;
    }
    drawEllipse(ctx, x + CELL_SIZE / 2, y + CELL_SIZE * 0.9, CELL_SIZE / 3, CELL_SIZE / 8, color);
    ctx.drawImage(spriteMap[action][direction], FRAME_WIDTH * getFrame(), 0, 64, 64, x - CELL_SIZE / 2, y - CELL_SIZE / 2, CELL_SIZE * 2, CELL_SIZE * 2);
}
function getFrame() {
    if (frameCount === SEQ_LENGTH * 100) {
        frameCount = 0;
    }
    return (Math.floor(frameCount++ / 100) * 100 % SEQ_LENGTH);
}
export default drawPawn;
