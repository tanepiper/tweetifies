/**
 * External requires
 */
var _ = require('underscore');
var fs = require('fs');
var ejs = require('ejs');
var xregexp = require('xregexp');
var moment = require('moment');
var eventStream = require('event-stream');

/**
 * The incoming tweet module uses event-stream to map a async function as a stream - allowing events to be .write
 * to the stream
 * @param  {[type]} instance [description]
 * @return {[type]}          [description]
 */
module.exports = function(instance) {

  return eventStream.map(function(data, cb) {
    var output_object = {};

    if (data.retweeted_status) {
      _.extend(output_object, {
        retweet: true,
        retweet_by: data.user.screen_name,
        tweet: _.clone(data.retweeted_status),
        ago: moment(data.retweeted_status.created_at).from()
      });
    } else {
      _.extend(output_object, {
        retweet: false,
        tweet: _.clone(data),
        ago: moment(data.created_at).from()
      });
    }

    // Mentions and hash tags we can just replace
    output_object.tweet.text = output_object.tweet.text.replace(/\B@([\w-]+)/gmi, '<a target="_blank" title="@$1" href="http://twitter.com/$1">@$1</a>');
    output_object.tweet.text = output_object.tweet.text.replace(/\B#([\w-]+)/gmi, '<a target="_blank" title="#$1" href="http://twitter.com/search/' + encodeURIComponent('#') + '$1">#$1</a>');

    // For urls and media we'll use the data from these to output
    if (data.entities && data.entities.urls && data.entities.urls.length > 0) {
      data.entities.urls.forEach(function(url) {
        var display = (url.display_url) ? url.display_url : url.url;
        var link = (url.expanded_url) ? url.expanded_url : url.url;
        output_object.tweet.text = output_object.tweet.text.replace(url.url, '<a target="_new" href="' + link + '" title="' + link + '">' + display + '</a>', 'gmi');
      });
    }

    if (data.entities && data.entities.media && data.entities.media.length > 0) {
      data.entities.media.forEach(function(media) {
        var display = (media.display_url) ? media.display_url : media.url;
        var link = (media.expanded_url) ? media.expanded_url : media.url;

        output_object.tweet.text = output_object.tweet.text.replace(media.url, '<a target="_new" href="' + link + '" title="' + link + '">' + display + '</a>', 'gi');
      });
    }

    // Generate our output HTML
    var tpl = ejs.render(instance.templates.tweet, output_object);

    var output = _.extend({}, {
      id: (data.retweeted_status) ? data.retweeted_status.id_str : data.id_str,
      data: data,
      tpl: tpl
    });

    cb (null, output);
  });
};