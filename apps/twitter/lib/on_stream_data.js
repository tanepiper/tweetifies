module.exports = function(instance, user, remote) {

  return function(data) {
    console.log('============== data event ==============');
    console.log(data);
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
      require('./../processors/process_tweet')(data, function(err, output) {
        if (err) {
          return remote.onError(err);
        }
        return remote.onTweet(output);
      });
    }
  };
};