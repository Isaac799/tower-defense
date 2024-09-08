const base = 1;
const difficulty = 2;
const scale = 50;
const uiTick = 250;
const blockmovementScore = 10;
const enemyTick = 10;

function normalize(value, array) {
        const min = Math.min(...array);
        const max = Math.max(...array);
        return (value - min) / (max - min);
}

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

function calculateDistance(point1, point2) {
        const x1 = point1.x;
        const y1 = point1.y;
        const x2 = point2[0];
        const y2 = point2[1];
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance;
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
    cost: number;
    damage: number;
    speed: number;
    backgroundColor: string;
    x: number;
    y: number;
}>}
 */
const towerDict = new Map();

towerDict.set(1, {
        name: "archer",
        cost: Math.floor(base * 10 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 2),
        speed: Math.floor(base * 8),
        backgroundColor: "blue",
        x: 0,
        y: 0,
});

towerDict.set(2, {
        name: "catapult",
        cost: Math.floor(base * 20 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 8),
        speed: Math.floor(base * 2),
        backgroundColor: "green",
        x: 0,
        y: 0,
});

towerDict.set(3, {
        name: "mage",
        cost: Math.floor(base * 30 + (difficulty / 5 + 1)),
        damage: Math.floor(base * 4),
        speed: Math.floor(base * 4),
        backgroundColor: "yellow",
        x: 0,
        y: 0,
});

/**
 * @type {Map<number, {
    name: string;
    health: number;
    money: number;
    speed: number;
    backgroundColor: string;
    addedToMap: boolean;
    moved: boolean;
    x: number;
    y: number;
}>}
 */
const enemyDict = new Map();

enemyDict.set(1, {
        name: "goblin",
        money: Math.floor(base * 10 - (difficulty / 5 + 1)),
        health: Math.floor(base * 2 * (difficulty / 5 + 1)),
        speed: 2,
        addedToMap: false,
        lastMove: "",
        moved: false,
        x: 0,
        y: 0,
        backgroundColor: "lightgreen",
});

enemyDict.set(2, {
        name: "troll",
        money: Math.floor(base * 20 - (difficulty / 5 + 1)),
        health: Math.floor(base * 8 * (difficulty / 5 + 1)),
        speed: 4,
        addedToMap: false,
        lastMove: "",
        moved: false,
        x: 0,
        y: 0,
        backgroundColor: "brown",
});

