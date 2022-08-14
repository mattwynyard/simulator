'use strict'
const net = require('node:net');
let socket = null;

const connectController = (port) => {

  const client = net.connect({
        port: port,
        onread: {
          buffer: Buffer.alloc(4 * 1024),
          callback: function(nread, buf) {
            console.log(buf.toString('utf8', 0, nread));
          }
        }
      });
    console.log("connecting to 38200");
    client.write('hello lance!\r\n');
    socket = client;
    return client;   
  }

  // socket.on('error', (err) => {
  //   console.log(err)
  //   socket.end();
  // })

  // socket.on('close', () => {
  //   console.log("socket closed")
  //   socket.end();
  // })

  

module.exports = { connectController }