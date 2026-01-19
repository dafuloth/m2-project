/**
 * @jest-environment jsdom
 */

describe("Scoreboard Functionality", () => {
    let scoreboardBody, game;

    beforeEach(() => {
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

    test("recordGameResult should add a row to the scoreboard", () => {
        game.recordGameResult("X wins!");

        const rows = scoreboardBody.querySelectorAll("tr");
        expect(rows.length).toBe(1);

        const cells = rows[0].querySelectorAll("td");
        expect(cells.length).toBe(2);
        expect(cells[1].textContent).toBe("X wins!");

        // Check if the first cell (timestamp) is not empty
        expect(cells[0].textContent).not.toBe("");
    });

    test("recordGameResult should prepend new results to the top", () => {
        game.recordGameResult("First Game");
        game.recordGameResult("Second Game");

        const rows = scoreboardBody.querySelectorAll("tr");
        expect(rows.length).toBe(2);

        // "Second Game" should be the first row
        expect(rows[0].querySelectorAll("td")[1].textContent).toBe("Second Game");
        expect(rows[1].querySelectorAll("td")[1].textContent).toBe("First Game");
    });

    test("recordGameResult should do nothing if scoreboardBody is missing", () => {
        document.body.innerHTML = ""; // Clear the DOM
        // Re-require to refresh internal variables if necessary, 
        // but scoreboardBody is a const at the top level of script.js.
        // Actually, it's a const initialized at the start of script.js execution.
        // So we need to reset modules AFTER clearing the DOM.
        jest.resetModules();
        game = require("../src/script.js");

        // This should not throw an error
        expect(() => game.recordGameResult("Should not crash")).not.toThrow();
    });
});
