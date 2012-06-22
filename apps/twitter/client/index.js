var domready = require('domready');
var sockjs = require('sockjs');
var dnode = require('dnode');

domready(function () {
    var stream = sockjs('/dnode');

    var d = dnode();

    d.on('local', function(local) {
      local.onError = function(e) {
        console.log(e);
      };

      local.onTweet = function(t) {
        console.log(t);
      };
    });

    d.on('remote', function (remote) {
       console.log(remote);
    });

    d.pipe(stream).pipe(d);
});