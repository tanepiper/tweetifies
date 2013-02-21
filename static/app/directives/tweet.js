'use strict';

angular.module('Tweetifies')
  .directive('tweet', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/views/tweet.html',
      controller: 'TweetCtrl'
    }
  });