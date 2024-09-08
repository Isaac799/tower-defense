const base = 1;
const difficulty = 2;
const scale = 50;
const uiTick = 500;
const enemyTick = 1000;

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
        name: "stone",
        backgroundColor: "gray",
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

towerDict.set(1, {
        name: "archer",
        cost: Math.floor(base * 10 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 2),
        speed: Math.floor(base * 8),
        backgroundColor: "blue",
});

towerDict.set(2, {
        name: "catapult",
        cost: Math.floor(base * 20 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 8),
        speed: Math.floor(base * 2),
        backgroundColor: "green",
});

towerDict.set(3, {
        name: "mage",
        cost: Math.floor(base * 30 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 4),
        speed: Math.floor(base * 4),
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
        money: Math.floor(base * 10 - (difficulty / 5 + 1)),
        health: Math.floor(base * 2 * (difficulty / 5 + 1)),
        speed: Math.floor(base * 8 * (difficulty / 10 + 1)),
        addedToMap: false,
        moved: false,
        backgroundColor: "lightgreen",
});

enemyDict.set(2, {
        name: "troll",
        money: Math.floor(base * 20 - (difficulty / 5 + 1)),
        health: Math.floor(base * 8 * (difficulty / 5 + 1)),
        speed: Math.floor(base * 2 * (difficulty / 10 + 1)),
        addedToMap: false,
        moved: false,
        backgroundColor: "brown",
});

enemyDict.set(3, {
        name: "witch",
        money: Math.floor(base * 30 - (difficulty / 5 + 1)),
        health: Math.floor(base * 4 * (difficulty / 5 + 1)),
        speed: Math.floor(base * 4 * (difficulty / 10 + 1)),
        addedToMap: false,
        moved: false,
        backgroundColor: "lightpurple",
});
function PX(value) {
        return value * scale + "px";
}

class Program {
        money = 10000;
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
        mapT = [
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
        // posX = 100;
        // posY = 100;
        constructor() {
                this.board = document.getElementById("board");
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

        RemoveAllTiles() {
                let els = this.board.querySelectorAll(".tile");
                for (const e of els) {
                        this.board.removeChild(e);
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

                let t1 = towerDict.get(1);
                let t2 = towerDict.get(2);
                let t3 = towerDict.get(3);

                let t1el = document.createElement("div");
                t1el.classList.add("add-tower-item");
                t1el.innerText = t1.name;

                t1el.addEventListener("click", (event) => {
                        if (this.money >= t1.cost) {
                                this.money -= t1.cost;
                                this.AddTowerToMap(t1, x, y);
                        }
                        this.RemoveAllDrawAddTowerContextMenu();
                });
                let t2el = document.createElement("div");
                t2el.classList.add("add-tower-item");
                t2el.innerText = t2.name;
                t2el.addEventListener("click", (event) => {
                        if (this.money >= t2.cost) {
                                this.money -= t2.cost;
                                this.AddTowerToMap(t2, x, y);
                        }
                        this.RemoveAllDrawAddTowerContextMenu();
                });
                let t3el = document.createElement("div");
                t3el.classList.add("add-tower-item");
                t3el.innerText = t3.name;
                t3el.addEventListener("click", (event) => {
                        if (this.money >= t3.cost) {
                                this.money -= t3.cost;
                                this.AddTowerToMap(t3, x, y);
                        }
                        this.RemoveAllDrawAddTowerContextMenu();
                });

                el.appendChild(t1el);
                el.appendChild(t2el);
                el.appendChild(t3el);

                el.style.height = PX(2.5 * base);
                el.style.width = PX(2.5 * base);
                el.style.top = PX(x + base / 2);
                el.style.left = PX(y + base / 2);
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

        DrawEnemy(x, y) {
                let unit = this.mapE[x][y];
                if (!unit) {
                        return;
                }

                let el = document.createElement("div");
                el.classList.add("tile-unit");
                el.style.height = PX(base);
                el.style.width = PX(base);
                el.style.backgroundColor = unit.backgroundColor;
                el.innerText = unit.name;
                el.style.top = PX(x);
                el.style.left = PX(y);

                this.board.appendChild(el);
        }

        RemoveAllDrawnEnemies() {
                let els = this.board.querySelectorAll(".tile-unit");
                for (const e of els) {
                        this.board.removeChild(e);
                }
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

        EnemyAtFinish(x, y) {
                console.log("Enemy at end, removing it");
                this.mapE[x][y] = 0;
        }

        DrawTowers() {
                for (let x = 0; x < this.mapT.length; x++) {
                        const row = this.mapT[x];
                        for (let y = 0; y < row.length; y++) {
                                const col = row[y];
                                this.DrawTower(x, y);
                        }
                }
        }

        DrawTower(x, y) {
                let tower = this.mapT[x][y];
                if (!tower) {
                        return;
                }

                let el = document.createElement("div");
                el.classList.add("tile-tower");
                el.style.height = PX(base);
                el.style.width = PX(base);
                el.style.backgroundColor = tower.backgroundColor;
                el.innerText = tower.name;
                el.style.top = PX(x);
                el.style.left = PX(y);

                this.board.appendChild(el);
        }

        RemoveAllDrawnTowers() {
                let els = this.board.querySelectorAll(".tile-tower");
                for (const e of els) {
                        this.board.removeChild(e);
                }
        }

        AddTowerToMap(tower, x, y) {
                let targetPosition = this.mapT[x][y];
                let targetPositionOccupied = !!targetPosition;
                if (targetPositionOccupied) {
                        console.warn("tower pos occupied");
                        return false;
                }
                // this.map[x][y] = 2;
                this.mapT[x][y] = JSON.parse(JSON.stringify(tower));
                return true;
        }

        ProgressRound(enemies) {
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
                }, enemyTick);
        }

        DrawUi() {
                // this.RemoveAllTiles();
                // this.DrawTiles();
                this.RemoveAllDrawnTowers();
                this.DrawTowers();
                setTimeout(() => {
                        this.DrawUi();
                }, uiTick);
        }

        KickoffRound() {
                this.round += 1;
                let enemies = this.GenerateEnemies(this.round);
                this.ProgressRound(enemies);
        }

        Run() {
                this.round = 6;
                this.DrawTiles();
                this.KickoffRound();
                this.DrawUi();
        }
}

document.addEventListener("DOMContentLoaded", (event) => {
        const program = new Program();
        program.Run();
});
