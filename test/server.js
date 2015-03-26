var http = require('http');

module.exports = function() {
  var server = http.createServer();
  var io = require('socket.io')(server);
  var board = require('rtc-switch')();

  io.on('connection', function(socket){
    var peer = board.connect();

    socket.on('rtc-signal', peer.process);
    peer.on('data', function(data) {
      socket.emit('rtc-signal', data);
    });
  });

  return server;
};
