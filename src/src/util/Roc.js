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
        var viewSearch = ['key', 'startkey', 'endkey'];
        var mandatoryOptions = ['url', 'database'];

        class Roc {
            constructor(opts) {
                this.url = opts.url;
                this.view = opts.view;
                this.database = opts.database;


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
                    return Promise.resolve();
                }
                superagent.get(this.requestUrl)
                    .withCredentials()
                    .then(res => {
                        if (res && res.body && res.status == 200) {
                            API.createData(this.varName, res.body);
                            this.data = res.body;
                        }
                    });
            }

            getByUuid(uuid, force) {
                return this.__ready.then(() => {
                    if (!force && this.view) {
                        return this._findByUuid(uuid);
                    } else {
                        console.log('force get');
                        return superagent.get(`${this.entryUrl}/${uuid}`)
                            .withCredentials()
                            .end()
                            .then(res => {
                                if (res.body && res.status == 200) {
                                    this._updateByUuid(uuid, res.body);
                                    return res.body;
                                }
                            });
                    }
                });
            }

            _updateByUuid(uuid, data) {
                var idx = this._findIndexByUuid(uuid);
                if(idx !== -1) {
                    this.data.setChildSync([idx], data);
                }
            }

            getById(id, force) {
                var id = DataObject.resurrect(id);
                return this.__ready.then(() => {
                    if (!force && this.view) {
                        return this._findById(id);
                    } else {
                        throw new Error('Not yet possible get by id');
                    }
                });
            }

            _findByUuid(uuid) {
                return this.data.find(entry => String(entry._id) === String(uuid));
            }

            _findIndexByUuid(uuid) {
                this.data.findIndex(entry => String(entry._id) === String(uuid));
            }

            _findById(id) {
                id = DataObject.resurrect(id);
                return this.data.find(entry => _.isEqual(id, DataObject.resurrect(entry.$id)));
            }

            create(toSave) {
                return this.__ready
                    .then(() => {
                        return superagent.post(this.entryUrl)
                            .withCredentials()
                            .send(toSave)
                            .end();
                    })
                    .then(res => {
                        if (res.body && (res.status == 200 || res.status == 201)) {
                            return this.getByUuid(res.body.id, true);
                        } else {
                            console.log(res);
                        }
                    })
                    .then(entry => {
                        if (!entry) return;
                        this.data.push(entry);
                        this.data.triggerChange();
                    });
            }

            update(entry, force) {
                return this.__ready.then(() => {
                    return superagent.put(`${this.entryUrl}/${String(entry._id)}`)
                        .withCredentials()
                        .send(entry);
                }).then(res => {
                    if (res.body && res.status == 200) {
                        if (this.view) {
                            this._updateByUuid(entry._id, entry);
                        }

                    }
                });
            }

            refresh() {
                this.__ready = this.init();
            }

            _getCdb(uuid) {
                const docUrl = `${this.entryUrl}/${String(uuid)}`;
                return new CDB(docUrl);
            }

            removeAttachmentsByUuid(uuid, attachments) {
                if (Array.isArray(attachments) && attachments.length === 0) return [];
                return this.__ready.then(() => {
                    const cdb = this._getCdb(uuid);
                    return cdb.remove(attachments)
                        .then(attachments => {
                            return this.getByUuid(uuid, true).then(data => {
                                this._updateByUuid(uuid, data)
                                return attachments;
                            });
                        });
                })
            }

            addAttachmentsByUuid(uuid, attachments) {
                return this.__ready.then(() => {
                    const cdb = this._getCdb(uuid);
                    return cdb.inlineUploads(attachments)
                        .then(attachments => {
                            return this.getByUuid(uuid, true).then(data => {
                                this._updateByUuid(uuid, data)
                                return attachments;
                            });
                        });
                });
            }

            addAttachmentsById(id, attachment) {
                return this.__ready.then(() => {
                    var uuid = this._findById(id)._id;
                    return this.addAttachmentsByUuid(uuid, attachment);
                });
            }


            removeByUuid(uuid, force) {
                uuid = String(uuid);
                if (force) {
                    var prom = Promise.resolve();
                } else {
                    prom = this.__ready;
                }
                return prom.then(() => {
                    return superagent.del(`${this.entryUrl}/${uuid}`)
                        .withCredentials()
                        .end();
                }).then(res => {
                    if (res.body && res.status == 200) {
                        var idx = this.data.findIndex(entry => {
                            return String(entry._id) === uuid;
                        });
                        if (idx !== -1) {
                            this.data.splice(idx, 1);
                            this.data.triggerChange();
                        }
                    }
                });
            }
        }

        return Roc;
    });

