import Player from '../../common/types/Player.js';
import { ActionableUnit, Unit, UnitAction } from '../../common/types/Units.js';

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

function updateScoreBoard(stats:{[key:number]:number}) {
  const unitCountByPlayer: { [key: number]: number } = {};
  playerList.forEach(id => { unitCountByPlayer[id] = 0; });

  for (const playerId in stats) {
    const playerScore = document.getElementById(`player-${playerId}-score`) as HTMLDivElement;
    const count = stats[playerId];
    playerScore.innerHTML = count ? `${count}` : 'Dead';
  }
}

function getPlayerName(playerId: number) {
  return playerNameById[playerId];
}

export { initScoreBoard, updateScoreBoard, getPlayerName };