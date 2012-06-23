var domready = require('domready');
var sockjs = require('sockjs');
var dnode = require('dnode');
var _ = require('underscore');

window.Tweetifies = {};

Tweetifies.onError = function(err) {
  console.log(e);
};

Tweetifies.onTweet = function(tweet) {
  var item = $(tweet.tpl);
  $('#twitter-output').prepend(item);
  item.slideDown();
};




domready(function () {
    var stream = sockjs('/dnode');

    var d = dnode({
      foo: function() {

      },
      onError: function(err) {
        console.log(e);
      },
      onTweet: Tweetifies.onTweet
    });

    d.pipe(stream).pipe(d);

    /*
    d.on('local', function(local) {
      local.onError = function(e) {
        console.log(e);
      };

      local.onTweet = function(t) {
        console.log(t);
      };
    });
     */

    d.on('remote', function(r) {
      $.post('/auth', function(token) {
        console.log(token);
        r.auth(token, function(err, remote) {
          if (err) {
            return console.log(err);
          }
          console.log(remote);
          Tweetifies.remote = remote;
        });
      });
    });


});