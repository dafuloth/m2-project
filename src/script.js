const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modal = document.getElementById('game-over-modal');
const modalMsg = document.getElementById('game-result');
const modalRestartBtn = document.getElementById('modal-restart');
const modalCancelBtn = document.getElementById('modal-cancel');
const winSound = document.getElementById('win-sound');
const scoreboardBody = document.getElementById('scoreboard-body');
const clearHistoryBtn = document.getElementById('clear-history');
const welcomeModal = document.getElementById('welcome-modal');
const welcomeStartBtn = document.getElementById('welcome-start-btn');
const clickSound = document.getElementById('click-sound');
const xSound = document.getElementById('x-sound');
const oSound = document.getElementById('o-sound');
const muteToggleBtn = document.getElementById('mute-toggle');

const STORAGE_KEY = 'noughts-and-crosses-history';
const MUTE_KEY = 'noughts-and-crosses-muted';

const state = {
  boardState: Array(9).fill(''),
  currentPlayer: 'X',
  running: true,
  playerNames: { X: 'X', O: 'O' },
  isMuted: localStorage.getItem(MUTE_KEY) === 'true'
};

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function init() {
  state.boardState.fill('');
  state.currentPlayer = 'X';
  state.running = true;
  updateStatus();
  if (cells) {
    cells.forEach(cell => {
      if (cell) {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning-cell');
        cell.disabled = false;
      }
    });
  }
  if (modal) {
    modal.close();
  }
}

function playHoverSound() {
  if (!state.running || state.isMuted) return;
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => { });
  }
}

function playXSound() {
  if (state.isMuted) return;
  if (xSound) {
    xSound.currentTime = 0;
    xSound.play().catch(() => { });
  }
}

function playOSound() {
  if (state.isMuted) return;
  if (oSound) {
    oSound.currentTime = 0;
    oSound.play().catch(() => { });
  }
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  localStorage.setItem(MUTE_KEY, String(state.isMuted));
  updateMuteButtonUI();
}

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

function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (!state.running) return;
  if (state.boardState[index] !== '') return;

  makeMove(index);
}

function makeMove(index) {
  state.currentPlayer === 'X' ? playXSound() : playOSound();
  state.boardState[index] = state.currentPlayer;
  const cell = cells ? cells[index] : null;
  if (cell) {
    cell.textContent = state.currentPlayer;
    cell.classList.add(state.currentPlayer.toLowerCase());
    cell.disabled = true;
  }

  const winningCombo = checkWin(state.currentPlayer, state.boardState);
  const winnerName = state.playerNames[state.currentPlayer];
  const winMsg = (winnerName === state.currentPlayer)
    ? `${state.currentPlayer} wins!`
    : `(${state.currentPlayer}) ${winnerName} wins!`;
  if (winningCombo) {
    state.running = false;
    if (cells) {
      cells.forEach(cell => { if (cell) cell.disabled = true; });
      winningCombo.forEach(idx => {
        if (cells[idx]) cells[idx].classList.add('winning-cell');
      });
    }
    if (statusEl) statusEl.textContent = winMsg;
    if (modalMsg) {
      modalMsg.textContent = winMsg;
    }
    if (winSound && !state.isMuted) {
      winSound.play();
    }
    if (modal) {
      modal.showModal();
    }
    recordGameResult(winMsg);
    return;
  }

  const drawMsg = "It's a Draw!";
  if (checkDraw()) {
    state.running = false;
    if (statusEl) statusEl.textContent = drawMsg;
    if (modalMsg) {
      modalMsg.textContent = drawMsg;
    }
    if (modal) {
      modal.showModal();
    }
    recordGameResult(drawMsg);
    return;
  }

  state.currentPlayer = state.currentPlayer === 'X' ? 'O' : 'X';
  updateStatus();
}

function updateStatus() {
  if (!statusEl) return;
  const name = state.playerNames[state.currentPlayer];
  if (name === state.currentPlayer) {
    statusEl.textContent = `${state.currentPlayer}'s turn`;
  } else {
    statusEl.textContent = `${name}'s turn (${state.currentPlayer})`;
  }
}

