'use strict';

define(['modules/default/defaultcontroller', 'src/util/api', 'src/util/versioning', 'src/data/structures', 'src/util/debug', 'src/util/util'], function (Default, API, Versioning, Structure, Debug, Util) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Drag and drop',
        description: 'Drop a file or paste some content to load',
        author: 'Norman Pellet, Michaël Zasso',
        date: '31.07.2014',
        license: 'MIT',
        cssClass: 'dragdrop'
    };

    Controller.prototype.references = {
        data: {
            label: 'First data element'
        },
        dataarray: {
            label: 'Array of loaded data'
        }
    };

    Controller.prototype.events = {
        onRead: {
            label: 'The data has been read',
            refVariable: ['data', 'dataarray']
        }
    };

    Controller.prototype.configurationStructure = function () {

        var typeList = Util.getStructuresComboOptions();

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        label: {
                            type: 'text',
                            title: 'Text displayed by default',
                            'default': 'Drop your file here'
                        },
                        dragoverlabel: {
                            type: 'text',
                            title: 'Text displayed on drag'
                        },
                        hoverlabel: {
                            type: 'text',
                            title: 'Text displayed on hover'
                        },
                        getusermedia: {
                            type: 'checkbox',
                            title: 'Use getUserMedia',
                            options: {yes: 'Yes'},
                            default: []
                        },
                        capture: {
                            type: 'combo',
                            title: 'Capture',
                            options: [
                                {title: 'none', key: 'none'},
                                {title: 'camera', key: 'camera'},
                                {title: 'camcorder', key: 'camcorder'},
                                {title: 'microphone', key: 'microphone'}
                            ],
                            default: 'none'
                        }
                    }
                },
                vars: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'For files'
                    },
                    fields: {
                        filter: {
                            type: 'combo',
                            title: 'filter on',
                            options: [
                                {title: 'File extension', key: 'ext'},
                                {title: 'Mime-type', key: 'mime'}
                            ],
                            'default': 'ext'
                        },
                        extension: {
                            type: 'text',
                            title: 'Filter',
                            'default': '*'
                        },
                        filetype: {
                            type: 'combo',
                            title: 'Read type',
                            options: [
                                {title: 'Text', key: 'text'},
                                {title: 'Base64 Encoded', key: 'base64'},
                                {title: 'Object URL', key: 'url'},
                                {title: 'Array buffer', key: 'buffer'}
                                /*{title: 'Binary string', key: 'binary'}*/
                            ],
                            'default': 'text'
                        },
                        type: {
                            type: 'combo',
                            title: 'Force type',
                            options: typeList,
                            'default': 'string'
                        },
                        mime: {
                            type: 'text',
                            title: 'Force mime-type'
                        },
                        variable: {
                            type: 'text',
                            title: 'Temporary variable',
                            'default': 'file'
                        }
                    }
                },
                string: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'For strings'
                    },
                    fields: {
                        type: {
                            type: 'combo',
                            title: 'Force type',
                            options: typeList,
                            'default': 'string'
                        },
                        filter: {
                            type: 'text',
                            title: 'filter (mime-type)',
                            'default': 'text/plain'
                        },
                        variable: {
                            type: 'text',
                            title: 'Temporary variable',
                            'default': 'str'
                        }
                    }
                },

                photo: {
                    options: {
                        type: 'table',
                        multiple: false,
                        title: 'For photos'
                    },
                    fields: {
                        variable: {
                            type: 'text',
                            title: 'Temporary variable',
                            'default': 'photo'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        vartype: ['groups', 'group', 0, 'vartype', 0],
        label: ['groups', 'group', 0, 'label', 0],
        dragoverlabel: ['groups', 'group', 0, 'dragoverlabel', 0],
        hoverlabel: ['groups', 'group', 0, 'hoverlabel', 0],
        getusermedia: ['groups', 'group', 0, 'getusermedia', 0],
        vars: ['groups', 'vars', 0],
        string: ['groups', 'string', 0],
        photo: ['groups', 'photo', 0],
        showPhotoButton: ['groups', 'group', 0, 'showPhotoButton', 0],
        capture: ['groups', 'group', 0, 'capture', 0]
    };

    Controller.prototype.initImpl = function () {
        var i, ii, cfgEl, eCfgEl;

        var fileCfg = this.module.getConfiguration('vars');
        if (fileCfg) {

            var enhancedFileCfg = [];
            for (i = 0, ii = fileCfg.length; i < ii; i++) {
                cfgEl = fileCfg[i];
                eCfgEl = $.extend({}, cfgEl);
                enhancedFileCfg.push(eCfgEl);
                if (cfgEl.extension) {
                    eCfgEl.match = new RegExp('^' + cfgEl.extension.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
                } else {
                    eCfgEl.match = /^.*$/i;
                }
                if (!cfgEl.filter) {
                    eCfgEl.filter = 'ext';
                }
            }
            this.fileCfg = enhancedFileCfg;

        }

        var stringCfg = this.module.getConfiguration('string');
        if (stringCfg) {

            var enhancedStringCfg = [];
            for (i = 0, ii = stringCfg.length; i < ii; i++) {
                cfgEl = stringCfg[i];
                eCfgEl = $.extend({}, cfgEl);
                enhancedStringCfg.push(eCfgEl);
                if (cfgEl.filter) {
                    eCfgEl.match = new RegExp('^' + cfgEl.filter.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
                } else {
                    eCfgEl.match = /^text\/plain$/i;
                }
            }
            this.stringCfg = enhancedStringCfg;

            this.photoCfg = this.module.getConfiguration('photo');

        }

        this.resolveReady();

    };

    Controller.prototype.parseString = function (value, meta) {
        try {
            if(meta.cfg.type) {
                var result = Structure._parse(meta.cfg.type, value);
            } else {
                result = value;
            }
            this.tmpVar(result, meta);
        } catch (e) {
            Debug.info('Value could not be parsed: ', value, e);
        }
    };

    Controller.prototype.open = function (data) {
        if (!(data.items && data.items.length) && !data.files.length)
            return;

        this.module.model.tmpVars = new DataObject();
        this.module.model.tmpVarsArray = new DataObject();

        var that = this;
        var defs = [];

        var cfg = this.fileCfg;
        var cfgString = this.stringCfg;

        var i, item, meta, def;
        if (data.items) { // only supported by Chrome
            for (i = 0; i < data.items.length; i++) {
                item = data.items[i];
                def = $.Deferred();
                defs.push(def);
                if (item.kind === 'file') {
                    item = item.getAsFile();
                    if (meta = this.checkFileMetadata(item, cfg)) {
                        meta.def = def;
                        this.read(item, meta);
                    } else {
                        def.resolve();
                    }
                } else {
                    if (meta = this.checkStringMetadata(item, cfgString)) {
                        meta.def = def;
                        this.treatString(item, meta);
                    } else {
                        def.resolve();
                    }
                }
            }
        } else { // other browsers are limited to drop files
            for (i = 0; i < data.files.length; i++) {
                item = data.files[i];
                def = $.Deferred();
                defs.push(def);
                if (meta = this.checkFileMetadata(item, cfg)) {
                    meta.def = def;
                    this.read(item, meta);
                } else {
                    def.resolve();
                }
            }
        }

        $.when.apply(window, defs).done(function () {
            that.createDataFromEvent('onRead', 'data', that.module.model.tmpVars);
            that.createDataFromEvent('onRead', 'dataarray', that.module.model.tmpVarsArray);
        });
    };

    Controller.prototype.openPhoto = function (result) {
        var that = this;
        var meta = this.checkPhotoMetadata(this.photoCfg);
        meta.def = $.Deferred();
        this.fileRead(result, meta);

        meta.def.done(function () {
            that.createDataFromEvent('onRead', 'data', that.module.model.tmpVars);
            that.createDataFromEvent('onRead', 'dataarray', that.module.model.tmpVarsArray);
        });
    };

    Controller.prototype.treatString = function (item, meta) {
        var that = this;
        item.getAsString(function (str) {
            that.parseString(str, meta);
        });
    };

    Controller.prototype.checkStringMetadata = function (item, cfg) {
        if (!cfg) {
            return Debug.warn('No string filter configured');
        }

        var mime = item.type || 'text/plain',
            lineCfg;

        for (var i = 0, l = cfg.length; i < l; i++) {
            var matcher = cfg[i].match;
            if (matcher.test(mime)) {
                lineCfg = cfg[i];
                break;
            }
        }

        if (!lineCfg) {
            return Debug.warn("String item's mime-type doesn't match: " + mime);
        }

        return {
            filename: '',
            mime: mime,
            cfg: lineCfg
        };
    };

    Controller.prototype.checkFileMetadata = function (item, cfg) {
        if (!cfg) {
            return Debug.warn('No file filter configured');
        }

        var name = item.name || '',
            mime = item.type,
            split = name.split('.'),
            ext, lineCfg;
        if (split.length < 2) {
            ext = '';
        } else {
            ext = split.pop().toLowerCase();
        }
        for (var i = 0, l = cfg.length; i < l; i++) {
            var filter = cfg[i].filter;
            if (filter === 'ext') {
                var extensions = cfg[i].extension;
                if (extensions === '*' || extensions.split(',').indexOf(ext) !== -1) {
                    lineCfg = cfg[i];
                    break;
                }
            } else {
                var matcher = cfg[i].match;
                if (matcher.test(mime)) {
                    lineCfg = cfg[i];
                    break;
                }
            }
        }
        if (!lineCfg && name) {
            return Debug.warn('Extension ' + ext + ' not configured (filename: ' + name + ')');
        } else if (!lineCfg) {
            return Debug.warn("Item has no filename and mime-type doesn't match: " + mime);
        }

        return {
            filename: name,
            mime: lineCfg.mime || mime || 'application/octet-stream',
            cfg: lineCfg
        };
    };

    Controller.prototype.checkPhotoMetadata = function (cfg) {
        var lineCfg = cfg[0];

        lineCfg.filetype = 'url';
        lineCfg.type = 'png';
        return {
            mime: 'image/png',
            cfg: lineCfg
        };
    };

    Controller.prototype.fileRead = function (result, meta) {
        switch (meta.cfg.filetype) {
            case 'text':
                this.parseString(result, meta);
                break;

            case 'base64':
                var b64idx = result.indexOf(';base64,');
                this.tmpVar(result.substr(b64idx + 8), meta);
                break;

            case 'url':
            case 'buffer':
                this.tmpVar(result, meta);
                break;

            /*case 'binary':
             reader.readAsBinaryString(file);
             break;*/
        }
    };

    Controller.prototype.read = function (file, meta) {
        var that = this;
        var reader = new FileReader();
        reader.onload = function (e) {
            that.fileRead(e.target.result, meta);
        };
        reader.onerror = function (e) {
            Debug.error(e);
        };

        switch (meta.cfg.filetype) {
            case 'text':
                reader.readAsText(file);
                break;

            case 'base64':
            case 'url':
                reader.readAsDataURL(file);
                break;

            case 'buffer':
                reader.readAsArrayBuffer(file);
                break;

            /*case 'binary':
             reader.readAsBinaryString(file);
             break;*/
        }
    };

    Controller.prototype.tmpVar = function (obj, meta) {
        if (typeof obj !== 'object' && meta.cfg.type) {
            obj = {
                type: meta.cfg.type,
                value: obj
            };
        }
        var name = meta.cfg.variable;
        var variable = new DataObject({
            filename: meta.filename,
            mimetype: meta.mime,
            contentType: meta.mime,
            content: obj
        });
        if (!this.module.model.tmpVarsArray[name])
            this.module.model.tmpVarsArray[name] = new DataArray();
        this.module.model.tmpVarsArray[name].push(variable);
        this.module.model.tmpVars[name] = variable;

        meta.def.resolve();
    };

    Controller.prototype.emulDataTransfer = function (e) {
        var emul = {};
        emul.files = e.target.files;
        emul.items = [];
        for (var i = 0; i < e.target.files.length; i++) {
            (function (i) {
                emul.items.push({
                    kind: 'file',
                    getAsFile: function () {
                        return e.target.files[i];
                    }
                });
            })(i);

        }
        return emul;
    };

    return Controller;

});
