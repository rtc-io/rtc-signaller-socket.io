/**
  Additional message data can be given in the 2nd parameter of the signaller:
  
  ```
  var signaller = require('..')(socket, {
    socketMessage: {
      type: 'rtc-signal',
      channel: 'default'
    }
  });
  ```
*/

var socket = io('http://localhost');
var quickconnect = require('rtc-quickconnect');
var signaller = require('..')(socket);
var freeice = require('freeice');
var qc = quickconnect(signaller, {
  room: 'socketio-signalling-demo',
  iceServers: freeice()
});

// let quickconnect know we want a datachannel
qc.createDataChannel('test');

// once the data channel is opened, let us know
qc.on('channel:opened:test', function(id, dc) {
  console.log('data channel opened with peer: ' + id);
});
