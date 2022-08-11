'use strict'
const net = require('node:net');

const connectController = (port) => {

  const client = net.connect({
        port: port,
        onread: {
          // Reuses a 4KiB Buffer for every read from the socket.
          buffer: Buffer.alloc(4 * 1024),
          callback: function(nread, buf) {
            // Received data is available in `buf` from 0 to `nread`.
            console.log(buf.toString('utf8', 0, nread));
          }
        }
      });
    console.log("connecting to 38200");
    client.write('hello!\r\n');
    return client;
    
  }

module.exports = { connectController }