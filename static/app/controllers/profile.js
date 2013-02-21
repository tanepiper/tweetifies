'use strict';

angular.module('Tweetifies')
  .controller('ProfileCtrl', ['$rootScope', '$scope', 'socket',
    function($rootScope, $scope, socket) {

      $scope.profile = {};

      socket.on('gotProfile', function(profile) {
        $scope.profile = profile;
      });


    }]);