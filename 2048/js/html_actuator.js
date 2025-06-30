function HTMLActuator(gridSize) {
  this.tileContainer = document.querySelector(".tile-container");
  this.scoreContainer = document.querySelector(".score-container");
  this.bestContainer = document.querySelector(".best-container");
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
        self.message(false);
      } else if (metadata.won) {
        self.message(true);
      }
    }
  });
};

// Continua o jogo (reiniciar e keep playing)
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

  var wrapper = document.createElement("div");
  var inner = document.createElement("div");

  var position = tile.previousPosition || { x: tile.x, y: tile.y };
   // Adiciona a classe 'tile-blocked' se a propriedade existir
  var classes = tile.blocked ? ["tile", "tile-blocked"] : ["tile", "tile-" + tile.value];
  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = tile.value;

  this.setPosition(wrapper, position);

  if (tile.previousPosition) {
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

// Define posição lendo variáveis CSS dinâmicas
HTMLActuator.prototype.setPosition = function (element, position) {
  var style = getComputedStyle(document.documentElement);
  var cellSize = parseFloat(style.getPropertyValue("--tile-size"));
  var gap = parseFloat(style.getPropertyValue("--grid-gap"));
  var x = position.x;
  var y = position.y;

  // Exemplo de deslocamento dinâmico: quanto maior a grid, menor o deslocamento
  var offsetFactor;

  if (this.gridSize === 4) {
    offsetFactor = 0.12;  // deslocamento para 4x4
  } else if (this.gridSize === 5) {
    offsetFactor = 0.15;   // deslocamento para 5x5 (ajuste conforme visual)
  } else if (this.gridSize === 6) {
    offsetFactor = 0.20;   // deslocamento para 6x6
  } else {
    offsetFactor = 0.1;    // valor padrão para outros casos
  }

  var translateX = (x + offsetFactor) * (cellSize + gap);
  var translateY = (y + offsetFactor) * (cellSize + gap);

  element.style.transform =
    "translate(" + translateX + "px, " + translateY + "px)";
};

HTMLActuator.prototype.applyClasses = function applyClasses(element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function normalizePosition(
  position
) {
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
  var type = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function clearMessage() {
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};
