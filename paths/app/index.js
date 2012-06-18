/**
 * External dependencies
 */
var _ = require('underscore');
var twitter = require('ntwitter');
var request = require('request');
var moment = require('moment');

/**
 * This module attaches the application to our dnode instance
 */
module.exports = function(namespace, dnode, instance, client, connection) {

  // Create the namespace on the DNode object
  dnode[namespace] = {};

  /**
   * Function to do a retweet, takes an ID and sends a status update, then
   * returns the tweet data
   */
  dnode[namespace].retweet = function(id, cb) {

    // Fetch the session data for our user
    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }
      instance.tweet_server.getOrCreateInstance(session).twitter.retweetStatus(id, cb);
    });
  };

  dnode[namespace].sendTweet = function(options, cb) {
    if (!options || !options.status) {
      return cb('You must pass a status to sendTweet');
    }

    _.extend(options, {
      'include_entities': true
    });

    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }

      instance.tweet_server.getOrCreateInstance(session).twitter.updateStatus(options.status, options, cb);
    });
  };

  /*

  dnode[namespace].search = function(term, params, cb) {
    if (typeof params === 'function') {
      cb = params;
      options = {};
    } else {
      options = params;
    }

    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }

      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.token,
        access_token_secret: session.oauth.token_secret
      });

      var interval = setInterval(function() {
        twit.search(term, options, function(err, data) {
          options.since_id = data.max_id_str;
          if (err) {
            clearInterval(interval);
            return cb(err);
          }
          cb(null, interval, data);
        });
      }, 5000);
    });
  };

  dnode[namespace].userTimeline = function(cb) {

    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }

      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.token,
        access_token_secret: session.oauth.token_secret
      });
      twit.verifyCredentials(function (err, data) {
        if (err) {
          return cb(err);
        }
        twit.getUserTimeline(function(data) {
          var tweet = {
            tweet_id: message.id_str,
            screen_name: message.user.screen_name,
            profile_image: message.user.profile_image_url,
            date: moment(message.created_at).format("MMM Do YYYY, hh:mm:ss"),
            text: message.text
          };
          cb(null, tweet);
        });
      });
    });
  };

  dnode[namespace].homeTimeline = function(params, cb) {
    if (typeof params === 'function') {
      cb = params;
      options = {};
    } else {
      options = params;
    }

    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }

      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.token,
        access_token_secret: session.oauth.token_secret
      });

      twit.verifyCredentials(function (err, data) {
        if (err) {
          return cb(err);
        }
        twit.getHomeTimeline(function(data) {
          var tweet = {
            tweet_id: message.id_str,
            screen_name: message.user.screen_name,
            profile_image: message.user.profile_image_url,
            date: moment(message.created_at).format("MMM Do YYYY, hh:mm:ss"),
            text: message.text
          };
          cb(null, tweet);
        });
      });
    });
  };
   */



  /*
  dnode[namespace].getDirectMessages = function(params, cb) {
    if (typeof params === 'function') {
      cb = params;
      options = {};
    } else {
      options = params;
    }

    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }

      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.token,
        token_secret: session.oauth.token_secret
      });
      twit.verifyCredentials(function (err, data) {}).getDirectMessages(cb);
    });
  };

  dnode[namespace].getTweetLocation = function(coordinates, cb) {
    request({
      uri: 'https://maps.googleapis.com/maps/api/geocode/json',
      qs: {
        sensor: false,
        latlng: coordinates[0] + ',' + coordinates[1]
      },
      json: true
    }, cb);
  };
   */

  // Now we know the client and server have a connection
  connection.on('ready', function() {
    console.log('Connection ready');

    // Get our session data
    dnode.session(function(err, session) {
      if (err) {
        return client.incomingError('Connection Ready Error in Session', err);
      }

      var tinstance = instance.tweet_server.getOrCreateInstance(session);
      if (tinstance) {
        if (tinstance.client) {
          tinstance.client = null;
        }
        tinstance.client = client;

        var j = (tinstance.tweets.length > 50) ? 50 : tinstance.tweets.length;
        for (var i = 0; j > i; j-- ) {
          tinstance.sendMessage(tinstance.tweets[j]);
        }

        if (!tinstance.stream) {
          tinstance.verifyCredentials(function(err, result) {
            if (err) {
              return client.incomingError(err);
            }

            var createStream = function(i) {
              i.twitter.stream('user', function(stream) {
                i.stream = stream;

                // When data comes in pass to incoming Message
                stream.on('data', i.incomingMessage.bind(tinstance));
                stream.on('error', tinstance.incomingError.bind(tinstance));

                stream.on('destroy', function(destory) {
                  createStream(i);
                });
              });
            };

            createStream(tinstance);
          });
        }
      }
    });
  });

  connection.on('end', function() {
    console.log('end');
    // Get our session data
    dnode.session(function(err, session) {
      if (err) {
        return client.incomingError('Connection Ready Error in Session', err);
      }
      var tinstance = instance.tweet_server.getOrCreateInstance(session);
      if (tinstance) {
        tinstance.client = null;
      }
    });
  });

};