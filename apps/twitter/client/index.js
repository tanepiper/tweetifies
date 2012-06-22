var domready = require('domready');
var sockjs = require('sockjs');
var dnode = require('dnode');

domready(function () {
    var stream = sockjs('/dnode');

    var d = dnode({
      foo: function() {

      },
      onError: function(err) {
        console.log(e);
      },
      onTweet: function(tweet) {

      }
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

    d.on('remote', function(remote) {
      $.post('/auth', function(token) {

        remote.auth(token, function(err, t) {
          if (err) {
            return console.log(err);
          }
          window.t = t;
        });

      });
    });


});