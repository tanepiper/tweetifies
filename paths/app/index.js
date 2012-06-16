module.exports = function(namespace, dnode, instance, client, connection) {

  var twitter = require('ntwitter');
  var request = require('request');

  dnode[namespace] = {};

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
      twit.verifyCredentials(function (err, data) {}).getUserTimeline(cb);
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
      twit.verifyCredentials(function (err, data) {}).getHomeTimeline(options, cb);
    });
  };

  dnode[namespace].sendTweet = function(options, cb) {

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
  }

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

  connection.on('ready', function() {
    dnode.session(function(err, session) {
      if (err) {
        return client.incomingError(err);
      }

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

        twit.stream('user', function(stream) {
          stream.on('data', function(data) {
            console.log('data', data);
            client.incomingMessage(data);
          });

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