import { Message, SendMethod } from '../Messages/Message';
import { Color } from './Color';
import { Unit } from './Units';

type Player = {
  id: number,
  name: string,
  color: Color,
};

enum PlayerType {
  human = 'human',
  ai = 'ai',
};

type DetailedPlayer = Player & {
  send: SendMethod;
  type: PlayerType;
  units: { [unitId: string]: Unit };
  resources: number;
};

export default Player;
export { DetailedPlayer, PlayerType };