'use strict';

define(['components/superagent/superagent', 'src/util/lru', 'src/util/debug'], function (superagent, LRU, Debug) {

    var pendings = {};

    function doByUrl(url, headers) {
        Debug.debug('DataURL: Looking for ' + url + ' by AJAX');
        return (pendings[url] = new Promise(function (resolve, reject) {
            superagent.get(url)
                .timeout(120000) // 2 minutes timeout
                .set(headers || {})
                .end(function urldataGetResult(err, res) {
                    delete pendings[url];
                    if (err || res.status != 200) {
                        Debug.info('DataURL: Failing in retrieving ' + url + ' by AJAX.');
                        reject(err || res.status);
                    } else {
                        var data = res.body || res.text;
                        Debug.info('DataURL: Found ' + url + ' by AJAX');
                        // We set 20 data in memory, 500 in local database
                        if (!LRU.exists('urlData')) {
                            LRU.create('urlData', 20, 500);
                        }
                        LRU.store('urlData', url, data);
                        resolve(data);
                    }
                });
        }));
    }

    function doLRUOrAjax(url, force, timeout, headers) {
        // Check in the memory if the url exists
        Debug.debug('DataURL: Looking in LRU for ' + url + ' with timeout of ' + timeout + ' seconds');
        return doLRU(url).then(function foundLRU(data) {
            Debug.debug('DataURL: Found ' + url + ' in local DB. Timeout: ' + data.timeout);

            // If timeouted. If no timeout is defined, then the link is assumed permanent
            if (timeout !== undefined && (Date.now() - data.timeout > timeout * 1000)) {
                Debug.debug('DataURL: URL is over timeout threshold. Looking by AJAX');
                return doByUrl(url, headers).catch(function notFoundAjax() {
                    Debug.debug('DataURL: Failed in retrieving URL by AJAX. Fallback to cached version');
                    return data.data;
                });
            }

            Debug.info('DataURL: URL is under timeout threshold. Return cached version');
            return (data.data || data);

        }, function notFoundLRU() {
            Debug.debug('DataURL: URL ' + url + ' not found in LRU. Look for AJAX');
            return doByUrl(url, headers);
        });
    }

    function doLRU(url) {
        Debug.debug('DataURL: Looking into LRU for ' + url);
        return Promise.resolve(LRU.get('urlData', url));
    }

    return {

        get: function urldataGet(url, force, timeout, headers) {
            if (pendings[url]) {
                return pendings[url];
            }

            if (typeof force === 'number') {
                timeout = force;
                force = false;
                headers = timeout;
            } else if (typeof force === 'object') {
                headers = force;
                timeout = 0;
                force = false;
            } else if (typeof timeout === 'object') {
                headers = timeout;
                timeout = 0;
            }

            Debug.debug('DataURL: getting ' + url + ' with force set to ' + force + ' and timeout to ' + timeout);

            if (force || timeout < 0 || typeof timeout === 'undefined') {
                return doByUrl(url, headers).catch(function notFoundForceAjax() {
                    // If ajax fails (no internet), go for LRU
                    return doLRU(url).then(function foundLRUForceAjax(data) {
                        return data.data;
                    });
                });
            } else {
                return doLRUOrAjax(url, force, timeout, headers);
            }
        },

        post: function urldataPost(url, data, type) {
            type = type || 'form';
            return new Promise(function (resolve, reject) {
                superagent
                    .post(url)
                    .type(type)
                    .send(data)
                    .end(function urldataPostResult(err, res) {
                        if (err || res.status != 200) {
                            reject(err || res.status);
                        } else {
                            resolve(res.body || res.text);
                        }
                    });
            });
        },

        emptyMemory: function emptyMemory() {
            LRU.empty('urlData', true, false);
        },

        emptyDB: function emptyDB() {
            LRU.empty('urlData', false, true);
        },

        emptyAll: function emptyAll() {
            LRU.empty('urlData', true, true);
        }

    };

});
