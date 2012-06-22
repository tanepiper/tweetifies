module.exports = function(instance) {

  var sockjs = require('sockjs');
  var dnode = require('dnode');
  var twitter = require('ntwitter');

  var sock = sockjs.createServer();

  sock.installHandlers(instance.express, { prefix : '/dnode' });

  instance.sockjs = sock;

  instance.sockjs.on('connection', function(stream) {

    var u;

    var d = dnode({
      auth : function (token, cb) {
        console.log(token, instance.tokens);
        u = instance.tokens[token];
        if (!u) return cb('Invalid Token');

        var t = new twitter(u.oauth);
        var l = {
          updateStatus: function(tweet, cb) {
            t.updateStatus(tweet.status, tweet, cb);
          },
          retweetStatus: function(id, cb) {
            t.retweetStatus(id, cb);
          }
        };

        cb(null, l);
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