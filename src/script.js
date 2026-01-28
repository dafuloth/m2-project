// --- CONSTANTS ---
const STORAGE_KEY = 'noughts-and-crosses-history';
const MUTE_KEY = 'noughts-and-crosses-muted';
const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

// --- ELEMENTS ---
const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modal = document.getElementById('game-over-modal');
const resultModalMsg = document.getElementById('game-result');
const modalRestartBtn = document.getElementById('modal-restart');
const modalCancelBtn = document.getElementById('modal-cancel');
const scoreboardBody = document.getElementById('scoreboard-body');
const clearHistoryBtn = document.getElementById('clear-history');
const welcomeModal = document.getElementById('welcome-modal');
const welcomeStartBtn = document.getElementById('welcome-start-btn');
const winSound = document.getElementById('win-sound');
const clickSound = document.getElementById('click-sound');
const xSound = document.getElementById('x-sound');
const oSound = document.getElementById('o-sound');
const muteToggleBtn = document.getElementById('mute-toggle');

// --- STATE MANAGEMENT ---
const state = {
  boardState: Array(9).fill(''),
  currentPlayer: 'X',
  running: true,
  playerNames: { X: 'X', O: 'O' },
  isMuted: localStorage.getItem(MUTE_KEY) === 'true'
};

// --- SOUNDS ---
function updateMuteButtonUI() {
  if (!muteToggleBtn) return;
  const icon = state.isMuted ? '🔇' : '🔊';
  const label = state.isMuted ? 'Unmute' : 'Mute';
  muteToggleBtn.innerHTML = `
    <span class="mute-icon">${icon}</span>
    <span class="mute-label">${label}</span>
  `;
  muteToggleBtn.setAttribute('aria-label', state.isMuted ? 'Unmute sounds' : 'Mute sounds');
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  localStorage.setItem(MUTE_KEY, String(state.isMuted));
  updateMuteButtonUI();
}

function playSound(sound) {
  if (state.isMuted || !sound) return;
  sound.currentTime = 0;
  sound.play().catch(() => { });
}

// --- STORAGE SERVICE ---
function getHistory() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  if (scoreboardBody) scoreboardBody.innerHTML = '';
  updateClearButtonVisibility();
}

// --- UI HELPERS ---
function updateStatus() {
  if (!statusEl) return;
  const name = state.playerNames[state.currentPlayer];
  statusEl.textContent = (name === state.currentPlayer)
    ? `${state.currentPlayer}'s turn`
    : `${name}'s turn (${state.currentPlayer})`;
}

function updateClearButtonVisibility() {
  if (!clearHistoryBtn) return;
  const history = getHistory();
  clearHistoryBtn.classList.toggle('hidden', history.length === 0);
}

function addResultToTable(entry) {
  if (!scoreboardBody) return;
  const row = document.createElement('tr');
  row.innerHTML = `<td>${entry.timestamp}</td><td>${entry.result}</td>`;
  scoreboardBody.insertBefore(row, scoreboardBody.firstChild);
}

function loadScoreboard() {
  if (!scoreboardBody) return;
  const history = getHistory();
  scoreboardBody.innerHTML = '';
  // History is saved with unshift (newest first), so reverse for chronological insertion via insertBefore
  [...history].reverse().forEach(addResultToTable);
  updateClearButtonVisibility();
}

// --- GAME LOGIC ---
function checkWin(player, board = state.boardState) {
  return WIN_COMBOS.find(combo => combo.every(i => board[i] === player)) || null;
}

function checkDraw(board = state.boardState) {
  return board.every(cell => cell !== '');
}

function recordGameResult(result) {
  if (!scoreboardBody) return;
  const dateTimeStr = new Date().toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
  const entry = { timestamp: dateTimeStr, result };

  addResultToTable(entry);
  const history = getHistory();
  history.unshift(entry);
  saveHistory(history);
  updateClearButtonVisibility();
}

