'use strict';

angular.module('Tweetifies')
  .controller('TimelineCtrl', ['$rootScope', '$scope', 'socket', 'TimelineService', function($rootScope, $scope, socket, TimelineService) {

    $scope.tweets = [];

    $scope.new_tweets = [];

    $scope.loadNewTweets = function() {
      $scope.tweets = $scope.new_tweets.concat($scope.tweets);
      $scope.new_tweets = [];
    }

    $scope.$watch('new_tweets', function(new_tweets) {
      $rootScope.$broadcast('newTweets', new_tweets.length);
    })

    socket.on('error', function(error) {
      console.log(error);
    })
    socket.on('gotProfile', function(profile) {
      console.log('profile', profile);
    });

    socket.on('homeTimeline', function(timeline) {
      console.log('timeline', timeline);
      $scope.tweets = timeline;
    });

    socket.on('tweet', function(tweet) {
      console.log('tweet', tweet);
      $scope.new_tweets.unshift(tweet);
      $scope.new_tweets_count++;
    });

  }]);