const cellsSize = 4

const canvas = document.getElementsByTagName("canvas")[0];
canvas.width = canvas.height = 200;
const ctx = canvas.getContext('2d');

const gameWidth = canvas.width/cellsSize;
const gameHeight = canvas.height/cellsSize;

class Cell {
    constructor(x, y, color="#000000") {
        this.x = x;
        this.y = y;
        this.color = color;
    }

    draw(ctx, color=this.color) {
        ctx.fillStyle = color;
        ctx.fillRect(this.x * cellsSize, this.y * cellsSize, cellsSize, cellsSize);
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
        //let cellsClone = this.cells.deepClone();


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

    start(interval_time, canvas, ctx) {
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
            return;
        }
        this.interval = setInterval(() => {
            clear(canvas, ctx);

            this.draw(ctx)
            this.tick()

        }, interval_time)
    }

    draw(ctx) {
        let time = performance.now();
        for (let cell of this.cells) {
            cell.draw(ctx);
        }
        time = performance.now() - time;
        console.log('Время отрисовки = ', time);
    }


    /**
     *
     * @param el is HTML element to bind controls
     * @param canvas where to draw after tick
     */
    bindStartStopStepControlsTo(el, canvas) {
        let ctx = canvas.getContext('2d');

        el.addEventListener("keydown",
            /**
             *
             * @param {KeyboardEvent} e
             */
            (e) => {
                console.log(e);
                if (e.key === " ") {
                    this.start(100, canvas, ctx);
                }

                if (e.code === "KeyW") {
                    clear(canvas, ctx);
                    this.tick();
                    this.draw(ctx);
                }
            }, false);
    }

    /**
     *
     * @param {HTMLCanvasElement} canvas where to bind spawn and despawn and to draw changes
     */
    bindSpawnAndDespawnControlsTo(canvas) {
        canvas.oncontextmenu = () => {return false;}

        let ctx = canvas.getContext("2d");

        let on_left_click = (e) => {
            let cell_x = Math.trunc(e.offsetX/cellsSize);
            let cell_y = Math.trunc(e.offsetY/cellsSize);

            let cell = findCellOn(cell_x, cell_y, this.cells);

            if (cell === null) {
                this.cells.push(new Cell(cell_x, cell_y));
            } else {
                return;
            }



            clear(canvas, ctx);
            this.draw(ctx);
        }

        let on_right_click = (e) => {
            let cell_x = Math.trunc(e.offsetX/cellsSize);
            let cell_y = Math.trunc(e.offsetY/cellsSize);

            let cell = findCellOn(cell_x, cell_y, this.cells);

            if (cell !== null) {
                this.cells.remove(cell);
            } else {
                return
            }

            clear(canvas, ctx);
            this.draw(ctx)
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

let mashine = new CellMashine([...cells], gameWidth, gameHeight);//cells, 10, 10);

mashine.draw(ctx);
mashine.bindSpawnAndDespawnControlsTo(canvas);
mashine.bindStartStopStepControlsTo(document, canvas);


