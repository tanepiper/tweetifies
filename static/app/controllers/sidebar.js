'use strict';

angular.module('Tweetifies')
  .controller('SidebarCtrl', ['$rootScope', '$scope', 'socket', function($rootScope, $scope, socket) {

    $scope.current_new_tweets = 0;

    $scope.$on('newTweets', function(e, total) {
      $scope.current_new_tweets = total;
    });

  }]);