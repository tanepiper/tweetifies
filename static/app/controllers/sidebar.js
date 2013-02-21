'use strict';

angular.module('Tweetifies')
  .controller('SidebarCtrl', ['$rootScope', '$scope', 'socket', function($rootScope, $scope, socket) {

    $scope.current_new_tweets = 0;

    $rootScope.$on('newTweets', function(e, total) {
      console.log(arguments);
      $scope.current_new_tweets = total;
    });

  }]);