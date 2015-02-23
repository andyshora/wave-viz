

var socket = io('http://localhost:8081');

function connect() {

}

socket.on('connect:failure', function (data) {
  console.log('connect:failure', data);
});

socket.on('connect:success', function (data) {
  console.log('connect:success', data);

  initGame();
});

sendWave();

function sendWave() {
  socket.emit('game:trigger-wave', { id: 123 });
}

