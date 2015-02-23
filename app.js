var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/trigger_wave', function (req, res) {
  console.log('trigger_wave');
  io.emit('trigger_wave', { id: 123 });
  res.send('trigger_wave');
});


// app settings
app.set('port', process.env.PORT || 8081);

app.use('/', express.static(__dirname + '/static', { maxAge: 86400 }));


server.listen(app.get('port'));
console.log('Listening on port %s', app.get('port'));