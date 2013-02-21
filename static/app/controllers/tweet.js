'use strict';

angular.module('Tweetifies')
  .controller('TweetCtrl', ['$scope', 'socket', function($scope, socket) {
    $scope.tweet = {};
    $scope.formatted_text = '';
    $scope.created_at = '';

    $scope.favorite = function() {
      console.log('favorite', $scope.tweet.id_str)
      socket.emit('favorite', $scope.tweet.id_str);
    };

    $scope.$watch('tweet', function(tweet) {
      if (tweet.id_str) {
        var content = $scope.tweet.text;

        tweet.entities.hashtags.forEach(function(hashtag) {
          content = content.replace('#' + hashtag.text, '<a href="#/search/' + hashtag.text + '">#' + hashtag.text + '</a>', 'gim');
        });

        tweet.entities.user_mentions.forEach(function(user_mention) {
          content = content.replace('@' + user_mention.screen_name, '<a href="#/user-timeline/' + user_mention.screen_name + '">@' + user_mention.screen_name + '</a>', 'gim');
        });

        tweet.entities.urls.forEach(function(url) {
          content = content.replace(url.url, '<a href="' + url.expanded_url + '">' + url.display_url + '</a>', 'gim');
        });

        if (tweet.entities.media) {
          tweet.entities.media.forEach(function(media) {
            content = content.replace(media.url, '<a href="' + media.expanded_url + '">' + media.expanded_url + '</a>', 'gim');
          });
        }

        $scope.formatted_text = content;
        $scope.created_at = moment($scope.tweet.created_at).fromNow();

        $scope.$on('updateTime', function() {
          $scope.created_at = moment($scope.tweet.created_at).fromNow();
        });
      }
    });

    socket.on('favorite', function() {
      $scope.tweet.favorited = true;
    });


  }])