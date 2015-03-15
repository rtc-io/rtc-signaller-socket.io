# rtc-signaller-socket.io

This is a signaller that can be used as a drop-in replacement for
[`rtc-signaller`](https://github.com/rtc-io/rtc-signaller), that
works with a [`socket.io`](http://socket.io) server.


[![NPM](https://nodei.co/npm/rtc-signaller-socket.io.png)](https://nodei.co/npm/rtc-signaller-socket.io/)



## Example Usage

The following examples show how a client and server can be
configured to work with socket.io, using
[`rtc-quickconnect`](https://github.com/rtc-io/rtc-quickconnect) on
the frontend.

### Server

Run using `node examples/server.js`:

```js
var http = require('http');
var server = http.createServer();
var io = require('socket.io')(server);
var board = require('rtc-switch')();
var port = process.env.PORT || 3000;

io.on('connection', function(socket){
  var peer = board.connect();

  socket.on('message', peer.process);
  peer.on('data', function(data) {
    socket.send(data);
  });
});

server.listen(port, function(err) {
  if (err) {
    return console.error('could not start server: ', err);
  }

  console.log('server running @ http://localhost:' + port);
});

```

### Client

Run using `beefy examples/client.js`:

```js
var quickconnect = require('rtc-quickconnect');
var signaller = require('rtc-signaller-socket.io')('http://localhost:3000');
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

```

## License(s)

### Apache 2.0

Copyright 2015 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
