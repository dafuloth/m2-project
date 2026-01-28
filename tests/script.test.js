/**
 * @jest-environment jsdom
 */

describe("Noughts & Crosses Game", () => {
    let cells, statusEl, restartBtn, game;

    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = jest.fn();
        HTMLDialogElement.prototype.close = jest.fn();
    });

    beforeEach(() => {
        // Mock localStorage
        const store = {};
        const localStorageMock = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, value) => { store[key] = value.toString(); }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { for (let key in store) delete store[key]; })
        };
        Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

        document.body.innerHTML = `
      <div id="status"></div>
      <button id="restart">Restart</button>
      <button id="mute-toggle">
        <span class="mute-icon">🔊</span>
        <span class="mute-label">Mute</span>
      </button>

      <dialog id="welcome-modal">
        <div class="mode-selector">
          <input type="radio" id="person" name="opponent" value="person" checked>
          <label for="person" class="mode-card">
            <div class="mode-card-content">
              <input type="text" class="player-x-name-input" id="player-x-input-friend">
              <input type="text" class="player-o-name-input" id="player-o-input-friend">
            </div>
          </label>
          <input type="radio" id="computerX" name="opponent" value="computerX">
          <label for="computerX" class="mode-card">
            <div class="mode-card-content">
              <input type="text" class="player-o-name-input" id="player-o-input-comp">
            </div>
          </label>
        </div>
        <button id="welcome-start-btn">Start Game</button>
      </dialog>

      <button class="cell" data-index="0"></button>
      <button class="cell" data-index="1"></button>
      <button class="cell" data-index="2"></button>
      <button class="cell" data-index="3"></button>
      <button class="cell" data-index="4"></button>
      <button class="cell" data-index="5"></button>
      <button class="cell" data-index="6"></button>
      <button class="cell" data-index="7"></button>
      <button class="cell" data-index="8"></button>
    `;

        jest.resetModules();
        // Use local references for assertions
        cells = Array.from(document.querySelectorAll(".cell"));
        statusEl = document.getElementById("status");
        restartBtn = document.getElementById("restart");

        // Load the game module after DOM setup
        game = require("../src/script.js");
    });

    describe("checkWin", () => {
        test("should return correct array for horizontal win in first row", () => {
            const testBoard = ["X", "X", "X", "", "", "", "", "", ""];
            expect(game.checkWin("X", testBoard)).toEqual([0, 1, 2]);
        });

        test("should return correct array for vertical win in first column", () => {
            const testBoard = ["O", "", "", "O", "", "", "O", "", ""];
            expect(game.checkWin("O", testBoard)).toEqual([0, 3, 6]);
        });

        test("should return correct array for diagonal win", () => {
            const testBoard = ["X", "", "", "", "X", "", "", "", "X"];
            expect(game.checkWin("X", testBoard)).toEqual([0, 4, 8]);
        });

        test("should return null for no win (i.e. draw)", () => {
            const testBoard = ["X", "O", "X", "", "", "", "", "", ""];
            expect(game.checkWin("X", testBoard)).toBeNull();
        });
    });

    describe("init", () => {
        test("should reset board state to empty", () => {
            game.boardState.splice(0, 9, "X", "O", "X", "O", "X", "O", "X", "O", "X");
            game.init();
            expect(game.boardState).toEqual(["", "", "", "", "", "", "", "", ""]);
        });

        test("should set current player to X", () => {
            game.currentPlayer = "O";
            game.init();
            expect(game.currentPlayer).toBe("X");
        });

        test("should set running to true", () => {
            game.running = false;
            game.init();
            expect(game.running).toBe(true);
        });

        test("should clear cell text and enable cells", () => {
            cells[0].textContent = "X";
            cells[0].disabled = true;
            game.init();
            expect(cells[0].textContent).toBe("");
            expect(cells[0].disabled).toBe(false);
        });
    });

    describe("makeMove", () => {
        test("should place current player mark on board", () => {
            game.init();
            game.currentPlayer = "X";
            game.makeMove(0);
            expect(game.boardState[0]).toBe("X");
        });

        test("should update cell text and disable it", () => {
            game.init();
            game.currentPlayer = "X";
            game.makeMove(4);
            expect(cells[4].textContent).toBe("X");
            expect(cells[4].disabled).toBe(true);
        });

        test("should switch player after move", () => {
            game.init();
            game.currentPlayer = "X";
            game.makeMove(0);
            expect(game.currentPlayer).toBe("O");
        });

        test("should detect win and stop game", () => {
            game.init();
            // Pre-fill two X's
            game.boardState[0] = "X";
            game.boardState[1] = "X";
            cells[0].textContent = "X";
            cells[1].textContent = "X";
            game.currentPlayer = "X";
            game.running = true;

            game.makeMove(2);

            expect(game.running).toBe(false);
            expect(statusEl.textContent).toBe("X wins!");
        });

        test("should detect draw", () => {
            game.init();
            game.boardState.splice(0, 9, "X", "O", "X", "X", "O", "O", "O", "X", "");
            // Optional DOM sync
            cells.forEach((c, i) => {
                c.textContent = game.boardState[i];
                c.disabled = c.textContent !== "";
            });
            game.currentPlayer = "X";

            game.makeMove(8);
            expect(game.running).toBe(false);
            expect(statusEl.textContent).toBe("It's a Draw!");
        });

        test("should show personalized win message for custom names", () => {
            game.init();
            game.playerNames.X = "Jack";
            game.boardState[0] = "X";
            game.boardState[1] = "X";
            game.currentPlayer = "X";
            game.running = true;

            game.makeMove(2);

            expect(statusEl.textContent).toBe("(X) Jack wins!");
        });
    });

    describe("handleCellClick", () => {
        test("should not make move if game is not running", () => {
            game.init();
            game.running = false;

            game.handleCellClick({ currentTarget: cells[0] });

            expect(game.boardState[0]).toBe("");
        });

        test("should not make move if cell is already filled", () => {
            game.init();
            game.boardState[0] = "X";
            cells[0].textContent = "X";
            cells[0].disabled = true;
            game.currentPlayer = "O";

            game.handleCellClick({ currentTarget: cells[0] });

            expect(game.boardState[0]).toBe("X");
            expect(game.currentPlayer).toBe("O");
        });

        test("should make move if cell is empty and game is running", () => {
            game.init();
            game.currentPlayer = "X";

            game.handleCellClick({ currentTarget: cells[5] });

            expect(game.boardState[5]).toBe("X");
            expect(cells[5].textContent).toBe("X");
        });
    });

    describe("Sound effects", () => {
        test("toggleMute should flip isMuted state and persist to storage", () => {
            game.isMuted = false;
            game.toggleMute();
            expect(game.isMuted).toBe(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('noughts-and-crosses-muted', 'true');

            game.toggleMute();
            expect(game.isMuted).toBe(false);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('noughts-and-crosses-muted', 'false');
        });

        test("updateMuteButtonUI should update icon and label", () => {
            game.isMuted = true;
            game.updateMuteButtonUI();

            expect(document.querySelector(".mute-label").textContent).toBe("Unmute");
            expect(document.querySelector(".mute-icon").textContent).toMatch(/🔇/);

            game.isMuted = false;
            game.updateMuteButtonUI();

            expect(document.querySelector(".mute-label").textContent).toBe("Mute");
            expect(document.querySelector(".mute-icon").textContent).toMatch(/🔊/);
        });
    });

    describe("Welcome Modal & Expandable Cards", () => {
        test("Start Game should collect names from the active mode card", () => {
            const friendXInput = document.getElementById('player-x-input-friend');
            const friendOInput = document.getElementById('player-o-input-friend');
            const welcomeStartBtn = document.getElementById('welcome-start-btn');

            friendXInput.value = "Jack";
            friendOInput.value = "Jill";

            // Trigger start game logic
            welcomeStartBtn.click();

            expect(game.playerNames.X).toBe("Jack");
            expect(game.playerNames.O).toBe("Jill");
        });

        test("should fallback to X and O for blank inputs", () => {
            const welcomeStartBtn = document.getElementById('welcome-start-btn');

            // Set some existing names first
            game.playerNames.X = "OldX";
            game.playerNames.O = "OldO";

            // Click start with blank inputs
            welcomeStartBtn.click();

            expect(game.playerNames.X).toBe("X");
            expect(game.playerNames.O).toBe("O");
        });

        test("should collect only relevant names in computer mode", () => {
            document.getElementById('computerX').checked = true;
            const compOInput = document.getElementById('player-o-input-comp');
            const welcomeStartBtn = document.getElementById('welcome-start-btn');

            compOInput.value = "Zach";

            welcomeStartBtn.click();

            expect(game.playerNames.O).toBe("Zach");
            expect(game.playerNames.X).toBe("X"); // Default
        });
    });
});
