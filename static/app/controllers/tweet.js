'use strict';

angular.module('Tweetifies')
  .controller('TweetCtrl', ['$scope', 'socket', function($scope, socket) {
    $scope.tweet = {};
  }])