'use strict';

define(['src/util/versioning', 'lib/couchdb/jquery.couch'], function (Versioning) {

    function share(options) {

        var urlPrefix = (options.couchUrl || window.location.origin).replace(/\/$/, '');
        var database = options.database || 'x';
        var tinyPrefix = (options.tinyUrl || window.location.origin + '/x/_design/x/_show/x').replace(/\/$/, '') + '/';
        $.couch.urlPrefix = urlPrefix;
        var db = $.couch.db(database);

        var view = Versioning.getView();

        // https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding#The_.22Unicode_Problem.22

        var encodedView = btoa( unescape( encodeURIComponent(JSON.stringify(view))));
        var encodedData = btoa( unescape( encodeURIComponent(Versioning.getDataJSON())));

        var docid = guid();

        var doc = {
            _id: docid,
            _attachments: {
                'view.json': {
                    'content_type': 'application/json',
                    'data': encodedView
                },
                'data.json': {
                    'content_type': 'application/json',
                    'data': encodedData
                }
            },
            version: view.version,
            visualizer: window.location.origin + window.location.pathname,
            couchdb: urlPrefix + '/' + database + '/'
        };

        var def = $.Deferred();

        db.saveDoc(doc, {
            success: function () {
                var tinyUrl = tinyPrefix + docid;
                def.resolve(tinyUrl);
            },
            error: function () {
                def.reject();
            }
        });

        return def;
    }

    var str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    function guid() {
        var result = '';
        for (var i = 0; i < 20; i++) {
            result += str[Math.floor(Math.random() * 62)];
        }
        return result;
    }

    return {
        share: share
    };

});
