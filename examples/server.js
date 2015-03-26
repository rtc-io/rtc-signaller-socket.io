var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);
var board = require('rtc-switch')();
var port = process.env.PORT || 3000;

io.on('connection', function(socket){
  var peer = board.connect();

  socket.on('rtc-signal', peer.process);
  peer.on('data', function(data) {
    socket.emit('rtc-signal', data);
  });
});

server.listen(port, function(err) {
  if (err) {
    return console.error('could not start server: ', err);
  }

  console.log('server running @ http://localhost:' + port);
});
