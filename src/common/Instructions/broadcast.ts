import { Message } from '../Messages/Message.js';
import { Arena } from '../types/Arena.js';
import { PlayerType } from '../types/Player.js';

function broadcast(arena: Arena, message: Message, senderId: number, callback?: number) {
  Object.values(arena.players)
    .filter(player => player.type === PlayerType.human)
    .forEach(player => player.send((senderId === player.id) ? { callback, ...message } : message));
}

export default broadcast;