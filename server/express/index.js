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

  // We need to tell swig where the root of the views dir is
  swig.init({
    root: instance.options.express.views_dir
  });

  // First we create our express and HTTP instance
  instance.app = express();
  instance.server = require('http').createServer(instance.app);

  var RedisStore = require('connect-redis')(express);
  instance.sessions = new RedisStore();

  var cookieParser = express.cookieParser('tweetifies');
  instance.cookieParser = cookieParser;

  // Now we configure the express app
  instance.app.engine('html', engines.swig);
  instance.app.set('views', instance.options.express.views_dir);
  instance.app.set('view engine', 'html');


  instance.app.use(express.bodyParser());
  instance.app.use(express.methodOverride());
  instance.app.use(cookieParser);
  instance.app.use(express.session({secret: 'tweetifies', store: instance.sessions})); // Make this a hash

  instance.app.use(express.static(instance.options.express.static_dir));

  instance.app.get('/login/twitter/return', require('./paths/get_login_twitter_return')(instance));
  instance.app.get('/login/twitter', require('./paths/get_login_twitter')(instance));
  instance.app.get('/logout', require('./paths/get_logout')(instance));
  instance.app.get('/home', require('./paths/get_home')(instance));
  instance.app.get('/', require('./paths/get_index')(instance));

  instance.server.listen(instance.options.express.port, instance.options.express.host);



}