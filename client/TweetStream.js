var stream = require('stream');
var _ = require('underscore');
var util = require('util');

_.extend(Tweetifies, {
  TweetStream: function() {

    var TweetStream = function() {
      stream.Stream.call(this);
      this.readable = true;
      this.writable = true;
    };

    TweetStream.prototype.on = function(data) {
      this.emit('data', data);
    };

    TweetStream.prototype.end = function() {
      this.emit('end');
    };

    util.inherits(TweetStream, stream.Stream);

    return new TweetStream();
  }
});

