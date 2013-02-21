'use strict';

angular.module('Tweetifies')
  .directive('sideProfile', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/views/side-profile.html',
      controller: 'ProfileCtrl'
    }
  });