var _ = require('underscore');

_.extend(Tweetifies, {
  Tweet: function(tweet) {
    _.extend(this, tweet);
    _.extend(this, {

      el: $(this.tpl),

      render: function(el) {
        if (!el && this.data.in_reply_to_screen_name === Tweetifies.profile.screen_name) {
          this.el.css({backgroundColor: '#D1F5D1'});
          Tweetifies.Notifier.Notify(this.data.user.profile_image_url, 'Tweet From @' + this.data.user.screen_name, this.data.text);
        }

        if (!el) {
          $('#twitter-output').prepend(this.el);
        } else {
          el.prepend(this.el);
        }

        this.el.slideDown();

        $('.reply', this.el).on('click', this.onReply.bind(this));
        $('.retweet', this.el).on('click', this.onRetweet.bind(this));
        $('.screen-name', this.el).on('click', this.onScreenname.bind(this));
      },
      onReply: function(e) {
        e.preventDefault();
        var output = [];

        if ($('input#in-reply-to').length > 0) {
          $('input#in-reply-to').remove();
        }

        // Get the names of all the people involved
        if (this.data.entities.user_mentions && this.data.entities.user_mentions.length > 0) {
          this.data.entities.user_mentions.forEach(function(mention) {
            if (mention.screen_name !== Tweetifies.profile.screen_name && output.indexOf('@' + mention.screen_name + ' ') === -1) {
              output.push('@' + mention.screen_name + ' ');
            }
          });
        }
        output.push('@' + this.data.user.screen_name + ' ');
        output = output.join('');
        $('#tweet-text').val(output);
        $('#tweet-text').focus()[0].setSelectionRange(output.length, output.length);

        $('#twitter-input').append('<input id="in-reply-to" name="in-reply-to" type="hidden" value="' + this.id + '" />');
      },

      onRetweet: function(e) {
        var c = confirm('Retweet to your followers?');
        if (c) {
          Tweetifies.app.retweetStatus(this.id, function(err, tweet) {
            if (err) {
              return Tweetifies.onError(err);
            }
            /*else {
              var origional_tweet = this.data.retweeted_status.id;
              $('#tweet-' + origional_tweet).css({
                'background-color': '#E4FAD2'
              });
              $('.meta p', '#tweet-' + origional_tweet).html($('.meta p', '#tweet-' + origional_tweet).html() + ' Retweeted ' + tweet.retweet_count + ' times');
            }*/
          });
        }
      },

      onScreenname: function(e) {
        e.preventDefault();

        var user = this.data.user;

        $('#user-modal .modal-header').html([
          '<img style="float: left;" src="' + user.profile_image_url + '" />',
          '<h3>@' + user.screen_name + '</h3>',
          '<div style="clear: both;"></div>'
        ].join(''));

        $('#user-modal .modal-body').html('Loading Tweets');
        $('#user-modal').modal('show');

        Tweetifies.app.getUserTimeline({screen_name: user.screen_name}, function(err, tweets) {
          if (err) {
            return Tweetifies.onError(err);
          }
          $('#mentions-modal .modal-body').html('');
          tweets.reverse().forEach(function(tweet) {
            var item = new Tweetifies.Tweet(tweet);
            item.render($('#user-modal .modal-body'));
          });
        });
      }
    });
  }
});