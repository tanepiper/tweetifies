/**
 * Create our Tweetifies application
 */
window.Tweetifies = {};

function Notifier() {}

// Returns "true" if this browser supports notifications.
Notifier.prototype.HasSupport = function() {
  if (window.webkitNotifications) {
    return true;
  } else {
    return false;
  }
};

// Request permission for this page to send notifications. If allowed,
// calls function "cb" with true.
Notifier.prototype.RequestPermission = function(cb) {
  window.webkitNotifications.requestPermission(function() {
    if (cb) { cb(window.webkitNotifications.checkPermission() === 0); }
  });
};

// Popup a notification with icon, title, and body. Returns false if
// permission was not granted.
Notifier.prototype.Notify = function(icon, title, body) {
  if (window.webkitNotifications.checkPermission() === 0) {
    var popup = window.webkitNotifications.createNotification(
    icon, title, body);
    popup.show();

    return true;
  }

  return false;
};

_.extend(Tweetifies, {
  preloadTemplates: [
    'geo',
    'tweet',
    'user_details'
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

  desktop_message_permission: 1,

  geocode_status: false,
  geocode_watcher: null,
  current_position: null,

  message_queue: [],

  onPositionUpdate: function(position) {
    Tweetifies.current_position = position.coords;
  },

  onPositionError: function(error) {
    console.log(error);
  },

  views: {
    '/': function(ctx, next) {

    },

    '/home': function(ctx, next) {

    },
    '/direct-messages': function(ctx, next) {

    },
    '/mentions': function(ctx, next) {

    }
  },

  init: function() {

    Tweetifies.preloadTemplates.forEach(function(tpl) {
      Tweetifies.loadtemplate(tpl);
    });

    page('/', Tweetifies.views['/']);
    page('/home', Tweetifies.views['/home']);
    page('/direct-messages', Tweetifies.views['/direct-messages']);
    page('/mentions', Tweetifies.views['/mentions']);


    Tweetifies.Notifier = new Notifier();

    /*
    if (Tweetifies.desktop_message_permission === 0) {
      $('.desktop-notifications').removeClass('off').addClass('on');
      $('.desktop-notifications i').removeClass('icon-remove-sign').addClass('icon-ok-sign');
    }
     */

    $('.desktop-notifications').on('click', function(e) {
      e.preventDefault();

      if (!Tweetifies.Notifier) {
        Tweetifies.Notifier = new Notifier();
      }

      Tweetifies.Notifier.RequestPermission(function(can) {
        if (can) {
          $(this).removeClass('off').addClass('on');
          $('i', this).removeClass('icon-remove-sign').addClass('icon-ok-sign');
          Tweetifies.Notifier.Notify('', 'Tweetifies', 'Desktop Notifications switched on');
        }
      });
    });

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
            console.error(err);
            $('#alerts')
              .removeClass('alert-success alert-info alert-warning')
              .addClass('alert-error')
              .html('<i class="icon-remove-sign"></i> <strong>Uh oh...</strong>' + err.toString());
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

  loadtemplate: function(tpl_name, data, cb) {
    if (typeof data ==='function') {
      cb = data;
      data = null;
    }
    var output;
    if (data && Tweetifies._cache.templates[tpl_name]) {
      output = Tweetifies._cache.templates[tpl_name](data);
      return cb && cb( output );
    } else {
      $.get('templates/' + tpl_name + '.html', function(tpl) {
        Tweetifies._cache.templates[tpl_name] = _.template($(tpl).html());
        if (data) {
          output = Tweetifies._cache.templates[tpl_name](data);
        }
        return cb && cb( output );
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
      onError: Tweetifies.onError
    }).connect(function(remote, connection) {
      _.extend(Tweetifies, {
        remote: remote,
        connection: connection
      });
      cb(remote, connection);
    });
  },

  incomingProfile: function(profile) {
    console.log(profile);
  },

  incomingMessage: function(err, message, render_now) {
    if (!message || message.friends) {
      console.log('Message Skipped');
      return;
    }

    Tweetifies.saveMessage(message.id, message);
    if (render_now) {
      return Tweetifies.renderMessage(message);
    }
    Tweetifies.message_queue.push(message);

    $('#alerts')
      .removeClass('alert-error alert-warning alert-success alert-info')
      .addClass('alert-info')
      .html('<button class="close" data-dismiss="alert">x</button><strong>' +
        '<a href="#" class="display-queue">Load ' + Tweetifies.message_queue.length + ' tweets</a></strong>'
      );

    if( $('#alerts').not(':visible') ) {
      $('#alerts').fadeIn();

      $('.display-queue').off('click').on('click', function(e) {
        e.preventDefault();
        var len = Tweetifies.message_queue.length;
        for (var i = 0; i < Tweetifies.message_queue.length + 1; i++) {
          var message = Tweetifies.message_queue.shift();
          console.log(message);
          Tweetifies.renderMessage(message);
        }

        /*
        console.log('display-queue');
        e.preventDefault();
        Tweetifies.message_queue.forEach(function(message, i, arr) {
          arr.splice(i, 1);
          Tweetifies.renderMessage(message);
        });
         */
        $('#alerts').html('').fadeOut();
      });
    }
  },
  renderMessage: function(message) {

    Tweetifies.loadtemplate('tweet', message, function(tpl_tweet) {
      $('#twitter-output').prepend(tpl_tweet);

      Tweetifies.loadtemplate('user_details', message.user, function(tpl_user) {
        $('.brand', '#tweet-' + message.id).popover({
          placement: 'bottom',
          title: '@' + message.user.screen_name,
          content: tpl_user
        });
      });

      /*
      if (message.geo) {
        Tweetifies.loadtemplate('geo', message, function(tpl_map) {

          $('.geo', '#tweet-' + message.id).popover({
            placement: 'bottom',
            title: '@' + message.user.screen_name,
            content: tpl_map
          });

          var el = $('#map-' + message.id)[0];

          var myOptions = {
            center: new google.maps.LatLng(message.geo.coordinates[0], message.geo.coordinates[1]),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };
          var map = new google.maps.Map(el, myOptions);

          var marker = new google.maps.Marker({
            position: map.getCenter(),
            map: map,
            title: ''
          });

          setTimeout(function() {
            google.maps.event.trigger(map, 'resize');
            map.panTo(marker.getPosition());
          }, 1000);
        });
      }
       */

      $('#tweet-' + message.id)
        .find('.tweet-commands a').on('click', Tweetifies.handleButton)
        .end()
      .slideDown(1000);

      if (message.in_reply_to_screen_name && message.in_reply_to_screen_name === Tweetifies.user.screen_name && Tweetifies.Notifier) {
        $('#tweet-' + message.id).css({
          'background-color': '#BEF0F0'
        });
        Tweetifies.Notifier.Notify(message.user.profile_image_url, 'Tweet From @' + message.user.screen_name, message.text);
      } else if (message.user.screen_name === Tweetifies.user.screen_name) {
        $('#tweet-' + message.id).css({
          'background-color': '#EBEBBE'
        });
      }

      $('div.tweet').each(function() {
        var id = $(this).data('tweet');
        var message = Tweetifies._cache.messages[id];
        var ago = moment(message.created_at).from();
        $('.timeago', this).text(ago);
      });

    });
  },

  onError: function(error) {
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
          Tweetifies.remote.app.retweet(message.id_str, function(err, tweet) {
            if (err) {
              Tweetifies.incomingError(err);
            } else {
              var origional_tweet = tweet.retweeted_status.id;
              $('#tweet-' + origional_tweet).css({
                'background-color': '#E4FAD2'
              });
              $('.meta p', '#tweet-' + origional_tweet).html($('.meta p', '#tweet-' + origional_tweet).html() + ' Retweeted ' + tweet.retweet_count + ' times');
            }
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