enemyDict.set(3, {
        name: "witch",
        money: Math.floor(base * 30 - (difficulty / 5 + 1)),
        health: Math.floor(base * 4 * (difficulty / 5 + 1)),
        speed: 3,
        addedToMap: false,
        lastMove: "",
        moved: false,
        x: 0,
        y: 0,
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
        subRound = 0;

        /**
         * @type {number[][]}
         */
        map = [
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [-1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, -2],
                [0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];
        ColEnemies = [];
        ColTowers = [];

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
                for (let i = 0; i < this.ColEnemies.length; i++) {
                        const unit = this.ColEnemies[i];
                        let el = document.createElement("div");
                        el.classList.add("tile-unit");
                        el.style.height = PX(base);
                        el.style.width = PX(base);
                        el.style.backgroundColor = unit.backgroundColor;
                        el.innerText = i + " " + unit.name.slice(0, 2);
                        el.style.top = PX(unit.x);
                        el.style.left = PX(unit.y);
                        this.board.appendChild(el);
                }
        }

        RemoveAllDrawnEnemies() {
                let els = this.board.querySelectorAll(".tile-unit");
                for (const e of els) {
                        this.board.removeChild(e);
                }
        }

        AddEnemyToMap(unit) {
                let spawnPoint = this.PickRandomSpawn();
                for (let i = 0; i < this.ColEnemies.length; i++) {
                        const e = this.ColEnemies[i];
                        if (e.x === spawnPoint[0] && e.y === spawnPoint[1]) {
                                // console.log(
                                //         "cannot add enemy to map, occupied"
                                // );
                                return false;
                        }
                }
                unit.x = spawnPoint[0];
                unit.y = spawnPoint[1];
                this.ColEnemies.push(unit);
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
                this.ColEnemies = this.ColEnemies.filter((e) => e.health > 0);
        }

        GetMapTileSore(x, y) {
                let tileKey = this.map[x][y];
                let tile = tileDict.get(tileKey);
                if (!tile) {
                        return scale;
                }
                return tile.canTravel ? 0 : blockmovementScore;
        }
        GetEnemyPositionSore(x, y) {
                for (let i = 0; i < this.ColEnemies.length; i++) {
                        const e = this.ColEnemies[i];
                        if (e.x === x && e.y === y) {
                                return blockmovementScore;
                        }
                }
                return 0;
        }

        GetMove(x, y) {
                return {
                        up: {
                                x: x,
                                y: y + 1,
                        },
                        down: {
                                x: x,
                                y: y - 1,
                        },
                        left: {
                                x: x - 1,
                                y: y,
                        },
                        right: {
                                x: x + 1,
                                y: y,
                        },
                };
        }

        GetScore(direction, x, y) {
                let score = 0;

                let move = this.GetMove(x, y);

                score += this.GetMapTileSore(
                        move[direction].x,
                        move[direction].y
                );
                score += this.GetEnemyPositionSore(
                        move[direction].x,
                        move[direction].y
                );

                return score;
        }

        NormalizesDistanceScores(x, y, goal) {
                let move = this.GetMove(x, y);

                let up = calculateDistance(move["up"], goal);
                let down = calculateDistance(move["down"], goal);
                let left = calculateDistance(move["left"], goal);
                let right = calculateDistance(move["right"], goal);

                let allDistances = [up, down, left, right];

                return {
                        up: normalize(up, allDistances),
                        down: normalize(down, allDistances),
                        left: normalize(left, allDistances),
                        right: normalize(right, allDistances),
                };
        }

        // CornerCheck(score, directionA, directionB) {
        //         if (score[directionA] >= blockmovementScore && score[directionB >= blockmovementScore]) {
        //                 console.log("Corner detected")
        //                 return
        //         }
        // }

        MoveEnemies() {
                for (let i = 0; i < this.ColEnemies.length; i++) {
                        let unit = this.ColEnemies[i];

                        let score = {
                                up: this.GetScore("up", unit.x, unit.y),
                                down: this.GetScore("down", unit.x, unit.y),
                                left: this.GetScore("left", unit.x, unit.y),
                                right: this.GetScore("right", unit.x, unit.y),
                        };
                        let distance = this.NormalizesDistanceScores(
                                unit.x,
                                unit.y,
                                this.finishPoints[0]
                        );
                        score.up += distance.up;
                        score.down += distance.down;
                        score.left += distance.left;
                        score.right += distance.right;

                        if (unit.lastMove === "up") {
                                score.down += 2;
                        } else if (unit.lastMove === "down") {
                                score.up += 2;
                        } else if (unit.lastMove === "left") {
                                score.right += 2;
                        } else if (unit.lastMove === "right") {
                                score.left += 2;
                        }

                        let moveOptions = Object.entries(score).sort(
                                (a, b) => a[1] - b[1]
                        );

                        let move = this.GetMove(unit.x, unit.y);
                        let toMoveScore = moveOptions[0][1];
                        let toMoveDirection = moveOptions[0][0];
                        let destination = move[toMoveDirection];

                        if (toMoveScore >= blockmovementScore) {
                                continue;
                        }

                        // if (
                        //         unit.lastMove === "up" &&
                        //         toMoveDirection === "down"
                        // ) {
                        //         unit.lastMove = "";
                        //         continue;
                        // }
                        // if (
                        //         unit.lastMove === "down" &&
                        //         toMoveDirection === "up"
                        // ) {
                        //         unit.lastMove = "";
                        //         continue;
                        // }

                        // if (
                        //         unit.lastMove === "left" &&
                        //         toMoveDirection === "right"
                        // ) {
                        //         unit.lastMove = "";
                        //         continue;
                        // }
                        // if (
                        //         unit.lastMove === "right" &&
                        //         toMoveDirection === "left"
                        // ) {
                        //         unit.lastMove = "";
                        //         continue;
                        // }

                        // if (
                        //         toMoveDirection === "left" ||
                        //         toMoveDirection === "right"
                        // ) {
                        //         debugger;
                        // }

                        let allowedToMove = this.subRound % unit.speed === 0;
                        if (!allowedToMove) {
                                console.log("NOT moving");
                                continue;
                        }

                        if (unit.moved) {
                                console.log("already moved unit");
                                continue;
                        }

                        let tileKey = this.map[destination.x][destination.y];
                        let tile = tileDict.get(tileKey);
                        let end = tile && tile.name === "finish";
                        if (end) {
                                this.EnemyAtFinish(i);
                                continue;
                        }

                        unit.moved = true;
                        unit.x = destination.x;
                        unit.y = destination.y;
                        unit.lastMove = toMoveDirection;
                }
        }

        PrepareEnemiesForMovement() {
                this.ColEnemies = this.ColEnemies.map((e) => {
                        e.moved = false;
                        return e;
                });
        }

        AllEnemiesMoved() {
                return this.ColEnemies.indexOf((e) => e.moved) === -1;
        }

        AllEnemiesGone() {
                return this.ColEnemies.length === 0;
        }

        EnemyAtFinish(i) {
                console.log("Enemy at end, removing it");
                this.ColEnemies.splice(i, 1);
        }

        DrawTowers() {
                for (let i = 0; i < this.ColTowers.length; i++) {
                        let tower = this.ColTowers[i];
                        let el = document.createElement("div");
                        el.classList.add("tile-tower");
                        el.style.height = PX(base);
                        el.style.width = PX(base);
                        el.style.backgroundColor = tower.backgroundColor;
                        el.innerText = tower.name;
                        el.style.top = PX(tower.x);
                        el.style.left = PX(tower.y);
                        this.board.appendChild(el);
                }
        }

        DrawTower(x, y) {}

        RemoveAllDrawnTowers() {
                let els = this.board.querySelectorAll(".tile-tower");
                for (const e of els) {
                        this.board.removeChild(e);
                }
        }

        AddTowerToMap(tower, x, y) {
                for (let i = 0; i < this.ColTowers.length; i++) {
                        const e = this.ColTowers[i];
                        if (e.x === x && e.y === y) {
                                console.log(
                                        "cannot add tower to map, occupied"
                                );
                                return false;
                        }
                }
                // this.map[x][y] = 2;
                let clonedTower = JSON.parse(JSON.stringify(tower));
                clonedTower.x = x;
                clonedTower.y = y;
                this.ColTowers.push(clonedTower);
                return true;
        }

        ProgressRound(enemies) {
                if (this.subRound >= 10) {
                        this.subRound = 0;
                }
                this.subRound += 1;
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
                        this.subRound = 0;
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
