'use strict';

define([
  'src/util/debug',
  'bowser',
  'lodash',
  'modernizr',
  'src/util/ui',
  'jquery-cookie'
], function (Debug, bowser, _, modernizr, ui) {
  var features = {
    canvas: {
      name: 'Canvas',
      type: 'recommended'
    },
    webgl: {
      name: 'WebGL',
      type: 'recommended'
    },
    localstorage: {
      name: 'LocalStorage',
      type: 'recommended'
    }
  };

  _.keys(features).forEach(function (f) {
    if (modernizr[f]) {
      features[f].has = true;
      features[f].color = 'green';
    } else {
      features[f].has = false;
      features[f].color = 'red';
    }
  });

  var browserHasAllFeatures = _.every(_.map(features, function (val) {
    return val.has;
  }));

  var browsers = {
    chrome: 5.0,
    msie: 11.0,
    firefox: 5.0,
    msedge: 0
  };

  var recommendedBrowsers = {
    browserName: bowser.name,
    browserVersion: bowser.version,
    browsers: [
      {
        name: 'Chrome',
        url: 'https://www.google.com/intl/en/chrome/browser/',
        message: '(Recommended)'
      },
      {
        name: 'Firefox',
        url: 'https://www.mozilla.org/en-US/firefox/new/'
      }
    ]
  };

  function checkBrowser() {
    // Check that it's not a bot
    var reg = /bot/i;
    if (navigator.userAgent.match(reg)) {
      return 'bot';
    }
    var browserKeys = _.keys(browsers);
    var bmap = _.map(browserKeys, function (val) {
      return bowser[val];
    });
    var browserListed = _.some(bmap);


    if (!browserListed) {
      Debug.warn('browser not recognized');
      return true;
    }

    var bowserKey = browserKeys[bmap.indexOf(true)];
    // Required version is more recent than actual version
    return browsers[bowserKey] <= +bowser.version;
  }

  var browserIsCompatible = checkBrowser();


  function browserErrorMessage() {
    var tmpl = '<h1>Incompatible browser</h1>';

    tmpl += '<b><%- browserName %> <%- browserVersion %> </b> is incompatible with the visualizer<br/>';
    tmpl += 'Please update your browser to one of the following: <br/>';
    tmpl += '<ul class="browser-list"><% _.forEach(browsers, function(b) { %><li class="<%- b.name.toLowerCase() %>"><a href="<%- b.url %>"> <%- b.name %> </a> <span style="color:orange"><%- b.message %></span></li><% }); %></ul>';
    return _.template(tmpl)(recommendedBrowsers);
  }

  function featureErrorMessage() {
    var tmpl = '<h1>Your browser is missing some important features </h1><br/>';


    tmpl += '<table><% _.forEach(features, function(f) { %> <tr>  <td style="width:20px; background-color: <%- f.color %>;"></td> <td> <%- f.name %>  </td></tr> <% }); %> </table><br/>';
    tmpl += '<p>We recommend updating your browser to one of the following:</p>';
    tmpl += '<ul class="browser-list"><% _.forEach(browsers, function(b) { %><li class="<%- b.name.toLowerCase() %>"><a href="<%- b.url %>"> <%- b.name %> </a> <span style="color:orange"><%- b.message %></span></li><% }); %></ul>';

    var feat = { features: _.cloneDeep(features) };
    return _.template(tmpl)(_.merge(feat, recommendedBrowsers));
  }


  return {
    checkCompatibility: function () {
      return new Promise(function (resolve) {
        // Bots always pass the test
        if (browserIsCompatible === 'bot') {
          return resolve();
        }
        if (!browserIsCompatible) {
          Debug.error('browser is not compatible');
          return resolve(browserErrorMessage());
        }

        if ($.cookie('visualizer-skip-feature-warning')) {
          Debug.info('user does not want to see warning');
          return resolve();
        }

        if (browserHasAllFeatures) {
          return resolve();
        }

        var $dialog = $('<div>');

        $dialog.html(featureErrorMessage());
        $dialog.append('<input id="skip-warning-checkbox" type="checkbox">Don\'t show this again</input>');
        ui.dialog($dialog, {
          buttons: {
            Ok: function () {
              $(this).dialog('close');
              if ($('#skip-warning-checkbox').is(':checked')) {
                $.cookie('visualizer-skip-feature-warning', true, { path: '/' });
              }
              resolve();
            }
          },
          close: function () {
            resolve();
          },
          width: 600
        });
      });
    }
  };
});
