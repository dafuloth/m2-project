const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modal = document.getElementById('game-over-modal');
const modalMsg = document.getElementById('game-result');
const modalRestartBtn = document.getElementById('modal-restart');
const modalCancelBtn = document.getElementById('modal-cancel');
const winSound = document.getElementById('win-sound');
const scoreboardBody = document.getElementById('scoreboard-body');

let boardState = Array(9).fill('');
let currentPlayer = 'X';
let running = true;

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function init() {
  boardState.fill('');
  currentPlayer = 'X';
  running = true;
  if (statusEl) {
    statusEl.textContent = `${currentPlayer}'s turn`;
  }
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

function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (!running) return;
  if (boardState[index] !== '') return;

  makeMove(index);
}

function makeMove(index) {
  boardState[index] = currentPlayer;
  const cell = cells ? cells[index] : null;
  if (cell) {
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    cell.disabled = true;
  }

  const winningCombo = checkWin(currentPlayer, boardState);

  const winMsg = `${currentPlayer} wins!`;
  if (winningCombo) {
    running = false;
    if (cells) {
      cells.forEach(cell => { if (cell) cell.disabled = true; });
      winningCombo.forEach(index => {
        if (cells[index]) cells[index].classList.add('winning-cell');
      });
    }
    if (statusEl) statusEl.textContent = winMsg;
    if (modalMsg) {
      modalMsg.textContent = winMsg;
    }
    if (winSound) {
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
    running = false;
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

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  if (statusEl) statusEl.textContent = `${currentPlayer}'s turn`;
}

function checkWin(player, board = boardState) {
  return WIN_COMBOS.find(combo => combo.every(i => board[i] === player)) || null;
}

function checkDraw(board = boardState) {
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

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${dateTimeStr}</td>
    <td>${result}</td>
  `;

  // Prepend so latest results are at the top
  scoreboardBody.insertBefore(row, scoreboardBody.firstChild);
}

if (cells && cells.length > 0 && cells[0] !== null) {
  cells.forEach(cell => cell && cell.addEventListener('click', handleCellClick));
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

init();

// Exports required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init,
    handleCellClick,
    makeMove,
    checkWin,
    recordGameResult,
    // Export getters for state variables
    get boardState() { return boardState; },
    set boardState(value) { boardState = value; },
    get currentPlayer() { return currentPlayer; },
    set currentPlayer(value) { currentPlayer = value; },
    get running() { return running; },
    set running(value) { running = value; }
  };
}
