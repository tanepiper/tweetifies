Tweetifies.module('Collections', function(Collections, Tweetifies, Backbone, Marionette, $, _){

  Collections.Urls = Backbone.Collection.extend({
    model: Tweetifies.Models.Url
  });

});