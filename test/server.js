var http = require('http');

module.exports = function() {
  var server = http.createServer();
  var io = require('socket.io')(server);
  var board = require('rtc-switch')();

  io.on('connection', function(socket){
    var peer = board.connect();

    socket.on('message', peer.process);
    peer.on('data', function(data) {
      console.log('OUT <== ' + data);
      socket.send(data);
    });
  });

  return server;
};
