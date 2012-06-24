var ntwitter = require('ntwitter');
var _ = require('underscore');
var async = require('async');

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

        twitter.getHomeTimeline({count: 40, include_entities: true}, function(err, tweets) {
          if (err) {
            return cb(err);
          }

          var process_tweet = require('./processors/incoming_tweet')(instance);

          async.map(tweets, process_tweet, function(err, initial_tweets) {
            if (err) {
              return cb(err);
            }

            var app = {
              initial_tweets: initial_tweets.reverse(),
              profile: profile,
              updateStatus: function(tweet, options, cb) {
                twitter.updateStatus(tweet, options, cb);
              },
              retweetStatus: function(id, cb) {
                twitter.retweetStatus(id, cb);
              },
              search: function(terms, options, cb) {
                twitter.search(terms, options, cb);
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
      });
    };
  };
};