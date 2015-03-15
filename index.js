var reTrailingSlash = /\/$/;

module.exports = function(server, opts) {
  // create the signaller
  var announceTimer;
  var signaller = require('rtc-signal/signaller')(opts, bufferMessage);
  var socket;

  function bufferMessage(message) {
    if (! socket) {
      return console.warn('need to buffer message: ' + message);
    }

    socket.send(message);
  }

  function connect() {
    socket = io(server, { forceNew: true });

    socket.on('connect', function() {
      signaller('connected');
    });

    socket.on('disconnect', function() {
      signaller('disconnected');
    });

    socket.on('message', signaller._process);

    return signaller;
  }

  function loadClient(callback) {
    var script = document.createElement('script');

    script.src = server.replace(reTrailingSlash, '') + '/socket.io/socket.io.js';
    script.onload = callback;
    document.body.appendChild(script);
  }

  signaller.announce = function(data) {
    if (socket && socket.connected) {
      // always announce on reconnect
      signaller.removeListener('connected', signaller._announce);
      signaller.on('connected', signaller._announce);
    }

    signaller._update(data);
    clearTimeout(announceTimer);

    // send the attributes over the network
    return announceTimer = setTimeout(signaller._announce, (opts || {}).announceDelay || 10);
  };

  signaller.leave = signaller.close = function() {
    return socket && socket.disconnect();
  };

  if (typeof io != 'undefined') {
    return connect();
  }

  loadClient(connect);
  return signaller;
};
