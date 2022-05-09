// compiled from main.ts
var canvas = document.getElementById("game-canvas");
canvas.width = canvas.height = 200;
var ctx = canvas.getContext('2d');
var Drawer = /** @class */ (function () {
    function Drawer(ctx, cellsSize) {
        this.ctx = ctx;
        this.cellsSize = cellsSize;
    }
    Object.defineProperty(Drawer.prototype, "gameWidth", {
        get: function () {
            return this.ctx.canvas.width / this.cellsSize;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Drawer.prototype, "gameHeight", {
        get: function () {
            return this.ctx.canvas.height / this.cellsSize;
        },
        enumerable: false,
        configurable: true
    });
    Drawer.prototype.drawCellMachine = function (cellMachine) {
        var time = performance.now();
        for (var line = 0; line < cellMachine.height; line++) {
            for (var cell_i = 0; cell_i < cellMachine.width; cell_i++) {
                var cell = cellMachine.getCellOn(line, cell_i);
                if (cell.isDead) {
                    continue;
                }
                this.ctx.fillStyle = cell.color;
                this.ctx.fillRect(line * this.cellsSize, cell_i * this.cellsSize, this.cellsSize, this.cellsSize);
            }
        }
        time = performance.now() - time;
        console.log('Время отрисовки = ', time);
    };
    return Drawer;
}());
var Cell = /** @class */ (function () {
    function Cell(color, isDead) {
        if (color === void 0) { color = "#000000"; }
        this.color = color;
        this.isDead = isDead;
    }
    return Cell;
}());
var CellMachine = /** @class */ (function () {
    function CellMachine(width, height) {
        this.width = width;
        this.height = height;
        this._cells = [];
        for (var x = 0; x < this.width; x++) {
            this._cells.push([]);
            for (var y = 0; y < this.height; y++) {
                this._cells[x].push(new Cell("#000000", true));
            }
        }
        this.interval = null;
    }
    CellMachine.prototype.getCellOn = function (x, y) {
        var cells = this._cells;
        var cell = cells[x][y];
        if (cell === undefined) {
            throw new Error("Out of range, given x = " + x + ", y = " + y + ", gameSize x = " + cells.length + ", y = " + cells[0].length);
        }
        return cell;
    };
    CellMachine.prototype.getNeighborsCount = function (x, y) {
        var neighbors_count = 0;
        for (var _i = 0, _a = [0, 1, -1]; _i < _a.length; _i++) {
            var x_dif = _a[_i];
            for (var _b = 0, _c = [0, 1, -1]; _b < _c.length; _b++) {
                var y_dif = _c[_b];
                if (x_dif === 0 && y_dif === 0)
                    continue;
                var target_x = x + x_dif;
                var target_y = y + y_dif;
                if (target_x < 0 || target_x >= this.width || target_y < 0 || target_y >= this.height)
                    continue;
                if (this.getCellOn(target_x, target_y).isDead === false) {
                    neighbors_count++;
                }
            }
        }
        return neighbors_count;
    };
    CellMachine.prototype.tick = function () {
        var time = performance.now();
        var cellsClone = deepClone(this._cells);
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                var neighbors_count = this.getNeighborsCount(x, y);
                var cell = this.getCellOn(x, y);
                if (cell.isDead) {
                    if (neighbors_count === 3) {
                        cellsClone[x][y].isDead = false;
                    }
                }
                else {
                    if (![2, 3].includes(neighbors_count)) {
                        cellsClone[x][y].isDead = true;
                    }
                }
            }
        }
        this._cells = cellsClone;
        time = performance.now() - time;
        console.log('Время тика = ', time);
    };
    CellMachine.prototype.start = function (interval_time, canvas, ctx, drawer) {
        var _this = this;
        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
            return;
        }
        this.interval = setInterval(function () {
            clear(canvas, ctx);
            drawer.drawCellMachine(_this);
            _this.tick();
        }, interval_time);
    };
    /**
     *
     * @param el to bind controls
     * @param canvas where to draw after tick
     * @param {Drawer} drawer
     */
    CellMachine.prototype.bindStartStopStepControlsTo = function (el, canvas, drawer) {
        var _this = this;
        var ctx = canvas.getContext('2d');
        el.addEventListener("keydown", 
        /**
         *
         * @param {KeyboardEvent} e
         */
        function (e) {
            console.log(e);
            if (e.key === " ") {
                _this.start(100, canvas, ctx, drawer);
            }
            if (e.code === "KeyW") {
                clear(canvas, ctx);
                _this.tick();
                drawer.drawCellMachine(_this);
            }
        }, false);
    };
    CellMachine.prototype.bindSpawnAndDespawnControlsTo = function (canvas, drawer) {
        var _this = this;
        canvas.oncontextmenu = function () { return false; };
        var ctx = canvas.getContext("2d");
        var on_left_click = function (e) {
            var cell_x = Math.trunc(e.offsetX / drawer.cellsSize);
            var cell_y = Math.trunc(e.offsetY / drawer.cellsSize);
            var cell = _this.getCellOn(cell_x, cell_y);
            if (cell.isDead) {
                _this.getCellOn(cell_x, cell_y).isDead = false;
            }
            else {
                return;
            }
            clear(canvas, ctx);
            drawer.drawCellMachine(_this);
        };
        var on_right_click = function (e) {
            var cell_x = Math.trunc(e.offsetX / drawer.cellsSize);
            var cell_y = Math.trunc(e.offsetY / drawer.cellsSize);
            var cell = _this.getCellOn(cell_x, cell_y);
            if (cell.isDead === false) {
                _this.getCellOn(cell_x, cell_y).isDead = true;
            }
            else {
                return;
            }
            clear(canvas, ctx);
            drawer.drawCellMachine(_this);
        };
        canvas.addEventListener("click", function (e) {
            if (e.which === 1) {
                on_left_click(e);
            }
            else if (e.which === 3) {
                on_right_click(e);
            }
        });
        canvas.addEventListener("mousemove", function (e) {
            if (![1, 2].includes(e.buttons)) {
                return;
            }
            if (e.buttons === 1) {
                on_left_click(e);
            }
            else if (e.buttons === 2) {
                on_right_click(e);
            }
        });
    };
    return CellMachine;
}());
function clear(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function deepClone(cells2d) {
    var clone = [];
    for (var x = 0; x < cells2d.length; x++) {
        clone[x] = [];
        for (var y = 0; y < cells2d[x].length; y++) {
            var cell = cells2d[x][y];
            clone[x].push(Object.assign(Object.create(cell), cell));
        }
    }
    return clone;
}
var drawer = new Drawer(ctx, 4);
var machine = new CellMachine(drawer.gameWidth, drawer.gameHeight);
drawer.drawCellMachine(machine);
machine.bindSpawnAndDespawnControlsTo(canvas, drawer);
machine.bindStartStopStepControlsTo(document, canvas, drawer);
