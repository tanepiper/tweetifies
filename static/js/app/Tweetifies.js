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
    templates: {}
  },
  init: function() {
    Tweetifies.loadDnode();
  },

  loadDnode: function() {
    DNode({
      incomingMessage: Tweetifies.incomingMessage,
      incomingError: Tweetifies.incomingError
    }).connect(function(remote, connection) {
      _.extend(Tweetifies, {
        remote: remote,
        connection: connection
      });
    });
  },

  incomingMessage: function(message) {
    console.log('Incoming Message', message);

    // For now we're going to assume we have a user object - we'll look at other cases later
    if (message.user) {
      var tpl_string = [
        '<div class="tweet well span5" id="tweet-' + message.id_str +'" style="display:none; position:relative; style: padding: 10px;">',
          '<header>',
            '<h5 style="padding-left: 5px; border-bottom: 2px solid  black; margin-bottom: 5px;">',
              '<a target="_new" href="http://twitter.com/' + message.user.screen_name + '">@' + message.user.screen_name + '</a>',
            '</h5>',
          '</header>',
          '<section class="main" style="position:relative;">',
            '<div style="float:left; position:absolute; top: 0; left: 0; width:50px; height: 80px">',
              '<img src="' + message.user.profile_image_url + '" style="margin-left: 5px;"/>',
            '</div>',
            '<div style="float:left; position:absolute; top: 0; left: 50px; width: 150px; height: 80px;">',
              'Sent <a href="">' + moment(message.created_at).format("MMM Do 'YY, hh:mm:ss") + '</a>',
            '</div>',
            '<div style="float:left; position:absolute; top: 0; left: 200px; width: 250px; height: 80px;">',
              '<p>' + message.text + '</p>',
            '</div>',
          '</section>',
          '<footer style="clear:both;">',
          '</footer>',
        '</div>'
      ].join('');


      $('#twitter-output').append(tpl_string);

      $('#tweet-' + message.id_str).fadeIn();
    }
  },

  incomingError: function(error) {
    console.error('Incoming Error', error);
  }
});