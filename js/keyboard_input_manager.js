function KeyboardInputManager() {
  this.events = {};
  this.moveCount = 0; 

  // --- Início das variáveis de tempo ---
  this.time = 0;
  this.timerInterval = null;
  this.startTimer();
  // --- Fim ---

  if (window.navigator.msPointerEnabled) {
    // Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function on(event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function emit(event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function callCallback(callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function listen() {
  var self = this;

  var map = {
    38: 0, 39: 1, 40: 2, 37: 3,
    75: 0, 76: 1, 74: 2, 72: 3,
    87: 0, 68: 1, 83: 2, 65: 3
  };

  // captura de teclas
  document.addEventListener("keydown", function handleKeydown(event) {
    var modifiers = event.altKey||event.ctrlKey||event.metaKey||event.shiftKey;
    var mapped    = map[event.which];

    if (!modifiers && mapped !== undefined) {
      event.preventDefault();

      var invert = document.getElementById('invert-controls').checked;
      var dir    = invert ? (mapped ^ 2) : mapped;

      // incrementa contador
      self.moveCount++;
      document.getElementById('move-count').textContent = self.moveCount;

      self.emit("move", dir);
    }

    // tecla R reinicia
    if (!modifiers && event.which === 82) {
      self.restart.call(self, event);
    }
  });

  // botões UI
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restart);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);

  // bind dos botões de dificuldade para também disparar o restart do inputManager
  this.bindButtonPress("#btn-easy", this.restart);
  this.bindButtonPress("#btn-medium", this.restart);
  this.bindButtonPress("#btn-hard", this.restart);

  // swipe/toque (sem alteração)
  var touchStartClientX, touchStartClientY;
  var gameContainer = document.getElementsByClassName("game-container")[0];

  gameContainer.addEventListener(this.eventTouchstart, function(e) {
    if ((!window.navigator.msPointerEnabled && e.touches.length>1)||
        e.targetTouches.length>1) return;
    if (window.navigator.msPointerEnabled) {
      touchStartClientX = e.pageX; touchStartClientY = e.pageY;
    } else {
      touchStartClientX = e.touches[0].clientX;
      touchStartClientY = e.touches[0].clientY;
    }
    e.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function(e){
    e.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function(e){
    if ((!window.navigator.msPointerEnabled && e.touches.length>0)||
        e.targetTouches.length>0) return;

    var touchEndClientX = window.navigator.msPointerEnabled
      ? e.pageX : e.changedTouches[0].clientX;
    var touchEndClientY = window.navigator.msPointerEnabled
      ? e.pageY : e.changedTouches[0].clientY;

    var dx = touchEndClientX - touchStartClientX;
    var dy = touchEndClientY - touchStartClientY;
    var absDx = Math.abs(dx), absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      var dir = absDx > absDy
        ? (dx>0?1:3)
        : (dy>0?2:0);

      var invert = document.getElementById('invert-controls').checked;
      dir = invert ? (dir ^ 2) : dir;

      // incrementa contador
      self.moveCount++;
      document.getElementById('move-count').textContent = self.moveCount;

      self.emit("move", dir);
    }
  });
};

KeyboardInputManager.prototype.restart = function restart(event) {
  event.preventDefault();
  // zera contador
  this.moveCount = 0;
  document.getElementById('move-count').textContent = this.moveCount;
  // reinicia o timer
  this.startTimer();
  this.emit("restart");
};

KeyboardInputManager.prototype.keepPlaying = function keepPlaying(event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function(selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

KeyboardInputManager.prototype.formatTime = function(seconds) {
  var mins = Math.floor(seconds / 60);
  var secs = seconds % 60;
  return mins + ':' + (secs < 10 ? '0' + secs : secs);
};

KeyboardInputManager.prototype.startTimer = function() {
  var self = this;
  // Reinicia contador de segundos
  this.time = 0;
  // Atualiza display imediatamente
  document.getElementById('time-elapsed').textContent = this.formatTime(this.time);
  // Limpa intervalo anterior, se existir
  if (this.timerInterval) clearInterval(this.timerInterval);
  // Dispara incremento a cada segundo
  this.timerInterval = setInterval(function() {
    self.time++;
    document.getElementById('time-elapsed').textContent = self.formatTime(self.time);
  }, 1000);
};

KeyboardInputManager.prototype.stopTimer = function() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
};

// Adicione estas duas funções no final do arquivo
KeyboardInputManager.prototype.stopTimer = function() {
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
};

KeyboardInputManager.prototype.getTime = function() {
    return this.time;
}