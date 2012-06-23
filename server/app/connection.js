var dnode = require('dnode');

module.exports = function(instance) {

  return function(stream) {

    var d = dnode();

    d.on('local', require('./local')(instance, stream, d));


    d.pipe(stream).pipe(d);

  };

};