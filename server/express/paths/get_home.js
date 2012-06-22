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

    instance.sockjs.on('connection', function(stream) {
      var d = dnode();
      console.log('connection', stream);

      d.on('local', function(local) {

        var user = instance.users[req.session.user.id + ':' + req.session.user.screen_name];
        if (!user) {
          user = instance.users[req.session.user.id + ':' + req.session.user.screen_name] = {
            session: req.session,
            local: local,
            stream: stream
          };

          if (!user.twitter) {
            user.twitter = new twitter(req.session.oauth);
          }
        }

        local.updateStatus = function(tweet, cb) {
          user.twitter.updateStatus(tweet.status, tweet, cb);

        };

        local.retweet = function(id, cb) {
          user.twitter.retweetStatus(id, cb);
        };

      });

      d.on('remote', function(remote) {
        console.log('remote', remote);
        var user = instance.users[req.session.user.id + ':' + req.session.user.screen_name];
        user.remote = remote;

        if (!user.stream) {
          user.twitter.verifyCredentials(function(err, profile) {
            user.profile = profile;
            session.profile = profile;

            user.twitter.stream('user', function(tstream) {
              user.tstream = tstream;

              tstream.on('data', require(instance.options.base + '/apps/twitter/lib/on_stream_data')(instance, user, remote));
              tstream.on('error', require(instance.options.base + '/apps/twitter/lib/on_stream_error')(instance, user, remote));
              tstream.on('destroy', require(instance.options.base + '/apps/twitter/lib/on_stream_destroy')(instance, user, remote));
            });
          });
        }
      });

      d.pipe(stream).pipe(d);

    });

    res.render('app', { session: req.session });
  };
};