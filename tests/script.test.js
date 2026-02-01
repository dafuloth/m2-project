/**
 * @jest-environment jsdom
 */

// --- TEST CONSTANTS ---
const TEST_HTML = `
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
        <input type="text" class="player-x-name-input" id="player-x-input-friend">
        <input type="text" class="player-o-name-input" id="player-o-input-friend">
      </label>
      <input type="radio" id="computerO" name="opponent" value="computerO">
      <label for="computerO" class="mode-card">
        <input type="text" class="player-x-name-input" id="player-x-input-comp">
      </label>
      <input type="radio" id="computerX" name="opponent" value="computerX">
      <label for="computerX" class="mode-card">
        <input type="text" class="player-o-name-input" id="player-o-input-comp">
      </label>
    </div>
    <button id="welcome-start-btn">Start Game</button>
  </dialog>

  <dialog id="game-over-modal">
    <span id="game-result"></span>
    <button id="modal-restart">Play Again</button>
  </dialog>

  <audio id="win-sound"></audio>
  <audio id="x-sound"></audio>
  <audio id="o-sound"></audio>
  <audio id="click-sound"></audio>

  <div id="board">
    ${[...Array(9)].map((_, i) => `<button class="cell" data-index="${i}"></button>`).join('\n    ')}
  </div>
`;

