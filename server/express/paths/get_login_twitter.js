/**
 * External Dependencies
 */
var _ = require('underscore');
var qs = require('qs');
var request = require('request');

/**
 * This module exports a route for the first part of Twitter Oauth process
 */
module.exports = function(instance) {

  var generateCallbackUrl = function() {
    var callback_url = 'http://' +
        instance.options.oauth.base_url + ( (instance.options.dev) ?  ':' + instance.options.express.port :  '' ) +
        '/login/twitter/return';
    return callback_url;
  };

  /**
   * The function returned to the express rotue
   */
  return function(req, res, next) {

    /**
     * Callback function for the response of getting a request token
     */
    var onRequestToken = function(err, response, body) {
      if (err || response.statusCode > 299) {
        if (!err) { err = 'Error ' + response.statusCode; }
        return next(err);
      }

      // Parse the response body and set values, then redirect the users to twitter
      // to authorise the app
      var access_token = qs.parse(body);
      _.extend(req.session.oauth, {
        token: access_token.oauth_token,
        token_secret: access_token.oauth_token_secret
      });

      res.redirect('https://twitter.com/oauth/authorize?oauth_token=' + req.session.oauth.token);
    };


    /**
     * Path logic starts here
     */

    // If we already have a session then we don't need to login again
    if (req.session.oauth) {
      return res.redirect('/');
    }

    // Extend our session information with some default
    _.extend(req.session, {
      oauth: {
        callback: generateCallbackUrl(),
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret
      },
      user: {}
    });

    // Request a token and pass to our callback
    request.post({
      uri: 'https://api.twitter.com/oauth/request_token',
      oauth: req.session.oauth
    }, onRequestToken);
  };
};