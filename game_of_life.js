"use strict"


/**
 * A standard Conway's Game of Life Implementation
 */
class Life {

    constructor(columns = 200, rows = 100) {
        this._table = null;
        this._columns = columns;
        this._rows = rows;
        this._cells = null;
        this._running = false;
        this._wait_time = 100;
        this._mouse = false;

        this._live_cells = 0;
        this._live_cells_display = null;

        this._generation_display = null;
        this._generation = 0;

        this._time_display = null;
        this._time = 0;

        this._live_cells_chart_element = null;
        this._live_cells_chart = null;

        this._execution_time_chart_element = null;
        this._execution_time_chart = null;
    }

    init() {
        this._table = document.getElementById('world');
        this._generation_display = document.getElementById('generation');
        this._live_cells_display = document.getElementById('live-cells');
        this._time_display = document.getElementById('time-display');
        this._live_cells_chart_element = document.getElementById('cell-stats').getContext('2d');
        this._execution_time_chart_element = document.getElementById('time-stats').getContext('2d');

        this._live_cells_chart_element.canvas.height = 30;
        this._live_cells_chart_element.canvas.width = 80;
        this._execution_time_chart_element.canvas.height = 30;
        this._execution_time_chart_element.canvas.width = 80;

        this._live_cells_display.innerHTML = '0';
        this._generation_display.innerHTML = '0';
        this._time_display.innerHTML = '0';
        this._live_cells_chart = new Chart(this._live_cells_chart_element, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Live Cells',
                    borderColor: 'rgb(255, 99, 132)',
                    data: []
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
							display: true,
							labelString: 'Generations'
						},
                        display: true,
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 24,
                            min: 0,
                            beginAtZero: true,

                        }   
                    }],
                    yAxes: [{
                        scaleLabel: {
							display: true,
							labelString: 'Live Cells'
						},
                        display: true,
                        ticks: {
                            min: 0
                        }
                    }]

                }
            }
        });

        this._execution_time_chart = new Chart(this._execution_time_chart_element, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Execution Time',
                    borderColor: 'rgb(255, 99, 132)',
                    data: []
                }]
            },
        
            // Configuration options go here
            options: {
                scales: {
                    xAxes: [{
                        scaleLabel: {
							display: true,
							labelString: 'Generations'
						},
                        display: true,
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: 24,
                            min: 0,
                            beginAtZero: true,

                        }   
                    }],
                    yAxes: [{
                        scaleLabel: {
							display: true,
							labelString: 'Execution time (ms)'
						},
                        display: true,
                        ticks: {
                            min: 0
                        }
                    }]

                }
            }
        });

        this.create_grid();
        this.seed_random();
    }

    add_data(chart, label, data) {
        chart.data.labels.push(label);
        chart.data.datasets.forEach((dataset) => {
            dataset.data.push(data);
        });
        chart.update();
    }

    clear_chart(chart) {
        chart.data.labels = [];
        chart.data.datasets.forEach((dataset) => {
            dataset.data = [];
        });
        chart.update();
    }

    clear() {
        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                this._cells[i][j]._state = 0;
                this._cells[i][j].set_background_color(Colors.dead);
                this._cells[i][j]._new_state = 0;
            }
        }

        this._generation = 0;
        this._generation_display.innerHTML = '0';

        this._live_cells = 0;
        this._live_cells_display.innerHTML = '0';

        this._time = 0;
        this._time_display.innerHTML = '0';


        this.clear_chart(this._live_cells_chart);
        this.clear_chart(this._execution_time_chart);
    }

    /**
    * Randomly places live cells through the map
    */
    seed_random() {

        this._generation = 0;
        this._generation_display.innerHTML = '0';
        this._live_cells = 0;

        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                this._cells[i][j]._state = Math.floor(Math.random() * 1.3);
                if (this._cells[i][j]._state === 1) {
                    this._cells[i][j].make_alive()
                    this._live_cells += 1;
                }
            }
        }
        this._live_cells_display.innerHTML = this._live_cells;

        this.add_data(this._live_cells_chart, 0, this._live_cells);

    }

    /**
    * Constructs the map using basic HTML elements (table, tr, td)
    */
    create_grid() {
        let table = document.createElement('table');
        this._cells = [];

        for (var i = 0; i < this._rows; i++) {
            let line = document.createElement('tr');
            this._cells[i] = [];
            for (let j = 0; j < this._columns; j++) {
                let cell = new Cell();

                line.appendChild(cell.element);
                this._cells[i][j] = cell;
            }
            table.appendChild(line);
        }

        this._table.appendChild(table);
    }

    /**
    * Iterates the game state by 1 step.
    */
    iterate() {

        let start = (new Date).getMilliseconds();


        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {
                this.check_state(i, j);
            }
        }

        for (var i = 0; i < this._rows; i++) {
            for (var j = 0; j < this._columns; j++) {

                this._cells[i][j]._state = this._cells[i][j]._new_state;
                this._cells[i][j].update();
            }
        }

        this._generation_display.innerHTML = this._generation++;
        this._live_cells_display.innerHTML = this._live_cells;

        this._time = (new Date).getMilliseconds() - start;
        this._time_display.innerHTML = this._time;

        this.add_data(this._live_cells_chart, this._generation, this._live_cells);
        this.add_data(this._execution_time_chart, this._generation, this._time);

        if (this._running) {
            setTimeout(function () { life.iterate(); }, this._wait_time);
        }

    }

    /**
    * Applies the Game of Life rule's to a cell
    * @param {number} i cell row
    * @param {number} j cell column
    */
    check_state(i, j) {

        var neighbours = this.get_neighbours(i, j);


        if (this._cells[i][j].alive()) {

            if (neighbours != 3 && neighbours != 2) {
                //we are killing this cell

                this._cells[i][j]._new_state = 0;
                this._cells[i][j].set_background_color(Colors.dead);
            }
        } else if (!this._cells[i][j].alive()) {

            if (neighbours == 3) {
                //we are reviving this cell
                this._cells[i][j]._new_state = 1;
                this._cells[i][j].set_background_color(Colors.alive);
            }

        } else {
            this._cells[i][j]._new_state = 0;
            this._cells[i][j].set_background_color(Colors.dead);
        }

        if (this._cells[i][j]._state == 1 &&  this._cells[i][j]._new_state == 0) {
            this._live_cells -= 1;
        } else if (this._cells[i][j]._state == 0 &&  this._cells[i][j]._new_state == 1) {
            this._live_cells += 1;
        }

    }

    /**
    * Determines the number of live neighbours a cell has
    * @param {number} i cell row
    * @param {number} j cell column
    */
    get_neighbours(i, j) {
        var neighbours = 0;

        if (this._cells[i - 1] != undefined) {
            neighbours +=
                (this._cells[i - 1][j - 1] == undefined ? 0 : this._cells[i - 1][j - 1].state) +
                (this._cells[i - 1][j] == undefined ? 0 : this._cells[i - 1][j].state) +
                (this._cells[i - 1][j + 1] == undefined ? 0 : this._cells[i - 1][j + 1].state);
        }

        neighbours +=
            (this._cells[i][j - 1] == undefined ? 0 : this._cells[i][j - 1].state) +
            (this._cells[i][j + 1] == undefined ? 0 : this._cells[i][j + 1].state);

        if (this._cells[i + 1] != undefined) {
            neighbours +=
                (this._cells[i + 1][j - 1] == undefined ? 0 : this._cells[i + 1][j - 1].state) +
                (this._cells[i + 1][j] == undefined ? 0 : this._cells[i + 1][j].state) +
                (this._cells[i + 1][j + 1] == undefined ? 0 : this._cells[i + 1][j + 1].state);
        }

        return neighbours;
    }

    /**
    * Event handler: Single step button.
    */
    button_iterate() {
        this.iterate()
    }

    /**
    * Event handler: Continuous run button.
    */
    button_run(button) {
        this._running = !this._running;

        button.value = button.value == 'Run' ? 'Stop' : 'Run';

        if (this._running) {
            this.iterate();
        }
    }

    /**
    * Event handler: Clear map button.
    */
    button_clear() {
        this.clear();
        this.iterate();
    }

    /**
    * Event handler: Randomly seed map button.
    */
    button_seed() {
        this.clear();
        this.seed_random();
    }

};

