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
module.exports = function(server, opts) {
  // create the signaller
  var announceTimer;
  var signaller = require('rtc-signal/signaller')(opts, bufferMessage);
  var client = (opts || {}).client || (typeof io != 'undefined' && io);
  var queuedMessages = [];
  var socket;

  function bufferMessage(message) {
    if (! socket) {
      return queuedMessages.push(message);
    }

    socket.send(message);
  }

  function connect(createSocket) {
    socket = createSocket(server, { forceNew: true });

    socket.on('connect', function() {
      queuedMessages.splice(0).forEach(bufferMessage);
      signaller('connected');
    });

    socket.on('disconnect', function() {
      signaller('disconnected');
    });

    socket.on('message', signaller._process);

    return signaller;
  }

  function findOrCreateLoader() {
    var script = document.querySelector('script[src$="/socket.io/socket.io.js"]');

    // if we don't have the script, then create it
    if (! script) {
      script = document.createElement('script');
      script.src = server.replace(reTrailingSlash, '') + '/socket.io/socket.io.js';
      document.body.appendChild(script);
    }

    return script;
  }

  function loadClient(callback) {
    var script = findOrCreateLoader();

    script.addEventListener('load', function() {
      if (typeof io == 'undefined') {
        return callback(new Error('loaded socket.io client script but could not locate io global'));
      }

      callback(null, client = io);
    });
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

  if (client) {
    return connect(client);
  }

  loadClient(function(err, io) {
    if (err) {
      return signaller('error', err);
    }

    connect(io);
  });

  return signaller;
};
