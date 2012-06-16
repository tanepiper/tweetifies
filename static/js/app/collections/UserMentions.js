Tweetifies.module('Collections', function(Collections, Tweetifies, Backbone, Marionette, $, _){

  Collections.UserMentions = Backbone.Collection.extend({
    model: Tweetifies.Models.UserMention
  });

});