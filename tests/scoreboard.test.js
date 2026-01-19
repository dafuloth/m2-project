/**
 * @jest-environment jsdom
 */

describe("Scoreboard", () => {
    let scoreboardBody, game;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (() => {
            let store = {};
            return {
                getItem: jest.fn(key => store[key] || null),
                setItem: jest.fn((key, value) => {
                    store[key] = value.toString();
                }),
                clear: jest.fn(() => {
                    store = {};
                }),
                removeItem: jest.fn(key => {
                    delete store[key];
                })
            };
        })();
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        document.body.innerHTML = `
            <div id="status"></div>
            <button id="restart">Restart</button>
            <div id="board">
                <button class="cell" data-index="0"></button>
            </div>
            <table>
                <tbody id="scoreboard-body"></tbody>
            </table>
        `;

        jest.resetModules();
        scoreboardBody = document.getElementById("scoreboard-body");
        game = require("../src/script.js");
    });

    test("recordGameResult should add a row to the scoreboard and save to localStorage", () => {
        game.recordGameResult("X wins!");

        const rows = scoreboardBody.querySelectorAll("tr");
        expect(rows.length).toBe(1);

        const cells = rows[0].querySelectorAll("td");
        expect(cells.length).toBe(2);
        expect(cells[1].textContent).toBe("X wins!");

        // Check if the first cell (timestamp) is not empty
        expect(cells[0].textContent).not.toBe("");

        // Final expectation: check localStorage
        expect(window.localStorage.setItem).toHaveBeenCalledWith('tic-tac-toe-history', expect.stringContaining('X wins!'));
    });

    test("loadScoreboard should populate the UI from localStorage", () => {
        const mockHistory = [
            { timestamp: "Jan 1, 2026, 10:00 AM", result: "Old Result" }
        ];
        window.localStorage.setItem('tic-tac-toe-history', JSON.stringify(mockHistory));

        // Trigger load
        game.loadScoreboard();

        const rows = scoreboardBody.querySelectorAll("tr");
        expect(rows.length).toBe(1);
        expect(rows[0].querySelectorAll("td")[1].textContent).toBe("Old Result");
    });

    test("recordGameResult should prepend new results to the top and update localStorage", () => {
        game.recordGameResult("First Game");
        game.recordGameResult("Second Game");

        const rows = scoreboardBody.querySelectorAll("tr");
        expect(rows.length).toBe(2);

        // "Second Game" should be the first row
        expect(rows[0].querySelectorAll("td")[1].textContent).toBe("Second Game");
        expect(rows[1].querySelectorAll("td")[1].textContent).toBe("First Game");

        // Verify localStorage contains both
        const stored = JSON.parse(window.localStorage.getItem('tic-tac-toe-history'));
        expect(stored.length).toBe(2);
        expect(stored[0].result).toBe("Second Game");
    });

    test("recordGameResult should do nothing if scoreboardBody is missing", () => {
        document.body.innerHTML = "";
        jest.resetModules();
        game = require("../src/script.js");

        expect(() => game.recordGameResult("Should not crash")).not.toThrow();
    });


    test("clearScoreboard should remove all results from UI and localStorage", () => {
        game.recordGameResult("Game to clear");
        expect(scoreboardBody.querySelectorAll("tr").length).toBe(1);

        game.clearScoreboard();

        expect(scoreboardBody.querySelectorAll("tr").length).toBe(0);
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('tic-tac-toe-history');
        expect(window.localStorage.getItem('tic-tac-toe-history')).toBeNull();
    });
});
