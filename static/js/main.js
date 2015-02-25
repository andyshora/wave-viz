var gridSize = 100; // will create gridSize ^ 2 points

var gridWidth = 100;
var gridHeight = 100;

var pointSize = 9;
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
    // requiresRender: false,
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
      // this.requiresRender = true;

    },
    sendEnergy: function() {

      var energyToSend = Math.round(this.energy * energyPropagationPerFrame);
      if (energyToSend < 5) {
        return;
      }

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
          var index = (n.y * gridHeight) + n.x;
          // add a fraction of this points energy
          // to neighbouring points
          // console.log('index', index, points);
          var obj = { index: index, energy: energyToSend };
          // if (points[index].energy < Math.round(this.energy * energyPropagationPerFrame)) {
          if (points[index].energy < 5) {
            energyTransferQueue.push(obj);
            if (!energyTransferRequired) {
              energyTransferRequired = true;
            }
          }
        }
      }

    },
    render: function() {

      // hude perf gain
      // no energy? dont bother rendering
      if (!this.energy) {
        return;
      }

      context.beginPath();

      var depressedPerc = 1 - (this.energy / 100); // todo - this should be based on sin(t)
      var customPointpointSize = pointSize * depressedPerc;
      var fract = Math.sin(this.energy / 50);

      if (customPointpointSize < pointSize * fract) {
        customPointpointSize = pointSize * fract;
      }
      var extraMargin = (pointSize - customPointpointSize) / 2;

      context.fillStyle = getColor(this.energy);
      context.fillRect((x * pointSize) + (x * pointMargin) + extraMargin, (y * pointSize) + (y * pointMargin) + extraMargin, customPointpointSize, customPointpointSize);


      if (this.increased === 1) {
        this.sendEnergy();
      }
      this.increased = 0;

      // this.sendEnergy();


      // console.log('this.energy', this.energy);

      // decrease the energy of this point
      // this.energy = Math.round(this.energy * energyPropagationPerFrame + .05) < 0 ? 0 : Math.round(this.energy * energyPropagationPerFrame + .05);
      energyTransferQueue.push({ index: (this.y * gridHeight) + this.x, energy: -energyLostPerFrame });
      energyTransferRequired = true;

      // cleanup
      // depressedPerc = customPointpointSize = extraMargin = null;
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
  energyTransferRequired = false;

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
  sendRandomWave();
}

function sendRandomWave() {
  var index = Math.floor(Math.random() * points.length);
  energyTransferQueue.push({ index: index, energy: 100 });
  energyTransferRequired = true;
}

// start FAF loop
var last = 0;
var energyTransferRequired = false;

var players = [];
players[0] = { x: 0, y: 0 };

function renderPlayers() {
  context.beginPath();
  context.fillStyle = 'white';
  context.fillRect(players[0].x * (pointSize + pointMargin), players[0].y * (pointSize + pointMargin), pointSize + pointMargin, pointSize + pointMargin);
}

function step(timestamp) {

  if (energyTransferRequired) {
    updatePoints();
  }

  renderPlayers();

  window.requestAnimationFrame(step);
}

function drawTapMarker(x, y) {
  context.beginPath();
  context.arc(x, y, 20, 0, 10 * Math.PI, false);
  context.fillStyle = 'white';
  context.fill();
}

function onCanvasTapped(event) {

  if (event.changedTouches) {
    var touches = event.changedTouches;

    var lastIndex = -1;

    for (var i=0; i < touches.length; i++) {
      var x = touches[i].pageX;
      var y = touches[i].pageY;

      x -= canvas.offsetLeft;
      y -= canvas.offsetTop;

      drawTapMarker(x, y);

      var index = getPointTapped(x, y);
      if (index === lastIndex) {
        continue;
      }
      lastIndex = index;

      if (index >= 0) {
        energyTransferQueue.push({ index: index, energy: 100 });
        energyTransferRequired = true;
      }

    }
  } else {
    var x = event.x;
    var y = event.y;

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    var index = getPointTapped(x, y);

    if (index >= 0) {
      energyTransferQueue.push({ index: index, energy: 100 });
      energyTransferRequired = true;
    }
  }

}

function getPointTapped(x, y) {
  var x2 = Math.floor(x / (pointSize + pointMargin));
  var y2 = Math.floor(y / (pointSize + pointMargin));

  return (typeof x2 === 'number') ? getPointIndex(x2, y2) : -1;
}

function getColor(energy) {

  // return energy > 30 ? 'red' : 'black';
  var spark = false;//Math.random() > .95;
  var r = Math.floor(energy * 2.55);

  return 'rgb(' + r + ',0,0)';

}


canvas.addEventListener('touchstart', onCanvasTapped, false);
canvas.addEventListener('mousedown', onCanvasTapped, false);

start = +new Date();
window.requestAnimationFrame(step);

var socket = io.connect();

socket.on('game:trigger-wave', function (data) {
  console.log('game:trigger-wave', data);
  sendRandomWave();
});

socket.on('game:move-player', function (data) {
  console.log('game:move-player', data);

  players[0].x += data.x;
  players[0].y += data.y;

});


