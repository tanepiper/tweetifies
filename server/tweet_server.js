var twitter = require('ntwitter');
var request = require('request');
var _ = require('underscore');
var moment = require('moment');

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

    tinstance.sendMessage = function(data, render_now) {
      if (this.client) {
        this.client.incomingMessage(null, data, render_now);
      } else {
        console.log('no client');
      }
    };

    tinstance.incomingError = function(error) {
      this.client.incomingError(error);
    };

    tinstance.incomingMessage = function(message) {

      // This is the first message sent in the stream, for now we ignore it
      if (message.friends) {
        //this.sendMessage(null);
      // We got a direct message
      } else if (message.direct_message) {


      } else if (message.event) {
        // we got an event message
        if (message.event === 'follow') {

        }

      // We got a plain old tweet
      } else {

        var text = message.text.replace(message.user.screen_name, '@' + message.user.screen_name, 'gi');

        if (message.entities && message.entities.urls && message.entities.urls.length > 0) {
          message.entities.urls.forEach(function(url) {
            var display = (url.display_url) ? url.display_url : url.url;
            var link = (url.expanded_url) ? url.expanded_url : url.url;
            text = text.replace(url.url, '<a target="_new" href="' + link + '" title="' + link + '">' + display + '</a>', 'gi');
          });
        }

        if (message.entities && message.entities.media && message.entities.media.length > 0) {
          message.entities.media.forEach(function(media) {
            var display = (media.display_url) ? media.display_url : media.url;
            var link = (media.expanded_url) ? media.expanded_url : media.url;

            text = text.replace(media.url, '<a target="_new" href="' + link + '" title="' + link + '">' + display + '</a>', 'gi');
          });
        }

        if (message.entities && message.entities.hashtags && message.entities.hashtags.length > 0) {
          text = text.replace(/(\B#[\w-]+)/gmi, '<a target="_blank" title="@$1" href="http://twitter.com/search/$1">$1</a>');
        }

        if (message.entities && message.entities.user_mentions && message.entities.user_mentions.length > 0) {
          text = text.replace(/(\B@[\w-]+)/gmi, '<a target="_blank" title="$1" href="http://twitter.com/$1">$1</a>');
        }

        _.extend(message, {
          date_display: moment(message.created_at).format("MMM Do YYYY, hh:mm:ss"),
          text_formatted: text
        });

        this.tweets.push(message);
        this.sendMessage(message, false);
      }
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