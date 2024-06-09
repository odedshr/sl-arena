import Player from '../common/types/Player.js';
import { ActionableUnit, Unit, UnitAction } from '../common/types/Units.js';

let playerList: number[] = [];
let playerNameById: { [key: number]: string } = {};

function initScoreBoard(players: Player[]) {
  const list = document.getElementById('scoreboard') as HTMLUListElement;

  while (list.firstChild) {
    list.removeChild(list.firstChild);
  }

  players.forEach((player) => {
    playerList.push(player.id);
    playerNameById[player.id] = player.name;

    const listItem = document.createElement('li');
    listItem.classList.add('player-item');
    listItem.setAttribute('style', `--player-color : ${player.color}`)

    const playerName = document.createElement('div');
    playerName.classList.add('player-name');
    playerName.innerHTML = player.name

    const playerScore = document.createElement('div');
    playerScore.id = `player-${player.id}-score`;
    playerScore.classList.add('player-score');

    listItem.appendChild(playerName);
    listItem.appendChild(playerScore);
    list.appendChild(listItem);
  });
}

function updateScoreBoard(units: Unit[]) {
  const unitCountByPlayer: { [key: number]: number } = {};
  playerList.forEach(id => { unitCountByPlayer[id] = 0; });

  units.forEach((unit) => {
    const actionableUnit = unit as ActionableUnit;
    const playerId = actionableUnit.owner;
    if (playerId !== undefined && actionableUnit.action !== UnitAction.dead) {
      unitCountByPlayer[playerId] = (unitCountByPlayer[playerId] || 0) + 1;
    }
  });

  Object.entries(unitCountByPlayer).forEach(([playerId, unitCount]) => {
    const playerScore = document.getElementById(`player-${playerId}-score`) as HTMLDivElement;
    playerScore.innerHTML = unitCount ? `${unitCount}` : 'Dead';
  });
}

function getPlayerName(playerId: number) {
  return playerNameById[playerId];
}

export { initScoreBoard, updateScoreBoard, getPlayerName };