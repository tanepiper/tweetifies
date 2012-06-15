/**
 * External Dependencies
 */
var express = require('express');
var request = require('request');
var fs = require('fs');
var qs = require('qs');

/**
 * This function creates an attaches our express and session store instances
 */
module.exports = function(instance) {

  var server = express.createServer();
  var RedisStore = require('connect-redis')(express);
  var store = new RedisStore();


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


  /**
   * Our route to handle twitter login and auth
   */
  server.get('/login/twitter', function(req, res, next) {

    // The user already has a session so we don't need to re-authorise
    if (req.session.oauth && !req.param('oauth_token') && !req.param('oauth_verifier')) {
      return res.redirect('/');
    } else {
      // We assume here we need to create a new session oauth
      req.session.oauth = {
        callback: 'http://' + instance.options.oauth.base_url + ( (instance.options.dev) ?  ':' + instance.options.express.port :  '' ) + '/login/twitter',
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret
      };
    }

    // Based on the incoming request we have requested our token and the user
    // has authorised the app
    if (req.param('oauth_token') && req.param('oauth_verifier')) {
      req.session.oauth.token = req.query.oauth_token;
      req.session.oauth.verifier = req.query.oauth_verifier;

      // Now we need to get our access token for reading/posting data
      request.post({
        uri: 'https://api.twitter.com/oauth/access_token',
        oauth: req.session.oauth
      }, function(err, response, body) {
        var access_token = qs.parse(body);

        req.session.oauth.access_token = access_token.oauth_token;
        req.session.oauth.access_token_secret = access_token.oauth_token_secret;

        res.redirect('/');
      });
    } else {
      request.post({
        uri: 'https://api.twitter.com/oauth/request_token',
        oauth: req.session.oauth
      }, function(err, response, body) {
        var access_token = qs.parse(body);

        req.session.oauth.token = access_token.oauth_token;
        req.session.oauth.token_secret = access_token.oauth_token_secret;

        res.redirect('https://twitter.com/oauth/authorize?oauth_token=' + access_token.oauth_token);
      });
    }
  });


  server.get('/logout', function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
  });



  server.get('/', function(req, res, next) {
     var show_login = true;
      if (req.session.oauth) {
        show_login = false;
      }

      res.render('app.html', {
        show_login: show_login,
        session: req.session
      });
  });

  server.listen(instance.options.express.port, instance.options.express.host);

  instance.sessions = store;
  instance.express = server;
}