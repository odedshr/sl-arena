import { PlayerType } from '../types/Player.js';
function broadcast(arena, message, senderId, callback) {
    Object.values(arena.players)
        .filter(player => player.type === PlayerType.human)
        .forEach(player => player.send((senderId === player.id) ? Object.assign({ callback }, message) : message));
}
export default broadcast;
