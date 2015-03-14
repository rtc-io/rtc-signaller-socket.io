var signaller = require('..');

function createSignaller(opts) {
  return signaller(location.origin, opts);
}

require('rtc-signaller-testrun')(createSignaller);
