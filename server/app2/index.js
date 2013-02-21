var socketio = require('socket.io');
var SessionSockets = require('session.socket.io');
var ntwitter = require('ntwitter');

module.exports = function(instance) {

  instance.io = socketio.listen(instance.server);

  instance.sessionSockets = new SessionSockets(instance.io, instance.sessions, instance.cookieParser);

  instance.sessionSockets.on('connection', function(err, socket, session) {
    socket.on('auth', function(token) {

      var twitter = new ntwitter(session.oauth);

      twitter.verifyCredentials(function(err, profile) {
        if (err) {
          return socket.emit('error', err);
        }

        socket.emit('gotProfile', profile);

        twitter.getHomeTimeline({count: 40, include_entities: true}, function(err, tweets) {
          if (err) {
            return socket.emit('error', err);
          }

          socket.emit('homeTimeline', tweets);

          /*
          var process_tweet = require('./../app/processors/tweet')(instance);

          process_tweet.on('data', function(data) {
            dnode.proto.remote.onTweet(data, true);
          });

          process_tweet.on('error', function(error) {
            dnode.proto.remote.onError(error);
          });

          tweets.reverse().forEach(function(tweet) {
            process_tweet.write(tweet);
          });

          var app = {
            updateStatus: function(tweet, options, cb) {
              twitter.updateStatus(tweet, options, cb);
            },
            retweetStatus: function(id, cb) {
              twitter.retweetStatus(id, cb);
            },

            createFavorite: function(id, cb) {
              twitter.createFavorite(id, cb);
            },

            destroyFavorite: function(id, cb) {
              twitter.destroyFavorite(id, cb);
            },

            search: function(query, cb) {

              var qs = _.extend({}, {
                q: query,
                include_entities: true
              });

              request({
                uri: 'http://search.twitter.com/search.json',
                qs: qs,
                json: true
              }, function(err, res, body){
                if (err) {
                  return cb(err);
                }

                var process_tweet = require('./../app/processors/tweet')(instance);

                var new_tweets = [];

                function done() {
                  cb(null, new_tweets);
                }

                process_tweet.on('data', function(data) {
                  new_tweets.push(data);
                });

                process_tweet.on('error', function(error) {
                  cb(error);
                });

                body.results.forEach(function(tweet) {
                  process_tweet.write(tweet);
                });
                done();

              });
            },


            getMentions: function(options, cb) {

              var process_tweet = require('./../app/processors/tweet')(instance);

              _.defaults(options, {
                include_entities: true,
                include_rts: true
              });

              twitter.getMentions(options, function(err, tweets) {
                if (err) {
                  return cb(err);
                }

                var new_tweets = [];

                function done() {
                  cb(null, new_tweets);
                }

                process_tweet.on('data', function(data) {
                  new_tweets.push(data);
                });

                process_tweet.on('error', function(error) {
                  cb(error);
                });

                tweets.forEach(function(tweet) {
                  process_tweet.write(tweet);
                });
                done();
              });
            },

            getUserTimeline: function(options, cb) {
              var process_tweet = require('./../app/processors/tweet')(instance);

              _.extend(options, {
                include_rts: true,
                include_entities: true,
                exclude_replies: false
              });

              twitter.getUserTimeline(options, function(err, tweets) {
                if (err) {
                  return cb(err);
                }

                var new_tweets = [];

                function done() {
                  cb(null, new_tweets);
                }

                process_tweet.on('data', function(data) {
                  new_tweets.push(data);
                });

                process_tweet.on('error', function(error) {
                  cb(error);
                });

                tweets.forEach(function(tweet) {
                  process_tweet.write(tweet);
                });
                done();
              });
            },

            showUser: function(id, cb) {
              twitter.showUser(id, cb);

              this.foo = function() {

              }
            }
          };*/

          twitter.stream('user', function(tstream) {
            instance.tstream = tstream;

            tstream.on('data', require('./../app/lib/on_stream_data')(instance, socket));
            tstream.on('error', require('./../app/lib/on_stream_error')(instance, socket));
            //tstream.on('destroy', require(instance.options.base + '/apps/twitter/lib/on_stream_destroy')(instance, d));

            //cb(null, app);
          });
        });
      });
    });
  });
}