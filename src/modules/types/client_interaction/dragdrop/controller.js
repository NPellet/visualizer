define(['modules/default/defaultcontroller', 'src/util/api', 'src/util/versioning', 'src/data/structures'], function(Default, API, Versioning, Structure) {

    function controller() {
    }

    var reg = new RegExp(";base64,(.+)$");

    controller.prototype = $.extend(true, {}, Default);

    controller.prototype.moduleInformation = {
        moduleName: 'Drag and drop',
        description: 'Drop a file or paste some content to load',
        author: 'Norman Pellet / Michaël Zasso',
        date: '03.04.2014',
        license: 'MIT',
        cssClass: 'dragdrop'
    };

    controller.prototype.references = {
        data: {
            label: 'The loaded data'
        },
        dataarray: {
            label: 'Array of loaded data'
        }
    };

    controller.prototype.events = {
        onRead: {
            label: 'The data has been read',
            refVariable: ['data','dataarray']
        }
    };

    controller.prototype.configurationStructure = function() {

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
                        extension: {
                            type: "text",
                            title: "File extension(s)",
                            "default": "*"
                        },
                        filetype: {
                            type: "combo",
                            title: "Read type",
                            options: [{title: "Text", key: "text"}, {title: "Base64 Encoded", key: "base64"}/*, {title: "Binary string", key: "binary"}, {title: "Array buffer", key: "b"}*/],
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

    controller.prototype.configAliases = {
        vartype: ['groups', 'group', 0, 'vartype', 0],
        label: ['groups', 'group', 0, 'label', 0],
        dragoverlabel: ['groups', 'group', 0, 'dragoverlabel', 0],
        hoverlabel: ['groups', 'group', 0, 'hoverlabel', 0],
        vars: ['groups', 'vars', 0],
        string: ['groups', 'string', 0, 0]
    };

    controller.prototype.parseString = function(value, meta) {
        try {
            var result = Structure._parse(meta.cfg.type, value);
            this.tmpVar(result, meta);
        } catch(e) {}
    };

    controller.prototype.open = function(data) {

        if (!data.items.length)
            return;
        
        this.module.model.tmpVars = new DataObject();
        this.module.model.tmpVarsArray = new DataObject();
        
        var that = this;
        var defs = [];
        
        var cfg = this.module.getConfiguration('vars');
        var cfgString = this.module.getConfiguration('string');
                
        var i = 0, ii = data.items.length, item, meta, def;
        for(; i < ii; i++) {
            item = data.items[i];
            def = $.Deferred();
            defs.push(def);
            if(item.kind === "file") {
                item = item.getAsFile();
                if(meta = this.checkMetadata(item, cfg)) {
                    meta.def = def;
                    this.read(item, meta);
                } else {
                    def.resolve();
                    continue;
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
                
        $.when.apply(window, defs).done(function(){
            that.setVarFromEvent('onRead', that.module.model.tmpVars, 'data');
            that.setVarFromEvent('onRead', that.module.model.tmpVarsArray, 'dataarray');
        });
    };
    
    controller.prototype.treatString = function(item, meta) {
        var that = this;
        item.getAsString(function(str){
            that.parseString(str, meta);
        });  
    };
    
    controller.prototype.checkMetadata = function(item, cfg) {
        if(!cfg) {
            return console.warn("No extension configured");
        }
        var split = item.name.split("."), ext, lineCfg;
        if(split.length<2) {
            ext = "";
        } else {
            ext = split.pop().toLowerCase();
        }
        for (var i = 0, l = cfg.length; i < l; i++) {
            var extensions = cfg[i].extension;
            if (extensions === "*" || extensions.split(',').indexOf(ext) !== -1) {
                lineCfg = cfg[i];
                break;
            }
        }
        if(! lineCfg) {
            return console.warn("Extension " + ext + " not configured (filename: "+item.name+")");
        }
        return {
            filename: item.name,
            mime: lineCfg.mime||item.type||"application/octet-stream",
            cfg: lineCfg
        };
    };
    
    controller.prototype.fileRead = function(result, meta) {
        switch (meta.cfg.filetype) {
            case 'text':
                this.parseString(result, meta);
                break;

            case 'base64':
                var base64 = reg.exec(result)[1];
                this.tmpVar(base64, meta);
                break;

            /*case 'binary':
                reader.readAsBinaryString(file);
                break;

            case 'buffer':
                reader.readAsArrayBuffer(file);
                break;*/
        }
    };

    controller.prototype.read = function(file, meta) {
        var that = this;
        var reader = new FileReader();
        reader.onload = function(e) {
            that.fileRead(e.target.result, meta);
        };
        reader.onerror = function(e) {
            console.error(e);
        };

        switch (meta.cfg.filetype) {
            case 'text':
                reader.readAsText(file);
                break;

            case 'base64':
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

    controller.prototype.tmpVar = function(obj, meta) {
        var name = meta.cfg.variable;
        var variable = new DataObject({
            filename: meta.filename,
            mimetype: meta.mime,
            content: obj
        }, true);
        if(!this.module.model.tmpVarsArray[name])
            this.module.model.tmpVarsArray[name] = new DataArray();
        this.module.model.tmpVarsArray[name].push(variable);
        this.module.model.tmpVars[name] = variable;

        meta.def.resolve();
    };

    return controller;
});