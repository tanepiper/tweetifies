Tweetifies.module('Collections', function(Collections, Tweetifies, Backbone, Marionette, $, _){

  Collections.Tweets = Backbone.Collection.extend({
    model: Tweetifies.Models.Tweet
  });

});