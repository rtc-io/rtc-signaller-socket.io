var signaller = require('..');

function createSignaller(opts) {
  // create the new socket
  // in our tests we forceNew to ensure that we don't multiplex on existing
  // channels (which would just make things messy)
  var socket = require('socket.io-client')(location.origin, { forceNew: true });

  return signaller(socket, opts);
}

require('rtc-signaller-testrun')(createSignaller);
