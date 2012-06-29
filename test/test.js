var config = require('./../config');
var server = require('./../server/');
var assert = require('assert');

var instance = server.createInstance(config);

describe('Tweetifies HTTP Server - Express', function(){
  it('Instance should have options present', function(){
    assert.deepEqual(instance.options, config, 'Instance options did not inherit from config');
  });

  it('Instance should have express server', function() {
    assert(instance.express, 'Instance express does not exists');
  });

  it('Instance should have socket instance', function(){
    assert(instance.sockjs, 'Instance sockjs does not exists');
  });
});


