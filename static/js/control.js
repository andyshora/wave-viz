
// var domain = /shora/ig.test(window.location.href) ? window.location.hostname : 'http://localhost/';
// console.log('domain', domain);

// var socket = io(domain);

var socket = io.connect();

// Send the ready event.
socket.emit('ready');


/*
socket.on('connect:failure', function (data) {
  console.log('connect:failure', data);
});

socket.on('room:count', function (data) {
  console.log('room:count', data);
});

socket.on('connect:success', function (data) {
  console.log('connect:success', data);

  initGame();
});*/

function movePlayer(x, y) {
  console.log('movePlayer', x, y);
  socket.emit('game:move-player', { x: x, y: y });
}

function sendWave() {
  console.log('sendWave');
  socket.emit('game:trigger-wave', { id: 123 });
}

