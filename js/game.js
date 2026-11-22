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

function mergeLine(values) {
  let tiles = values.filter(value => value !== 0);
  let score = 0;

  while (true) {
    const nextTiles = [];

    // Once a pair merges, its result can merge again on the next pass.
    for (let index = 0; index < tiles.length; index += 1) {
      const value = tiles[index];
      if (value === tiles[index + 1]) {
        nextTiles.push(value * 2);
        score += value * 2;
        index += 1;
      } else {
        nextTiles.push(value);
      }
    }

    if (nextTiles.length === tiles.length) {
      return { tiles: nextTiles, score };
    }
    tiles = nextTiles;
  }
}

function moveTiles(tiles, direction) {
  const nextTiles = Array(CELL_COUNT).fill(0);
  let score = 0;

  for (let line = 0; line < BOARD_SIZE; line += 1) {
    const indices = getLineIndices(line, direction);
    const merged = mergeLine(indices.map(index => tiles[index]));

    score += merged.score;
    merged.tiles.forEach((value, offset) => {
      nextTiles[indices[offset]] = value;
    });
  }

  return {
    tiles: nextTiles,
    score,
    changed: nextTiles.some((value, index) => value !== tiles[index]),
  };
}

function hasAvailableMoves(tiles) {
  return tiles.some((value, index) => {
    const hasRightNeighbor = index % BOARD_SIZE < BOARD_SIZE - 1;
    return value === 0
      || (hasRightNeighbor && value === tiles[index + 1])
      || value === tiles[index + BOARD_SIZE];
  });
}
