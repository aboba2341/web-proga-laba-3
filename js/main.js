const board = document.querySelector('#board');
const score = document.querySelector('#score');
const restartButton = document.querySelector('#restart');
const undoButton = document.querySelector('#undo');
const directionPad = document.querySelector('#direction-pad');
const leaderboard = document.querySelector('#leaderboard');
const leaderboardEntries = document.querySelector('#leaderboard-entries');
const emptyLeaderboard = document.querySelector('#empty-leaderboard');
const gameOver = document.querySelector('#game-over');
const gameOverScore = document.querySelector('#game-over-score');
const gameOverMessage = document.querySelector('#game-over-message');
const recordForm = document.querySelector('#record-form');
const playerName = document.querySelector('#player-name');
const restartAfterGame = document.querySelector('#restart-after-game');
const dateFormat = new Intl.DateTimeFormat('ru-RU', { dateStyle: 'short' });
const directionsByKey = new Map([
  ['ArrowLeft', 'left'],
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['ArrowRight', 'right'],
]);

const cells = Array.from({ length: CELL_COUNT }, () => {
  const cell = document.createElement('div');
  cell.className = 'cell';
  return cell;
});
board.append(...cells);

let session = loadSession();

function renderGame() {
  const { game, previousGame } = session;
  cells.forEach((cell, index) => {
    const value = game.tiles[index];
    if (value === 0) {
      cell.replaceChildren();
      return;
    }

    const tile = document.createElement('span');
    tile.className = 'tile';
    tile.dataset.value = value;
    tile.textContent = value;
    cell.replaceChildren(tile);
  });

  const finished = !hasAvailableMoves(game.tiles);
  score.value = game.score;
  undoButton.disabled = finished || previousGame === null;

  if (finished) {
    gameOverScore.value = game.score;
    const recordSaved = loadRecord(session.id) !== null;
    recordForm.hidden = recordSaved;
    gameOverMessage.textContent = recordSaved ? 'Ваш рекорд сохранён.' : 'Ходов больше нет.';
    gameOver.showModal();
  }
}

function updateGame() {
  saveSession(session);
  renderGame();
}

function playMove(direction) {
  if (leaderboard.open || gameOver.open) {
    return;
  }

  const moved = moveTiles(session.game.tiles, direction);
  if (!moved.changed) {
    return;
  }

  session.previousGame = session.game;
  session.game = {
    tiles: addRandomTiles(moved.tiles, randomInteger(1, 2)),
    score: session.game.score + moved.score,
  };
  updateGame();
}

function restartGame() {
  if (gameOver.open) {
    gameOver.close();
    restartButton.focus();
  }

  recordForm.reset();
  playerName.setCustomValidity('');
  session = {
    id: crypto.getRandomValues(new Uint32Array(4)).join('-'),
    game: createGame(),
    previousGame: null,
  };
  updateGame();
}

function showLeaderboard() {
  const records = loadTopRecords();
  leaderboardEntries.replaceChildren(...records.map(record => {
    const row = document.createElement('tr');
    row.insertCell().textContent = record.name;
    row.insertCell().textContent = record.score;

    const time = document.createElement('time');
    time.dateTime = record.date;
    time.textContent = dateFormat.format(new Date(record.date));
    row.insertCell().append(time);
    return row;
  }));

  emptyLeaderboard.hidden = records.length > 0;
  leaderboard.showModal();
}

restartButton.addEventListener('click', restartGame);
restartAfterGame.addEventListener('click', restartGame);
gameOver.addEventListener('cancel', event => event.preventDefault());

undoButton.addEventListener('click', () => {
  if (session.previousGame === null || gameOver.open) {
    return;
  }

  session.game = session.previousGame;
  session.previousGame = null;
  updateGame();
});

document.querySelector('#show-leaderboard').addEventListener('click', showLeaderboard);
document.querySelector('#show-leaderboard-after-game').addEventListener('click', showLeaderboard);

playerName.addEventListener('input', () => playerName.setCustomValidity(''));
recordForm.addEventListener('submit', event => {
  event.preventDefault();
  if (!gameOver.open || recordForm.hidden) {
    return;
  }

  const name = playerName.value.trim();
  if (name.length === 0) {
    playerName.setCustomValidity('Введите имя.');
    playerName.reportValidity();
    return;
  }

  const saved = saveRecord(session.id, {
    name,
    score: session.game.score,
    date: new Date().toISOString(),
  });
  if (!saved) {
    gameOverMessage.textContent = 'Не удалось сохранить результат. Попробуйте ещё раз.';
    return;
  }

  gameOverMessage.textContent = 'Ваш рекорд сохранён.';
  recordForm.hidden = true;
  restartAfterGame.focus();
});

directionPad.addEventListener('click', event => {
  const button = event.target.closest('button[data-direction]');
  if (button) {
    playMove(button.dataset.direction);
  }
});

document.addEventListener('keydown', event => {
  const direction = directionsByKey.get(event.key);
  if (!direction || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
      || leaderboard.open || gameOver.open) {
    return;
  }

  event.preventDefault();
  playMove(direction);
});

if (session === null) {
  restartGame();
} else {
  renderGame();
}
