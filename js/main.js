var gridSize = 100; // will create gridSize ^ 2 points

var gridWidth = 100;
var gridHeight = 100;

var pointSize = 6;
var energyPropagationPerFrame = .40;
var energyLostPerFrame = 5; // smaller = longer energy trail
var pointMargin = 1;

var points = [];
var energyTransferQueue = [];
var t0 = +new Date();

// RAF
var start = null;
var fps = 60;

var canvas = document.getElementById('canvas');
var canvasWidth = canvas.width = (gridWidth * pointSize) + (gridWidth-1 * pointMargin);
var canvasHeight = canvas.height = (gridHeight * pointSize) + (gridHeight-1 * pointMargin);


var context = canvas.getContext('2d');


var Point = function(x, y) {

  return {
    x: x,
    y: y,
    increased: 0,
    requiresRender: false,
    energy: 0, // 0-100
    addEnergy: function(energy) {

      if (energy > 0) {
        this.increased = 1;
      } else if (energy < 0) {
        this.increased = -1;
      } else {
        this.increased = 0;
      }

      // only add energy if point doesnt already have any
      var tempEnergy = this.energy + energy;

      if (tempEnergy > 100) {
        tempEnergy = 100;
      } else if (tempEnergy < 0) {
        tempEnergy = 0;
      }

      this.energy = tempEnergy < 10 ? 0 : tempEnergy;
      this.requiresRender = true;

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
        if ((n.x >= 0) && (n.x < gridWidth) && (n.y >= 0) && (n.y < gridHeight)) {
          var index = getPointIndex(n.x, n.y);
          // add a fraction of this points energy
          // to neighbouring points
          // console.log('index', index, points);
          var obj = { index: index, energy: Math.round(this.energy * energyPropagationPerFrame) };
          // if (points[index].energy < Math.round(this.energy * energyPropagationPerFrame)) {
          if (points[index].energy < 5) {  
            energyTransferQueue.push(obj);
          }
        }
      }

    },
    render: function(t) {

      this.requiresRender = false;

      context.beginPath();

      var depressedPerc = 1 - (this.energy / 100); // todo - this should be based on sin(t)
      var customPointpointSize = pointSize * depressedPerc;

      var fract = this.energy / 100;

      if (customPointpointSize < pointSize * fract) {
        customPointpointSize = pointSize * fract;
      }
      var extraMargin = (pointSize - customPointpointSize) / 2;

      context.fillStyle = getColor(this.energy);
      // context.fillStyle = 'rgb(255,0,0)';
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
      energyTransferQueue.push({ index: index, energy: -energyLostPerFrame });
    }
  };
};



for (var y = 0; y < gridHeight; y++) {
  for (var x = 0; x < gridWidth; x++) {
    var index = points.length;
    points.push(new Point(x, y));
    points[index].render(t0);
  }
}

function transferScheduledEnergy() {

  var len = energyTransferQueue.length;

  // avoid expensive shift operation
  for (var i = 0; i < len; i++) {
    points[energyTransferQueue[i].index].addEnergy(energyTransferQueue[i].energy);
  }

  energyTransferQueue = [];

}

function clearCanvas() {
  context.clearRect (0, 0, canvasWidth, canvasHeight);
}

function updatePoints() {

  clearCanvas();

  // update points
  
  transferScheduledEnergy();

  // todo - speed this up
  for (var y = 0; y < gridHeight; y++) {
    for (var x = 0; x < gridWidth; x++) {
      var index = (y * gridHeight) + x;
      points[index].render();
    }
  }

}

function getPointIndex(x, y) {
  return (y * gridHeight) + x;
}

function onUpdateClicked() {
  var index = Math.floor(Math.random() * points.length);
  energyTransferQueue.push({ index: index, energy: 100 });
}

// start FAF loop

var a = false;

function step(timestamp) {
  if (energyTransferQueue.length) {
    updatePoints();
  }
  window.requestAnimationFrame(step);
}

function getTapPosition(event) {
  var x = event.x;
  var y = event.y;

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  var index = getPointTapped(x, y);

  if (index >= 0) {
    energyTransferQueue.push({ index: index, energy: 100 });
    
  }
}

function getPointTapped(x, y) {
  var x2 = Math.floor(x / (pointSize + pointMargin));
  var y2 = Math.floor(y / (pointSize + pointMargin));

  return (typeof x2 === 'number') ? getPointIndex(x2, y2) : -1;
}

function getColor(energy) {

  var spark = Math.random() > .95;

  var r = Math.floor(energy * 2.55);
  var g = spark ? Math.floor(energy * 2.55) : 0;
  var b = spark ? Math.floor(energy * 2.55) : 0;

  return 'rgb(' + r + ',' + g + ',' + b + ')';

}

canvas.addEventListener('touchstart', getTapPosition, false);
canvas.addEventListener('mousedown', getTapPosition, false);

start = +new Date();
window.requestAnimationFrame(step);
