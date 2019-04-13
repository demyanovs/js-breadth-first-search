class App {
    mapWidth = 480;
    mapHeight = 480;
    mapPadding = 20;
    cellSize = 40;
    canvas = document.getElementById("canvas");
    context = this.canvas.getContext("2d");

    reachable = [];
    explored = [];
    path = [];
    startNode = {};
    goalNode = {};

    colors = {board: '#EAE7E1', startNode: '#214ECA', goalNode: '#E52E2E', adjacent: '#00A30E', explored: '#878787', path: '#6CA1DA'};

    constructor(startNode, goalNode) {
        // Clear canvas
        this.clearCanvas();

        this.reachable.push({current: startNode, previous: {}});
        this.goalNode = goalNode;

        this.fillNode(startNode, this.colors.startNode);
        this.fillNode(goalNode, this.colors.goalNode);
        this.context.fillStyle = 'black';

        this.drawBoard();
        this.findPath();
        App.disableControls(true);
        /*
        this.canvas.onmouseover = function (e) {
            document.body.style.cursor = 'pointer';
        };
        this.canvas.onmouseout = function (e) {
            document.body.style.cursor = 'default';
        };
        */
        const self = this;
        this.canvas.addEventListener('click', function(e) {
            console.log(self.getMousePos(e));
        }, false);
    }

    async findPath() {
        async function wait() {
            return new Promise(function(resolve) {
                setTimeout(resolve, 10);
            });
        }

        let previousNode = {};
        let i = 0;
        while (this.reachable.length) {
            await wait();
            let nodeData = this.chooseNode(),
                node = nodeData.current;

            if ( App.areObjectsEqual(node, this.goalNode)) {
                App.disableControls(false);
                return this.buildPath(nodeData);
            }
            this.explored.push({current: node, previous: nodeData.previous, direction: nodeData.direction});
            document.querySelector('.breadth-search-container .explored .explored-list').innerHTML = JSON.stringify(this.explored);

            if (i > 0) {
                this.fillNode(node, this.colors.explored);
            }

            // Where can we get from here?
            this.getAdjacents(node, previousNode);
            document.querySelector('.breadth-search-container .reachable .reachable-list').innerHTML = JSON.stringify(this.reachable);

            previousNode = node;
            i++;
        }
    }

    chooseNode() {
        return this.reachable.shift();
    }

    getAdjacents(node, previousNode) {
        if (node.x - 1 > 0) {
            let adjacentNode = {x: node.x - 1, y: node.y};
            if (!this.isExplored(adjacentNode)) {
                if (!App.areObjectsEqual(adjacentNode, this.goalNode)) {
                    this.fillNode(adjacentNode, this.colors.adjacent);
                }
                this.reachable.push({current: adjacentNode, previous: node});
            }
        }
        if (node.x + 1 <= this.mapWidth / this.cellSize) {
            let adjacentNode = {x: node.x + 1, y: node.y};
            if (!this.isExplored(adjacentNode)) {
                if (!App.areObjectsEqual(adjacentNode, this.goalNode)) {
                    this.fillNode(adjacentNode, this.colors.adjacent);
                }
                this.reachable.push({current: adjacentNode, previous: node});
            }
        }
        if (node.y - 1 > 0) {
            let adjacentNode = {x: node.x, y: node.y - 1};
            if (!this.isExplored(adjacentNode)) {
                if (!App.areObjectsEqual(adjacentNode, this.goalNode)) {
                    this.fillNode(adjacentNode, this.colors.adjacent);
                }
                this.reachable.push({current: adjacentNode, previous: node});
            }
        }
        if (node.y + 1 <= this.mapHeight / this.cellSize) {
            let adjacentNode = {x: node.x, y: node.y + 1};
            if (!this.isExplored(adjacentNode)) {
                if (!App.areObjectsEqual(adjacentNode, this.goalNode)) {
                    this.fillNode(adjacentNode, this.colors.adjacent);
                }
                this.reachable.push({current: adjacentNode, previous: node});
            }
        }
    }

    buildPath(node) {
        this.path.push(this.goalNode);
        while (node) {
            let prevNode = this.explored.find((e) => App.areObjectsEqual(e.current, node.previous));
            if (prevNode == null) {
                break;
            }

            node = prevNode;
            if (JSON.stringify(node.previous) !== JSON.stringify(this.startNode)) {
                this.fillNode(node.current, this.colors.path);
            }
            this.path.push(prevNode.current);
        }
        document.querySelector('.breadth-search-container .path .path-list').innerHTML = JSON.stringify(this.path.reverse());
    }

    drawBoard() {
        // horizontal
        let i = 1;
        for (let x = 0; x <= this.mapHeight; x += this.cellSize) {
            this.context.moveTo(this.mapPadding, 0.5 + x + this.mapPadding);
            this.context.lineTo(this.mapWidth + this.mapPadding, 0.5 + x + this.mapPadding);
            if (i <= this.mapWidth/this.cellSize) {
                this.context.font = "20px Arial";
                this.context.fillText(i, x + this.cellSize / 2 + this.mapPadding / 2, this.mapPadding-5);
                i++;
            }
        }

        // vertical
        i = 1;
        for (let x = 0; x <= this.mapWidth; x += this.cellSize) {
            this.context.moveTo(0.5 + x + this.mapPadding, this.mapPadding);
            this.context.lineTo(0.5 + x + this.mapPadding, this.mapHeight + this.mapPadding);

            if (i <= this.mapWidth/this.cellSize) {
                this.context.font = "20px Arial";
                this.context.fillText(i, 0, x + this.cellSize / 2 + this.mapPadding + 5);
                i++;
            }
        }
        this.context.strokeStyle = "black";
        this.context.stroke();
    }

    getMousePos(evt) {
        var rect = this.canvas.getBoundingClientRect();
        let x = evt.clientX - rect.left,
            y = evt.clientY - rect.top;

        let ceil = {x: Math.ceil((x-this.mapPadding)/this.cellSize), y: Math.ceil((y-this.mapPadding)/this.cellSize)};
        return {x, y};
    }

    fillNode(node, color) {
        this.context.fillStyle = color;
        this.context.fillRect(this.cellSize * (node.x - 1) + this.mapPadding,this.cellSize * (node.y - 1) + this.mapPadding, this.cellSize, this.cellSize);
        this.context.stroke();
    }

    isExplored(node) {
        return (this.reachable.filter(e => App.areObjectsEqual(e.current, node)).length > 0 ||
            this.explored.filter(e => App.areObjectsEqual(e.current, node)).length > 0)
    }

    clearCanvas() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = this.colors.board;
        this.context.fillRect(this.mapPadding, this.mapPadding, this.mapWidth, this.mapHeight);
        document.querySelector('.breadth-search-container .path .path-list').innerHTML = '...';
    }

    static areObjectsEqual(obj1, obj2) {
        return JSON.stringify(obj1) === JSON.stringify(obj2);
    }

    static disableControls(disabled = true)
    {
        document.querySelector('#start-button').disabled = disabled;
    }
}

function start() {
    let x_start = parseInt(document.getElementById('x_start').value),
        y_start = parseInt(document.getElementById('y_start').value),
        x_goal = parseInt(document.getElementById('x_goal').value),
        y_goal = parseInt(document.getElementById('y_goal').value);
    const map = new App({x: x_start,y: y_start}, {x: x_goal, y: y_goal});
}


window.addEventListener("load", () => {
    const map = new App({x: 4,y: 5}, {x: 9, y: 11});
});