
var domain = /shora/ig.test(window.location.href) ? window.location.hostname : 'http://localhost:3000/';
console.log('domain', domain);

var socket = io(domain);

function connect() {

}

socket.on('connect:failure', function (data) {
  console.log('connect:failure', data);
});

socket.on('room:count', function (data) {
  console.log('room:count', data);
});

socket.on('connect:success', function (data) {
  console.log('connect:success', data);

  initGame();
});

sendWave();

function sendWave() {
  socket.emit('game:trigger-wave', { id: 123 });
}

