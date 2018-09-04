'use strict';

define([
  'jquery',
  'lodash',
  'forms/button',
  './util',
  './ui',
  './versioning',
  'lib/couchdb/jquery.couch'
], function ($, _, Button, Util, UI, Versioning) {
  function share(options) {
    return new Promise(function (resolve, reject) {
      var urlPrefix = (options.couchUrl || window.location.origin).replace(
        /\/$/,
        ''
      );
      var database = options.database || 'x';
      var tinyPrefix = `${(
        options.tinyUrl || `${window.location.origin}/x/_design/x/_show/x`
      ).replace(/\/$/, '')}/`;
      $.couch.urlPrefix = urlPrefix;
      var db = $.couch.db(database);

      var view = Versioning.getView();

      // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22

      var encodedView = btoa(
        unescape(encodeURIComponent(JSON.stringify(view)))
      );
      var encodedData = btoa(
        unescape(encodeURIComponent(Versioning.getDataJSON()))
      );

      var docid = guid();

      var doc = {
        _id: docid,
        _attachments: {
          'view.json': {
            content_type: 'application/json',
            data: encodedView
          },
          'data.json': {
            content_type: 'application/json',
            data: encodedData
          }
        },
        version: view.version,
        visualizer: window.location.origin + window.location.pathname,
        couchdb: `${urlPrefix}/${database}/`
      };

      db.saveDoc(doc, {
        success: function () {
          var tinyUrl = tinyPrefix + docid;
          return resolve(tinyUrl);
        },
        error: function (e) {
          return reject(e);
        }
      });
    });
  }

  var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function guid() {
    var result = '';
    for (var i = 0; i < 20; i++) {
      result += str[Math.floor(Math.random() * 62)];
    }
    return result;
  }

  function feedback(options, shareOptions) {
    options = options || {};
    shareOptions = shareOptions || {};
    shareOptions = _.defaults(shareOptions, {
      couchUrl: 'http://visualizer.epfl.ch',
      database: 'x',
      tinyUrl: 'http://visualizer.epfl.ch/tiny'
    });

    if (!options.disabled) {
      share(shareOptions)
        .then(function (tinyUrl) {
          var description = `\n\nTestcase: ${tinyUrl} ([Original URL](${
            document.location.href
          }))`;
          var url = `https://github.com/NPellet/visualizer/issues/new?body=${encodeURIComponent(
            description
          )}`;
          var win = window.open(url, '_blank');
          win.focus();
        })
        .catch(() => {
          UI.showNotification(
            'Error with Feedback, maybe pop-up was blocked',
            'error'
          );
        });
    }
  }

  function couchShare(options, dialogOptions) {
    var uniqid = Util.getNextUniqueId();
    var dialog = $('<div>')
      .html(
        '<h3>Click the share button to make a snapshot of your view and generate a tiny URL</h3><br>'
      )
      .append(
        new Button(
          'Share',
          function () {
            var that = this;
            if (!options.disabled) {
              share(options).then(
                function (tinyUrl) {
                  $(`#${uniqid}`)
                    .val(tinyUrl)
                    .focus()
                    .select();
                  that.disable();
                },
                function () {
                  $(`#${uniqid}`).val('error');
                }
              );
            }
          },
          { color: 'blue' }
        ).render()
      )
      .append($(`<input type="text" id="${uniqid}" />`).css('width', '400px'));
    UI.dialog(dialog, dialogOptions);
  }

  return {
    share,
    couchShare,
    feedback
  };
});
