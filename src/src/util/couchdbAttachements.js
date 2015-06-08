"use strict";

// Mini-library to manage couchdb attachments
// - Get and upload attachments just by their name
// - Cache already downloaded attachments
define(['src/util/versioning', 'superagent'], function(Versioning, superagent) {

    // A namespace for preventing overwriting
    var prefix = 'upload/';

    /**
     * @param url Set the docUrl. If none specified, will attempt to use the viewURL to set the docURL
     * @constructor
     * @exports src/util/couchdbAttachments
     */
    var CouchdbAttachments = function() {
        // get the document url from the view url
        if(arguments.length === 0) {
            var viewUrl = Versioning.lastLoaded.view.url;
            if(!viewUrl) {
                throw new Error('couchdb attachments initialization failed: No view url');
            }
            this.docUrl = viewUrl.replace(/\/[^\/]+$/, '');
            this.url = '';
        }
        else {
            this.docUrl = arguments[0];
        }

        this.attachments = {};
        console.log('document url is:', this.docUrl);
    };

    /**
        @return {Promise<Object>} the list
     */
    CouchdbAttachments.prototype.getList = function(refresh) {
        var that = this;

        return Promise.resolve().then(function() {
            if(!refresh && that.lastDoc) {
                return that.lastDoc._attachments;
            }
            return that.refresh();
        });
    };

    /**
     *
     * @param name Name of the attachment to upload
     * @param data The attachment's content to upload
     * @param options
     * @returns {Promise.<Object>} The new list of attachments
     */
    CouchdbAttachments.prototype.upload = function(name, data, options) {
        var that = this;
        options = options || {};

        return this.getList().then(function() {
            return new Promise(function(resolve, reject) {
                var exists = that.lastDoc._attachments[name];
                console.log(that.lastDoc);
                var contentType = options.contentType || (exists ? exists.content_type : undefined);
                if(!contentType) {
                    return reject(new Error('Content-Type unresolved. Cannot upload document without content-type'));
                }
                superagent
                    .put(that.docUrl + '/' + name)
                    .query({rev: that.lastDoc._rev})
                    .set('Content-Type', contentType)
                    .set('Accept', 'application/json')
                    .send(data)
                    .end(function(err, res){
                        if(err) return reject(err);
                        if(res.status !== 201) return reject(new Error('Error uploading attachment, couchdb returned status code ' + res.status));
                        that.lastDoc._rev = res.body.rev;
                        that.attachments[name] = data;
                        return resolve(res);
                    })
            });
        }).then(function() {
            // We need to update the document after the upload
            return that.getList(true);
        });

    };

    /**
     * Get the content of an attachment
     * @param name The name of the attachment
     * @param refresh Set to true if to force download (this will clear the cache)
     * @return {Promise} The parsed content of the attachment
     */
    CouchdbAttachments.prototype.get = function(name, refresh) {
        var that = this;

        return this.getList().then(function() {
            if(!refresh && that.attachments[name]) {
                console.log('return attachment from cache');
                return that.attachments[name];
            }

            var r;
            var exists = that.lastDoc._attachments[name];
            if(!refresh) r = Promise.resolve();
            else r = that.refresh();
            return r.then(function() {
                return new Promise(function(resolve, reject) {
                    var req = superagent.get(that.docUrl + '/' + name);
                    if(exists) req.set('Accept', that.lastDoc._attachments[name].content_type);
                    req.query({rev: that.lastDoc._rev})
                        .end(function(err, res) {
                            if(err) return reject(err);
                            if(res.status !== 200) return reject(new Error('Error getting attachment, couchdb returned status code ' + res.status));
                            debugger;
                            that.attachments[name] = res.text;
                            console.log(res.headers);
                            console.log('body', res.body);
                            console.log('text', res.text);
                            return resolve(res.body || res.text);
                        });

                });
            });

        });
    };

    /**
     * Remove an attachment
     * @param name The name of the attachment
     * @returns {Promise.<Object>} The new list of attachments
     */
    CouchdbAttachments.prototype.remove = function(name) {
        var that = this;
        return this.getList().then(function() {
            if(!that.lastDoc._attachments[name]) throw new Error('Cannot remove attachment, attachment does not exist.');
            return new Promise(function(resolve, reject) {
                superagent
                    .del(that.docUrl + '/' + name)
                    .query({rev: that.lastDoc._rev})
                    .set('Accept', 'application/json')
                    .end(function(err, res) {
                        if(err) return reject(err);
                        if(res.status !== 200) return reject(new Error('Error deleting attachment, couchdb returned status code ' + res.status));
                        that.lastDoc._rev = res.body.rev;
                        delete that.attachments[name];
                        delete that.lastDoc._attachments[name];
                        return resolve(that.lastDoc._attachments);
                    });
            });

        });
    };

    /**
     * Makes a request to get an up-to-date list of attachments. Clears the cache.
     * @returns {Promise.<Object>} The new list of attachments
     */
    // Get documents with latest attachements' rev ids
    CouchdbAttachments.prototype.refresh = function() {
        var that = this;
        return new Promise(function(resolve, reject) {
            superagent
                .get(that.docUrl)
                .set('Accept', 'application/json')
                .end(function(err, res){
                    console.log('status', res.status);
                    if(err) return reject(err);
                    if(res.status !== 200) return reject(new Error('Error getting document, couchdb returned status code ' + res.status));
                    console.log('body', res);
                    that.attachments = {};
                    that.lastDoc = res.body;
                    return resolve(res.body._attachments);
                });
        });
    };

    return CouchdbAttachments;
});