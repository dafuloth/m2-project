const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');
const modal = document.getElementById('game-over-modal');
const modalMsg = document.getElementById('game-result');
const modalRestartBtn = document.getElementById('modal-restart');
const modalCancelBtn = document.getElementById('modal-cancel');
const winSound = document.getElementById('win-sound');

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
  statusEl.textContent = `${currentPlayer}'s turn`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('x', 'o', 'winning-cell');
    cell.disabled = false;
  });
  modal.close();
}

function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (!running) return;
  if (boardState[index] !== '') return;

  makeMove(index);
}

function makeMove(index) {
  boardState[index] = currentPlayer;
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.classList.add(currentPlayer.toLowerCase());
  cell.disabled = true;

  const winningCombo = checkWin(currentPlayer, boardState);

  const winMsg = `${currentPlayer} wins!`;
  if (winningCombo) {
    running = false;
    cells.forEach(cell => cell.disabled = true);
    winningCombo.forEach(index => cells[index].classList.add('winning-cell'));
    statusEl.textContent = winMsg;
    modalMsg.textContent = winMsg;
    winSound.play();
    modal.showModal();
    return;
  }

  const drawMsg = "It's a Draw!";
  if (checkDraw()) {
    running = false;
    statusEl.textContent = drawMsg;
    modalMsg.textContent = drawMsg;
    modal.showModal();
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusEl.textContent = `${currentPlayer}'s turn`;
}

function checkWin(player, board = boardState) {
  return WIN_COMBOS.find(combo => combo.every(i => board[i] === player)) || null;
}

function checkDraw(board = boardState) {
  return board.every(cell => cell !== '');
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', init);
modalRestartBtn.addEventListener('click', init);
modalCancelBtn.addEventListener("click", () => {
  modal.close();
});

init();

// Exports required for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    init,
    handleCellClick,
    makeMove,
    checkWin,
    // Export getters for state variables
    get boardState() { return boardState; },
    set boardState(value) { boardState = value; },
    get currentPlayer() { return currentPlayer; },
    set currentPlayer(value) { currentPlayer = value; },
    get running() { return running; },
    set running(value) { running = value; }
  };
}
