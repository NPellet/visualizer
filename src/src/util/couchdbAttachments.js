'use strict';

// Mini-library to manage couchdb attachments
// - Get and upload attachments just by their name
// - Cache already downloaded attachments
define([
    'src/util/versioning',
    'superagent',
    'src/util/util'
], function (Versioning, superagent, util) {

    var base64DataUrlReg = /^data:([a-z]+\/[a-z]+)?;base64,/;

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

    class CouchdbAttachments {
        /**
         * @param url Set the docUrl. If none specified, will attempt to use the viewURL to set the docURL
         * @constructor
         * @exports src/util/couchdbAttachments
         */
        constructor() {
            // get the document url from the view url
            if (arguments.length === 0) {
                var viewUrl = Versioning.lastLoaded.view.url;
                if (!viewUrl) {
                    throw new Error('couchdb attachments initialization failed: No view url');
                }
                this.docUrl = viewUrl.replace(/\/[^\/]+$/, '');
            } else {
                this.docUrl = arguments[0];
            }
        }

        /**
         @return {object} attachments - An array with the attachments metadata
         @return {number} attachments[].name - The name of the resource
         @return {string} attachments[].content_type - Resource's mime-type
         @return {string} attachments[].digest - base64 md5 digest of the resource
         @return {number} attachments[].length - Length in bytes of the resource
         @return {number} attachments[].url - The url of the resource
         */
        list(secondRound) {
            return Promise.resolve().then(() => {
                var hasAtt = this.lastDoc && this.lastDoc._attachments;
                if (!this.lastDoc && secondRound) {
                    throw new Error('Unreachable');
                }
                if (!hasAtt && !secondRound) {
                    return this.refresh().then(() => {
                        return this.list(true);
                    });
                } else if (!hasAtt) {
                    this.lastDoc._attachments = {};
                }
                return this.attachmentsAsArray(this, this.lastDoc._attachments);
            });
        }

        /**
         * Upload several attachments in one revision
         * @param {object[]} options
         * @param {string} options[].name - The name of the attachment
         * @param {string} options[].contentType - The contentType of the uploaded data
         * @param {string} options[].data - The attachment data to upload. If string, must be a valid base64 encoded dataURL.
         * @param {string} options[].content - The attachment data to upload. Alias of data.
         * @param {Blob|string} options[].file - The attachment data to upload. Alias of data.
         * @example
         * // With dataurl
         * cdb.inlineUploads([{
     *   name: 'example.png',
     *   file: 'data:image/png;base64,ORK5CYII='
     * }]);
         * // With Blob
         * cdb.inlineUploads([{
     *   name: 'example.txt',
     *   file: new Blob(['example'], {content_type: 'text/plain'});
     * }]);
         * // With data
         * cdb.inlineUploads([{
     *   name: 'example.txt',
     *   contentType: 'text/plain',
     *   data: 'example'
     * }]);
         * @returns {Promise.<object>} The new list of attachments
         */
        inlineUploads(options) {
            var prom = this.list();
            if (!options) return prom.then(() => {
                return attachmentsAsArray(this, this.lastAttachmentsResult);
            });
            return prom.then(() => {
                if (!(Array.isArray(options))) {
                    throw new TypeError('options must be an array');
                }

                var prom = [];
                for (let i = 0; i < options.length; i++) {
                    let name = getName(options[i]);
                    let item = options[i];
                    let data = item.data || item.file || item.content;
                    if (typeof data === 'string') {
                        if (item.encoding === 'base64') {
                            this.lastDoc._attachments[name] = {
                                content_type: item.contentType,
                                data: data
                            };
                        } else {
                            let dataUrl = base64DataUrlReg.exec(data.slice(0, 64));
                            if (!dataUrl) {
                                this.lastDoc._attachments[name] = {
                                    content_type: item.contentType,
                                    data: btoa(unescape(encodeURIComponent(data)))
                                };
                            } else {
                                this.lastDoc._attachments[name] = {
                                    content_type: item.contentType || dataUrl[1],
                                    data: data.slice(dataUrl[0].length)
                                };
                            }
                        }

                    } else if (data instanceof Blob) {
                        if (!item.contentType && data.type) {
                            item.contentType = data.type;
                        }
                        let p = new Promise((resolve, reject) => {
                            let reader = new FileReader();
                            reader.onload = function (e) {
                                return resolve({
                                    item: item,
                                    base64data: dataURLtoBase64(e.target.result)
                                });
                            };
                            reader.onerror = function () {
                                return reject('Error while reading file');
                            };
                            reader.readAsDataURL(data);
                        });
                        prom.push(p);
                    } else {
                        return Promise.reject(new Error('Item must have a valid data or file property'));
                    }
                }
                return Promise.all(prom);
            }).then(toChange => {
                for (let i = 0; i < toChange.length; i++) {
                    const c = toChange[i];
                    this.lastDoc._attachments[getName(c.item)] = {
                        content_type: c.item.contentType,
                        data: c.base64data
                    };
                }
                return superagent
                    .put(this.docUrl)
                    .withCredentials()
                    .set('Content-Type', 'application/json')
                    .set('Accept', 'application/json')
                    .send(this.lastDoc)
                    .end();
            }).then(() => this.refresh());
        }


        /**
         *
         * @param {object} options
         * @param {string} options.name - Name of the attachment to upload
         * @param {string} options.filename - Alias for name
         * @param {string} options.contentType - Content-Type of the attachment to upload
         * @param {string|Blob} options.data -  The attachment's content to upload
         * @param {string|Blob} options.file - The attachments's content to upload
         * @param {string|Blob} options.content - The attachments's content to upload
         * @returns {Promise.<Object>} The new list of attachments
         */
        upload(options) {
            let data = options.data || options.file || options.content;
            return this.list().then(() => {
                if (!options) {
                    throw new Error('Invalid arguments');
                }
                let contentType = options.contentType;
                if (!contentType && data instanceof Blob) {
                    contentType = data.type;
                } else if (typeof data === 'string') {
                    if (options.encoding === 'base64') {
                        data = options.data;
                    } else {
                        let dataUrl = base64DataUrlReg.exec(data.slice(0, 64));
                        if (dataUrl) {
                            data = util.b64toBlob(data.slice(dataUrl[0].length), dataUrl[1]);
                            contentType = dataUrl[1];
                        } else {
                            data = new Blob([data], {content_type: options.contentType});
                        }
                    }
                } else {
                    throw new Error('Data must be Blob or base64 dataUrl');
                }

                if (!contentType) {
                    throw new Error('Content-Type unresolved. Cannot upload document without content-type');
                }
                return superagent
                    .put(this.docUrl + '/' + getName(options))
                    .withCredentials()
                    .query({rev: this.lastDoc._rev})
                    .set('Content-Type', contentType)
                    .set('Accept', 'application/json')
                    .send(data)
                    .then(res => {
                        if (res && res.body && res.body.rev) {
                            this.lastDoc._rev = res.body.rev;
                        }
                    });
            }).then(() => this.refresh());
        }

        /**
         * Get the content of an attachment
         * @param name The name of the attachment to get
         * @return {Promise} The parsed content of the attachment
         */
        get(name, options) {
            options = options || {};
            return this.list().then(() => {
                const _att = this.lastDoc._attachments[name];
                if (!_att) throw new Error('The attachment ' + name + ' does not exist');
                const req = superagent.get(this.docUrl + '/' + name).withCredentials();
                if (_att) req.set('Accept', this.lastDoc._attachments[name].content_type);
                return req.query({rev: this.lastDoc._rev})
                    .then(res => {
                        if (options.raw) return res.text;
                        return res.body;
                    });
            });
        }

        /**
         * Remove an attachment
         * @param name The name of the attachment to remove.
         * @returns {Promise.<Object>} The new list of attachments
         */
        remove(name) {
            if (Array.isArray(name)) {
                return inlineRemove(this, name);
            }
            return this.list().then(() => {
                if (!this.lastDoc._attachments[name]) throw new Error('Cannot remove attachment, attachment does not exist.');
                return superagent
                    .del(this.docUrl + '/' + name)
                    .withCredentials()
                    .query({rev: this.lastDoc._rev})
                    .set('Accept', 'application/json')
                    .then(res => {
                        if (res && res.body && res.body.rev) {
                            this.lastDoc._rev = res.body.rev;
                            delete this.lastDoc._attachments[name];
                            return attachmentsAsArray(this, this.lastDoc._attachments);
                        } else {
                            throw new Error('Unexpected error when removing attachments');
                        }
                    });
            });
        }

        /**
         * Refreshes the list of attachment from couchdb.
         * @returns {Promise.<Object>} attachments - The new list of attachments
         */
        // Get documents with latest attachements' rev ids
        refresh() {
            return superagent
                .get(this.docUrl)
                .withCredentials()
                .set('Accept', 'application/json')
                .then(res => {
                    this.lastDoc = res.body;
                    return attachmentsAsArray(this, res.body._attachments);
                });
        }

        /**
         * An alias for refresh
         * Refreshes the list of attachment from couchdb.
         * @returns {Promise.<Object>} attachments - The new list of attachments
         */
        fetchList() {
            return this.refresh();
        }

        attachmentsAsArray() {
            var r = [];
            var i = 0;
            for (var key in this.lastDoc._attachments) {
                r.push(this.lastDoc._attachments[key]);
                r[i].name = key;
                r[i].url = encodeURI(this.docUrl + '/' + key);
                i++;
            }
            this.lastAttachmentsResult = r;
            return r;
        }

        // This is an alternative strategy for storing multiple attachments in one revision
        // The problem with this is that it doesn't allow to change the contentType
        // (because Blobs are immutable) if the browser did not set it correctly or if
        // the user wants to manually change it will not work properly
        uploads1(files) {
            if (!Array.isArray(files)) {
                throw new Error('uploads expects an array as parameter');
            }

            var req = superagent.post(this.docUrl).withCredentials();

            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                req.attach('_attachments', file, getName(file));
            }
            req.field('_rev', this.lastDoc._rev);
            return req.end().then(res => {
                if (res.status !== 201) throw new Error('Error uploading attachments, couchdb returned status code ' + res.status);
                return this.refresh();
            });
        }
    }


    // Private function
    function inlineRemove(ctx, names) {
        return ctx.list().then(() => {
            if (!Array.isArray(names)) throw new TypeError('Argument should be an array');
            if (names.length === 0) return ctx.list();
            for (var i = 0; i < names.length; i++) {
                delete ctx.lastDoc._attachments[names[i]];
            }
            return superagent
                .put(ctx.docUrl)
                .withCredentials()
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .send(ctx.lastDoc)
                .then(res => {
                    if (res && res.body && res.body.rev) {
                        ctx.lastDoc._rev = res.body.rev;
                        return attachmentsAsArray(ctx, ctx.lastDoc._attachments);
                    }
                });
        }).then(() => ctx.refresh());
    }

    function attachmentsAsArray(ctx, att) {
        var r = [];
        var i = 0;
        for (var key in att) {
            r.push(att[key]);
            r[i].name = key;
            r[i].filename = key;
            r[i].url = encodeURI(ctx.docUrl + '/' + key);
            i++;
        }
        ctx.lastAttachmentsResult = r;
        return r;
    }

    function getName(options) {
        return options.name || options.filename;
    }

    return CouchdbAttachments;
});
