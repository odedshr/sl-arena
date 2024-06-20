import { colors } from './types/Color.js';
import { Direction } from './types/Units.js';
const fightingAdjectives = [
    'aggressive', 'brave', 'courageous', 'dauntless', 'fearless',
    'fierce', 'intrepid', 'mighty', 'powerful', 'relentless',
    'rugged', 'stalwart', 'tenacious', 'unyielding', 'valiant',
    'vigilant', 'warlike', 'fighting', 'ferocious', 'invincible',
    'dark', 'light', 'bright'
];
const material = [
    'aluminum', 'copper', 'gold', 'iron', 'lead', 'radioactive',
    'nickel', 'platinum', 'silver', 'titanium', 'mercury', 'bronze', 'stone', 'wooden'
];
const greekLetters = [
    'alpha', 'beta', 'gamma', 'delta', 'epsilon',
    'zeta', 'eta', 'theta', 'iota', 'kappa',
    'lambda', 'mu', 'nu', 'xi', 'omicron',
    'pi', 'rho', 'sigma', 'tau', 'upsilon',
    'phi', 'chi', 'psi', 'omega'
];
const fightingPlaceAdjectives = [
    'Chaotic',
    'Violent',
    'Turbulent',
    'Hostile',
    'Brutal',
    'Dangerous',
    'Intense',
    'Bloodied',
    'Combat-ridden',
    'Fierce',
    'Tumultuous',
    'Destructive',
    'Anarchic',
    'Savage',
    'Belligerent',
    'War-torn',
    'Perilous',
    'Ravaged',
    'Conflict-ridden',
    'Treacherous'
];
const fightLocations = [
    'arena', 'battlefield', 'coliseum', 'dojo', 'pit',
    'ring', 'stadium', 'cage', 'octagon', 'court',
    'field', 'hall', 'lair', 'zone', 'ground',
    'dungeon', 'stage', 'fortress', 'gauntlet', 'zone'
];
const armyDescriptors = [
    'faction',
    'militia',
    'battalion',
    'regiment',
    'brigade',
    'division',
    'legion',
    'troop',
    'squadron',
    'company',
    'platoon',
    'task force',
    'contingent',
    'unit',
    'force',
    'corps',
    'armada',
    'phalanx',
    'cadre',
    'garrison'
];
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
function getRandomArenaId() {
    return `${getRandomElement(fightingPlaceAdjectives)} ${getRandomElement(colors)} ${getRandomElement(fightLocations)}`;
}
function getRandomUnitId(type) {
    return `${getRandomElement(fightingAdjectives)} ${getRandomElement(colors)} ${getRandomElement(material)} ${type}`;
}
function getRandomFactionId() {
    return `${getRandomElement(fightingAdjectives)} ${getRandomElement(greekLetters)} ${getRandomElement(armyDescriptors)}`;
}
const directions = [Direction.north, Direction.northEast, Direction.east, Direction.southEast, Direction.south, Direction.southWest, Direction.west, Direction.northWest];
function getRandomDirection() {
    return getRandomElement(directions);
}
export { getRandomArenaId, getRandomUnitId, getRandomFactionId, getRandomDirection, colors };
