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
     * @param {CellMashine} cellMashine
     */
    drawCellMashine(cellMashine) {
        let time = performance.now();
        for (let cell of cellMashine.cells) {
            this.drawCell(cell);
        }
        time = performance.now() - time;
        console.log('Время отрисовки = ', time);
    }

    /**
     *
     * @param {Cell} cell
     * @param {string} color
     */
    drawCell(cell, color=cell.color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(cell.x * this.cellsSize, cell.y * this.cellsSize, this.cellsSize, this.cellsSize);
    }
}

class Cell {
    constructor(x, y, color="#000000") {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}

class CellMashine {
    /**
     *
     * @param {Array.<Cell>} cells
     * @param {number} width
     * @param {number} height
     */
    constructor(cells, width, height) {
        this.cells = cells;
        this.width = width;
        this.height = height;

        this.interval = null;
    }

    tick() {
        let time = performance.now();
        let cellsClone = this.cells.slice();
        for (let x = 0; x < this.width; x++) {
            for (let y = 0; y < this.height; y++) {
                let neighbors_count = getNeighborsCount(x, y, this.cells);

                let cell = findCellOn(x, y, this.cells);

                if (cell === null) {
                    if (neighbors_count >= 3) {
                        cellsClone.push(new Cell(x, y))
                    }
                } else {
                    if (![2,3].includes(neighbors_count)) {
                        cellsClone.remove(cell);
                    }
                }
            }
        }
        this.cells = cellsClone;
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

            drawer.drawCellMashine(this);
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
                    drawer.drawCellMashine(this);
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

            let cell = findCellOn(cell_x, cell_y, this.cells);

            if (cell === null) {
                this.cells.push(new Cell(cell_x, cell_y));
            } else {
                return;
            }



            clear(canvas, ctx);
            drawer.drawCellMashine(this);
        }

        let on_right_click = (e) => {
            let cell_x = Math.trunc(e.offsetX/drawer.cellsSize);
            let cell_y = Math.trunc(e.offsetY/drawer.cellsSize);

            let cell = findCellOn(cell_x, cell_y, this.cells);

            if (cell !== null) {
                this.cells.remove(cell);
            } else {
                return
            }

            clear(canvas, ctx);
            drawer.drawCellMashine(this);
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

let cells = []

function clear(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function findCellOn(x, y, cells) {
    for (let cell of cells) {
        if (cell.x === x && cell.y === y) {
            return cell;
        }
    }

    return null;
}

Array.prototype.remove = function (item) {
    const index = this.indexOf(item);
    if (index > -1) {
        this.splice(index, 1);
        return true;
    } else {
        return false;
    }
}

Array.prototype.deepClone = function () {
    let clone = []
    for (let el of this) {
        clone.push(Object.assign(Object.create(el), el))
    }

    return clone;
}


function getNeighborsCount(x, y, cells) {
    let neighbors_count = 0
    for (let x_dif of [0, 1, -1]) {
        for (let y_dif of [0, 1, -1]) {
            if (x_dif === 0 && y_dif === 0) {continue;}
            if (findCellOn(x + x_dif, y + y_dif, cells) !== null) {neighbors_count++}
        }
    }

    return neighbors_count;
}

let drawer = new Drawer(ctx, 4);
let mashine = new CellMashine([...cells], drawer.gameWidth, drawer.gameHeight);//cells, 10, 10);

drawer.drawCellMashine(mashine);
mashine.bindSpawnAndDespawnControlsTo(canvas, drawer);
mashine.bindStartStopStepControlsTo(document, canvas, drawer);


