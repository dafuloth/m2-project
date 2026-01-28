/**
 * @jest-environment jsdom
 */

// --- TEST CONSTANTS ---
const SCOREBOARD_HTML = `
  <div id="status"></div>
  <button id="restart">Restart</button>
  <button id="clear-history" class="btn hidden">Clear History</button>
  <div id="board">
    <button class="cell" data-index="0"></button>
  </div>
  <table>
    <tbody id="scoreboard-body"></tbody>
  </table>
`;

describe("Scoreboard", () => {
    let scoreboardBody, game;

    // --- TEST HELPERS ---
    const mockStorage = () => {
        let store = {};
        const mock = {
            getItem: jest.fn(key => store[key] || null),
            setItem: jest.fn((key, v) => { store[key] = v.toString(); }),
            removeItem: jest.fn(key => { delete store[key]; }),
            clear: jest.fn(() => { store = {}; })
        };
        Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
        return mock;
    };

    beforeAll(() => {
        HTMLDialogElement.prototype.showModal = jest.fn();
        HTMLDialogElement.prototype.close = jest.fn();
    });

    beforeEach(() => {
        mockStorage();
        document.body.innerHTML = SCOREBOARD_HTML;

        jest.resetModules();
        scoreboardBody = document.getElementById("scoreboard-body");
        game = require("../src/script.js");
    });

    describe("Persistence of Game History", () => {
        test("recordGameResult should add a row to UI and save to storage", () => {
            game.recordGameResult("X wins!");

            const rows = scoreboardBody.querySelectorAll("tr");
            expect(rows.length).toBe(1);
            expect(rows[0].querySelectorAll("td")[1].textContent).toBe("X wins!");
            expect(window.localStorage.setItem).toHaveBeenCalledWith('noughts-and-crosses-history', expect.stringContaining('X wins!'));
        });

        test("loadScoreboard should rebuild the UI from storage data", () => {
            const mockHistory = [{ timestamp: "10:00 AM", result: "Archived Win" }];
            window.localStorage.setItem('noughts-and-crosses-history', JSON.stringify(mockHistory));

            game.loadScoreboard();

            const rows = scoreboardBody.querySelectorAll("tr");
            expect(rows.length).toBe(1);
            expect(rows[0].querySelectorAll("td")[1].textContent).toBe("Archived Win");
        });

        test("recordGameResult should prepend latest results for easy viewing", () => {
            game.recordGameResult("Game 1");
            game.recordGameResult("Game 2");

            const rows = scoreboardBody.querySelectorAll("tr");
            expect(rows[0].querySelectorAll("td")[1].textContent).toBe("Game 2");
            expect(rows[1].querySelectorAll("td")[1].textContent).toBe("Game 1");
        });

        test("recordGameResult should handle missing scoreboardBody gracefully", () => {
            document.body.innerHTML = "";
            jest.resetModules();
            game = require("../src/script.js");
            expect(() => game.recordGameResult("No crash")).not.toThrow();
        });
    });

    describe("Scoreboard UI Controls", () => {
        test("clearScoreboard should wipe UI and storage completely", () => {
            game.recordGameResult("Deletable Result");
            game.clearScoreboard();

            expect(scoreboardBody.querySelectorAll("tr").length).toBe(0);
            expect(window.localStorage.removeItem).toHaveBeenCalledWith('noughts-and-crosses-history');
        });

        test("Clear button visibility should sync with history content", () => {
            const clearBtn = document.getElementById("clear-history");

            // Initially hidden
            game.updateClearButtonVisibility();
            expect(clearBtn.classList.contains("hidden")).toBe(true);

            // Visible after record
            game.recordGameResult("X wins!");
            expect(clearBtn.classList.contains("hidden")).toBe(false);

            // Hidden after clear
            game.clearScoreboard();
            expect(clearBtn.classList.contains("hidden")).toBe(true);
        });
    });
});
