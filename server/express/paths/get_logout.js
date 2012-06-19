/**
 * External Dependencies
 */


/**
 * This module exports a route for logging out the app
 */
module.exports = function(instance) {

  /**
   * The function returned to the express rotue
   */
  return function(req, res, next) {
    req.session.destroy();
    res.redirect('/');
  };
};