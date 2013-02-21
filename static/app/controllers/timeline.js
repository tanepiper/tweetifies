'use strict';

angular.module('Tweetifies')
  .controller('TimelineCtrl', ['$rootScope', '$scope', 'socket', 'TimelineService', function($rootScope, $scope, socket, TimelineService) {

    $scope.tweets = [];

    socket.on('error', function(error) {
      console.log(error);
    })
    socket.on('gotProfile', function(profile) {
      console.log('profile', profile);
    });

    socket.on('homeTimeline', function(timeline) {
      console.log('timeline', timeline);
    });

    socket.on('tweet', function(tweet) {
      console.log('tweet', tweet);
    });

    socket.emit('auth');

  }]);