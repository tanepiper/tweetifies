Tweetifies.module('Tweets', function(Tweets, Tweetifies, Backbone, Marionette, $, _) {

  Tweets.Model = Backbone.Model.extend({

  });

  Tweets.Collection = Backbone.Collection.extend({
    model: Tweets.Model,

    initialize: function() {
      this.updateCounts();
      this.on('add', this.updateCounts, this);
      this.on('remove', this.updateCounts, this);
    },
    updateCounts: function() {
      var counts = {};
      counts.total = this.length;
      this.counts = counts;
      this.trigger("update:counts", counts);
    }
  });

  Tweets.getAllTweets = function(){
    if (!Tweets.tweetlist){
      Tweets.tweetlist = new Tweets.Collection();
    }
    return Tweets.tweetlist;
  };
});