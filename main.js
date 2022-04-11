const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = canvas.height = 200;
const ctx = canvas.getContext('2d');

class Drawer {
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} cellsSize
     */
    constructor(ctx, cellsSize) {
        this.ctx = ctx;
        this.cellsSize = cellsSize;
    }

    get gameWidth() {
        return this.ctx.canvas.width/this.cellsSize
    }

    get gameHeight() {
        return this.ctx.canvas.height/this.cellsSize
    }

    /**
     *
     * @param {CellMachine} cellMachine
     */
    drawCellMachine(cellMachine) {
        let time = performance.now();
        for (let line = 0; line < cellMachine.height; line++) {
            for (let cell_i = 0; cell_i < cellMachine.width; cell_i++) {
                let cell = cellMachine.getCellOn(line, cell_i);//line, cell_i);
                if (cell.isDead) {
                    continue;
                }
                this.ctx.fillStyle = cell.color;
                this.ctx.fillRect(line * this.cellsSize, cell_i * this.cellsSize, this.cellsSize, this.cellsSize);
            }
        }
        time = performance.now() - time;
        console.log('Время отрисовки = ', time);
    }
}

class Cell {
    /**
     *
     * @param {string} color
     * @param {boolean} isDead
     */
    constructor(color="#000000", isDead) {
        this.color = color;
        this.isDead = isDead;
    }
}

class CellMachine {
    /**
     *
     * @param {Array<Array.<Cell>>} cells
     * @param {number} width
     * @param {number} height
     */
    constructor(cells, width, height) {
        this.width = width;
        this.height = height;

        this._cells = [];

        for (let x = 0; x < this.width; x++) {
            this._cells.push([]);
            for (let y = 0; y < this.height; y++) {
                this._cells[x].push(new Cell("#000000", true));
            }
        }

        this.interval = null;
    }

    getCellOn(x, y) {
        let cells = this._cells
        let cell = cells[x][y]
        if (cell === undefined) {
            throw new Error(`Out of range, given x = ${x}, y = ${y}, gameSize x = ${cells.length}, y = ${cells[0].length}`);
        }
        return cell;
    }

    getNeighborsCount(x, y) {
        let neighbors_count = 0
        for (let x_dif of [0, 1, -1]) {
            for (let y_dif of [0, 1, -1]) {
                if (x_dif === 0 && y_dif === 0) continue;
                let target_x = x + x_dif
                let target_y = y + y_dif
                if (target_x < 0 || target_x >= this.width || target_y < 0 || target_y >= this.height) continue;
                if (this.getCellOn(target_x, target_y).isDead === false) {neighbors_count++}
            }
        }

        return neighbors_count;
    }

    tick() {
        let time = performance.now();
        /**
         *
         * @type {Array<Array<Cell>>}
         */
        let cellsClone = deepClone(this._cells);
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let neighbors_count = this.getNeighborsCount(x, y);

                let cell = this.getCellOn(x,y);

                if (cell.isDead) {
                    if (neighbors_count === 3) {
                        cellsClone[x][y].isDead = false;
                    }
                } else {
                    if (![2,3].includes(neighbors_count)) {
                        cellsClone[x][y].isDead = true;
                    }
                }
            }
        }
        this._cells = cellsClone;
        time = performance.now() - time;
        console.log('Время тика = ', time);
    }

    /**
     *
     * @param interval_time
     * @param canvas
     * @param ctx
     * @param {Drawer} drawer
     */
    start(interval_time, canvas, ctx, drawer) {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
            return;
        }
        this.interval = setInterval(() => {
            clear(canvas, ctx);

            drawer.drawCellMachine(this);
            this.tick()

        }, interval_time)
    }


    /**
     *
     * @param el is HTML element to bind controls
     * @param canvas where to draw after tick
     * @param {Drawer} drawer
     */
    bindStartStopStepControlsTo(el, canvas, drawer) {
        let ctx = canvas.getContext('2d');

        el.addEventListener("keydown",
            /**
             *
             * @param {KeyboardEvent} e
             */
            (e) => {
                console.log(e);
                if (e.key === " ") {
                    this.start(100, canvas, ctx, drawer);
                }

                if (e.code === "KeyW") {
                    clear(canvas, ctx);
                    this.tick();
                    drawer.drawCellMachine(this);
                }
            }, false);
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas where to bind spawn and despawn and to draw changes
     * @param {Drawer} drawer
     */
    bindSpawnAndDespawnControlsTo(canvas, drawer) {
        canvas.oncontextmenu = () => {return false;}

        let ctx = canvas.getContext("2d");

        let on_left_click = (e) => {
            let cell_x = Math.trunc(e.offsetX/drawer.cellsSize);
            let cell_y = Math.trunc(e.offsetY/drawer.cellsSize);

            let cell = this.getCellOn(cell_x, cell_y);

            if (cell.isDead) {
                this.getCellOn(cell_x, cell_y).isDead = false;
            } else {
                return;
            }

            clear(canvas, ctx);
            drawer.drawCellMachine(this);
        }

        let on_right_click = (e) => {
            let cell_x = Math.trunc(e.offsetX/drawer.cellsSize);
            let cell_y = Math.trunc(e.offsetY/drawer.cellsSize);

            let cell = this.getCellOn(cell_x, cell_y);

            if (cell.isDead === false) {
                this.getCellOn(cell_x, cell_y).isDead = true;
            } else {
                return
            }

            clear(canvas, ctx);
            drawer.drawCellMachine(this);
        }

        canvas.addEventListener("click", (e) => {
            if (e.which === 1) {
                on_left_click(e);
            } else if (e.which === 3) {
                on_right_click(e);
            }
        })

        canvas.addEventListener("mousemove", (e) => {
            if (![1,2].includes(e.buttons)) {
                return;
            }

            if (e.buttons === 1) {
                on_left_click(e);
            } else if (e.buttons === 2) {
                on_right_click(e);
            }
        })
    }
}

function clear(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function deepClone(cells2d) {
    const clone = []
    for (let x = 0; x < cells2d.length; x++) {
        clone[x] = []
        for (let y = 0; y < cells2d[x].length; y++) {
            let cell = cells2d[x][y]
            clone[x].push(Object.assign(Object.create(cell), cell));
        }
    }

    return clone;
}

const drawer = new Drawer(ctx, 4);
const machine = new CellMachine([], drawer.gameWidth, drawer.gameHeight);

drawer.drawCellMachine(machine);
machine.bindSpawnAndDespawnControlsTo(canvas, drawer);
machine.bindStartStopStepControlsTo(document, canvas, drawer);