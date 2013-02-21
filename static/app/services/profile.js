'use strict';

angular.module('Tweetifies')
  .factory('$profile', ['$rootScope', function($rootScope) {

    var profile = {};

    return {
      getProfile: function() {
        return profile;
      },
      setProfile: function(user_profile) {
        profile = user_profile;
      }
    };

  }]);