var gridSize = 12; // will create gridSize ^ 2 points
var pointSize = 50;
var refreshInterval = 60;
var energyPropagationPerFrame = .8;
var energyLostPerFrame = 5;

var pointMargin = 1;
var points = [];
var energyTransferQueue = [];
var t0 = +new Date();

// RAF
var start = null;
var fps = 30;

var canvas = document.getElementById('canvas');
canvas.width = canvas.height = (gridSize * pointSize) + (gridSize-1 * pointMargin);
var context = canvas.getContext('2d');


var Point = function(x, y) {

  return {
    x: x,
    y: y,
    increased: 0,
    energy: 0, // 0-100
    addEnergy: function(energy) {

      if (energy > 0) {
        this.increased = 1;
      } else if (energy < 0) {
        this.increased = -1;
      } else {
        this.increased = 0;
      }

      var tempEnergy = this.energy + energy;
      if (tempEnergy > 100) {
        tempEnergy = 100;
      } else if (tempEnergy < 0) {
        tempEnergy = 0;
      }
      this.energy = tempEnergy;
      // console.log('this.energy', this.energy);
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
          // add a fraction of this points energy
          // to neighbouring points
          // console.log('index', index, points);
          var obj = { index: index, energy: Math.round(this.energy * energyPropagationPerFrame) };
          if (points[index].energy < Math.round(this.energy * energyPropagationPerFrame)) {
            energyTransferQueue.push(obj);
          }
        }
      }

    },
    render: function(t) {



      context.beginPath();

      var depressedPerc = 1 - (this.energy / 100); // todo - this should be based on sin(t)
      var customPointpointSize = pointSize * depressedPerc;

      if (customPointpointSize < pointSize / 2) {
        customPointpointSize = pointSize / 2;
      }
      var extraMargin = (pointSize - customPointpointSize) / 2;

      // context.fillStyle = 'rgb(255,' + Math.floor(255 - this.energy) + ',' + Math.floor(255 - this.energy) + ')';
      context.fillStyle = 'red';
      context.fillRect((x * pointSize) + (x * pointMargin) + extraMargin, (y * pointSize) + (y * pointMargin) + extraMargin, customPointpointSize, customPointpointSize);

      if (!this.energy) {
        return;
      }

      if (this.increased === 1) {
        this.sendEnergy();
      }
      this.increased = 0;

      // this.sendEnergy();
        

      // console.log('this.energy', this.energy);

      // decrease the energy of this point
      // this.energy = Math.round(this.energy * energyPropagationPerFrame + .05) < 0 ? 0 : Math.round(this.energy * energyPropagationPerFrame + .05);
      var index = getPointIndex(this.x, this.y);
      var obj = { index: index, energy: -energyLostPerFrame };
      energyTransferQueue.push(obj);
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

// var interval = setInterval(updatePoints, refreshInterval);

function transferScheduledEnergy() {

  while (data = energyTransferQueue.shift()) {
    var index = data.index;
    points[index].addEnergy(data.energy);
  }

}

function clearCanvas() {
  context.clearRect (0, 0, canvas.width, canvas.height);
}

function updatePoints(progress) {

  clearCanvas();

  // update points
  transferScheduledEnergy();

  // var t = +new Date();

  for (var y = 0; y < gridSize; y++) {
    for (var x = 0; x < gridSize; x++) {
      var index = getPointIndex(x, y);
      points[index].render(progress);
    }
  }

}

function getPointIndex(x, y) {
  return (y * gridSize) + x;
}

function onUpdateClicked() {
  var index = Math.floor(Math.random() * points.length);
  energyTransferQueue.push({ index: index, energy: 100 });
}

// start FAF loop

function step(timestamp) {

  if (!start) {
    start = +new Date();
  }

  setTimeout(function() {

    var progress = timestamp - start;
    updatePoints(progress);

    if (progress < 5000) {
      window.requestAnimationFrame(step);
    }
  }, 1000 / fps);
}

start = +new Date();
window.requestAnimationFrame(step);