function checkWin(player, board = state.boardState) {
  return WIN_COMBOS.find(combo => combo.every(i => board[i] === player)) || null;
}

function checkDraw(board = state.boardState) {
  return board.every(cell => cell !== '');
}

function recordGameResult(result) {
  if (!scoreboardBody) return;

  const now = new Date();
  const dateTimeStr = now.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const entry = { timestamp: dateTimeStr, result };

  // Update Scoreboard
  addResultToTable(entry);

  // Update Storage
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  history.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  updateClearButtonVisibility();
}

function addResultToTable(entry) {
  if (!scoreboardBody) return;
  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${entry.timestamp}</td>
    <td>${entry.result}</td>
  `;
  scoreboardBody.insertBefore(row, scoreboardBody.firstChild);
}

function loadScoreboard() {
  if (!scoreboardBody) return;
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  scoreboardBody.innerHTML = '';
  history.reverse().forEach(entry => addResultToTable(entry));
  updateClearButtonVisibility();
}

function clearScoreboard() {
  localStorage.removeItem(STORAGE_KEY);
  if (scoreboardBody) {
    scoreboardBody.innerHTML = '';
  }
  updateClearButtonVisibility();
}

function updateClearButtonVisibility() {
  if (!clearHistoryBtn) return;
  const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  if (history.length > 0) {
    clearHistoryBtn.classList.remove('hidden');
  } else {
    clearHistoryBtn.classList.add('hidden');
  }
}

if (cells && cells.length > 0 && cells[0] !== null) {
  cells.forEach(cell => {
    if (cell) {
      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('mouseenter', playHoverSound);
    }
  });
}
if (restartBtn) {
  restartBtn.addEventListener('click', init);
}

// Only set up modal event listeners if elements exist (not in test environment)
if (modalRestartBtn) {
  modalRestartBtn.addEventListener('click', init);
}
if (modalCancelBtn) {
  modalCancelBtn.addEventListener('click', () => {
    modal.close();
  });
}
if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', clearScoreboard);
}
if (muteToggleBtn) {
  muteToggleBtn.addEventListener('click', toggleMute);
}

if (welcomeStartBtn) {
  welcomeStartBtn.addEventListener('click', () => {
    // Reset defaults
    state.playerNames.X = 'X';
    state.playerNames.O = 'O';

    // Find active mode card
    const selectedRadio = document.querySelector('.mode-selector input[type="radio"]:checked');
    if (selectedRadio) {
      const card = selectedRadio.nextElementSibling;
      if (card) {
        const xInput = card.querySelector('.player-x-name-input');
        const oInput = card.querySelector('.player-o-name-input');

        if (xInput && xInput.value.trim()) state.playerNames.X = xInput.value.trim();
        if (oInput && oInput.value.trim()) state.playerNames.O = oInput.value.trim();
      }
    }

    updateStatus();
    welcomeModal.close();
  });
}

// Show welcome modal on load if elements exist
if (welcomeModal) {
  welcomeModal.showModal();
}

updateMuteButtonUI();
init();
loadScoreboard();

// Exports required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init,
    handleCellClick,
    makeMove,
    checkWin,
    recordGameResult,
    addResultToTable,
    loadScoreboard,
    clearScoreboard,
    updateStatus,
    updateClearButtonVisibility,
    toggleMute,
    updateMuteButtonUI,
    // Export getters/setters for state variables
    get boardState() { return state.boardState; },
    set boardState(value) { state.boardState = value; },
    get currentPlayer() { return state.currentPlayer; },
    set currentPlayer(value) { state.currentPlayer = value; },
    get running() { return state.running; },
    set running(value) { state.running = value; },
    get playerNames() { return state.playerNames; },
    set playerNames(value) { state.playerNames = value; },
    get isMuted() { return state.isMuted; },
    set isMuted(value) { state.isMuted = value; }
  };
}
