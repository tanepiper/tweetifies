var sockjs = require('sockjs');

module.exports = function(instance) {

  var sock = sockjs.createServer();

  sock.on('connection', require('./connection')(instance));

  sock.installHandlers(instance.express, { prefix : '/tweetifies' });

  instance.sockjs = sock;
};