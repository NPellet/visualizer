'use strict';

define([
    'src/util/api',
    'src/util/ui',
    'superagent',
    'uri/URI',
    'lodash',
    'src/util/couchdbAttachments'
],
    function (API, ui, superagent, URI, _, CDB) {
        var defaultOptions = {
            messages: {}
        };

        var viewSearch = ['key', 'startkey', 'endkey'];
        var mandatoryOptions = ['url', 'database'];

        class Roc {
            constructor(opts) {
                this.url = opts.url;
                this.view = opts.view;
                this.database = opts.database;
                this.messages = opts.messages || {};
                this.showNotifications = opts.showNotifications;


                this.requestUrl = new URI(opts.url);
                this.databaseUrl = this.requestUrl.directory(`${this.requestUrl.directory()}/db/${this.database}`).normalize().href();
                this.entryUrl = `${this.databaseUrl}entry`;

                if (this.view) {
                    this.requestUrl = new URI(`${this.databaseUrl}_view/${this.view}`);

                    for (let i = 0; i < viewSearch.length; i++) {
                        if (opts[viewSearch[i]]) {
                            this.requestUrl.addSearch(viewSearch[i], JSON.stringify(opts[viewSearch[i]]));
                        }
                    }

                    this.requestUrl = this.requestUrl.normalize().href();
                }

                this.varName = opts.varName;
                this.refresh();
            }

            init() {
                if (!this.view) {
                    return Promise.resolve({});
                }
                return superagent.get(this.requestUrl)
                    .withCredentials()
                    .then(res => {
                        if (res && res.body && res.status == 200) {
                            API.createData(this.varName, res.body);
                            this.data = res.body;
                        }
                        return res;
                    });
            }

            getByUuid(uuid, options) {
                options = createOptions(options);
                return this.__ready.then(() => {
                    if (!options.force && this.view) {
                        return this._findByUuid(uuid);
                    } else {
                        return superagent.get(`${this.entryUrl}/${uuid}`)
                            .withCredentials()
                            .end()
                            .then(res => {
                                if (res.body && res.status == 200) {
                                    this._updateByUuid(uuid, res.body);
                                    return res.body;
                                }
                            }).catch(handleError(this, options));
                    }
                });
            }

            _updateByUuid(uuid, data) {
                var idx = this._findIndexByUuid(uuid);
                if (idx !== -1) {
                    console.log('set child sync', idx, data);
                    this.data.setChildSync([idx], data);
                }
            }

            getById(id, options) {
                options = createOptions(options);
                var id = DataObject.resurrect(id);
                return this.__ready.then(() => {
                    if (!options.force && this.view) {
                        return this._findById(id);
                    } else {
                        throw new Error('Not yet possible get by id');
                    }
                }).catch(handleError(this, options));
            }

            _findByUuid(uuid) {
                return this.data.find(entry => String(entry._id) === String(uuid));
            }

            _findIndexByUuid(uuid) {
                return this.data.findIndex(entry => String(entry._id) === String(uuid));
            }

            _findById(id) {
                id = DataObject.resurrect(id);
                return this.data.find(entry => _.isEqual(id, DataObject.resurrect(entry.$id)));
            }

            create(toSave, options) {
                options = createOptions(options);
                return this.__ready
                    .then(() => {
                        return superagent.post(this.entryUrl)
                            .withCredentials()
                            .send(toSave)
                            .end();
                    })
                    .then(handleSuccess(this, options))
                    .then(res => {
                        if (res.body && (res.status == 200 || res.status == 201)) {
                            return this.getByUuid(res.body.id, {force: true});
                        }
                    })
                    .then(entry => {
                        if (!entry) return;
                        this.data.push(entry);
                        this.data.triggerChange();
                    }).catch(handleError(this, options));
            }

            update(entry, options) {
                options = createOptions(options);
                // Todo force
                return this.__ready.then(() => {
                    return superagent.put(`${this.entryUrl}/${String(entry._id)}`)
                        .withCredentials()
                        .send(entry);
                })
                    .then(handleSuccess)
                    .then(res => {
                        if (res.body && res.status == 200) {
                            if (this.view) {
                                this._updateByUuid(entry._id, entry);
                            }
                        }
                    }).catch(handleError(this, options));
            }

            refresh(options) {
                options = createOptions(options);
                this.__ready = this.init()
                    .then(handleSuccess(this, options))
                    .catch(handleError(this, options));
            }

            _getCdb(uuid) {
                const docUrl = `${this.entryUrl}/${String(uuid)}`;
                return new CDB(docUrl);
            }

            removeAttachmentsByUuid(uuid, attachments, options) {
                options = createOptions(options);
                if (Array.isArray(attachments) && attachments.length === 0) return [];
                return this.__ready.then(() => {
                    const cdb = this._getCdb(uuid);
                    return cdb.remove(attachments)
                        .then(attachments => {
                            return this.getByUuid(uuid, {force: true}).then(data => {
                                console.log('got doc', data);
                                this._updateByUuid(uuid, data);
                                return attachments;
                            });
                        });
                }).catch(handleError(this, options));
            }

            addAttachmentsByUuid(uuid, attachments, options) {
                options = createOptions(options);
                return this.__ready.then(() => {
                    const cdb = this._getCdb(uuid);
                    return cdb.inlineUploads(attachments)
                        .then(attachments => {
                            return this.getByUuid(uuid, {force: true}).then(data => {
                                console.log('got document', data);
                                this._updateByUuid(uuid, data);
                                return attachments;
                            });
                        });
                }).catch(handleError(this, options));
            }

            addAttachmentsById(id, attachment, options) {
                options = createOptions(options);
                return this.__ready.then(() => {
                    var uuid = this._findById(id)._id;
                    return this.addAttachmentsByUuid(uuid, attachment);
                }).catch(handleError(this, options));
            }


            removeByUuid(uuid, options) {
                options = createOptions(options);
                uuid = String(uuid);
                if (options.force) {
                    var prom = Promise.resolve();
                } else {
                    prom = this.__ready;
                }
                return prom.then(() => {
                    return superagent.del(`${this.entryUrl}/${uuid}`)
                        .withCredentials()
                        .end();
                })
                    .then(handleSuccess(this, options))
                    .then(res => {
                        if (res.body && res.status == 200) {
                            var idx = this._findIndexByUuid(uuid);
                            if (idx !== -1) {
                                this.data.splice(idx, 1);
                                this.data.triggerChange();
                            }
                        }
                        return res;
                    }).catch(handleError(this, options));
            }
        }

        function createOptions(options) {
            if (options && options.message) {
                var messages = Object.assign(defaultOptions.message, options.messages);
            }
            options = Object.assign(defaultOptions, options);
            if (messages) options.messages = messages;
            return options;
        }

        function handleError(ctx, options) {
            return function (err) {
                if (err.status || err.timeout) { // error comes from superagent
                    handleSuperagentError(err, ctx, options);
                }
                // Propagate error
                throw err;
            };
        }

        function handleSuccess(ctx, options) {
            return function (data) {
                if (data.status) {
                    handleSuperagentSuccess(data, ctx, options);
                }
                return data;
            };
        }

        function handleSuperagentSuccess(data, ctx, options) {
            if (ctx.showNotifications) {
                const message = options.messages[data.status] || ctx.messages[data.status];
                if (message) {
                    ui.showNotification(message, 'success');
                }
            }
        }

        function handleSuperagentError(err, ctx, options) {
            if (ctx.showNotifications) {
                const message = options.messages[err.status] || ctx.messages[err.status];
                if (message) {
                    ui.showNotification(message, 'error');
                }
            }
        }

        return Roc;
    });

