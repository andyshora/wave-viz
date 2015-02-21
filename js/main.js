var gridSize = 100; // will create gridSize ^ 2 points

var gridWidth = 80;
var gridHeight = 80;

var pointSize = 10;
var energyPropagationPerFrame = .4;
var energyLostPerFrame = 10;
var pointMargin = 1;

var points = [];
var energyTransferQueue = [];
var t0 = +new Date();

// RAF
var start = null;
var fps = 60;

var canvas = document.getElementById('canvas');
canvas.width = (gridWidth * pointSize) + (gridWidth-1 * pointMargin);
canvas.height = (gridHeight * pointSize) + (gridHeight-1 * pointMargin);
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
          if (!points[index].energy) {  
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

      if (customPointpointSize < pointSize * .8) {
        customPointpointSize = pointSize * .8;
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
      var obj = { index: index, energy: -energyLostPerFrame };
      energyTransferQueue.push(obj);
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

  // todo - speed this up
  for (var y = 0; y < gridHeight; y++) {
    for (var x = 0; x < gridWidth; x++) {
      var index = getPointIndex(x, y);
      points[index].render(progress);
      
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

  if (!start) {
    start = +new Date();
  }

  var progress = timestamp - start;

  if (a) {
    updatePoints(progress);
    
  }



  a = !a;
  window.requestAnimationFrame(step);
 



}

function getTapPosition(event) {
  // console.log('getTapPosition');
  var x = event.x;
  var y = event.y;

  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;

  var index = getPointTapped(x, y);
  energyTransferQueue.push({ index: index, energy: 100 });
}

function getPointTapped(x, y) {
  var x2 = Math.floor(x / (pointSize + pointMargin));
  var y2 = Math.floor(y / (pointSize + pointMargin));

  return getPointIndex(x2, y2);
}

function getColor(energy) {

  var spark = Math.random() > .9;

  var r = Math.floor(energy * 2.55);
  var g = spark ? Math.floor(energy * 2.55) : 0;
  var b = spark ? Math.floor(energy * 2.55) : 0;

  return 'rgb(' + r + ',' + g + ',' + b + ')';

}

canvas.addEventListener('touchstart', getTapPosition, false);
canvas.addEventListener('mousedown', getTapPosition, false);

start = +new Date();
window.requestAnimationFrame(step);
