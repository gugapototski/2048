window.fakeStorage = {
  _data: {},

  setItem: function setItem(id, val) {
    return this._data[id] = String(val);
  },

  getItem: function getItem(id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function removeItem(id) {
    return delete this._data[id];
  },

  clear: function clearStorage() {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.bestScoreKey = "bestScore";
  this.gameStateKey = "gameState";
  this.timeRankingKey = "timeRanking"; // 1. Adicione esta linha
  
  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function localStorageSupported() {
  var testKey = "test";

  try {
    var storage = window.localStorage;
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function getBestScore() {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function setBestScore(score) {
  this.storage.setItem(this.bestScoreKey, score);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function getGameState() {
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function setGameState(gameState) {
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function clearGameState() {
  this.storage.removeItem(this.gameStateKey);
};

LocalStorageManager.prototype.getTimeRanking = function () {
  var rankingJSON = this.storage.getItem(this.timeRankingKey);
  return rankingJSON ? JSON.parse(rankingJSON) : [];
};

LocalStorageManager.prototype.addTimeToRanking = function (timeInSeconds) {
  var ranking = this.getTimeRanking();
  
  // Adiciona o novo tempo com a data atual
  ranking.push({
    time: timeInSeconds,
    date: new Date().toLocaleDateString() 
  });
  
  // Ordena por tempo (menor primeiro)
  ranking.sort((a, b) => a.time - b.time);
  
  // Mantém apenas os 5 melhores
  var top5 = ranking.slice(0, 5);
  
  // Salva de volta no localStorage
  this.storage.setItem(this.timeRankingKey, JSON.stringify(top5));
};