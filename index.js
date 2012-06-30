/**
 *  Todo
 *
 * Turn this into a bouncy proxy, create instances for each subdomain, redirect
 * requests and traffic
 *
 * This could run on port 80 and redirect traffic to nginx
 */

var config = require('./config');

var server = require('./server').createInstance(config);