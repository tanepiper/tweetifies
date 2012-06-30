var server = require('./../server/');
var assert = require('assert');
var request = require('request');

var instance = server.createInstance();

describe('Tweetifies HTTP Server - Express', function(){
  it('Instance should have options present', function(){
    assert(instance.options, 'Instance options not generated');
  });

  it('Instance should have express server', function() {
    assert(instance.express, 'Instance express does not exists');
  });

  it('Instance should have socket instance', function(){
    assert(instance.sockjs, 'Instance sockjs does not exists');
  });


  it('Instance should present a login page', function(done) {
    request({
      uri: 'http://' + instance.options.express.host + ':' + instance.options.express.port + '/'
    }, function(err, response, body) {
      assert.ifError(err);
      assert.equal(response.statusCode, 200, 'Express returned non-200 state');
      done();
    });
  });

  it('Instance should return a redirect when trying to access app not logged in', function(done) {
    request({
      uri: 'http://' + instance.options.express.host + ':' + instance.options.express.port + '/home',
      followRedirect: false
    }, function(err, response, body) {
      assert.ifError(err);
      assert.equal(response.statusCode, 302, 'Express returned 302 redirect state');
      done();
    });
  });

});


