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

      var tinstance = instance.tweet_server.getOrCreateInstance(session, {
        client: client
      });
      console.log(tinstance);
      if (tinstance) {

        // If we already have Oauth data in the session then we don't need to get it from the user
        /**
         * This is our function to generate the view data
         */
        var incomingMessage = function(message) {
          //console.log(message);
          var output;

          if (message.friends) {
            client.incomingMessage(null, null);
          } else if (message.event) {
            if (message.event === 'follow') {

            }
          } else {

            var text = message.text.replace(message.user.screen_name, '@' + message.user.screen_name, 'gi');

            if (message.entities && message.entities.urls && message.entities.urls.length > 0) {
              message.entities.urls.forEach(function(url){
                text = text.replace(url.url, '<a target="_new" href="' + url.expanded_url + '" title="' + url.expanded_url + '">' + url.display_url + '</a>', 'gi');
              });
            }

            if (message.entities && message.entities.media && message.entities.media.length > 0) {
              message.entities.media.forEach(function(media){
                text = text.replace(media.url, '<a target="_new" href="' + media.expanded_url + '" title="' + media.expanded_url + '">' + media.display_url + '</a>', 'gi');
              });
            }

            if (message.entities && message.entities.hashtags && message.entities.hashtags.length > 0) {
              message.entities.hashtags.forEach(function(hashtag){
                text = text.replace('#' + hashtag.text, '<a target="_new" href="https://twitter.com/search/' + encodeURIComponent('#' + hashtag.text) + '" title="' + '#' + hashtag.text + '">' + '#' + hashtag.text + '</a>', 'gi');
              });
            }

            if (message.entities && message.entities.user_mentions && message.entities.user_mentions.length > 0) {
              message.entities.user_mentions.forEach(function(user_mention){
                text = text.replace('@' + user_mention.screen_name, '<a target="_new" href="http://twitter.com/' + user_mention.screen_name + '" title="' + '@' + user_mention.screen_name + '">' + '@' + user_mention.screen_name + '</a>', 'gi');
              });
            }

            _.extend(message, {
              date_display: moment(message.created_at).format("MMM Do YYYY, hh:mm:ss"),
              text_formatted: text
            });

            // First we send this to redis
            //instance.db.hset(session.user.user_id, message.id, JSON.stringify(message));
            tinstance.incomingStreamTweet(message);
            client.incomingMessage(null, message);
          }
        };

        /**
         * Connect to the user stream
         */
        tinstance.verifyCredentials(function(err, result) {
          if (err) {
            return client.incomingError(err);
          }

          var j = (tinstance.tweets.length > 50) ? 50 : tinstance.tweets.length;
          for (var i = 0; i < j; i++ ) {
            incomingMessage(tinstance.tweets[i]);
          }

          tinstance.twitter.stream('user', function(stream) {
            // When data comes in pass to incoming Message
            stream.on('data', incomingMessage);

            stream.on('error', function(error) {
              console.log('error', error);
              client.incomingError(error);
            });

            stream.on('destroy', function(destory) {
              console.log('destory', destory);
              client.incomingError(destory);
            });
          });
        });
      }
    });
  });

};