/**
 * External Dependencies
 */


/**
 * This module exports a route for the home page of the application before login
 */
module.exports = function(instance) {

  /**
   * The function returned to the express rotue
   */
  return function(req, res, next) {
    if (req.session.oauth) {
      return res.redirect('/home');
    }
    res.render('login', { session: req.session });
  };

};