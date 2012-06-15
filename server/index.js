module.exports = (function() {

  var _ = require('underscore');

  return {
    createInstance: function(options) {
      options = options || {};

      var instance = {};

      instance.options = _.defaults(options, {
        base: __dirname,
        express: {
          host: '0.0.0.0',
          port: 8001,
          static_dir: __dirname + '/static',
          view_dir: __dirname
        }
      });

      require('./express')(instance);
      require('./dnode_server')(instance);

      return instance;
    }
  }

}());