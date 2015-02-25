// var express = require('express');
// var app = express();
// var server = require('http').Server(app);
// var io = require('socket.io')(server);

var express = require('express.io');

var app = express();
app.http().io();


//CORS middleware
/*var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'example.com');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
};

app.use(allowCrossDomain);*/


var connectedCount = 0;

// serve static files
app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));

// Broadcast the new visitor event on ready route.
app.io.route('ready', function(req) {
    req.io.broadcast('new visitor');
});

app.io.route('game:trigger-wave', function(req) {
  console.log('game:trigger-wave');
  req.io.broadcast('game:trigger-wave');
});

app.io.route('game:move-player', function(req) {
  console.log('game:move-player', req.data);
  req.io.broadcast('game:move-player', req.data);
});


/*
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

  console.log('io', io.sockets);

});*/

app.listen(process.env.PORT || 3000);

// app.set('port', (process.env.PORT || 3000));
// app.listen(app.get('port'));
// app.listen(process.env.PORT || 8082);
console.log('Listening on port %s', process.env.PORT || 3000);
