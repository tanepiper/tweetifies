/**
 * Create our Tweetifies application
 */
window.Tweetifies = {};

_.extend(Tweetifies, {
  templates: [
    'tweet'
  ],
  regions: {
    navigation: '#top-navbar',
    twitter_output: '#twitter-output'
  },
  _cache: {
    views: {},
    collections: {},
    models: {},
    templates: {},
    messages: {}
  },
  user: {},

  geocode_status: false,
  geocode_watcher: null,
  current_position: null,

  onPositionUpdate: function(position) {
    console.log(position);
  },

  onPositionError: function(error) {
    console.log(error);
  },

  init: function() {
    Tweetifies.loadDnode(function(remote, connection) {
      remote.session(function(err, session) {
        if (err) {
          return console.log(err);
        }

        _.extend(Tweetifies.user, session.user);

      });
    });

    $('#tweet-text').on('keyup', function(e) {
      var len = $(this).val().length;
      var left = 140 - len;
      $('.chars-left').text(left);
    });

    $('.geocode').on('click', function() {
      console.log($(this).hasClass('on'));

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
    });

    $('#twitter-input a.tweet').on('click', function(e) {
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
        Tweetifies.remote.app.sendTweet(to_send, function(err, tweet) {
          if (err) {
            $('#alerts')
              .removeClass('alert-success alert-info alert-warning')
              .addClass('alert-error')
              .html('<i class="icon-remove-sign"></i> <strong>Uh oh...</strong>' + err);
          } else {
            $('#tweet-text').val('');
            $('.chars-left').text('140');
          }
          $('#tweet-text').attr('disabled', false);
        });
      } else {
        $('#alerts')
          .removeClass('alert-success alert-info alert-warning')
          .addClass('alert-error')
          .html('<i class="icon-remove-sign"></i> <strong>Uh oh...</strong>You may only enter text between 1 and 140 characters');
      }
    });
  },

  loadtemplate: function(tpl_name, cb) {
    if (Tweetifies._cache.templates[tpl_name]) {
      cb( Tweetifies._cache.templates[tpl_name] );
    } else {
      $.get('templates/' + tpl_name + '.html', function(data) {
        Tweetifies._cache.templates[tpl_name] = _.template($(data).html());
        cb( Tweetifies._cache.templates[tpl_name] );
      });
    }
  },

  loadMessage: function(id, cb) {
    var message = Tweetifies._cache.messages[id];
    if (!message) {
      cb('Message with id ' + id.toString() + ' does not exist');
    } else {
      cb(null, message);
    }
  },

  saveMessage: function(id, message) {
    Tweetifies._cache.messages[id] = message;
  },

  loadDnode: function(cb) {
    DNode({
      incomingMessage: Tweetifies.incomingMessage,
      incomingError: Tweetifies.incomingError
    }).connect(function(remote, connection) {
      _.extend(Tweetifies, {
        remote: remote,
        connection: connection
      });
      cb(remote, connection);
    });
  },

  incomingMessage: function(err, message) {
    if (!message || message.friends) {
      console.log('Message Skipped');
      return;
    }

    Tweetifies.saveMessage(message.id, message);

    Tweetifies.loadtemplate('tweet', function(tpl) {
      $('#twitter-output').prepend(tpl(message));

      $('.brand', '#tweet-' + message.id).popover({
        placement: 'bottom',
        title: '@' + message.user.screen_name,
        content: [
          '<img class="pull-left" src="' + message.user.profile_image_url + '" />',
          '<div class="pull-left">',
            '<h6>' + message.user.name + '</h6>',
            ( (message.user.description) ? '<p>' + message.user.description + '</p>' : '' ),
          '</div>',
          '<div style="clear: both;"></div>'
        ].join('')
      });

      $('#tweet-' + message.id)
      .find('.tweet-commands a').on('click', Tweetifies.handleButton)
      .end()
      .slideDown(1000);
    });
  },

  incomingError: function(error) {
    console.error('Incoming Error', error);
  },

  handleButton: function(e) {
    e.preventDefault();

    var output;

    var tweet = $(this).closest('.tweet');
    var id = $(tweet).data('tweet');

    var action_clicked = $(this).attr('class');
    var action_clicked_text = $(this).text();

    // Load the message from the cache
    Tweetifies.loadMessage(id, function(err, message) {
      if (err) {
        return Tweetifies.incomingError(err);
      }

      if (action_clicked === 'reply') {
        Tweetifies.onReply(id, tweet, message);

      } else if (action_clicked === 'direct-message') {
        output = [];
        output.push('d ' + message.user.screen_name + ' ');
        $('#tweet-text').val(output.join(''));
      } else if (action_clicked === 'retweet') {
        var c = confirm('Retweet to your followers?');
        if (c) {
          Tweetifies.remote.app.retweet(message.id_str, function() {
            console.log(arguments);
          });
        }
      }
    });
  },

  onReply: function(id, tweet, message) {
    var output = [];

    if ($('input#in-reply-to').length > 0) {
      $('input#in-reply-to').remove();
    }

    // Get the names of all the people involved
    if (message.entities.user_mentions.length > 0) {
      message.entities.user_mentions.forEach(function(mention) {
        if (mention.screen_name !== Tweetifies.user.screen_name && output.indexOf('@' + mention.screen_name + ' ') === -1) {
          output.push('@' + mention.screen_name + ' ');
        }
      });
    }
    output.push('@' + message.user.screen_name + ' ');

    // Set the value of the tweet text
    $('#tweet-text').val(output.join(''));
    $('#tweet-text').on('keyup.reply', function(e) {
      if ($(this).val().length === 0) {
        $('input#in-reply-to').remove();
      }
      $('#tweet-text').off('keyup.reply');
    });

    $('#twitter-input').append('<input id="in-reply-to" name="in-reply-to" type="hidden" value="' + message.id_str + '" />');

    $('#alerts')
      .removeClass('alert-error alert-warning alert-success alert-info')
      .addClass('alert-info')
      .html('This tweet has been set in reply to ' + output.join(', '))
      .fadeIn(function() {
        $(this).fadeOut();
      });
  },

    /*
    e.preventDefault();
    var id = $(this).attr('href');
    var tweet = $(id);
    var footer = $('footer', tweet);

    console.log(id, tweet, footer);

    return this;
     */

  buttonRetweet: function(e) {
    /*
    e.preventDefault();
    var id = $(this).attr('href').split('-')[1];
    var tweet = $($(this).attr('href'));
    var footer = $('footer', tweet);

    console.log(id, tweet, footer);

    Tweetifies.remote.app.retweet(id, function(err, data) {
      console.log(arguments);
    });

    return this;
     */
  }
});