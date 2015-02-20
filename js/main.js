var gridSize = 20; // will create gridSize ^ 2 points
var pointSize = 30;
var refreshInterval = 250;
var propagationFraction = .8;

var pointMargin = 1;
var points = [];
var energyTransferQueue = [];
var t0 = +new Date();

var canvas = document.getElementById('canvas');
canvas.width = canvas.height = (gridSize * pointSize) + (gridSize-1 * pointMargin);
var context = canvas.getContext('2d');


var Point = function(x, y) {

  return {
    x: x,
    y: y,
    energy: 0, // 0-100
    addEnergy: function(energy) {
      if (energy > 5) {

        if (energy > this.energy) {
          this.energy += energy;
          if (this.energy > 255) {
            this.energy = 255;
          }

          if (this.energy > 20) {
            this.sendEnergy();
          }

        }

      } else {
        this.energy = 0;
      }

    },
    sendEnergy: function() {

      var neighbours = [];
      neighbours.push({ x: this.x + 1, y: this.y + 1 });
      neighbours.push({ x: this.x + 1, y: this.y });
      neighbours.push({ x: this.x + 1, y: this.y - 1 });

      neighbours.push({ x: this.x - 1, y: this.y + 1 });
      neighbours.push({ x: this.x - 1, y: this.y });
      neighbours.push({ x: this.x - 1, y: this.y - 1 });

      neighbours.push({ x: this.x, y: this.y + 1 });
      neighbours.push({ x: this.x, y: this.y - 1 });

      for (var i = 0; i < neighbours.length; i++) {
        var n = neighbours[i];
        if ((n.x >= 0) && (n.x < gridSize) && (n.y >= 0) && (n.y < gridSize)) {
          var index = getPointIndex(n.x, n.y);
          // send a fraction of this points energy
          // to neighbouring points
          var obj = { index: index, energy: this.energy * propagationFraction };
          energyTransferQueue.push(obj);
        }
      }


    },
    render: function(t) {
      context.beginPath();

      context.fillStyle = 'rgb(' + Math.floor(255 - this.energy) + ',250,250)';
      context.fillRect((x * pointSize) + (x * pointMargin), (y * pointSize) + (y * pointMargin), pointSize, pointSize);

      this.energy *= propagationFraction;
    }
  };
};



for (var y = 0; y < gridSize; y++) {
  for (var x = 0; x < gridSize; x++) {
    var index = points.length;
    points.push(new Point(x, y));
    points[index].render(t0);
  }
}

var interval = setInterval(updatePoints, refreshInterval);

function transferScheduledEnergy() {

  while (data = energyTransferQueue.shift()) {
    var index = data.index;
    points[index].addEnergy(data.energy);
  }

}

function updatePoints() {

  // update points
  transferScheduledEnergy();

  var t = +new Date();

  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      var index = getPointIndex(x, y);
      points[index].render(t);
    }
  }

}

function getPointIndex(x, y) {
  return (y * gridSize) + x;
}

function onUpdateClicked() {
  var index = Math.floor(Math.random() * points.length);
  energyTransferQueue.push({ index: index, energy: 255 });
}

// start raq loop
