var couchdb = require('felix-couchdb');

module.exports = function(instance) {
  instance.couch = couchdb.createClient(5985, 'localhost');

  instance.couchdb = instance.couch.db('tweetifies');

  instance.couchdb.exists(function(err, exists) {
    if (!exists) {
      instance.couchdb.create(function(err) {
        if (err) {
          throw err;
        }
      });
    }
  })
}