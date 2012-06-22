/**
 * External Dependencies
 */
var dnode = require('dnode');
var twitter = require('ntwitter');

/**
 * This module exports a route for the home page of the application after login
 */
module.exports = function(instance) {

  /**
   * The function returned to the express rotue
   */
  return function(req, res, next) {
    if (!req.session.oauth) {
      return res.redirect('/');
    }

    res.render('app', { session: req.session });
  };
};