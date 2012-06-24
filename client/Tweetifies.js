var _ = require('underscore');
var shoe = require('shoe');
var dnode = require('dnode');
var page = require('page');

window.Tweetifies = _.extend({}, {

  tweets: {},
  queue: [],

  timeUpdate: null,

  geocode_status: false,
  geocode_watcher: null,
  current_position: null,

  MAX_ITEMS_TO_LOAD: 300,

  onError: function(error) {
    console.log('Error', error);
  },

  onTweet: function(tweet, render_now) {

    var item = new Tweetifies.Tweet(tweet);
    Tweetifies.tweets[tweet.id] = tweet;

    if (render_now) {
      item.render();
    } else {
      Tweetifies.queue.push(item);
      Tweetifies.updateQueueDisplay();
    }
  },

  onProfile: function(profile) {
    Tweetifies.profile = profile;
  },

  updateQueueDisplay: function() {
    $('#load-tweets').text(Tweetifies.queue.length + ' new Tweets');
    $('#queue').fadeIn();
  },

  processQueue: function(e) {
    if (e) e.preventDefault();

    var to_load;
    if (Tweetifies.queue.length > Tweetifies.MAX_ITEMS_TO_LOAD) {
      to_load = Tweetifies.MAX_ITEMS_TO_LOAD;
    } else {
      to_load = Tweetifies.queue.length;
    }
    var to_show = Tweetifies.queue.splice(0, to_load);
    to_show.forEach(function(item) {
      item.render();
    });
    if (to_load === Tweetifies.MAX_ITEMS_TO_LOAD) {
      Tweetifies.updateQueueDisplay();
    } else {
      $('#queue').fadeOut();
    }
  },

  desktopNotifications: function(e) {
    e.preventDefault();
    Tweetifies.Notifier.RequestPermission(function(can) {
      if (can) {
        $(this).removeClass('off').addClass('on');
        $('i', this).removeClass('icon-remove-sign').addClass('icon-ok-sign');
        Tweetifies.Notifier.Notify('/img/tweetifies-logo.png', 'Tweetifies', 'Desktop Notifications switched on');
      }
    });
  },

  onTweetTextEnter: function() {
    var len = $(this).val().length;
    var left = 140 - len;
    $('.chars-left').text(left);

    if ($('input#in-reply-to').length > 0 && len === 0) {
      $('input#in-reply-to').remove();
    }
  },

  onTimeUpdate: function() {
    $('div.tweet').each(function() {
      var id = $(this).data('tweet');
      var message = Tweetifies.tweets[id];
      if (!message) {
        return console.log('Cannot update ' + id);
      }
      var ago = moment(message.created_at).from();
      $('.timeago', this).text(ago);
    });
  },

  onGeocode: function(e) {
    e.preventDefault();
    if ($(this).hasClass('on')) {
      Tweetifies.geocode_status = true;
      Tweetifies.geocode_watcher = navigator.geolocation.watchPosition(Tweetifies.onPositionUpdate, Tweetifies.onPositionError, {enableHighAccuracy:true});

      navigator.geolocation.getCurrentPosition(function(position) {
        Tweetifies.current_position = position.coords;
      });

      $('.geocode.off').removeClass('active');
      $(this).addClass('active');

    } else {
      Tweetifies.geocode_status = false;
      navigator.geolocation.clearWatch(Tweetifies.geocode_watcher);

      $('.geocode.on').removeClass('active');
      $(this).addClass('active');
    }
  },

  onPositionUpdate: function(position) {
    Tweetifies.current_position = position.coords;
  },

  onPositionError: function(error) {
    console.log(error);
  },

  onSendTweet: function(e) {
    e.preventDefault();
    var status = $('#tweet-text').val();
    if (status.length > 0 && status.length <= 140) {
      var to_send = _.extend({}, {
        status: status
      });

      if (Tweetifies.geocode_status) {
        to_send.lat = Tweetifies.current_position.latitude;
        to_send.long = Tweetifies.current_position.longitude;
      }

      if ($('input#in-reply-to').length > 0) {
        _.extend(to_send, {
          in_reply_to_status_id: $('input#in-reply-to').val()
        });
      }

      $('#tweet-text').attr('disabled', true);
      Tweetifies.app.updateStatus(status, to_send, function(err, tweet) {
        if (err) {
          return Tweetifies.onError(err);
        }
        $('#tweet-text').val('');
        $('.chars-left').text('140');
        $('#tweet-text').attr('disabled', false);
      });
    } else {
      $('#alerts').html('<i class="icon-remove-sign"></i> <strong>Uh oh...</strong>You may only enter text between 1 and 140 characters');
    }
  },

  onViewMentions: function(e) {
    e.preventDefault();

    $('#mentions-modal').modal('show');
    $('#mentions-modal .modal-body').html('Loading Tweets');
    Tweetifies.app.getMentions({}, function(err, tweets) {
      if (err) {
        return Tweetifies.onError(err);
      }
      $('#mentions-modal .modal-body').html('');
      tweets.reverse().forEach(function(tweet) {
        var item = new Tweetifies.Tweet(tweet);
        item.render($('#mentions-modal .modal-body'));
      });
    });
  },

  onSearch: function(e) {
    e.preventDefault();

    var search_value = $('.search-query', this).val();

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
  },

  onHideToggle: function(e) {
    e.preventDefault();

    if ($(this).hasClass('down')) {
      $('#twitter-input').slideUp();
      $('body').animate({
        paddingTop: '120px'
      });
      $(this).removeClass('down').addClass('up').html('<i class="icon-circle-arrow-down"></i> Show');
    } else {
      $('#twitter-input').slideDown();
      $('body').animate({
        paddingTop: '240px'
      });
      $(this).removeClass('up').addClass('down').html('<i class="icon-circle-arrow-up"></i> Hide');
    }
  },

  init: function() {

    $('#loading-modal').modal('show');

    Tweetifies.stream = shoe('/tweetifies');
    Tweetifies.dnode = dnode({
      onError: Tweetifies.onError,
      onTweet: Tweetifies.onTweet,
      onProfile: Tweetifies.onProfile
    });

    Tweetifies.dnode.on('remote', function(remote) {
      Tweetifies.remote = remote;
      $.post('/auth', function(token) {
        Tweetifies.remote.auth(token, function(err, app) {
          if (err) {
            return Tweetifies.onError(err);
          }
          Tweetifies.app = app;

          $('#loading-modal').modal('hide');
          $('#load-tweets').on('click', Tweetifies.processQueue);
          $('#desktop-notifications').on('click', Tweetifies.desktopNotifications);
          $('#tweet-text').on('keyup', Tweetifies.onTweetTextEnter);
          $('.geocode').on('click', Tweetifies.onGeocode);
          $('#send-tweet').on('click', Tweetifies.onSendTweet);

          $('.hide-toggle a').on('click', Tweetifies.onHideToggle);

          $('#view-mentions').on('click', Tweetifies.onViewMentions);

          $('#twitter-search').on('submit', Tweetifies.onSearch);


          //setInterval(Tweetifies.onTimeUpdate, 10000);
        });
      });
    });

    Tweetifies.dnode.pipe(Tweetifies.stream).pipe(Tweetifies.dnode);
  }

});