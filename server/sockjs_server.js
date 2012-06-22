module.exports = function(instance) {

  var sockjs = require('sockjs');
  var dnode = require('dnode');
  var ntwitter = require('ntwitter');

  var sock = sockjs.createServer();

  sock.installHandlers(instance.express, { prefix : '/dnode' });

  instance.sockjs = sock;

  instance.sockjs.on('connection', function(stream) {

    var u;

    var d = dnode({
      auth : function (token, cb) {

        u = instance.tokens[token];

        if (!u) return cb('Invalid Token');

        var twitter = new ntwitter(u.oauth);
        var authorised = {
          updateStatus: function(tweet, cb) {
            twitter.updateStatus(tweet.status, tweet, cb);
          },
          retweetStatus: function(id, cb) {
            twitter.retweetStatus(id, cb);
          }
        };

        twitter.verifyCredentials(function(err, profile) {
          authorised.profile = profile;

          twitter.stream('user', function(tstream) {
            authorised.tstream = tstream;

            tstream.on('data', require(instance.options.base + '/apps/twitter/lib/on_stream_data')(instance, d));
            //tstream.on('error', require(instance.options.base + '/apps/twitter/lib/on_stream_error')(instance, d));
            //tstream.on('destroy', require(instance.options.base + '/apps/twitter/lib/on_stream_destroy')(instance, d));

            cb(null, authorised);
          });
        });
      }
    });

    d.on('local', function(local) {

    });

    d.on('remote', function(remote) {
      console.log('remote', remote, u);
      /*
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
       */
    });

    d.pipe(stream).pipe(d);

  });
};