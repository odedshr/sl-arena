import { Message } from '../../common/Messages/Message';
import { Arena } from '../../common/types/Arena';
import { PlayerType } from '../../common/types/Player';

function broadcast(arena: Arena, message: Message, senderId: number, callback?: number) {
  Object.values(arena.players)
    .filter(player => player.type === PlayerType.human)
    .forEach(player => player.send((senderId === player.id) ? { callback, ...message } : message));
}

export default broadcast;