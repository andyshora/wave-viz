var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var connectedCount = 0;

app.set('ipaddr', '127.0.0.1');
app.set('port', (process.env.PORT || 3000));

server.listen((process.env.PORT || 3000), "127.0.0.1");

// app settings
// app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));

io.on('connection', function (socket) {
  connectedCount++;
  console.log('connectedCount', connectedCount);
  io.emit('room:count', { count: connectedCount });

  // controller emitted signal which needs relaying to game screen
  socket.on('game:trigger-wave', function(data) {
    io.emit('game:trigger-wave', data);
    console.log('game:trigger-wave');
  });

  socket.on('disconnect', function () {
    connectedCount--;
    console.log('connectedCount', connectedCount);
    io.emit('room:count', { count: connectedCount });
  });

});

app.listen(process.env.PORT || 3000);
console.log('Listening on port %s', process.env.PORT || 3000);
