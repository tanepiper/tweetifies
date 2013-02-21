'use strict';

angular.module('Tweetifies')
  .factory('$timeline', ['$rootScope', function($rootScope) {

    // All tweets
    var tweets = [];

    // Incoming tweets we're not displaying yet
    var new_tweets = [];

    // List of users
    var users = [];

    return {
      getTweets: function() {
        return tweets;
      },

      getNewTweets: function() {
        return new_tweets;
      },

      emptyNewTweets: function() {
        new_tweets = []
      },

      setTweets: function(new_tweets) {
        tweets = new_tweets;
      },

      addTweet: function(tweet) {
        new_tweets.unshift(tweet);
      }
    }

  }]);