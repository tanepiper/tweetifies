var domready = require('domready');
var sockjs = require('sockjs');
var dnode = require('../../');

domready(function () {
    var result = document.getElementById('result');
    var stream = sockjs('/dnode');
    
    var d = dnode();
    d.on('remote', function (remote) {
        remote.transform('beep', function (s) {
            result.textContent = 'beep => ' + s;
        });
    });
    d.pipe(stream).pipe(d);
});
