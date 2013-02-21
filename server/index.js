/**
 * External requires
 */
var _ = require('underscore');
var fs = require('fs');

/**
 * This module in our instance starting module, it allows us to return an instance
 * that has an express and DNode server connected to it
 */
module.exports = (function() {

  return {
    /**
     * This function can be called to create the instance
     */
    createInstance: function(options) {
      options = options || {};

      var instance = {};

      // Set some default options
      instance.options = _.defaults(options, {
        base: __dirname,
        express: {
          host: '0.0.0.0',
          port: 8001,
          static_dir: __dirname + '/static',
          view_dir: __dirname + '/views'
        }
      });

      instance.users = {};

      instance.tokens = {};

     // Attach the express server for HTTP
      require('./express')(instance);

      require('./app2/couchdb')(instance);
      require('./app2')(instance);

      return instance;
    }
  };

}());