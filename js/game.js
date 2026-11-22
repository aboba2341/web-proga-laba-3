const BOARD_SIZE = 4;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;

function randomInteger(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function addRandomTiles(tiles, count) {
  const nextTiles = tiles.slice();
  const emptyCells = [];

  for (let index = 0; index < CELL_COUNT; index += 1) {
    if (nextTiles[index] === 0) {
      emptyCells.push(index);
    }
  }

  for (let spawned = 0; spawned < count && emptyCells.length > 0; spawned += 1) {
    const position = randomInteger(0, emptyCells.length - 1);
    const [index] = emptyCells.splice(position, 1);
    nextTiles[index] = Math.random() < 0.9 ? 2 : 4;
  }

  return nextTiles;
}

function createGame() {
  const tiles = addRandomTiles(Array(CELL_COUNT).fill(0), randomInteger(1, 3));
  return { tiles, score: 0 };
}

function getLineIndices(line, direction) {
  const vertical = direction === 'up' || direction === 'down';
  const reversed = direction === 'right' || direction === 'down';

  return Array.from({ length: BOARD_SIZE }, (_, offset) => {
    const step = reversed ? BOARD_SIZE - 1 - offset : offset;
    return vertical ? step * BOARD_SIZE + line : line * BOARD_SIZE + step;
  });
}

function slideTiles(tiles, lines) {
  const nextTiles = Array(CELL_COUNT).fill(0);
  const movements = [];
  const merged = [];
  let score = 0;

  for (const line of lines) {
    const occupied = line.filter(index => tiles[index] !== 0);
    let target = 0;

    for (let index = 0; index < occupied.length; index += 1) {
      const from = occupied[index];
      const to = line[target];
      const value = tiles[from];
      const next = occupied[index + 1];
      target += 1;
      nextTiles[to] = value;

      if (from !== to) {
        movements.push({ from, to });
      }

      if (value === tiles[next]) {
        nextTiles[to] = value * 2;
        score += nextTiles[to];
        movements.push({ from: next, to });
        merged.push(to);
        index += 1;
      }
    }
  }

  return { tiles: nextTiles, movements, merged, score };
}

function moveTiles(tiles, direction) {
  const steps = [];
  const lines = Array.from({ length: BOARD_SIZE }, (_, line) => getLineIndices(line, direction));
  let score = 0;

  // Results from one pass may merge again on the next pass.
  let step = slideTiles(tiles, lines);
  while (step.movements.length > 0) {
    steps.push(step);
    score += step.score;
    step = slideTiles(step.tiles, lines);
  }

  return { tiles: step.tiles, score, changed: steps.length > 0, steps };
}

function hasAvailableMoves(tiles) {
  return tiles.some((value, index) => {
    const hasRightNeighbor = index % BOARD_SIZE < BOARD_SIZE - 1;
    return value === 0
      || (hasRightNeighbor && value === tiles[index + 1])
      || value === tiles[index + BOARD_SIZE];
  });
}
