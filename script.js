const base = 1;
const difficulty = 2;
const scale = 50;

function isBitActive(number, bitPosition) {
        const mask = 1 << bitPosition;
        return (number & mask) !== 0;
}

function doubleValuesIfKeyExists(obj1, obj2) {
        const result = {};
        for (const [key, value] of Object.entries(obj1)) {
                result[key] = obj2.hasOwnProperty(key) ? value * 2 : value;
        }
        return result;
}

/**
 * @type {Map<number, {
    name: string;
    backgroundColor: string;
    enemyTravel: boolean;
}>}
 */
const tileDict = new Map();

tileDict.set(0, {
        name: "none",
        backgroundColor: "black",
        enemyTravel: false,
});

tileDict.set(1, {
        name: "dirt",
        backgroundColor: "tan",
        enemyTravel: true,
});

tileDict.set(2, {
        name: "tree",
        backgroundColor: "green",
        enemyTravel: false,
});

/**
 * @type {Map<number, {
    name: string;
    damage: number;
    speed: number;
    backgroundColor: string;
}>}
 */
const towerDict = new Map();

towerDict.set(0, {
        name: "archer",
        damage: base * 2,
        speed: base * 8,
        backgroundColor: "blue",
});

towerDict.set(1, {
        name: "catapult",
        damage: base * 8,
        speed: base * 2,
        backgroundColor: "green",
});

towerDict.set(2, {
        name: "mage",
        damage: base * 4,
        speed: base * 4,
        backgroundColor: "purple",
});

/**
 * @type {Map<number, {
    name: string;
    health: number;
    speed: number;
    backgroundColor: string;
}>}
 */
const enemyDict = new Map();

enemyDict.set(1, {
        name: "goblin",
        health: base * 2 * (difficulty / 5 + 1),
        speed: base * 8 * (difficulty / 10 + 1),
        backgroundColor: "lightgreen",
});

enemyDict.set(2, {
        name: "troll",
        health: base * 8 * (difficulty / 5 + 1),
        speed: base * 2 * (difficulty / 10 + 1),
        backgroundColor: "lightbrown",
});

enemyDict.set(4, {
        name: "witch",
        health: base * 4 * (difficulty / 5 + 1),
        speed: base * 4 * (difficulty / 10 + 1),
        backgroundColor: "lightpurple",
});
function PX(value) {
        return value * scale + "px";
}

class Program {
        /**
         * @type {undefined | [number, number]}
         */
        selectedTile;

        round = 0;

        /**
         * @type {number[][]}
         */
        map = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        /**
         * @type {HTMLElement}
         */
        board;
        // posX = 100;
        // posY = 100;
        constructor() {
                this.board = document.getElementById("board");
                this.DrawTiles();
        }

        DrawTiles() {
                for (let x = 0; x < this.map.length; x++) {
                        const row = this.map[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                this.DrawTile(x, y);
                        }
                }
        }

        RemoveAllDrawAddTowerContextMenu() {
                let els = this.board.querySelectorAll(
                        ".add-tower-context-menu"
                );
                for (const e of els) {
                        this.board.removeChild(e);
                }
        }

        DrawAddTowerContextMenu(x, y) {
                this.RemoveAllDrawAddTowerContextMenu();
                let el = document.createElement("div");
                el.classList.add("add-tower-context-menu");
                el.addEventListener("mouseleave", (event) => {
                        this.selectedTile = null;
                        this.RemoveAllDrawAddTowerContextMenu();
                });
                el.style.height = PX(2.5 * base);
                el.style.width = PX(2.5 * base);
                el.style.top = PX(x + base / 2);
                el.style.left = PX(y + base / 2);
                console.log("Adding context menu");
                this.board.appendChild(el);
                return el;
        }

        DrawTile(x, y) {
                // console.log("drawing tile", x, y);
                let tileKey = this.map[x][y];
                let tile = tileDict.get(tileKey);

                let el = document.createElement("div");
                el.classList.add("tile");
                if (tile.name === "none") {
                        el.classList.add("tile-modifiable");
                        el.addEventListener("contextmenu", (event) => {
                                event.preventDefault();
                                this.DrawAddTowerContextMenu(x, y);
                                this.selectedTile = [x, y];
                        });
                }
                el.style.height = PX(base);
                el.style.width = PX(base);
                el.style.backgroundColor = tile.backgroundColor;
                el.style.top = PX(x);
                el.style.left = PX(y);

                this.board.appendChild(el);
        }

        ProgressRound() {
                console.log("progressing round");
                this.round += 1;
                let enemys = this.DetermineEnemy(this.round);
                console.log(" * * * enemys", enemys);
        }

        DetermineEnemy(r) {
                let enemyCounts = {};
                for (let i = 1; i <= r + 1; i++) {
                        const enemy = i - 1;
                        if (i < r) {
                                let o = this.DetermineEnemy(enemy);
                                enemyCounts = doubleValuesIfKeyExists(
                                        enemyCounts,
                                        o
                                );
                        }
                        if (isBitActive(r, enemy)) {
                                if (enemyCounts[i]) {
                                        enemyCounts[i] *= 2;
                                } else {
                                        enemyCounts[i] = 1;
                                }
                        }
                }
                return enemyCounts;
        }

        Run() {
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
                this.ProgressRound();
        }
}

document.addEventListener("DOMContentLoaded", (event) => {
        const program = new Program();
        program.Run();
});
