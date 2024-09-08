const base = 1;
const difficulty = 2;
const scale = 50;
const tick = 100;

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

function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
}

/**
 * @type {Map<number, {
    name: string;
    backgroundColor: string;
    canTravel: boolean;
}>}
 */
const tileDict = new Map();

tileDict.set(-1, {
        name: "spawn",
        backgroundColor: "indigo",
        canTravel: true,
});

tileDict.set(-2, {
        name: "finish",
        backgroundColor: "indigo",
        canTravel: true,
});

tileDict.set(0, {
        name: "none",
        backgroundColor: "black",
        canTravel: false,
});

tileDict.set(1, {
        name: "dirt",
        backgroundColor: "tan",
        canTravel: true,
});

tileDict.set(2, {
        name: "tree",
        backgroundColor: "green",
        canTravel: false,
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
        backgroundColor: "yellow",
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
        addedToMap: false,
        moved: false,
        backgroundColor: "lightgreen",
});

enemyDict.set(2, {
        name: "troll",
        health: base * 8 * (difficulty / 5 + 1),
        speed: base * 2 * (difficulty / 10 + 1),
        addedToMap: false,
        moved: false,
        backgroundColor: "brown",
});

enemyDict.set(3, {
        name: "witch",
        health: base * 4 * (difficulty / 5 + 1),
        speed: base * 4 * (difficulty / 10 + 1),
        addedToMap: false,
        moved: false,
        backgroundColor: "lightpurple",
});
function PX(value) {
        return value * scale + "px";
}

