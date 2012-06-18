var twitter = require('ntwitter');
var request = require('request');
var _ = require('underscore');

module.exports = function(instance) {

  this.servers = {};
  this.server_count = 0;

  this.getOrCreateInstance = function (session, add_to) {
    if (!session || !session.user && !session.oauth) {
      return false;
    }
    if (this.servers[session.user.screen_name]) {
      if (add_to) {
       _.extend(this.servers[session.user.screen_name], add_to);
      }
      return this.servers[session.user.screen_name];
    }
    // Object to store our instance
    var tinstance = {
      session_id: session.id,
      instance: instance,
      session: session,
      twitter: (session.oauth) ? new twitter(session.oauth) : null,
      tweets: []
    };

    tinstance.verifyCredentials = function(cb) {
      this.verified = true;
      this.twitter.verifyCredentials(cb);
    };

    tinstance.incomingStreamTweet = function(data) {
      this.tweets.shift(data);
      //this.client.incomingMessage(null, data);
    };

    this.servers[session.user.screen_name] = tinstance;
    this.server_count += 1;

    return tinstance;
  };

  this.getServer = function(session) {
    return this.servers[session.user.screen_name];
  };


  instance.tweet_server = this;
};