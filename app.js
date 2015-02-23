var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var connectedCount = 0;

// app settings
app.set('port', process.env.PORT || 8081);

app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));

io.on('connection', function (socket) {
  connectedCount++;
  console.log('connectedCount', connectedCount);
  socket.emit('room:count', { count: connectedCount });

  // controller emitted signal which needs relaying to game screen
  socket.on('game:trigger-wave', function(data) {
    socket.emit('game:trigger-wave', data);
    console.log('game:trigger-wave');
  });

  socket.on('disconnect', function (socket) {
    connectedCount--;
    console.log('connectedCount', connectedCount);
    socket.emit('room:count', { count: connectedCount });
  });

});


server.listen(app.get('port'));
console.log('Listening on port %s', app.get('port'));
