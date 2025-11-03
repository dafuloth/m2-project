const cells = Array.from(document.querySelectorAll('.cell'));
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let boardState = Array(9).fill('');
let currentPlayer = 'X';
let running = true;

const WIN_COMBOS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function init(){
  boardState.fill('');
  currentPlayer = 'X';
  running = true;
  statusEl.textContent = `${currentPlayer}'s turn`;
  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
  });
}

function handleCellClick(e){
  const index = Number(e.currentTarget.dataset.index);
  if (!running) return;
  if (boardState[index] !== '') return;

  makeMove(index);
}

function makeMove(index){
  boardState[index] = currentPlayer;
  const cell = cells[index];
  cell.textContent = currentPlayer;
  cell.disabled = true;

  const win = checkWin(currentPlayer, boardState);
  if (win) {
    running = false;
    statusEl.textContent = `${currentPlayer} wins!`;
    return;
  }

  if (boardState.every(cell => cell !== '')) {
    running = false;
    statusEl.textContent = `Draw`;
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  statusEl.textContent = `${currentPlayer}'s turn`;
}

function checkWin(player, board = boardState){
  return WIN_COMBOS.some(combo => combo.every(i => board[i] === player));
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
restartBtn.addEventListener('click', init);

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
