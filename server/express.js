/**
 * External Dependencies
 */
var express = require('express');
var request = require('request');
var fs = require('fs');
var qs = require('qs');
var _ = require('underscore');

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


  server.get('/login/twitter/return', function(req, res, next) {
    _.extend(req.session.oauth, {
      token: req.query.oauth_token,
      verifier: req.query.oauth_verifier
    });
    // Now we need to get our access token for reading/posting data
    request.post({
      uri: 'https://api.twitter.com/oauth/access_token',
      oauth: req.session.oauth
    }, function(err, response, body) {
      if (err || response.statusCode > 299) {
        if (!err) {
          console.log(response);
          err = 'Error ' + response.statusCode;
        }
        return next(err);
      }

      var perm_token = qs.parse(body);
      console.log(perm_token);
      _.extend(req.session.oauth, {
        access_token_key: perm_token.oauth_token,
        access_token_secret: perm_token.oauth_token_secret,
        token: null,
        token_secret: null,
        verifier: null,
        callback: null
      });

      _.extend(req.session.user, {
        screen_name: perm_token.screen_name,
        user_id: perm_token.user_id
      });


      delete req.session.oauth.token;
      delete req.session.oauth.token_secret;
      delete req.session.oauth.verifier;
      delete req.session.oauth.callback;


      console.log('Session', req.session.oauth);

      res.redirect('/');
    });

  });

  /**
   * Our route to handle twitter login and auth
   */
  server.get('/login/twitter', function(req, res, next) {

    if (req.session.oauth) {
      return res.redirect('/');
    } else {
      var callback_url = 'http://' +
          instance.options.oauth.base_url + ( (instance.options.dev) ?  ':' + instance.options.express.port :  '' ) +
          '/login/twitter/return';

      req.session.oauth = {
        callback: callback_url,
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret
      };

      req.session.user = {};

      request.post({
        uri: 'https://api.twitter.com/oauth/request_token',
        oauth: req.session.oauth
      }, function(err, response, body) {
        if (err || response.statusCode > 299) {
          if (!err) {
            console.log(response);
            err = 'Error ' + response.statusCode;
          }
          return next(err);
        }

        var access_token = qs.parse(body);
        _.extend(req.session.oauth, {
          token: access_token.oauth_token,
          token_secret: access_token.oauth_token_secret
        });

        res.redirect('https://twitter.com/oauth/authorize?oauth_token=' + req.session.oauth.token);
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