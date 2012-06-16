Tweetifies.module('TweetView', function(TweetView, Tweetifies, Backbone, Marionette, $, _) {

  TweetView.Item = Marionette.ItemView.extend({
    template: Tweetifies.App._cache.templates.tweet,
    tagname: '<div>',

    events: {
      'click a.reply': 'doReply',
      'click a.retweet': 'doRetweet',
      'click a.delete': 'doDelete'
    },

    initialize: function() {
      _.bindAll(this, 'render');

      this.bindTo(this.model, 'change:reply', this.doReply, this);
      this.bindTo(this.model, 'change:retweet', this.doRetweet, this);
      this.bindTo(this.model, 'change:delete', this.doDelete, this);
    },

    doReply: function() {
      console.log('doReply', arguments, this);
    },

    doRetweet: function() {
      console.log('doReply', arguments, this);
    },

    doDelete: function() {
      console.log('doReply', arguments, this);
    }

  });

  TweetView.List = Marionette.CollectionView.extend({
    itemView: TweetView.Item
  });

  // The primary object to get the actual todo list of the ground
  // and running.
  var create = {

    run: function(tweets){
      var listView = this.getListView(tweets);
      TweetView.list.show(listView);
    },

    getListView: function(tweets){
      var listView = new TweetView.List({
        collection: tweets
      });
      return listView;
    }
  };

  // Initializer
  // -----------

  // All `Marionette.Application` objects have an event aggregator. We're
  // listening to this one to tell us that the app was initialized, and
  // give us the list of Todos to use for display and manipulation in
  // our list.
  TweetView.vent.on("app:initialized", function(tweets){
    create.run(tweets);
  });

});