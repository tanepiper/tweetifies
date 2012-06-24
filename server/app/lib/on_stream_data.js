var fs = require('fs');

module.exports = function(instance, dnode) {

  return function(data) {
    console.log('============== data event ==============');
    //console.log(data);
    console.log('============ end data event ============');

    if (data.friends) {

    } else if (data.direct_message) {

    } else if (data['delete']) {

    } else if (data.geo_scrub) {

    } else if (data.limit) {

    } else if (data.status_withheld) {

    } else if (data.user_withheld) {

    } else if (data.event) {

    } else {
      // Finally we have a fucking tweet!
      var process_tweet = require('./../processors/tweet')(instance);

      process_tweet.on('data', function(data) {
        dnode.proto.remote.onTweet(data, false);
      });

      process_tweet.on('error', function(error) {
        dnode.proto.remote.onError(err);
      });

      process_tweet.write(data);
    }
  };
};