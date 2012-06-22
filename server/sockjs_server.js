module.exports = function(instance) {

  var sockjs = require('sockjs');

  var sock = sockjs.createServer();

  sock.installHandlers(instance.express, { prefix : '/dnode' });

  instance.sockjs = sock;
}