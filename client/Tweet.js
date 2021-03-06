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

        if (this.data.favorited) {
          $(this.el).css({ 'background-color': '#E9EE65' });
        }

        this.el.slideDown();

        $('.reply', this.el).on('click', this.onReply.bind(this));
        $('.retweet', this.el).on('click', this.onRetweet.bind(this));
        $('.favorite', this.el).on('click', this.onFavorite.bind(this));
        // This loads the current user
        $('.screen-name', this.el).on('click', this.onScreenname.bind(this));

        // This loads another users profile, we don't need to bind this tweet
        $('.user-profile', this.el).on('click', this.onUserProfile);
        $('.hash-tag', this.el).on('click', this.onHashTag);

      },
      onReply: function(e) {
        e.preventDefault();
        var output = [];

        if ($('input#in-reply-to').length > 0) {
          $('input#in-reply-to').remove();
        }

        if ($('.hide-toggle a').hasClass('up')) {
          $('.hide-toggle a').trigger('click');
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
        e.preventDefault();

        var c = confirm('Retweet to your followers?');
        if (c) {
          Tweetifies.app.retweetStatus(this.id, function(err, tweet) {
            if (err) {
              return Tweetifies.onError(err);
            }
          });
        }
      },

      onFavorite: function(e) {
        e.preventDefault();

        var id = this.id;
        var trigger = $(e.target).hasClass('unfavorite');
        console.log(trigger);

        if (trigger) {
          Tweetifies.app.destroyFavorite(id, function(err, tweet) {
            if (err) {
              return Tweetifies.onError(err);
            }
            $('#tweet-' + id).css({ 'background-color': 'whiteSmoke' });
            $(e.target).html('<i class="icon-star"></i> Favorite</a>').removeClass('unfavorite');
          });
        } else {
          Tweetifies.app.createFavorite(id, function(err, tweet) {
            if (err) {
              return Tweetifies.onError(err);
            }
            $('#tweet-' + id).css({ 'background-color': '#E9EE65' });
            $(e.target).html('<i class="icon-star-empty"></i> Unfavorite</a>').addClass('unfavorite');
          });
        }
      },

      onScreenname: function(e) {
        e.preventDefault();

        var user = this.data.user;

        $('#user-modal .modal-header').html([
          '<img style="float: left;" src="' + user.profile_image_url + '" />',
          '<h3>@' + user.screen_name + '</h3>',
          '<p>' + user.description + '</p>',
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
      },

      onUserProfile: function(e) {
        e.preventDefault();
        var id = $(this).attr('rel');

        $('#user-modal .modal-header').html('<h3>Loading Profile</h3>');
        $('#user-modal .modal-body').html('Loading Tweets');
        $('#user-modal').modal('show');

        Tweetifies.app.showUser(id, function(err, data) {
          if (err) {
            return Tweetifies.onError(err);
          }
          var user = data[0];
          $('#user-modal .modal-header').html([
            '<img style="float: left;" src="' + user.profile_image_url + '" />',
            '<h3>@' + user.screen_name + '</h3>',
            '<p>' + user.description + '</p>',
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
        });
      },

      onHashTag: function(e) {
        e.preventDefault();

        var search_value = $(this).text();

        $('#search-modal .modal-header').html('<h3>Search: ' + search_value + '</h3>');

        $('#search-modal .modal-body').html('Loading Tweets');
        $('#search-modal').modal('show');

        Tweetifies.app.search(search_value, function(err, tweets) {
          if (err) {
            return Tweetifies.onError(err);
          }

          $('#search-modal .modal-body').html('');
          tweets.reverse().forEach(function(tweet) {
            var item = new Tweetifies.Tweet(tweet);
            item.render($('#search-modal .modal-body'));
          });
        });
      }
    });
  }
});