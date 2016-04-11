var socketio = require('socket.io-client');
var quickconnect = require('rtc-quickconnect');
var freeice = require('freeice');
var signaller = require('..');
var roomId = 'socketio-signalling-demo-' + Date.now();
var clients = 10;

function client(idx) {
	var expected = clients - 1;
	var socket = socketio('http://localhost:3000');
	var qc = quickconnect(signaller(socket), {
	  room: roomId,
	  iceServers: freeice()
	});

	// let quickconnect know we want a datachannel
	qc.createDataChannel('test');

	// once the data channel is opened, let us know
	qc.on('channel:opened:test', function(id, dc) {
		expected--;
		console.log('[%s] data channel opened with peer: %s, %d more expected', qc.id, id, expected);
	});

	console.log('created client %d with id %s', idx, qc.id);
}

for (var i = 0; i < clients; i++) {
	client(i);
}