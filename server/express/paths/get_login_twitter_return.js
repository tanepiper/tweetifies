/**
 * External Dependencies
 */
var _ = require('underscore');
var qs = require('qs');
var request = require('request');

/**
 * This module exports a route for the second part of Twitter Oauth process
 */
module.exports = function(instance) {

  /**
   * The function returned to the express rotue
   */
  return function(req, res, next) {

    /**
     * Callback function for the response of getting a access token
     */
    var onAccessToken = function(err, response, body) {
      if (err || response.statusCode > 299) {
        if (!err) {
          err = 'Error ' + response.statusCode;
        }
        return next(err);
      }


      // Parse the response body and set values, then redirect the users to twitter
      // to authorise the app
      var perm_token = qs.parse(body);

      _.extend(req.session.oauth, {
        access_token_key: perm_token.oauth_token,
        access_token_secret: perm_token.oauth_token_secret
      });

      _.extend(req.session.user, {
        screen_name: perm_token.screen_name,
        id: perm_token.user_id
      });

      // Redirect to the app
      res.redirect('/home');
    };

    /**
     * Path logic starts here
     */

    // Check we got query strings we were expecting
    if (!req.query.oauth_token || !req.query.oauth_verifier) {
      return next('Twitter did not return an OAuth verifier');
    }

    // Extend our Oauth with these values
    _.extend(req.session.oauth, {
      token: req.query.oauth_token,
      verifier: req.query.oauth_verifier
    });

    // Now we need to get our access token for using the twitter api
    request.post({
      uri: 'https://api.twitter.com/oauth/access_token',
      oauth: req.session.oauth
    }, onAccessToken);
  };
};