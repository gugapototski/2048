function Tile(position, value) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function savePosition() {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function updatePosition(position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function serializeTile() {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value
  };
};
