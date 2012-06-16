module.exports = function(namespace, dnode, instance, client, connection) {

  var _ = require('underscore');
  var twitter = require('ntwitter');
  var request = require('request');
  var moment = require('moment');

  dnode[namespace] = {};


  dnode[namespace].retweet = function(id, cb) {
    console.log('Retweet request', id);
    dnode.session(function(err, session) {
      if (err) {
        return cb(err);
      }
      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
      });
      twit.retweetStatus(id, cb);
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
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
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
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
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
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
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

      var twit = new twitter({
        consumer_key: instance.options.oauth.consumer_key,
        consumer_secret: instance.options.oauth.consumer_secret,
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
      });
      twit.verifyCredentials(function (err, data) {}).updateStatus(options.status, options, cb);
    });
  };

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
        access_token_key: session.oauth.access_token,
        access_token_secret: session.oauth.access_token_secret
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

  /**
   * This is our function to generate the view data
   */
  var incomingMessage = function(message) {
    var output;

    if (message.friends) {
      this.incomingMessage(null, null);
    } else {
      //console.log('Incoming Message', message);
      output = {
        type: 'tweet',
        id: message.id,
        tweet_id: message.id_str,
        date: moment(message.created_at).format("MMM Do YYYY, hh:mm:ss"),
        user: _.extend({}, message.user),
        entities: _.extend({}, message.entities)
      };

      var text = message.text.replace(message.user.screen_name, '@' + message.user.screen_name, 'gi');


      if (message.entities && message.entities.urls && message.entities.urls.length > 0) {
        message.entities.urls.forEach(function(url){
          text = text.replace(url.url, '<a href="' + url.expanded_url + '" title="' + url.expanded_url + '">' + url.display_url + '</a>', 'gi');
          output.entities.urls.push(url);
        });
      }

      if (message.entities && message.entities.hashtags && message.entities.hashtags.length > 0) {
        message.entities.hashtags.forEach(function(hashtag){
          text = text.replace('#' + hashtag.text, '<a href="/search/' + encodeURIComponent('#' + hashtag.text) + '" title="' + '#' + hashtag.text + '">' + '#' + hashtag.text + '</a>', 'gi');
          output.entities.hashtags.push(hashtag);
        });
      }

      if (message.entities && message.entities.user_mentions && message.entities.user_mentions.length > 0) {
        message.entities.user_mentions.forEach(function(user_mention){
          text = text.replace('@' + user_mention.screen_name, '<a href="/search/' + encodeURIComponent('@' + user_mention.screen_name) + '" title="' + '@' + user_mention.screen_name + '">' + '@' + user_mention.screen_name + '</a>', 'gi');
          output.entities.user_mentions.push(user_mention);
        });
      }

      output.text = text;

      this.incomingMessage(null, output);
    }
  };

  // Now we know the client and server have a connection
  connection.on('ready', function() {
    // Get our session data
    dnode.session(function(err, session) {


      if (err) {
        return client.incomingError('Connection Ready Error in Session', err);
      }

      // If we already have Oauth data in the session then we don't need to get it from the user
      if (session.oauth) {
        var twit = new twitter({
          consumer_key: instance.options.oauth.consumer_key,
          consumer_secret: instance.options.oauth.consumer_secret,
          access_token_key: session.oauth.access_token,
          access_token_secret: session.oauth.access_token_secret
        });

        /*
        twit
        .verifyCredentials(function (err, data) {
          console.log(data);
        })
        .getHomeTimeline({count: 20, include_entities: true}, function(err, data) {
          client.incomingTweets(data);
        });
        */

        /**
         * Connect to the user stream
         */
        twit.stream('user', function(stream) {

          // When data comes in pass to incoming Message
          stream.on('data', incomingMessage.bind(client));

          stream.on('error', function(error) {
            console.log('error', error);
            client.incomingError(error);
          });

          stream.on('destroy', function(destory) {
            console.log('destory', destory);
            client.incomingError(destory);
          });
        });
      }
    });
  });

};