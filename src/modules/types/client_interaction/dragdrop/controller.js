define(['modules/default/defaultcontroller', 'src/util/api', 'src/util/versioning', 'src/data/structures'], function (Default, API, Versioning, Structure) {

    function Controller() {
    }

    var reg = new RegExp(";base64,(.+)$");

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'Drag and drop',
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

        var types = Structure._getList(), l = types.length, typeList = new Array(l);
        for (var i = 0; i < l; i++) {
            typeList[i] = {key: types[i], title: types[i]};
        }

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
                            type: "combo",
                            title: "filter on",
                            options: [
                                {title: "File extension", key: "ext"},
                                {title: "Mime-type", key: "mime"}
                            ],
                            "default": "ext"
                        },
                        extension: {
                            type: "text",
                            title: "Filter",
                            "default": "*"
                        },
                        filetype: {
                            type: "combo",
                            title: "Read type",
                            options: [
                                {title: "Text", key: "text"},
                                {title: "Base64 Encoded", key: "base64"},
                                {title: "Object URL", key: "url"}/*, {title: "Binary string", key: "binary"}, {title: "Array buffer", key: "b"}*/
                            ],
                            "default": "text"
                        },
                        type: {
                            type: "combo",
                            title: "Force type",
                            options: typeList,
                            "default": "string"
                        },
                        mime: {
                            type: "text",
                            title: "Force mime-type"
                        },
                        variable: {
                            type: "text",
                            title: "Temporary variable",
                            "default": "file"
                        }
                    }
                },
                string: {
                    options: {
                        type: 'table',
                        multiple: false,
                        title: 'For strings'
                    },
                    fields: {
                        type: {
                            type: "combo",
                            title: "Force type",
                            options: typeList,
                            "default": "string"
                        },
                        variable: {
                            type: "text",
                            title: "Temporary variable",
                            "default": "str"
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
        vars: ['groups', 'vars', 0],
        string: ['groups', 'string', 0, 0]
    };

    Controller.prototype.initImpl = function () {
        var i, ii, cfgEl, eCfgEl;

        var fileCfg = this.module.getConfiguration('vars');
        if(fileCfg) {

            var enhancedFileCfg = [];
            for(i = 0, ii = fileCfg.length; i < ii; i++) {
                cfgEl = fileCfg[i];
                eCfgEl = $.extend({}, cfgEl);
                enhancedFileCfg.push(eCfgEl);
                if(cfgEl.extension) {
                    eCfgEl.match = new RegExp('^' + cfgEl.extension.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
                } else {
                    ecfgEl.match = /^.*$/i;
                }
                if(!cfgEl.filter) {
                    eCfgEl.filter = "ext";
                }
            }
            this.fileCfg = enhancedFileCfg;

        }

        this.stringCfg = this.module.getConfiguration('string');

        this.resolveReady();

    };

    Controller.prototype.parseString = function (value, meta) {
        try {
            var result = Structure._parse(meta.cfg.type, value);
            this.tmpVar(result, meta);
        } catch (e) {
        }
    };

    Controller.prototype.open = function (data, transferType) {

        if (!data.items.length)
            return;

        this.module.model.tmpVars = new DataObject();
        this.module.model.tmpVarsArray = new DataObject();

        var that = this;
        var defs = [];

        var cfg = this.fileCfg;
        var cfgString = this.stringCfg;

        var i = 0, ii = data.items.length, item, meta, def;
        for (; i < ii; i++) {
            item = data.items[i];
            def = $.Deferred();
            defs.push(def);
            if (item.kind === "file") {
                item = item.getAsFile();
                if (meta = this.checkMetadata(item, cfg)) {
                    meta.def = def;
                    this.read(item, meta);
                } else {
                    def.resolve();
                }
            } else {
                this.treatString(item, {
                    filename: "",
                    mime: "",
                    def: def,
                    cfg: cfgString
                });
            }
        }

        $.when.apply(window, defs).done(function () {
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

    Controller.prototype.checkMetadata = function (item, cfg) {
        if (!cfg) {
            return console.warn("No filter configured");
        }

        item.name = item.name || "";
        var split = item.name.split("."), ext, lineCfg;
        if (split.length < 2) {
            ext = "";
        } else {
            ext = split.pop().toLowerCase();
        }
        for (var i = 0, l = cfg.length; i < l; i++) {
            var filter = cfg[i].filter;
            if(filter === "ext") {
                var extensions = cfg[i].extension;
                if (extensions === "*" || extensions.split(',').indexOf(ext) !== -1) {
                    lineCfg = cfg[i];
                    break;
                }
            } else {
                var matcher = cfg[i].match;
                var mime = item.type;
                if(matcher.test(mime)) {
                    lineCfg = cfg[i];
                    break;
                }
            }
        }
        if (!lineCfg && item.name) {
            return console.warn("Extension " + ext + " not configured (filename: " + item.name + ")");
        } else if(!lineCfg) {
            return console.warn("Item has no filename and mime-type doesn't match: " + item.type);
        }

        return {
            filename: item.name,
            mime: lineCfg.mime || item.type || "application/octet-stream",
            cfg: lineCfg
        };
    };

    Controller.prototype.fileRead = function (result, meta) {
        switch (meta.cfg.filetype) {
            case 'text':
                this.parseString(result, meta);
                break;

            case 'base64':
                var base64 = reg.exec(result)[1];
                this.tmpVar(base64, meta);
                break;

            case 'url':
                this.tmpVar(result, meta);
                break;

            /*case 'binary':
             reader.readAsBinaryString(file);
             break;

             case 'buffer':
             reader.readAsArrayBuffer(file);
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
            console.error(e);
        };

        switch (meta.cfg.filetype) {
            case 'text':
                reader.readAsText(file);
                break;

            case 'base64':
            case 'url':
                reader.readAsDataURL(file);
                break;

            /*case 'binary':
             reader.readAsBinaryString(file);
             break;

             case 'buffer':
             reader.readAsArrayBuffer(file);
             break;*/
        }
    };

    Controller.prototype.tmpVar = function (obj, meta) {
        var name = meta.cfg.variable;
        var variable = new DataObject({
            filename: meta.filename,
            mimetype: meta.mime,
            content: obj
        }, true);
        if (!this.module.model.tmpVarsArray[name])
            this.module.model.tmpVarsArray[name] = new DataArray();
        this.module.model.tmpVarsArray[name].push(variable);
        this.module.model.tmpVars[name] = variable;

        meta.def.resolve();
    };

    return Controller;
});