/**
 * External Dependencies
 */
var express = require('express');
var swig = require('swig');
var engines = require('consolidate');

/**
 * This function creates an attaches our express and session store instances
 */
module.exports = function(instance) {

  swig.init({
    root: instance.options.express.views_dir
  });

  // First we create our HTTP instance and session store
  var app = express();
  var server = require('http').createServer(app);

  var RedisStore = require('connect-redis')(express);
  var store = new RedisStore();

  var cookieParser = express.cookieParser('tweetifies');

  // Now we configure the express app
  app.engine('html', engines.swig);
  app.set('views', instance.options.express.views_dir);
  app.set('view engine', 'html');


  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(cookieParser);
  app.use(express.session({secret: 'tweetifies', store: store})); // Make this a hash

  app.use(express.static(instance.options.express.static_dir));

  app.post('/auth', function(req, res, next) {
    if (!req.session) return;

    var token = Math.random().toString(16).slice(2);
    instance.tokens[token] = req.session;

    res.end(token);
  });

  app.get('/login/twitter/return', require('./paths/get_login_twitter_return')(instance));
  app.get('/login/twitter', require('./paths/get_login_twitter')(instance));
  app.get('/logout', require('./paths/get_logout')(instance));
  app.get('/home', require('./paths/get_home')(instance));
  app.get('/', require('./paths/get_index')(instance));

  server.listen(instance.options.express.port, instance.options.express.host);

  instance.sessions = store;
  instance.express = app;
  instance.server = server;
  instance.cookieParser = cookieParser;
}