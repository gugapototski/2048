function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.inputManager   = new InputManager;
  this.storageManager = new StorageManager;
  this.actuator       = new Actuator;

  this.startTiles     = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

GameManager.prototype.WINNING_TILE = 2048;

// Restart the game
GameManager.prototype.restart = function restartGame() {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function continuePlaying() {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function isGameTerminated() {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();
  var wasSavedGame = previousState !== null;

  if (wasSavedGame) {
    var savedGrid = previousState.grid;
    var savedScore = previousState.score;
    var gameOver = previousState.over;
    var gameWon = previousState.won;
    var shouldKeepPlaying = previousState.keepPlaying;

    this.grid = new Grid(savedGrid.size, savedGrid.cells);
    this.score = savedScore;
    this.over = gameOver;
    this.won = gameWon;
    this.keepPlaying = shouldKeepPlaying;
  } else {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;

    this.addStartTiles();
  }

  this.actuate();
};


// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function addStartTiles() {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function addRandomTile() {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function actuateGrid() {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  if (this.over) {
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated()
  });
};

// Represent the current game as an object
GameManager.prototype.serialize = function serializeGame() {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function prepareTiles() {
  this.grid.eachCell(function resetTile(x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function moveTile(tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  var self = this;

  if (this.isGameTerminated()) return;

  var traversals = this.buildTraversals(this.getVector(direction));
  var moved = false;

  this.prepareTiles();

  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      var cell = { x: x, y: y };
      var tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, self.getVector(direction));
        var next = self.grid.cellContent(positions.next);

        if (self.canMerge(tile, next)) {
          self.mergeTiles(tile, next, positions.next);
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true;
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true;
    }

    this.actuate();
  }
};

// Novos métodos extraídos
GameManager.prototype.canMerge = function (tile, next) {
  return next && next.value === tile.value && !next.mergedFrom;
};

GameManager.prototype.mergeTiles = function (tile, next, position) {
  var merged = new Tile(position, tile.value * 2);
  merged.mergedFrom = [tile, next];

  this.grid.insertTile(merged);
  this.grid.removeTile(tile);
  tile.updatePosition(position);
  this.score += merged.value;

  if (merged.value === this.WINNING_TILE) this.won = true;
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function getVector(direction) {
  var map = {
    0: { x: 0,  y: -1 },
    1: { x: 1,  y: 0 },
    2: { x: 0,  y: 1 },
    3: { x: -1, y: 0 }
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function buildTraversals(vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function findFarthestPosition(cell, vector) {
  var previous;

  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell
  };
};

GameManager.prototype.movesAvailable = function movesAvailable() {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

GameManager.prototype.tileMatchesAvailable = function tileMatchesAvailable() {
  var self = this;
  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function positionsEqual(first, second) {
  return first.x === second.x && first.y === second.y;
};
