var shoe = require('shoe');

module.exports = function(instance) {

  var sock = shoe(require('./connection')(instance));

  sock.install(instance.express, { prefix : '/tweetifies' });

  instance.sockjs = sock;
};