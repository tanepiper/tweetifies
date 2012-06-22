var http = require('http');
var sockjs = require('sockjs');
var ecstatic = require('ecstatic')(__dirname + '/static');
var dnode = require('../../');

var server = http.createServer(ecstatic);
server.listen(9999);

var sock = sockjs.createServer();
sock.on('connection', function (stream) {
    var d = dnode({
        transform : function (s, cb) {
            var res = s.replace(/[aeiou]{2,}/, 'oo').toUpperCase();
            cb(res);
        }
    });
    d.pipe(stream).pipe(d);
});
sock.installHandlers(server, { prefix : '/dnode' });
