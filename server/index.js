/**
 * External requires
 */
var _ = require('underscore');
var pg = require('pg');

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
          view_dir: __dirname
        }
      });

      instance.clients = {};

      require('./tweet_server')(instance);

     // Attach the express server for HTTP
      require('./express')(instance);

      // Attach the DNode server for our functionality
      require('./dnode_server')(instance);

      return instance;
    }
  };

}());