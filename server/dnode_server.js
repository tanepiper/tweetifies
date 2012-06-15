module.exports = function(instance) {

  var dnode = require('dnode');
  var fs = require('fs');
  var dnodeSession = require('dnode-session');

  var dnode_server = function(client, connection) {
    var _self = this;
    require(instance.options.base + '/paths/app')('app', _self, instance, client, connection);
  };

  dnode().use(dnodeSession({store: instance.sessions})).use(dnode_server).listen(instance.express);

  instance.dnode = dnode;
}