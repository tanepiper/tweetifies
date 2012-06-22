/**
 * External Dependencies
 */
var express = require('express');
var request = require('request');
var fs = require('fs');
var qs = require('qs');
var _ = require('underscore');
var twitter = require('ntwitter');

/**
 * This function creates an attaches our express and session store instances
 */
module.exports = function(instance) {

  // First we create our HTTP instance and session store
  var server = express.createServer();
  var RedisStore = require('connect-redis')(express);
  var store = new RedisStore();

  // Now we configure the express server
  server.configure(function() {
    server.set('view engine', 'html');
    server.register('.html', require('ejs'));
    server.set('views', instance.options.express.views_dir);

    server.use(express.bodyParser());
    server.use(express.methodOverride());

    server.use(express.cookieParser());
    server.use(express.session({secret: 'ScotlandJS', store: store})); // Make this a hash

    server.use(express.static(instance.options.express.static_dir));
  });

  server.post('/auth', function(req, res, next) {
    if (!req.session) return;

    var token = Math.random().toString(16).slice(2);
    instance.tokens[token] = req.session;

    res.end(token);
  });

  server.get('/login/twitter/return', require('./paths/get_login_twitter_return')(instance));
  server.get('/login/twitter', require('./paths/get_login_twitter')(instance));
  server.get('/logout', require('./paths/get_logout')(instance));
  server.get('/home', require('./paths/get_home')(instance));
  server.get('/', require('./paths/get_index')(instance));

  server.listen(instance.options.express.port, instance.options.express.host);

  instance.sessions = store;
  instance.express = server;
}