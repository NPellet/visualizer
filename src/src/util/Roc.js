'use strict';

define(['src/util/api', 'src/util/ui', 'src/util/util', 'src/util/debug',  'superagent', 'uri/URI', 'lodash', 'src/util/couchdbAttachments', 'src/util/mimeTypes', 'src/util/IDBKeyValue'],
    function (API, ui, Util, Debug, superagent, URI, _, CDB, mimeTypes, IDB) {

        const defaultOptions = {
            messages: {
                200: 'OK',
                201: 'Created',
                202: 'Accepted',
                204: 'No content',
                400: 'Bad request',
                401: 'Unauthorized',
                404: 'Not Found',
                409: 'Conflict',
                403: 'Forbidden',
                408: 'Request timeout',
                500: 'Internal server error',
                502: 'Bad gateway'
            }
        };

        const getTypes = ['get', 'getAttachment', 'getView', 'getQuery', 'getTokens', 'getGroups', 'getToken'];

        const messagesByType = {
            get: {
                401: 'Unauthorized to get entry'
            },
            create: {
                200: 'Entry created',
                201: 'Entry created',
                401: 'Unauthorized to create entry'
            },
            update: {
                200: 'Entry updated',
                401: 'Unauthorized to update entry',
                404: 'Could not update entry: does not exist'
            },
            delete: {
                200: 'Entry deleted',
                401: 'Unauthorized to delete entry',
                404: 'Cannot delete entry: does not exist'
            },
            addAttachment: {
                200: 'Added attachment',
                401: 'Unauthorized to add attachment',
                404: 'Cannot add attachment: document does not exist'
            },
            deleteAttachment: {
                200: 'Attachment deleted',
                401: 'Unauthorized to delete attachment',
                404: 'Cannot delete attachment: does not exist'
            },
            getAttachment: {
                401: 'Unauthorized to get attachment',
                404: 'Attachment does not exist'
            },
            getView: {
                401: 'Unauthorized to get view',
                404: 'View does not exist'
            },
            getQuery: {
                401: 'Unauthorized to get query',
                404: 'Query does not exist'
            },
            getGroups: {},
            addGroup: {
                401: 'Unauthorized to add group',
                200: 'Group added to entry'
            },
            getTokens: {},
            getToken: {},
            createToken: {
                200: 'Token created',
                401: 'Unauthorized to create token'
            },
            deleteToken: {
                200: 'Token deleted',
                401: 'Unauthorized to delete token'
            }
        };

        for (let key in defaultOptions.messages) {
            // For get requests default is not to show any messages
            if (key < '300') {
                for (let i = 0; i < getTypes.length; i++) {
                    messagesByType[getTypes[i]][key] = '';
                }
            }
        }

        const viewSearchJsonify = ['key', 'startkey', 'endkey'];
        const viewSearch = ['limit', 'mine', 'groups'];
        const mandatoryOptions = ['url', 'database'];

        const idb = new IDB('roc-documents');

        class Roc {
            constructor(opts) {
                for (var key in opts) {
                    if (opts.hasOwnProperty(key)) {
                        this[key] = opts[key];
                    }
                }

                for (let i = 0; i < mandatoryOptions.length; i++) {
                    if (!this[mandatoryOptions[i]]) {
                        throw new Error(`${mandatoryOptions[i]} is a mandatory option`);
                    }
                }
                this.messages = this.messages || {};
                this.variables = {};


                this.requestUrl = new URI(opts.url);
                this.databaseUrl = this.requestUrl.directory(`${this.requestUrl.directory()}/db/${this.database}`).normalize().href();
                this.entryUrl = `${this.databaseUrl}entry`;
                this.__ready = Promise.resolve();
            }

            view(viewName, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getView');
                    let requestUrl = new URI(`${this.databaseUrl}_view/${viewName}`);
                    addSearch(requestUrl, options);

                    requestUrl = requestUrl.normalize().href();

                    return superagent.get(requestUrl)
                        .withCredentials()
                        .then(res => {
                            if (res && res.body && res.status == 200) {
                                if (options.filter) {
                                    res.body = res.body.filter(options.filter);
                                }
                                if (options.sort) {
                                    res.body = res.body.sort(options.sort);
                                }
                                if (options.varName) {
                                    for (var i = 0; i < res.body.length; i++) {
                                        this.typeUrl(res.body[i].$content, res.body[i]);
                                    }
                                    return API.createData(options.varName, res.body).then(data => {
                                        this.variables[options.varName] = {
                                            type: 'view',
                                            options,
                                            viewName,
                                            requestUrl,
                                            data: data
                                        };
                                        for (var i = 0; i < data.length; i++) {
                                            data.traceSync([i]);
                                        }
                                        return data;
                                    });
                                }
                            }
                            return res.body;
                        })
                        .then(handleSuccess(this, options))
                        .catch(handleError(this, options));
                });
            }

            query(viewName, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getQuery');
                    let requestUrl = new URI(`${this.databaseUrl}_query/${viewName}`);
                    addSearch(requestUrl, options);
                    requestUrl = requestUrl.normalize().href();

                    return superagent.get(requestUrl)
                        .withCredentials()
                        .then(res => {
                            if (res && res.body && res.status == 200) {
                                if (options.filter) {
                                    res.body = res.body.filter(options.filter);
                                }
                                if (options.sort) {
                                    res.body = res.body.sort(options.sort);
                                }
                                if (options.varName) {
                                    if (options.addRightsInfo) {
                                        for (var i = 0; i < res.body.length; i++) {
                                            res.body[i].anonymousRead = {
                                                type: 'boolean',
                                                url: `${this.entryUrl}/${res.body[i].id}/_rights/read?asAnonymous=true`
                                            };
                                            res.body[i].userWrite = {
                                                type: 'boolean',
                                                url: `${this.entryUrl}/${res.body[i].id}/_rights/write`
                                            }
                                        }
                                    }
                                    for (var i = 0; i < res.body.length; i++) {
                                        res.body[i].document = {
                                            type: 'object',
                                            url: `${this.entryUrl}/${res.body[i].id}`
                                        };
                                    }
                                    return API.createData(options.varName, res.body).then(data => {
                                        this.variables[options.varName] = {
                                            type: 'query',
                                            options,
                                            requestUrl,
                                            viewName,
                                            data: data
                                        };
                                        return data;
                                    });
                                }
                            }
                            return res.body;
                        })
                        .then(handleSuccess(this, options))
                        .catch(handleError(this, options));
                });
            }

            document(uuid, options) {
                return this.get(uuid).then(doc => {
                    if (!doc) return;
                    if (options.varName) {
                        this.typeUrl(doc.$content, doc);
                        return API.createData(options.varName, doc).then(data => {
                            this.variables[options.varName] = {
                                type: 'document',
                                data: data
                            };
                            if (options.track) {
                                data.onChange(() => {
                                    idb.set(data._id, data.resurrect());
                                });

                                idb.get(data._id).then(localEntry => {
                                    if (!localEntry) return;
                                    if (localEntry._rev === doc._rev) {
                                        this._updateByUuid(data._id, localEntry, options);
                                    } else {
                                        idb.delete(data._id);
                                    }
                                });
                            }
                            return data;
                        });
                    }
                    return doc;
                });
            }

            get(entry, options) {
                return this.__ready.then(() => {
                    var uuid = getUuid(entry);
                    options = createOptions(options, 'get');
                    if (options.fromCache) {
                        var e = this._findByUuid(uuid);
                        if (e) return e;
                        if (!options.fallback) return e;
                    }
                    return superagent.get(`${this.entryUrl}/${uuid}`)
                        .withCredentials()
                        .end()
                        .then(res => {
                            if (res.body && res.status == 200) {
                                this._defaults(res.body.$content);
                                if (!options.noUpdate) {
                                    this._updateByUuid(uuid, res.body, options);
                                }
                                return res.body;
                            }
                        }).catch(handleError(this, options));
                });
            }

            getById(id, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'get');
                    var entry = this._findById(id);
                    if (!entry || options.fromCache) {
                        return entry;
                    }
                    return this.get(entry)
                        .catch(handleError(this, options));
                });
            }

            getGroups(options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getGroups');
                    return superagent.get(`${this.databaseUrl}groups`).then(res => res.body).catch(handleError(this, options));
                })
            }

            create(entry, options) {
                return this.__ready
                    .then(() => {
                        options = createOptions(options, 'create');
                        if (!entry.$kind) {
                            entry.$kind = this.kind;
                        }
                        this._defaults(entry.$content);
                        return superagent.post(this.entryUrl)
                            .withCredentials()
                            .send(entry)
                            .then(handleSuccess(this, options))
                            .then(res => {
                                if (res.body && (res.status == 200 || res.status == 201)) {
                                    return this.get(res.body.id);
                                }
                            })
                            .then(entry => {
                                if (!entry) return;
                                this.typeUrl(entry.$content, entry);
                                let keys = Object.keys(this.variables);
                                for (let i = 0; i < keys.length; i++) {
                                    let v = this.variables[keys[i]];
                                    if (v.type === 'view') {
                                        var idx = v.data.length;
                                        v.data.push(entry);
                                        v.data.traceSync([idx]);
                                        if (!options.noTrigger) {
                                            v.data.triggerChange();
                                        }
                                    } else if (v.type === 'query') {
                                        this.query(v.viewName, v.options);
                                    }
                                }
                                return entry;
                            })
                            .catch(handleError(this, options));
                    });
            }

            update(entry, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'update');
                    var reqEntry = DataObject.resurrect(entry);
                    this.untypeUrl(reqEntry.$content);
                    return superagent.put(`${this.entryUrl}/${String(entry._id)}`)
                        .withCredentials()
                        .send(reqEntry)
                        .then(handleSuccess(this, options))
                        .then(res => {
                            if (res.body && res.status == 200) {
                                entry._rev = res.body.rev;
                                entry.$creationDate = res.body.$creationDate;
                                entry.$modificationDate = res.body.$modificationDate;
                                this._updateByUuid(entry._id, entry, options);
                                idb.delete(entry._id);
                            }
                            return entry;
                        })
                        .catch(handleError(this, options));
                });
            }

            deleteAttachment(entry, attachments, options) {
                return this.__ready.then(() => {
                    if (!entry || !entry._attachments) return;
                    options = createOptions(options, 'deleteAttachment');
                    if (Array.isArray(attachments) && attachments.length === 0) return entry;
                    if (!Array.isArray(attachments)) attachments = [attachments];

                    attachments = attachments.map(String);
                    return this.get(entry, {fromCache: true, fallback: true})
                        .then(entry => {
                            this._deleteFilename(entry.$content, attachments);
                            for (var i = 0; i < attachments.length; i++) {
                                delete entry._attachments[attachments[i]];
                            }
                            var cdb = this._getCdb(entry);
                            return cdb.remove(attachments, {
                                noRefresh: true
                            }).then(() => {
                                return this.get(entry, {noUpdate: true}).then(data => {
                                    entry._rev = data._rev;
                                    entry._attachments = data._attachments;
                                    entry.$creationDate = data.$creationDate;
                                    entry.$modificationDate = data.$modificationDate;
                                    if (entry.triggerChange && !options.noTrigger) {
                                        entry.triggerChange();
                                    }
                                    return entry;
                                });
                            });
                        })
                        .then(handleSuccess(this, options))
                        .catch(handleError(this, options));
                });
            }

            removeAttachment(entry, attachments, options) {
                return this.deleteAttachment(entry, attachments, options);
            }

            unattach(entry, row, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'deleteAttachment');
                    // Confirm?
                    if (!this.processor) throw new Error('no processor');

                    if (!row.__parent) {
                        throw new Error('row must be linked to parent for unattach to work');
                    }
                    var arr = row.__parent;
                    var idx = arr.indexOf(row);
                    if (idx === -1) {
                        Debug.warn('element to unattach not found');
                        return;
                    }

                    var toDelete = this._findFilename(row);
                    toDelete = toDelete.map(d => String(d.filename));
                    arr.splice(idx, 1);
                    var toKeep = this._findFilename(entry.$content, toDelete);
                    toKeep = toKeep.map(k => String(k.filename));
                    toDelete = _.difference(toDelete, toKeep);
                    return this.deleteAttachment(entry, toDelete, options).then(() => {
                        arr.splice(idx, 1);
                        if (!options.noTrigger) {
                            arr.triggerChange();
                        }
                        return entry;
                    });
                });
            }

            attach(type, entry, attachment, options) {
                return this.__ready.then(() => {
                    var attachOptions = createOptions(options, 'attach');
                    var prom = Promise.resolve();
                    if (!attachment.filename) {
                        prom = ui.enterValue('Enter a filename');
                    }

                    return prom
                        .then(filename => {
                            if (filename) attachment.filename = filename;
                            if (!attachment.filename) {
                                return;
                            }

                            attachment.filename = this.processor.getFilename(type, attachment.filename);

                            // If we had to ask for a filename, resolve content type
                            var fallback;
                            if (filename) {
                                fallback = attachment.contentType;
                                attachment.contentType = undefined;
                            }
                            setContentType(attachment, fallback);

                            return this.get(entry, {fromCache: true, fallback: true}).then(entry => {
                                return this.addAttachment(entry, attachment, createOptions(options, 'addAttachment'))
                                    .then(entry => {
                                        if (!this.processor) {
                                            throw new Error('no processor');
                                        }

                                        return Promise.resolve(this.processor.process(type, entry.$content, attachment)).then(() => {
                                            this.typeUrl(entry.$content, entry);
                                            if (entry.triggerChange && !options.noTrigger) {
                                                entry.triggerChange();
                                            }
                                            return entry;
                                        });
                                    });
                            });
                        })
                        .then(handleSuccess(this, attachOptions))
                        .catch(handleError(this, attachOptions));
                });
            }

            discardLocal(entry) {
                var uuid = getUuid(entry);
                return idb.delete(uuid).then(() => {
                    // Get from server again
                    return this.get(entry);
                });
            }

            getAttachment(entry, name, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getAttachment');
                    const cdb = this._getCdb(entry);
                    return cdb.get(name)
                        .catch(handleError(this, options));
                });
            }

            getAttachmentList(entry) {
                return this.__ready.then(() => {
                    const cdb = this._getCdb(entry);
                    return cdb.list();
                });
            }

            addAttachment(entry, attachments, options) {
                return this.__ready.then(() => {
                    var prom = Promise.resolve(true);
                    attachments = DataObject.resurrect(attachments);
                    if (attachments.length === 1) {
                        attachments = attachments[0];
                    }

                    if (!Array.isArray(attachments)) {
                        if (!attachments.filename) {
                            prom = ui.enterValue('Enter a filename').then(filename => {
                                if (filename) attachments.filename = filename;
                                if (!attachments.filename) {
                                    return;
                                }
                                // If we had to ask for a filename, resolve content type
                                var fallback = attachments.contentType;
                                attachments.contentType = undefined;
                                setContentType(attachments, fallback);
                                attachments = [attachments];
                                return filename;
                            });
                        } else {
                            attachments = [attachments];
                        }
                    }

                    attachments.forEach(attachment => {
                        setContentType(attachment);
                    });


                    return prom.then(filename => {
                        if (!filename) return;


                        options = createOptions(options, 'addAttachment');
                        return this.get(entry, {fromCache: true, fallback: true})
                            .then(entry => {
                                const cdb = this._getCdb(entry);
                                return cdb.inlineUploads(attachments, {
                                    noRefresh: true
                                })
                                    .then(() => this.get(entry, {noUpdate: true}))
                                    .then(data => {
                                        entry._rev = data._rev;
                                        entry._attachments = data._attachments;
                                        entry.$creationDate = data.$creationDate;
                                        entry.$modificationDate = data.$modificationDate;
                                        if (entry.triggerChange && !options.noTrigger) {
                                            entry.triggerChange();
                                        }
                                        return entry;
                                    });
                            })
                            .then(handleSuccess(this, options))
                            .catch(handleError(this, options));
                    });
                });
            }

            addAttachmentById(id, attachment, options) {
                return this.__ready.then(() => {
                    var doc = this._findById(id);
                    if (!doc) return;
                    return this.addAttachment(doc._id, attachment, options);
                });
            }

            getTokens(options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getTokens');
                    return superagent.get(`${this.databaseUrl}token`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => res.body)
                        .catch(handleError(this, options));
                });
            }

            getToken(token, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'getToken');
                    var tokenId = getTokenId(token);
                    return superagent.get(`${this.databaseUrl}token/${tokenId}`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => res.body)
                        .catch(handleError(this, options));
                });
            }

            createToken(entry, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'createToken');
                    var uuid = getUuid(entry);
                    return superagent.post(`${this.entryUrl}/${uuid}/_token`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => res.body)
                        .catch(handleError(this, options));
                });
            }

            deleteToken(token, options) {
                return this.__ready.then(() => {
                    options = createOptions(options, 'deleteToken');
                    var tokenId = getTokenId(token);
                    return superagent.del(`${this.databaseUrl}token/${tokenId}`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => res.body)
                        .catch(handleError(this, options));
                });
            }

            addGroup(entry, group, options, remove) {
                var method = remove ? 'del' : 'put';
                return this.__ready.then(() => {
                    const uuid = getUuid(entry);
                    options = createOptions(options, 'addGroup');
                    return superagent[method](`${this.entryUrl}/${uuid}/_owner/${String(group)}`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => {
                            if (!options.noUpdate) {
                                this.get(uuid).then(() => res.body);
                            } else {
                                return res.body;
                            }
                        })
                        .catch(handleError(this, options));
                });
            }


            deleteGroup(entry, group, options) {
                return this.addGroup(entry, group, options, true)
            }


            delete(entry, options) {
                return this.__ready.then(() => {
                    const uuid = getUuid(entry);
                    options = createOptions(options, 'delete');
                    return superagent.del(`${this.entryUrl}/${uuid}`)
                        .withCredentials()
                        .then(handleSuccess(this, options))
                        .then(res => {
                            if (res.body && res.status == 200) {
                                for (let key in this.variables) {
                                    const idx = this._findIndexByUuid(uuid, key);
                                    if (idx !== -1) {
                                        this.variables[key].data.splice(idx, 1);
                                        if (!options.noTrigger) {
                                            this.variables[key].data.triggerChange();
                                        }
                                    }
                                }

                            }
                            return res.body;
                        })
                        .catch(handleError(this, options));
                });
            }

            remove(entry, options) {
                return this.delete(entry, options);
            }

            // Private
            _getCdb(entry) {
                var isEntry, uuid;
                var type = DataObject.getType(entry);
                if (type === 'string') {
                    uuid = String(entry);
                } else if (type === 'object') {
                    uuid = String(entry._id);
                    isEntry = true;
                } else {
                    throw new Error('Bad arguments');
                }
                const docUrl = `${this.entryUrl}/${String(uuid)}`;
                var cdb = new CDB(docUrl);
                if (isEntry) {
                    cdb.setDoc(entry);
                }
                return cdb;
            }

            _findByUuid(uuid, key) {
                if (key === undefined) {
                    var result;
                    // Return the first one found (they are all supposed to be the same...)
                    for (let key in this.variables) {
                        result = this._findByUuid(uuid, key);
                        if (result) return result;
                    }
                    return null;
                }

                if (!this.variables[key]) return null;
                if (this.variables[key].type === 'view') {
                    return this.variables[key].data.find(entry => String(entry._id) === String(uuid));
                } else if (this.variables[key].type === 'document') {
                    if (String(this.variables[key].data._id) === String(uuid)) {
                        return this.variables[key].data;
                    }
                }
            }

            _findById(id, key) {
                if (key === undefined) {
                    var result;
                    for (let key in this.variables) {
                        result = this._findById(id, key);
                        if (result) return result;
                    }
                    return null;
                }
                if (!this.variables[key]) return null;
                id = DataObject.resurrect(id);
                if (this.variables[key].type === 'document' && _.isEqual(DataObject.resurrect(this.variables[key].data.$id), id)) {
                    return this.variables[key].data;
                } else if (this.variables[key].type === 'view') {
                    return this.variables[key].data.find(entry => _.isEqual(id, DataObject.resurrect(entry.$id)));
                }
                return null;
            }

            _findIndexByUuid(uuid, key) {
                if (!this.variables[key]) return -1;
                if (this.variables[key].type === 'document') {
                    return -1;
                } else if (this.variables[key].type === 'view') {
                    return this.variables[key].data.findIndex(entry => String(entry._id) === String(uuid));
                } else if (this.variables[key].type === 'query') {
                    return this.variables[key].data.findIndex(entry => String(entry.id) === String(uuid));
                }
                return -1;
            }

            _updateByUuid(uuid, data, options) {
                for (let key in this.variables) {
                    if (this.variables[key].type === 'view') {
                        const idx = this._findIndexByUuid(uuid, key);
                        if (idx !== -1) {
                            this.typeUrl(data.$content, data);
                            //this.variables[key].data.setChildSync([idx], data);
                            let row = this.variables[key].data.getChildSync([idx]);
                            this._updateDocument(row, data, options);
                        }
                    } else if (this.variables[key].type === 'document') {
                        uuid = String(uuid);
                        const _id = this.variables[key].data._id;
                        if (uuid === _id) {
                            //var newData = DataObject.resurrect(data);
                            this.typeUrl(data.$content, data);
                            let doc = this.variables[key].data;
                            this._updateDocument(doc, data, options);
                        }
                    } else if (this.variables[key].type === 'query' && this.queryAutoRefresh) {
                        const idx = this._findIndexByUuid(uuid, key);
                        if (idx !== -1) {
                            // Redo the same query
                            this.query(this.variables[key].viewName, this.variables[key].options);
                        }
                    }
                }
            }

            _updateDocument(doc, data, options) {
                if (doc && data) {
                    let keys = Object.keys(data);
                    for (let i = 0; i < keys.length; i++) {
                        let key = keys[i];
                        doc[key] = data[key];
                    }
                    if (doc.triggerChange && !options.noTrigger)
                        doc.triggerChange();
                }
            }

            _defaults(content) {
                if (this.processor) {
                    var kind = this.kind;
                    if (kind) {
                        this.processor.defaults(kind, content);
                    }
                }
            }

            _traverseFilename(v, cb) {
                var type = DataObject.getType(v);
                var i;
                if (type === 'array') {
                    for (i = 0; i < v.length; i++) {
                        this._traverseFilename(v[i], cb);
                    }
                } else if (type === 'object') {
                    if (v.filename) {
                        cb(v);
                    } else {
                        var keys = Object.keys(v);
                        for (i = 0; i < keys.length; i++) {
                            this._traverseFilename(v[keys[i]], cb);
                        }
                    }
                }
            }

            _findFilename(v, filename) {
                var r = [];
                if (!Array.isArray(filename) && typeof filename !== 'undefined') filename = [filename];
                this._traverseFilename(v, function (v) {
                    if (typeof filename === 'undefined') {
                        r.push(v);
                    } else if (filename.indexOf(String(v.filename)) !== -1) {
                        r.push(v);
                    }
                });
                return r;
            }

            _deleteFilename(v, filename) {
                var filenames = this._findFilename(v, filename);
                for (var i = 0; i < filenames.length; i++) {
                    delete filenames[i].filename;
                }
            }

            untypeUrl(v) {
                this._traverseFilename(v, v => {
                    if (v.data && v.data.url) {
                        delete v.data;
                    }
                });
            }

            typeUrl(v, entry) {
                this._traverseFilename(v, v => {
                    var filename = String(v.filename);
                    if (!entry._attachments) return;
                    var att = entry._attachments[filename];
                    if (!att) return;
                    var contentType = att.content_type;
                    var vtype = Util.contentTypeToType(contentType);
                    var prop;
                    if (typeValue.indexOf(vtype) !== -1) {
                        prop = 'value';
                    } else {
                        prop = 'url';
                    }
                    v.data = {
                        type: vtype || 'string'
                    };
                    v.data[prop] = `${this.entryUrl}/${entry._id}/${v.filename}`;
                });
            }
        }

        function createOptions(options, type, custom) {
            var messages = Object.assign({}, defaultOptions.messages, messagesByType[type], options && options.messages);
            options = Object.assign({}, defaultOptions, options, custom);
            if (messages) options.messages = messages;
            options.type = type;
            return options;
        }

        function handleError(ctx, options) {
            return function (err) {
                if (!options.mute || !options.muteError) {
                    if (err.status || err.timeout) { // error comes from superagent
                        handleSuperagentError(err, ctx, options);
                    } else {
                        defaultErrorHandler(err);
                    }
                }
                // Propagate error
                throw err;
            };
        }

        function handleSuccess(ctx, options) {
            return function (data) {
                if (!options.mute && !options.muteSuccess) {
                    if (data.status) {
                        handleSuperagentSuccess(data, ctx, options);
                    } else if (options.type && options.type.match(/attachment/i)) {
                        handleSuperagentSuccess({status: 200}, ctx, options);
                    }
                }
                return data;
            };
        }

        function handleSuperagentSuccess(data, ctx, options) {
            const message = options.messages[data.status] || ctx.messages[data.status];
            if (message && !options.disableNotification) {
                ui.showNotification(message, 'success');
            }
        }

        function handleSuperagentError(err, ctx, options) {
            const message = options.messages[err.status] || ctx.messages[err.status];
            if (message && !options.disableNotification) {
                ui.showNotification(message, 'error');
                Debug.error(err, err.stack);
            }
        }

        function getUuid(entry) {
            var uuid;
            var type = DataObject.getType(entry);
            if (type === 'string') {
                uuid = entry;
            } else if (type === 'object') {
                uuid = entry._id;
            } else {
                throw new Error('Bad arguments');
            }
            return String(uuid);
        }

        function getTokenId(token) {
            var id;
            var type = DataObject.getType(token);
            if (type === 'string') {
                id = token;
            } else if (type === 'object') {
                id = token.$id;
            } else {
                throw new Error('Bad arguments');
            }
            return String(id);
        }

        function defaultErrorHandler(err) {
            ui.showNotification(`Error: ${err.message}`, 'error');
            Debug.error(err, err.stack);
        }

        function setContentType(attachment, fallback) {
            fallback = fallback || 'application/octet-stream';
            var filename = attachment.filename;
            var contentType = attachment.contentType;
            if (contentType && contentType !== 'application/octet-stream') {
                return;
            }

            // Ideally jcamp extensions should be handled by mime-types
            attachment.contentType = mimeTypes.lookup(filename, fallback) || fallback;
        }

        function addSearch(requestUrl, options) {
            for (let i = 0; i < viewSearchJsonify.length; i++) {
                if (options[viewSearchJsonify[i]]) {
                    requestUrl.addSearch(viewSearchJsonify[i], JSON.stringify(options[viewSearchJsonify[i]]));
                }
            }

            for (let i = 0; i < viewSearch.length; i++) {
                if (options[viewSearch[i]]) {
                    requestUrl.addSearch(viewSearch[i], options[viewSearch[i]]);
                }
            }
        }

        const typeValue = ['gif', 'tiff', 'jpeg', 'jpg', 'png'];


        return Roc;
    });