class Program {
        progressingRound = false;
        /**
         * @type {[number, number][]}
         */
        spawnPoints = [];
        /**
         * @type {[number, number][]}
         */
        finishPoints = [];
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
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [-1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -2],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [-1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, -2],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        mapE = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        /**
         * @type {HTMLElement}
         */
        board;
        /**
         * @type {HTMLElement}
         */
        boardE;
        // posX = 100;
        // posY = 100;
        constructor() {
                this.board = document.getElementById("board");
                this.boardE = document.getElementById("boardE");
                this.DrawTiles();
                this.spawnPoints = this.DetermineSpawnPoints();
                this.finishPoints = this.DetermineFinishPoints();
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
        DetermineEnemiesForRound(r) {
                let enemyCounts = {};

                for (let i = 1; i <= r + 1; i++) {
                        const enemy = i - 1;
                        if (i < r) {
                                let o = this.DetermineEnemiesForRound(enemy);
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

        GenerateEnemies(r) {
                let counts = this.DetermineEnemiesForRound(r);

                let finalEnemies = [];
                let units = Object.entries(counts);
                for (let i = 0; i < units.length; i++) {
                        let enemy = units[i];
                        let unitIdentifier = parseInt(enemy[0]);
                        let unitCount = enemy[1];
                        for (let j = 0; j < unitCount; j++) {
                                let unit = enemyDict.get(unitIdentifier);
                                if (!unit) {
                                        console.error(
                                                "cannot find unit ",
                                                unitIdentifier
                                        );
                                        return;
                                }
                                let clonedUnit = JSON.parse(
                                        JSON.stringify(unit)
                                );
                                finalEnemies.push(clonedUnit);
                        }
                }
                shuffleArray(finalEnemies);
                return finalEnemies;
        }

        /**
         * @returns {[number, number]}
         */
        DetermineSpawnPoints() {
                let options = [];
                for (let x = 0; x < this.map.length; x++) {
                        const row = this.map[x];
                        for (let y = 0; y < row.length; y++) {
                                let tileKey = this.map[x][y];
                                let tile = tileDict.get(tileKey);
                                if (tile.name === "spawn") {
                                        options.push([x, y]);
                                }
                        }
                }
                return options;
        }

        /**
         * @returns {[number, number]}
         */
        DetermineFinishPoints() {
                let options = [];
                for (let x = 0; x < this.map.length; x++) {
                        const row = this.map[x];
                        for (let y = 0; y < row.length; y++) {
                                let tileKey = this.map[x][y];
                                let tile = tileDict.get(tileKey);
                                if (tile.name === "finish") {
                                        options.push([x, y]);
                                }
                        }
                }
                return options;
        }

        /**
         *
         * @returns {[number, number]}
         */
        PickRandomSpawn() {
                return this.spawnPoints[
                        Math.floor(Math.random() * this.spawnPoints.length)
                ];
        }

        DrawEnemies() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                this.DrawEnemy(x, y);
                        }
                }
        }

        RemoveAllDrawnEnemies() {
                let els = this.boardE.querySelectorAll(".tile-unit");
                for (const e of els) {
                        this.boardE.removeChild(e);
                }
        }

        DrawEnemy(x, y) {
                let unit = this.mapE[x][y];
                if (!unit) {
                        return;
                }

                let el = document.createElement("div");
                el.classList.add("tile-unit");
                // if (tile.name === "none") {
                //         el.classList.add("tile-unit");
                //         el.addEventListener("contextmenu", (event) => {
                //                 event.preventDefault();
                //                 this.DrawAddTowerContextMenu(x, y);
                //                 this.selectedTile = [x, y];
                //         });
                // }
                el.style.height = PX(base);
                el.style.width = PX(base);
                el.style.backgroundColor = unit.backgroundColor;
                el.innerText = unit.name;
                el.style.top = PX(x);
                el.style.left = PX(y);

                this.boardE.appendChild(el);
        }

        AddEnemyToMap(unit) {
                let spawnPoint = this.PickRandomSpawn();
                let targetPosition = this.mapE[spawnPoint[0]][spawnPoint[1]];
                let targetPositionOccupied = !!targetPosition;
                if (targetPositionOccupied) {
                        return false;
                }
                this.mapE[spawnPoint[0]][spawnPoint[1]] = unit;
                return true;
        }

        /**
         * @param {{[x:number]:number}} enemies
         */
        AddEnemiesToMap(enemies) {
                for (let i = 0; i < enemies.length; i++) {
                        const e = enemies[i];
                        let success = this.AddEnemyToMap(e);
                        if (success) {
                                e.addedToMap = true;
                        }
                }
                return enemies.filter((e) => !e.addedToMap);
        }

        RemoveDeadEnemies() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                let unit = this.mapE[x][y];
                                if (!unit || unit.health > 0) {
                                        continue;
                                }
                                this.mapE[x][y] = 0;
                        }
                }
        }

        MoveEnemies() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                this.MoveEnemy(x, y);
                        }
                }
        }

        PrepareEnemiesForMovement() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                let unit = this.mapE[x][y];
                                if (!unit) {
                                        continue;
                                }
                                unit.moved = false;
                        }
                }
        }

        AllEnemiesMoved() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                let unit = this.mapE[x][y];
                                if (unit && !unit.moved) {
                                        return false;
                                }
                        }
                }
                return true;
        }

        AllEnemiesGone() {
                for (let x = 0; x < this.mapE.length; x++) {
                        const row = this.mapE[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                let unit = this.mapE[x][y];
                                if (unit) {
                                        return false;
                                }
                        }
                }
                return true;
        }

        MoveEnemy(x, y) {
                let unit = this.mapE[x][y];
                if (!unit) {
                        return;
                }
                if (unit.moved) {
                        return;
                }
                let destination = this.mapE[x][y + 1];
                let destinationOcupied = !!destination;

                let tileKey = this.map[x][y + 1];
                let tile = tileDict.get(tileKey);
                let end = tile && tile.name === "finish";
                if (end) {
                        this.EnemyAtFinish(x, y);
                        return;
                }

                if (destinationOcupied) {
                        if (destination) return;
                }
                unit.moved = true;
                this.mapE[x][y + 1] = unit;
                this.mapE[x][y] = 0;
        }

        EnemyAtFinish(x, y) {
                console.log("Enemy at end, removing it");
                this.mapE[x][y] = 0;
        }

        ProgressRound(enemies) {
                this.progressingRound = true;

                this.RemoveDeadEnemies();
                this.PrepareEnemiesForMovement();
                this.MoveEnemies();

                let doneSpawning = enemies.length === 0;
                if (!doneSpawning) {
                        enemies = this.AddEnemiesToMap(enemies);
                }

                this.RemoveAllDrawnEnemies();
                this.DrawEnemies();

                if (this.AllEnemiesGone() && doneSpawning) {
                        console.log("round finished");
                        return;
                }

                setTimeout(() => {
                        this.ProgressRound(enemies);
                }, tick);
        }

        KickoffRound() {
                this.round += 1;
                let enemies = this.GenerateEnemies(this.round);
                this.ProgressRound(enemies);
        }

        Run() {
                this.round = 6;
                this.KickoffRound();
        }
}

document.addEventListener("DOMContentLoaded", (event) => {
        const program = new Program();
        program.Run();
});
