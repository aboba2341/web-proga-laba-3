const board = document.querySelector('#board');
const leaderboard = document.querySelector('#leaderboard');
const previewTiles = new Map([[5, 2], [10, 4]]);

for (let index = 0; index < 16; index += 1) {
  const cell = document.createElement('div');
  cell.className = 'cell';

  const value = previewTiles.get(index);
  if (value) {
    const tile = document.createElement('span');
    tile.className = 'tile';
    tile.dataset.value = value;
    tile.textContent = value;
    cell.append(tile);
  }

  board.append(cell);
}

document.querySelector('#show-leaderboard').addEventListener('click', () => {
  leaderboard.showModal();
});
