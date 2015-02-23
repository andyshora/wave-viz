var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);


// app settings
app.set('port', process.env.PORT || 8081);

app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));

io.on('connection', function (socket) {
  socket.emit('client connected', {});

  socket.on('game:trigger-wave', function(data) {
    io.emit('game:trigger-wave', data);
    console.log('game:trigger-wave');
  });

});



server.listen(app.get('port'));
console.log('Listening on port %s', app.get('port'));
