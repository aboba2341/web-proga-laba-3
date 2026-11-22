const SESSION_KEY = 'cascade:session';
const RECORD_PREFIX = 'cascade:record:';

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function isValidScore(score) {
  return Number.isSafeInteger(score) && score >= 0;
}

function isValidGame(game) {
  return Array.isArray(game?.tiles)
    && game.tiles.length === CELL_COUNT
    && game.tiles.some(value => value !== 0)
    && game.tiles.every(value => value === 0 || (Number.isSafeInteger(value)
      && value >= 2 && Number.isInteger(Math.log2(value))))
    && isValidScore(game.score);
}

function loadSession() {
  const saved = readStorage(SESSION_KEY);
  if (typeof saved?.id !== 'string' || !saved.id || !isValidGame(saved.game)) {
    return null;
  }

  return {
    id: saved.id,
    game: saved.game,
    previousGame: isValidGame(saved.previousGame) ? saved.previousGame : null,
  };
}

function saveSession(session) {
  writeStorage(SESSION_KEY, session);
}

function isValidRecord(record) {
  return typeof record?.name === 'string' && record.name.trim().length > 0
    && isValidScore(record.score)
    && typeof record.date === 'string' && Number.isFinite(Date.parse(record.date));
}

function loadRecord(sessionId) {
  const record = readStorage(RECORD_PREFIX + sessionId);
  return isValidRecord(record) ? record : null;
}

function saveRecord(sessionId, record) {
  // One key per game keeps a repeated submission from adding a second row.
  return loadRecord(sessionId) !== null || writeStorage(RECORD_PREFIX + sessionId, record);
}

function loadTopRecords() {
  let keys;
  try {
    keys = Object.keys(localStorage);
  } catch {
    return [];
  }

  return keys.filter(key => key.startsWith(RECORD_PREFIX))
    .map(readStorage)
    .filter(isValidRecord)
    .sort((first, second) => second.score - first.score || Date.parse(first.date) - Date.parse(second.date))
    .slice(0, 10);
}
