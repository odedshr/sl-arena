import { SendMethod } from '../Messages/Message.js';
import { Color } from './Color.js';
import { ActionableUnit } from './Units.js';

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
  units: { [unitId: string]: ActionableUnit };
  resources: number;
};

export default Player;
export { DetailedPlayer, PlayerType };