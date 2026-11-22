const board = document.querySelector('#board');
const score = document.querySelector('#score');
const restartButton = document.querySelector('#restart');
const undoButton = document.querySelector('#undo');
const directionPad = document.querySelector('#direction-pad');
const leaderboard = document.querySelector('#leaderboard');
const gameOver = document.querySelector('#game-over');
const gameOverScore = document.querySelector('#game-over-score');
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

let game = createGame();
let previousGame = null;

function renderGame() {
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
    gameOver.showModal();
  }
}

function playMove(direction) {
  if (leaderboard.open || gameOver.open) {
    return;
  }

  const moved = moveTiles(game.tiles, direction);
  if (!moved.changed) {
    return;
  }

  previousGame = game;
  game = {
    tiles: addRandomTiles(moved.tiles, randomInteger(1, 2)),
    score: game.score + moved.score,
  };
  renderGame();
}

function restartGame() {
  if (gameOver.open) {
    gameOver.close();
    restartButton.focus();
  }

  game = createGame();
  previousGame = null;
  renderGame();
}

restartButton.addEventListener('click', restartGame);
document.querySelector('#restart-after-game').addEventListener('click', restartGame);
gameOver.addEventListener('cancel', event => event.preventDefault());

undoButton.addEventListener('click', () => {
  if (previousGame === null || gameOver.open) {
    return;
  }

  game = previousGame;
  previousGame = null;
  renderGame();
});

document.querySelector('#show-leaderboard').addEventListener('click', () => {
  leaderboard.showModal();
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

renderGame();
