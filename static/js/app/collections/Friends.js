Tweetifies.module('Collections', function(Collections, Tweetifies, Backbone, Marionette, $, _){

  Collections.Friends = Backbone.Collection.extend({
    model: Tweetifies.Models.Friend
  });

});