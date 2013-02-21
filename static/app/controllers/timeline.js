'use strict';

angular.module('Tweetifies')
  .controller('TimelineCtrl', ['$rootScope', '$scope', '$timeout', 'socket', 'TimelineService', function($rootScope, $scope, $timeout, socket, TimelineService) {

    $scope.tweets = [];

    $scope.new_tweets = [];

    $scope.tweet_text = '';

    $scope.characters_left = 140;

    $scope.$watch('tweet_text', function(newVal, oldVal) {
      $scope.characters_left = 140 - newVal.length;
    });

    $scope.loadNewTweets = function() {
      $scope.tweets = $scope.new_tweets.concat($scope.tweets);
      $scope.new_tweets = [];
    }

    $scope.submitTweet = function() {
      socket.emit('newTweet', {
        status: $scope.tweet_text
      });
    }

    $scope.$watch('new_tweets', function(new_tweets) {
      $rootScope.$broadcast('newTweets', new_tweets.length);
    })

    socket.on('error', function(error) {
      console.log('error', error);
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
    });

    socket.on('delete', function(tweet) {
      console.log('delete', tweet);
    });

    socket.on('newTweetSent', function(tweet) {
      $scope.tweet_text = '';
      console.log('newTweetSent', tweet);
    })

    $timeout(function updateTime() {
      $rootScope.$broadcast('updateTime')
      $timeout(updateTime, 60000);
    }, 60000);


  }]);