function init() {
  state.boardState.fill('');
  state.currentPlayer = 'X';
  state.running = true;
  updateStatus();

  cells.forEach(cell => {
    if (cell) {
      cell.textContent = '';
      cell.classList.remove('x', 'o', 'winning-cell');
      cell.disabled = false;
    }
  });
  if (modal) modal.close();
}

function makeMove(index) {
  state.currentPlayer === 'X' ? playSound(xSound) : playSound(oSound);
  state.boardState[index] = state.currentPlayer;

  const cell = cells[index];
  if (cell) {
    cell.textContent = state.currentPlayer;
    cell.classList.add(state.currentPlayer.toLowerCase());
    cell.disabled = true;
  }

  const winningCombo = checkWin(state.currentPlayer);
  if (winningCombo) {
    state.running = false;
    const winnerName = state.playerNames[state.currentPlayer];
    const winMsg = (winnerName === state.currentPlayer)
      ? `${state.currentPlayer} wins!`
      : `(${state.currentPlayer}) ${winnerName} wins!`;

    if (statusEl) statusEl.textContent = winMsg;
    if (resultModalMsg) resultModalMsg.textContent = winMsg;
    if (cells) winningCombo.forEach(idx => cells[idx]?.classList.add('winning-cell'));
    if (!state.isMuted) playSound(winSound);
    if (modal) modal.showModal();
    recordGameResult(winMsg);
    return;
  }

  if (checkDraw()) {
    state.running = false;
    const drawMsg = "It's a Draw!";
    if (statusEl) statusEl.textContent = drawMsg;
    if (resultModalMsg) resultModalMsg.textContent = drawMsg;
    if (modal) modal.showModal();
    recordGameResult(drawMsg);
    return;
  }

  state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

// --- EVENT HANDLERS ---
function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (!state.running || state.boardState[index] !== '') return;
  makeMove(index);
}

function handleWelcomeStart() {
  state.playerNames.X = 'X';
  state.playerNames.O = 'O';

  const selectedRadio = document.querySelector('.mode-selector input[type="radio"]:checked');
  const card = selectedRadio?.nextElementSibling;
  if (card) {
    const xInput = card.querySelector('.player-x-name-input');
    const oInput = card.querySelector('.player-o-name-input');
    if (xInput?.value.trim()) state.playerNames.X = xInput.value.trim();
    if (oInput?.value.trim()) state.playerNames.O = oInput.value.trim();
  }

  updateStatus();
  welcomeModal?.close();
}

// --- INITIALIZATION ---
cells.forEach(cell => {
  if (cell) {
    cell.addEventListener('click', handleCellClick);
    cell.addEventListener('mouseenter', () => (!state.isMuted && state.running) && playSound(clickSound));
  }
});

restartBtn?.addEventListener('click', init);
modalRestartBtn?.addEventListener('click', init);
modalCancelBtn?.addEventListener('click', () => modal?.close());
clearHistoryBtn?.addEventListener('click', clearHistory);
muteToggleBtn?.addEventListener('click', toggleMute);
welcomeStartBtn?.addEventListener('click', handleWelcomeStart);

if (welcomeModal) welcomeModal.showModal();
updateMuteButtonUI();
init();
loadScoreboard();

// --- EXPORTS FOR TESTING ---
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init, handleCellClick, makeMove, checkWin, recordGameResult, addResultToTable,
    loadScoreboard, clearScoreboard: clearHistory, updateStatus, updateClearButtonVisibility,
    toggleMute, updateMuteButtonUI,
    get boardState() { return state.boardState; },
    set boardState(v) { state.boardState = v; },
    get currentPlayer() { return state.currentPlayer; },
    set currentPlayer(v) { state.currentPlayer = v; },
    get running() { return state.running; },
    set running(v) { state.running = v; },
    get playerNames() { return state.playerNames; },
    set playerNames(v) { state.playerNames = v; },
    get isMuted() { return state.isMuted; },
    set isMuted(v) { state.isMuted = v; }
  };
}
