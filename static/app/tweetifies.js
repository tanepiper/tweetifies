'use strict';

angular.module('Tweetifies', [])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: '/app/views/timeline.html',
        controller: 'TimelineCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);