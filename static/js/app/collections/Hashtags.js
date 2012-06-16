Tweetifies.module('Collections', function(Collections, Tweetifies, Backbone, Marionette, $, _){

  Collections.Hashtags = Backbone.Collection.extend({
    model: Tweetifies.Models.Hashtag
  });

});