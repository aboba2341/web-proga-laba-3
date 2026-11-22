const board = document.querySelector('#board');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const cells = Array.from({ length: CELL_COUNT }, () => {
  const cell = document.createElement('div');
  cell.className = 'cell';
  return cell;
});
board.append(...cells);

function renderTiles(tiles) {
  cells.forEach((cell, index) => {
    const value = tiles[index];
    if (value === 0) {
      cell.replaceChildren();
      return;
    }

    const tile = document.createElement('span');
    tile.className = 'tile';
    tile.dataset.value = value;
    tile.textContent = value;

    if (value > 2048) {
      const hue = (250 + (Math.log2(value) - 12) * 137.508) % 360;
      tile.style.setProperty('--tile-hue', hue);
    }
    cell.replaceChildren(tile);
  });
}

function animateSlide(movements) {
  const cellBounds = cells.map(cell => cell.getBoundingClientRect());
  return Promise.allSettled(movements.map(({ from, to }) => {
    const tile = cells[from].firstElementChild;
    const x = cellBounds[to].left - cellBounds[from].left;
    const y = cellBounds[to].top - cellBounds[from].top;

    tile.classList.add('tile-moving');
    return tile.animate([
      { transform: 'translate(0, 0)' },
      { transform: `translate(${x}px, ${y}px)` },
    ], { duration: 105, easing: 'ease-out', fill: 'forwards' }).finished;
  }));
}

async function animateBoardMove(steps, tiles, isCurrentMove) {
  const lastStep = steps.at(-1);

  for (const step of steps) {
    await animateSlide(step.movements);
    if (!isCurrentMove()) {
      return;
    }

    const isLastStep = step === lastStep;
    renderTiles(isLastStep ? tiles : step.tiles);

    const effects = step.merged.map(index => cells[index].firstElementChild.animate([
      { transform: 'scale(0.96)' },
      { transform: 'scale(1.12)', offset: 0.55 },
      { transform: 'scale(1)' },
    ], { duration: 115, easing: 'ease-in-out' }).finished);

    if (isLastStep) {
      tiles.forEach((value, index) => {
        if (value !== 0 && step.tiles[index] === 0) {
          effects.push(cells[index].firstElementChild.animate([
            { transform: 'scale(0.55)', opacity: 0 },
            { transform: 'scale(1)', opacity: 1 },
          ], { duration: 125, easing: 'ease-out' }).finished);
        }
      });
    }

    await Promise.allSettled(effects);
    if (!isCurrentMove()) {
      return;
    }
  }
}
