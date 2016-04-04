var socket = require('socket.io-client')('http://localhost:3000', {
	transports: ['polling']
});
var signaller = require('..')(socket);
var quickconnect = require('rtc-quickconnect');
var captureConfig = require('rtc-captureconfig');
var freeice = require('freeice');
var capture = require('rtc-capture');
var attach = require('rtc-attach');
var crel = require('crel');

function attachVideo(stream, el) {
	attach(stream, function(err, media) {
		if (err || !media) return;
		media.style = 'width: 100%';
		el.appendChild(media);
		document.body.appendChild(el);
	});
}

capture(captureConfig('camera min:1280x720').toConstraints(), function(err, stream) {

	attachVideo(stream, crel('div', { class: 'local', style: 'width: 50%; float: left;' }));

	var qc = quickconnect(signaller, {
		room: 'socketio-signalling-demo-longpoll',
		iceServers: freeice(),
		heartbeat: 30000
	}).addStream(stream)
	.on('stream:added', function(id, stream) {
		console.log('added %s', id);
		var el = crel('div', { class: 'remote', id: id , style: 'width: 50%; float: left;'});
		attachVideo(stream, el);
	})
	.on('stream:removed', function(id) {
		console.log('removed %s', id);
		var el = document.getElementById(id);
		if (el) el.remove();
	})
	.on('local:announce', function(data) {
		console.log('-> connected to %s', data.room);
	})
	.on('peer:announce', function(data) {
		console.log('-> announce');
		console.log(data);
	});
});