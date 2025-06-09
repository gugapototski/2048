function HTMLActuator(gridSize) {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
  this.gridSize = gridSize || 4;
}

HTMLActuator.prototype.actuate = function actuate(grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function renderFrame() {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function renderColumn(column) {
      column.forEach(function renderCell(cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }
  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function continueGame() {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function clearContainer(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function addTile(tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");

  // Posição atual ou anterior, para animar corretamente
  var position = tile.previousPosition || { x: tile.x, y: tile.y };

  // Aplica classes básicas
  var classes = ["tile", "tile-" + tile.value];
  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  // Posiciona o tile dinamicamente (removendo dependência de classes CSS fixas)
  this.setPosition(wrapper, position);

  if (tile.previousPosition) {
    // Animação para mover tile da posição anterior para a atual
    window.requestAnimationFrame(function () {
      self.setPosition(wrapper, { x: tile.x, y: tile.y });
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);

    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
  }

  wrapper.appendChild(inner);
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.setPosition = function(element, position) {
  // Ajuste para posição baseada em 1 (como no seu código original)
  var x = position.x - 0;
  var y = position.y - 0;

  // Cálculo do tamanho e gap (exemplo baseado no seu CSS atual)
  var totalWidth = 470;
  var gap = 15;

  // Pegue o tamanho da grade (coloque o valor dinâmico conforme precisar)
  var gridSize = this.gridSize;

  var cellSize = (totalWidth - gap * (gridSize - 1)) / gridSize;

  var translateX = x * (cellSize + gap);
  var translateY = y * (cellSize + gap);

  element.style.transform = "translate(" + translateX + "px, " + translateY + "px)";
};

HTMLActuator.prototype.applyClasses = function applyClasses(element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function normalizePosition(position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function positionClass(position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function updateScore(score) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function updateBestScore(bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function displayMessage(won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function clearMessage() {
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
