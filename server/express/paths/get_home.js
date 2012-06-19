/**
 * External Dependencies
 */


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

    // Here we want to check if a client exists for a user and if not, create it before DNode needs to use it
    var user = instance.users[req.session.user.id + ':' + req.session.user.screen_name];
    if (!user) {
      instance.users[req.session.user.id + ':' + req.session.user.screen_name] = {
        session: req.session
      };
    }

    res.render('app', { session: req.session });
  };
};