var ntwitter = require('ntwitter');
var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var request = require('request');

module.exports = function(instance, stream, dnode) {

  return function(local) {

    local.auth = function(token, cb) {
      if (!instance.tokens[token]) {
        return cb('Invalid Token');
      }

      var u = instance.tokens[token];
      var twitter = new ntwitter(u.oauth);

      twitter.verifyCredentials(function(err, profile) {
        if (err) {
          return cb(err);
        }

        dnode.proto.remote.onProfile(profile);

        twitter.getHomeTimeline({count: 40, include_entities: true}, function(err, tweets) {
          if (err) {
            return cb(err);
          }

          var process_tweet = require('./processors/tweet')(instance);

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

                var process_tweet = require('./processors/tweet')(instance);

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

              var process_tweet = require('./processors/tweet')(instance);

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
              var process_tweet = require('./processors/tweet')(instance);

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
            }
          };

          twitter.stream('user', function(tstream) {
            app.tstream = tstream;

            tstream.on('data', require('./lib/on_stream_data')(instance, dnode));
            tstream.on('error', require('./lib/on_stream_error')(instance, dnode));
            //tstream.on('destroy', require(instance.options.base + '/apps/twitter/lib/on_stream_destroy')(instance, d));

            cb(null, app);
          });
        });
      });
    };
  };
};