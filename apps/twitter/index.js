var twitter = require('ntwitter');

module.exports = function(instance) {

  return function(client, connection) {

    var self = this;

    connection.on('ready', function() {
      self.session(function(err, session) {
        if (err) {
          return client.onError('Connection Ready Error in Session', err);
        }

        /**
         * TODO: This needs to be less ephemeral - should be spun out to a seperate DNode instance
         * that can store and regenerate these on the fly
         */
        var user = instance.users[session.user.id + ':' + session.user.screen_name];
        if (!user) {
          user = instance.users[session.user.id + ':' + session.user.screen_name] = {
            session: session
          };
        }

        user.client = client;
        user.connection = connection;

        if (!user.twitter) {
          user.twitter = new twitter(session.oauth);
        }

        if (!user.stream) {
          user.twitter.verifyCredentials(function(err, profile) {
            user.profile = profile;
            session.profile = profile;

            user.twitter.stream('user', function(stream) {
              user.stream = stream;

              stream.on('data', require('./lib/on_stream_data')(instance, user, client, connection));
              stream.on('error', require('./lib/on_stream_error')(instance, user, client, connection));
              stream.on('destroy', require('./lib/on_stream_destroy')(instance, user, client, connection));
            });
          });
        }

        console.log(user);

      });
    });


  };
};