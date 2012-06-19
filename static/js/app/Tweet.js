_.extend(Tweetifies, {
  Tweet: function(data) {
    var _self = this;

    this.data = data;

    Tweetifies.loadTemplate('tweet', this.data).bind(this);

    return this;
  }
});