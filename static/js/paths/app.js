$(function() {
  var timer;
  var timerCurrent;
  var timerFinish;
  var timerSeconds;
  function drawTimer(el, percent){
    $(el).html('<div class="percent"></div><div id="slice"'+(percent > 50?' class="gt50"':'')+'><div class="pie"></div>'+(percent > 50?'<div class="pie fill"></div>':'')+'</div>');
    var deg = 360/100*percent;
    $('#slice .pie', el).css({
      '-moz-transform':'rotate('+deg+'deg)',
      '-webkit-transform':'rotate('+deg+'deg)',
      '-o-transform':'rotate('+deg+'deg)',
      'transform':'rotate('+deg+'deg)'
    });
    $('.percent', el).html(Math.round(percent)+'%');
  }
  function stopWatch(el){
    var seconds = (timerFinish-(new Date().getTime()))/1000;
    if(seconds <= 0){
      drawTimer(el, 100);
      clearInterval(timer);
    }else{
      var percent = 100-((seconds/timerSeconds)*100);
      drawTimer(el, percent);
    }
  }

  var user = {};
  var list = $('#twitter-output');

  var fadeout_time = 30000;

  var render_tweet = function(message) {
    if (message.friends) {
      user.friends = message.friends;
    } else {

      var body = message.text;
      var in_reply_to = '';

      if (message.entities.urls.length > 0) {
        message.entities.urls.forEach(function(url) {
          body = body.replace(url.url, '<a target="_new" href="' + url.expanded_url + '">' + url.display_url + '</a>', 'gi');
        });
      }
      if (message.entities.user_mentions.length > 0) {
        message.entities.user_mentions.forEach(function(user) {
          body = body.replace('@' + user.screen_name, '<a target="_new" href="http://twitter.com/' + user.screen_name + '">@' + user.screen_name + '</a>', 'gi');
          in_reply_to = ' in reply to @' + '<a target="_new" href="http://twitter.com/' + user.screen_name + '">@' + user.screen_name + '</a>';
        });
      }
      if (message.entities.hashtags.length > 0) {
        message.entities.hashtags.forEach(function(hastag) {
          body = body.replace('#' + hastag.text, '<a target="_new" href="https://twitter.com/search/' + hastag.text + '">#' + hastag.text + '</a>', 'gi');
        });
      }

      var geo_button = '';
      if (message.geo !== null) {
        geo_button = [
        '<a rel="' + message.id + '" class="geotrigger btn view" href="#viewgeo-' + message.id + '">View Geo Data</a>',
        '<div class="modal hide fade" id="viewgeo-' + message.id +'">',
          '<div class="modal-header">',
            '<button type="button" class="close" data-dismiss="modal">×</button>',
            '<h3>Location Data</h3>',
          '</div>',
          '<div class="modal-body">',
            '<div class="map" style="width: 500px; height: 400px;"></div>',
          '</div>',
          '<div class="modal-footer">',
            '<a href="#" class="btn" data-dismiss="modal">Close</a>',
          '</div>',
        '</div>'].join('');
      }


      var result_body = $([
        '<div id="' + message.id + '" class="tweet well row span10">',
          '<div class="span2">',
            '<a target="_new" href="http://twitter.com/' + message.user.screen_name + '">',
              '<h6 class="from">Tweeted By<br />' + '@' + message.user.screen_name + '</h6>',
              '<img src="' + message.user.profile_image_url + '" />',
            '</a>',
          '</div>',
          '<div class="span4">',
            '<div class="row span7">',
              '<p>' + body + '</p>',
            '</div>',
            '<div class="row span7">',
              '<p>Sent on ',
                '<a target="_new" href="http://twitter.com/' + message.user.screen_name + '/status/' + message.id_str + '">',
                  moment(message.created_at).format('Do MMMM YYYY h:mm:ss'),
                '</a>',
                in_reply_to,
              '</p>',
              '<a rel="' + message.id + '" class="objecttrigger btn view" href="#viewmodal-' + message.id + '">View Tweet Object</a>',
              '<div class="modal hide fade" id="viewobject-' + message.id +'">',
                '<div class="modal-header">',
                  '<button type="button" class="close" data-dismiss="modal">×</button>',
                  '<h3>Tweet' + message.id + '</h3>',
                '</div>',
                '<div class="modal-body">',
                  '<pre>',
                    JSON.stringify(message, null, 2),
                  '</pre>',
                '</div>',
                '<div class="modal-footer">',
                  '<a href="#" class="btn" data-dismiss="modal">Close</a>',
                '</div>',
              '</div>',
              geo_button,
            '</div>',
          '</div>',
        '</div>'
      ].join(''));

      list.prepend(result_body);

      $('a.geotrigger', '#' + message.id).on('click', function() {
        remote.app.getTweetLocation(message.geo.coordinates, function(err, res, body) {
          if (body.results.length > 0) {
            $('.modal-header h3', '#viewgeo-' + message.id).text(body.results[0].formatted_address);
          }

          var el = $('.map', '#viewgeo-' + message.id)[0];

          var myOptions = {
            center: new google.maps.LatLng(message.geo.coordinates[0], message.geo.coordinates[1]),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP
          };

          var map = new google.maps.Map(el, myOptions);

          var marker = new google.maps.Marker({
            position: map.getCenter(),
            map: map,
            title: 'Click to zoom'
          });

          $('#viewgeo-' + message.id).modal({show: true});

          $('.modal-footer a', '#viewgeo-' + message.id).on('click', function() {
            if (map) {
              marker = null;
              map = null;
              delete marker;
              delete map;
            }
          });

          setTimeout(function() {
            google.maps.event.trigger(map, 'resize');
            map.panTo(marker.getPosition());
          }, 1000);
        });
      });

      $('a.objecttrigger', '#' + message.id).on('click', function() {
        $('#viewobject-' + message.id).modal({show: true});
      });
    }
  };

  DNode({
    incomingTweets: function(message) {
      message.reverse().forEach(function(tweet) {
        render_tweet(tweet);
      });
    },

    incomingTweet: render_tweet,

    incomingError: function(error) {
      console.error(error);
    },

    incomingDestroy: function(destroy) {
      console.warn(destroy);
    }

  }).connect(function(remote, connection) {
    window.remote = remote;
    window.connection = connection;

    $('#twitter-input').submit(function(e) {
      e.preventDefault();

      var options = {};
      options.status = $('#tweet-text').val();
      var geolocate =  $('#geolocate').is(':checked');

      if (geolocate) {
        navigator.geolocation.getCurrentPosition(function(position) {
          options.lat = position.coords.latitude;
          options.long = position.coords.longitude;
          sendTweet();
        });
      } else {
        sendTweet();
      }

      function sendTweet() {
        remote.app.sendTweet(options, function(err, data) {
          if (err) {
            return console.error(err);
          }
          $('#tweet-text').val('');
        });
      }
    });

  });
});