describe("Noughts & Crosses Game Suite", () => {
    let cells, statusEl, game;

    // --- TEST HELPERS ---
    const mockStorage = () => {
        const store = {};
        const mock = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, v) => { store[key] = v.toString(); }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { for (let k in store) delete store[k]; })
        };
        Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
        return mock;
    };

    const setBoard = (marks) => {
        game.boardState.splice(0, 9, ...marks);
        cells.forEach((c, i) => {
            c.textContent = marks[i];
            c.disabled = marks[i] !== "";
        });
    };

    const clickCell = (idx) => game.handleCellClick({ currentTarget: cells[idx] });

    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = jest.fn();
        HTMLDialogElement.prototype.close = jest.fn();
        jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
    });

    beforeEach(() => {
        mockStorage();
        document.body.innerHTML = TEST_HTML;

        jest.resetModules();
        cells = Array.from(document.querySelectorAll(".cell"));
        statusEl = document.getElementById("status");
        game = require("../src/script.js");
        window.HTMLMediaElement.prototype.play.mockClear();
    });

    describe("Game Logic & Rules", () => {
        test("checkWin should detect horizontal win", () => {
            expect(game.checkWin("X", [
                "X", "X", "X",
                "O", "O", "",
                "", "", ""
            ])).toEqual([0, 1, 2]);
        });

        test("checkWin should detect vertical win", () => {
            expect(game.checkWin("O", [
                "O", "", "",
                "O", "", "",
                "O", "", ""
            ])).toEqual([0, 3, 6]);
        });

        test("checkWin should detect diagonal win", () => {
            expect(game.checkWin("X", [
                "X", "", "",
                "", "X", "",
                "", "", "X"
            ])).toEqual([0, 4, 8]);
        });

        test("checkWin should return null for no win", () => {
            expect(game.checkWin("X", [
                "X", "O", "X",
                "O", "X", "O",
                "O", "X", ""
            ])).toBeNull();
        });

        test("init should reset boardState to empty", () => {
            setBoard([
                "X", "O", "X",
                "O", "X", "O",
                "O", "X", ""
            ]);
            game.init();
            expect(game.boardState.every(c => c === "")).toBe(true);
        });

        test("init should reset currentPlayer to X", () => {
            game.currentPlayer = "O";
            game.init();
            expect(game.currentPlayer).toBe("X");
        });

        test("init should set running to true", () => {
            game.running = false;
            game.init();
            expect(game.running).toBe(true);
        });

        test("init should clear cell DOM content", () => {
            cells[0].textContent = "X";
            game.init();
            expect(cells[0].textContent).toBe("");
        });
    });

    describe("Player Actions", () => {
        test("makeMove should record mark on the board", () => {
            game.init();
            game.makeMove(0);
            expect(game.boardState[0]).toBe("X");
        });

        test("makeMove should switch player turn", () => {
            game.init();
            game.makeMove(0);
            expect(game.currentPlayer).toBe("O");
        });

        test("makeMove should detect win and update status", () => {
            game.init();
            setBoard([
                "X", "X", "",
                "O", "O", "",
                "", "", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(2);
            expect(game.running).toBe(false);
            expect(statusEl.textContent).toBe("X wins!");
        });

        test("makeMove should detect draw and update status", () => {
            game.init();
            setBoard([
                "X", "O", "X",
                "X", "O", "O",
                "O", "X", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(8);
            expect(game.running).toBe(false);
            expect(statusEl.textContent).toBe("It's a Draw!");
        });

        test("makeMove should handle personalized winning names", () => {
            game.init();
            game.playerNames.X = "Annie";
            setBoard([
                "X", "X", "",
                "O", "O", "",
                "", "", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(2);
            expect(statusEl.textContent).toBe("(X) Annie wins!");
        });
    });

    describe("Interaction Guards", () => {
        test("handleCellClick should ignore clicks when game is not running", () => {
            game.init();
            game.running = false;
            clickCell(0);
            expect(game.boardState[0]).toBe("");
        });

        test("handleCellClick should ignore clicks on already filled cells", () => {
            game.init();
            setBoard([
                "X", "", "",
                "", "", "",
                "", "", ""
            ]);
            game.currentPlayer = "O";
            clickCell(0);
            expect(game.currentPlayer).toBe("O"); // Should not have switched
        });

        test("handleCellClick should execute valid move", () => {
            game.init();
            clickCell(5);
            expect(game.boardState[5]).toBe("X");
        });
    });

    describe("Audio & Muting", () => {
        test("toggleMute should flip state and save to storage", () => {
            game.isMuted = false;
            game.toggleMute();
            expect(game.isMuted).toBe(true);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('noughts-and-crosses-muted', 'true');

            game.toggleMute();
            expect(game.isMuted).toBe(false);
            expect(window.localStorage.setItem).toHaveBeenCalledWith('noughts-and-crosses-muted', 'false');
        });

        test("updateMuteButtonUI should show Unmute label when muted", () => {
            game.isMuted = true;
            game.updateMuteButtonUI();
            expect(document.querySelector(".mute-label").textContent).toBe("Unmute");
            expect(document.querySelector(".mute-icon").textContent).toMatch(/🔇/);
        });

        test("updateMuteButtonUI should show Mute label when unmuted", () => {
            game.isMuted = false;
            game.updateMuteButtonUI();
            expect(document.querySelector(".mute-label").textContent).toBe("Mute");
            expect(document.querySelector(".mute-icon").textContent).toMatch(/🔊/);
        });

        test("sounds should play during move when unmuted", () => {
            game.isMuted = false;
            game.init();
            game.makeMove(0);
            expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
        });

        test("sounds should NOT play when muted", () => {
            game.isMuted = true;
            game.init();
            game.makeMove(0);
            expect(window.HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
        });
    });

    describe("Welcome Modal Integration", () => {
        test("Start Game should collect Friend mode names", () => {
            document.getElementById('player-x-input-friend').value = "Jack";
            document.getElementById('player-o-input-friend').value = "Jill";
            document.getElementById('welcome-start-btn').click();
            expect(game.playerNames.X).toBe("Jack");
            expect(game.playerNames.O).toBe("Jill");
        });

        test("Welcome modal should handle Computer mode selection names", () => {
            document.getElementById('computerX').checked = true;
            document.getElementById('player-o-input-comp').value = "Zach";
            document.getElementById('welcome-start-btn').click();

            expect(game.playerNames.O).toBe("Zach");
            expect(game.playerNames.X).toBe("Computer");
        });

        test("Start Game should fallback for blank names", () => {
            game.playerNames.X = "OldX";
            document.getElementById('welcome-start-btn').click();
            expect(game.playerNames.X).toBe("X");
        });
    });

    describe("Computer Opponent", () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        test("Selecting Computer O mode should set AI state and name", () => {
            document.getElementById('computerO').checked = true;
            document.getElementById('player-x-input-comp').value = "Human";
            document.getElementById('welcome-start-btn').click();

            expect(game.playerNames.O).toBe("Computer");
            expect(game.playerNames.X).toBe("Human");
            expect(game.computerOpponent).toBe("O");
        });

        test("Selecting Computer X mode should set AI state and name", () => {
            document.getElementById('computerX').checked = true;
            document.getElementById('player-o-input-comp').value = "Human";
            document.getElementById('welcome-start-btn').click();

            expect(game.playerNames.O).toBe("Human");
            expect(game.playerNames.X).toBe("Computer");
            expect(game.computerOpponent).toBe("X");
        });

        test("Computer should make a move after human turn", () => {
            // Setup AI as O
            document.getElementById('computerO').checked = true;
            document.getElementById('welcome-start-btn').click();

            // Human (X) moves
            game.makeMove(0);
            expect(game.currentPlayer).toBe("O");

            // Advance timers for setTimeout
            jest.advanceTimersByTime(500);

            // Verify computer moved
            expect(game.currentPlayer).toBe("X");
            expect(game.boardState.filter(c => c !== "").length).toBe(2);
        });

        test("Computer should move first if it is X", () => {
            document.getElementById('computerX').checked = true;
            document.getElementById('welcome-start-btn').click();

            // Advance timers for first move
            jest.advanceTimersByTime(500);

            expect(game.boardState.filter(c => c !== "").length).toBe(1);
            expect(game.currentPlayer).toBe("O");
        });

        test("Computer should not move if game is over", () => {
            document.getElementById('computerO').checked = true;
            document.getElementById('welcome-start-btn').click();

            setBoard([
                "X", "X", "",
                "O", "O", "",
                "", "", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(2); // X wins

            jest.advanceTimersByTime(500);

            // Current player stays X (game stopped)
            expect(game.running).toBe(false);
            expect(game.boardState.filter(c => c === "O").length).toBe(2); // No new O move
        });
    });

    describe("Result Presentation", () => {
        test("Winning should update result modal message", () => {
            game.init();
            setBoard([
                "X", "X", "",
                "O", "O", "",
                "", "", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(2);
            expect(document.getElementById('game-result').textContent).toMatch(/wins/);
        });

        test("Draw should update result modal message", () => {
            game.init();
            setBoard([
                "X", "O", "X",
                "X", "O", "O",
                "O", "X", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(8);
            expect(document.getElementById('game-result').textContent).toBe("It's a Draw!");
        });

        test("Winning should play win sound", () => {
            game.init();
            setBoard([
                "X", "X", "",
                "O", "O", "",
                "", "", ""
            ]);
            game.currentPlayer = "X";
            game.makeMove(2);
            expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
        });
    });
});
