var reTrailingSlash = /\/$/;

/**
  # rtc-signaller-socket.io

  This is a signaller that can be used as a drop-in replacement for
  [`rtc-signaller`](https://github.com/rtc-io/rtc-signaller), that
  works with a [`socket.io`](http://socket.io) server.

  ## Example Usage

  The following examples show how a client and server can be
  configured to work with socket.io, using
  [`rtc-quickconnect`](https://github.com/rtc-io/rtc-quickconnect) on
  the frontend.

  ### Server

  Run using `node examples/server.js`:

  <<< examples/server.js

  ### Client

  Run using `beefy examples/client.js`:

  <<< examples/client.js

**/
module.exports = function(socket, opts) {
  // create the signaller
  var announceTimer;
  var signaller = require('rtc-signal/signaller')(opts, bufferMessage);
  var queuedMessages = [];
  
  function bufferMessage(message) {
    if (! socket) {
      return queuedMessages.push(message);
    }

    socket.emit('rtc-signal', message);
  }

  function init() {
    socket.on('connect', function() {
      queuedMessages.splice(0).forEach(bufferMessage);
      signaller('connected');
    });

    socket.on('disconnect', function() {
      signaller('disconnected');
    });

    socket.on('rtc-signal', signaller._process);

    return signaller;
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

  return init();
};