/**
 * A Cell - the unit of life in this game.
 */
class Cell {
    constructor() {
        this._element = document.createElement('td')
        this._state = 0;
        this._new_state = 0;
        this._element.addEventListener('click', function (e) { this.toggle_state(); }.bind(this, event))

    }

    update() {
        if (this._state == 1) {
            this.make_alive();
        } else {
            this.make_dead();
        }
    }
    alive() {
        return this._state == 1;
    }

    set_background_color(color) {
        this._element.style.backgroundColor = color;
    }

    make_alive() {
        this.set_background_color(Colors.alive);
        this._state = 1;
    }

    make_dead() {
        this.set_background_color(Colors.dead);
        this._state = 0;
    }

    toggle_state() {
        if (this._state == 0) {
            this._state = 1;
            this._new_state = 1;
            this.set_background_color(Colors.alive)
        } else {
            this._state = 0;
            this._new_state = 0;
            this.set_background_color(Colors.dead)
        }
    }

    get element() {
        return this._element
    }

    get state() {
        return this._state
    }

    set state(state) {
        this._state = state
    }

    set new_state(new_state) {
        this._new_state = new_state
    }

    add_event(event, handler, capture) {
        if (/msie/i.test(navigator.userAgent)) {
            this._element.attachEvent('on' + event, handler);
        } else {
            this._addEventListener(event, handler, capture);
        }
    }
};

/**
 * Color codes
 * @enum {string}
 */
//TODO make this an enum
var Colors = {
    dead: '#FFFFFF',
    alive: '#7272FF'
};

var life = new Life();

/**
 * Starts Life when the page loads
 */
window.onload = function () {
    life.init();
}