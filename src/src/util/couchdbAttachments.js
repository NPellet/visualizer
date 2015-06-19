'use strict';

// Mini-library to manage couchdb attachments
// - Get and upload attachments just by their name
// - Cache already downloaded attachments
define(['src/util/versioning', 'superagent', 'src/util/lru'], function (Versioning, superagent, LRU) {

    // A namespace for preventing overwriting
    var storeName = '__couchdb-attachments';
    var limitMemory = 200;
    var limitStore = 500;
    if (!LRU.exists(storeName)) {
        LRU.create(storeName, limitMemory, limitStore);
    }

    function dataURLtoBase64(data) {
        var pos;
        var l = Math.min(100, data.length);
        for (var i = 0; i < l; i++) {
            if (data[i] === ';') {
                pos = i + 1;
                break;
            }
        }
        var t = data.slice(pos, pos + 7);
        if (pos && t === 'base64,') {
            pos = pos + 7;
            return data.slice(pos);
        } else {
            throw new Error('Could not parse dataurl');
        }
    }


    /**
     * @param url Set the docUrl. If none specified, will attempt to use the viewURL to set the docURL
     * @constructor
     * @exports src/util/couchdbAttachments
     */
    var CouchdbAttachments = function () {
        // get the document url from the view url
        if (arguments.length === 0) {
            var viewUrl = Versioning.lastLoaded.view.url;
            if (!viewUrl) {
                throw new Error('couchdb attachments initialization failed: No view url');
            }
            this.docUrl = viewUrl.replace(/\/[^\/]+$/, '');
            this.url = '';
        } else {
            this.docUrl = arguments[0];
        }
    };

    /**
     @return {object} attachments - An array with the attachments metadata
     @return {number} attachments[].name - The name of the resource
     @return {string} attachments[].content_type - Resource's mime-type
     @return {string} attachments[].digest - base64 md5 digest of the resource
     @return {number} attachments[].length - Length in bytes of the resource
     @return {number} attachments[].url - The url of the resource
     */
    CouchdbAttachments.prototype.list = function () {
        if (!this.lastDoc._attachments) throw new Error('List not available before calling fetchList');
        return attachmentsAsArray(this, this.lastDoc._attachments);
    };

    // This is an alternative strategy for storing multiple attachments in one revision
    // The problem with this is that it doesn't allow to change the contentType
    // (because Blobs are immutable) if the browser did not set it correctly or if
    // the user wants to manually change it will not work properly
    CouchdbAttachments.prototype.uploads1 = function (files) {
        var that = this;
        if (!Array.isArray(files)) {
            throw new Error('uploads expects an array as parameter');
        }

        return Promise.resolve().then(function () {
            return new Promise(function (resolve, reject) {
                var req = superagent.post(that.docUrl);

                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    req.attach('_attachments', file, file.name);
                }
                req.field('_rev', that.lastDoc._rev);
                req.end(function (err, res) {
                    if (err) return reject(err);
                    if (res.status !== 201) reject(new Error('Error uploading attachments, couchdb returned status code ' + res.status));
                    return resolve();
                });
            });
        }).then(function () {
            return that.refresh();
        });
    };

    /**
     * Upload several attachments in one revision
     * @param {object[]} options
     * @param {string} options[].contentType - The contentType of the uploaded data
     * @param {string} options[].data - The attachment data to upload
     * @param {Blob} options[].file - The attachment data to upload
     * @returns {Promise.<object>} The new list of attachments
     */
    CouchdbAttachments.prototype.inlineUploads = function (options) {
        var that = this;
        if (!options) return Promise.resolve(attachmentsAsArray(this, this.lastAttachmentsResult));
        return Promise.resolve().then(function () {
            if (!(Array.isArray(options))) {
                throw new TypeError('options must be an array');
            }

            var prom = [];
            for (var i = 0; i < options.length; i++) {
                (function (i) {
                    var item = options[i];
                    if (item.data) {
                        that.lastDoc._attachments[options.name] = {
                            content_type: options.contentType,
                            data: btoa(unescape(encodeURIComponent(item.data)))
                        };
                    } else if (item.file) {
                        var p = new Promise(function (resolve, reject) {
                            var reader = new FileReader();
                            reader.onload = function (e) {
                                return resolve({
                                    item: item,
                                    base64data: dataURLtoBase64(e.target.result)
                                });
                            };
                            reader.onerror = function () {
                                return reject('Error while reading file');
                            };
                            reader.readAsDataURL(item.file);
                        });
                        prom.push(p);

                    } else {
                        return Promise.reject(new Error('Item must have data or file property'));
                    }
                })(i);
            }
            return Promise.all(prom);
        }).then(function (toChange) {
            return new Promise(function (resolve, reject) {
                for (var i = 0; i < toChange.length; i++) {
                    var c = toChange[i];
                    that.lastDoc._attachments[c.item.name] = {
                        content_type: c.item.contentType,
                        data: c.base64data
                    };
                }
                superagent
                    .put(that.docUrl)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .send(that.lastDoc)
                    .end(function (err, res) {
                        if (err) return reject(err);
                        if (res.status !== 201) return reject(new Error('Error uploading inline attachments, couchdb returned status code ' + res.status));
                        return resolve();
                    });
            });
        }).then(function () {
            return that.refresh();
        });
    };

    /**
     *
     * @param {object} options
     * @param {string} options.name - Name of the attachment to upload
     * @param {string} options.data -  The attachment's content to upload
     * @param {Blob} options.file - The attachments's content to upload
     * @returns {Promise.<Object>} The new list of attachments
     */
    CouchdbAttachments.prototype.upload = function (options) {
        var that = this;
        return this.list().then(function () {
            if (!options) {
                throw new Error('Invalid arguments');
            }
            return new Promise(function (resolve, reject) {
                var exists = that.lastDoc._attachments[options.name];
                var contentType = options.contentType || (exists ? exists.content_type : undefined);
                if (!contentType) {
                    return reject(new Error('Content-Type unresolved. Cannot upload document without content-type'));
                }
                superagent
                    .put(that.docUrl + '/' + options.name)
                    .query({rev: that.lastDoc._rev})
                    .set('Content-Type', contentType)
                    .set('Accept', 'application/json')
                    .send(options.data || options.file)
                    .end(function (err, res) {
                        if (err) return reject(err);
                        if (res.status !== 201) return reject(new Error('Error uploading attachment, couchdb returned status code ' + res.status));
                        that.lastDoc._rev = res.body.rev;
                        return resolve();
                    });
            });
        }).then(function () {
            // We need to update the document after the upload
            var prom = that.refresh();
            if (options.data) { // Don't store in lru if it's a file
                prom.then(function () {
                    LRU.store(storeName, that.lastDoc._attachments[options.name].digest, options.data);
                });
            }
            return prom;
        });
    };

    /**
     * Get the content of an attachment
     * @param name The name of the attachment to get
     * @return {Promise} The parsed content of the attachment
     */
    CouchdbAttachments.prototype.get = function (name) {
        var that = this;
        return this.list().then(function () {
            var exists = that.lastDoc._attachments[name];
            if (!exists) throw new Error('The attachment ' + name + ' does not exist');
            return Promise.resolve(LRU.get(storeName, exists.digest)).then(function (data) {
                if (data) return data.data;
                else return {};
            }, function () {
                return new Promise(function (resolve, reject) {
                    var req = superagent.get(that.docUrl + '/' + name);
                    if (exists) req.set('Accept', that.lastDoc._attachments[name].content_type);
                    req.query({rev: that.lastDoc._rev})
                        .end(function (err, res) {
                            if (err) return reject(err);
                            if (res.status !== 200) return reject(new Error('Error getting attachment, couchdb returned status code ' + res.status));
                            LRU.store(storeName, exists.digest, res.body || res.text);
                            return resolve(res.body || res.text);
                        });
                });
            });
        });
    };

    /**
     * Remove an attachment
     * @param name The name of the attachment to remove.
     * @returns {Promise.<Object>} The new list of attachments
     */
    CouchdbAttachments.prototype.remove = function (name) { // TODO: lru has no remove yet
        var that = this;
        if (Array.isArray(name)) {
            return inlineRemove(this, name);
        }
        return this.list().then(function () {
            if (!that.lastDoc._attachments[name]) throw new Error('Cannot remove attachment, attachment does not exist.');
            return new Promise(function (resolve, reject) {
                superagent
                    .del(that.docUrl + '/' + name)
                    .query({rev: that.lastDoc._rev})
                    .set('Accept', 'application/json')
                    .end(function (err, res) {
                        if (err) return reject(err);
                        if (res.status !== 200) return reject(new Error('Error deleting attachment, couchdb returned status code ' + res.status));
                        that.lastDoc._rev = res.body.rev;
                        delete that.lastDoc._attachments[name];
                        return resolve(attachmentsAsArray(that, that.lastDoc._attachments));
                    });
            });
        });
    };


    // Private function
    function inlineRemove(ctx, names) {
        return Promise.resolve().then(function () {
            if (!Array.isArray(names)) throw new TypeError('Argument should be an array');
            if (names.length === 0) return ctx.list();
            return new Promise(function (resolve, reject) {
                for (var i = 0; i < names.length; i++) {
                    delete ctx.lastDoc._attachments[names[i]];
                }
                superagent
                    .put(ctx.docUrl)
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .send(ctx.lastDoc)
                    .end(function (err, res) {
                        if (err) return reject(err);
                        if (res.status !== 201) return reject(new Error('Error uploading inline attachments, couchdb returned status code ' + res.status));
                        return resolve();
                    });
            });
        }).then(function () {
            return ctx.refresh();
        });
    }

    /**
     * An alias for fetchList
     * Fetches the list of attachment from couchdb.
     * @returns {Promise.<Object>} attachments - The new list of attachments
     */
        // Get documents with latest attachements' rev ids
    CouchdbAttachments.prototype.refresh = function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            superagent
                .get(that.docUrl)
                .set('Accept', 'application/json')
                .end(function (err, res) {
                    if (err) return reject(err);
                    if (res.status !== 200) return reject(new Error('Error getting document, couchdb returned status code ' + res.status));
                    that.lastDoc = res.body;
                    return resolve(attachmentsAsArray(that, res.body._attachments));
                });
        });
    };

    function attachmentsAsArray(ctx, att) {
        var r = [];
        var i = 0;
        for (var key in att) {
            r.push(att[key]);
            r[i].name = key;
            r[i].url = encodeURI(ctx.docUrl + '/' + key);
            i++;
        }
        ctx.lastAttachmentsResult = r;
        return r;
    }

    CouchdbAttachments.prototype.fetchList = CouchdbAttachments.prototype.refresh;
    return CouchdbAttachments;
});
