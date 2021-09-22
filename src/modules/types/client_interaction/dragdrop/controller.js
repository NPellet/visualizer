'use strict';

define([
  'jquery',
  'modules/default/defaultcontroller',
  'src/util/api',
  'src/util/versioning',
  'src/data/structures',
  'src/util/debug',
  'src/util/util',
  'src/util/ui',
  'src/util/mimeTypes',
], function (
  $,
  Default,
  API,
  Versioning,
  Structure,
  Debug,
  Util,
  ui,
  mimeTypes,
) {
  function Controller() {
    this.flushData = this.flushData.bind(this);
  }

  $.extend(true, Controller.prototype, Default);

  Controller.prototype.moduleInformation = {
    name: 'Drag and drop',
    description: 'Drop a file or paste some content to load',
    author: 'Norman Pellet, Michaël Zasso',
    date: '31.07.2014',
    license: 'MIT',
    cssClass: 'dragdrop',
  };

  Controller.prototype.references = {
    data: {
      label: 'First data element',
    },
    dataarray: {
      label: 'Array of loaded data',
    },
  };

  Controller.prototype.events = {
    onRead: {
      label: 'The data has been read',
      refVariable: ['data', 'dataarray'],
      refAction: ['data', 'dataarray'],
    },
  };

  Controller.prototype.configurationStructure = function () {
    const typeList = Util.getStructuresComboOptions();
    return {
      groups: {
        group: {
          options: {
            type: 'list',
          },
          fields: {
            label: {
              type: 'text',
              title: 'Text displayed by default',
              default: 'Drop your file here',
            },
            dragoverlabel: {
              type: 'text',
              title: 'Text displayed on drag',
            },
            hoverlabel: {
              type: 'text',
              title: 'Text displayed on hover drop / paste area',
              default: "Drag'n drop or paste here",
            },
            fileSelectLabel: {
              type: 'text',
              title: 'Text displayed on file select button',
              default: 'Select file',
            },
            labelFontSize: {
              type: 'float',
              title: 'Size of the label text',
              default: 26,
            },
            checkOptions: {
              type: 'checkbox',
              title: 'General options',
              options: {
                promptAmbiguous: 'Prompt for filename when ambiguous',
              },
              default: ['promptAmbiguous'],
            },
            inputOptions: {
              type: 'checkbox',
              title: 'Input options',
              options: {
                allowDrop: 'Allow files to be dropped',
                allowPaste: 'Allow text to be pasted',
                allowCamera: 'Allow taking pictures with camera',
                allowFileInput: 'Allow open file dialog',
                showFileInputButton: 'Show file input button',
              },
              default: ['allowDrop', 'allowPaste', 'allowFileInput'],
            },
          },
        },
        vars: {
          options: {
            type: 'table',
            multiple: true,
            title: 'For files',
          },
          fields: {
            filter: {
              type: 'combo',
              title: 'filter on',
              options: [
                { title: 'File extension', key: 'ext' },
                { title: 'Mime-type', key: 'mime' },
              ],
              default: 'ext',
            },
            extension: {
              type: 'text',
              title: 'Filter',
              default: '*',
            },
            filetype: {
              type: 'combo',
              title: 'Read type',
              options: [
                { title: 'Text', key: 'text' },
                { title: 'Base64 Encoded', key: 'base64' },
                { title: 'Object URL', key: 'url' },
                { title: 'Array buffer', key: 'buffer' },
                /* {title: 'Binary string', key: 'binary'}*/
              ],
              default: 'text',
            },
            type: {
              type: 'combo',
              title: 'Force type',
              options: typeList,
              default: '',
            },
            mime: {
              type: 'text',
              title: 'Force mime-type',
            },
            variable: {
              type: 'text',
              title: 'Temporary variable',
              default: 'file',
            },
          },
        },
        string_general: {
          options: {
            type: 'list',
            title: 'For strings (general)',
          },
          fields: {
            askFilename: {
              type: 'checkbox',
              title: 'Ask for filename',
              options: { yes: 'Yes' },
              default: [],
            },
          },
        },
        string: {
          options: {
            type: 'table',
            multiple: true,
            title: 'For strings',
          },
          fields: {
            filter: {
              type: 'combo',
              title: 'filter on',
              options: [
                { title: 'File extension', key: 'ext' },
                { title: 'Mime-type', key: 'mime' },
              ],
              default: 'ext',
            },
            extension: {
              type: 'text',
              title: 'Filter',
              default: '*',
            },
            type: {
              type: 'combo',
              title: 'Force type',
              options: typeList,
              default: '',
            },
            mime: {
              type: 'text',
              title: 'Force mime-type',
            },
            variable: {
              type: 'text',
              title: 'Temporary variable',
              default: 'str',
            },
          },
        },

        photo: {
          options: {
            type: 'table',
            multiple: false,
            title: 'For photos',
          },
          fields: {
            variable: {
              type: 'text',
              title: 'Temporary variable',
              default: 'photo',
            },
          },
        },
      },
    };
  };

  Controller.prototype.configAliases = {
    vartype: ['groups', 'group', 0, 'vartype', 0],
    label: ['groups', 'group', 0, 'label', 0],
    dragoverlabel: ['groups', 'group', 0, 'dragoverlabel', 0],
    hoverlabel: ['groups', 'group', 0, 'hoverlabel', 0],
    fileSelectLabel: ['groups', 'group', 0, 'fileSelectLabel', 0],
    labelFontSize: ['groups', 'group', 0, 'labelFontSize', 0],
    inputOptions: ['groups', 'group', 0, 'inputOptions', 0],
    vars: ['groups', 'vars', 0],
    string: ['groups', 'string', 0],
    photo: ['groups', 'photo', 0],
    showPhotoButton: ['groups', 'group', 0, 'showPhotoButton', 0],
    capture: ['groups', 'group', 0, 'capture', 0],
    checkOptions: ['groups', 'group', 0, 'checkOptions', 0],
    askFilename: ['groups', 'string_general', 0, 'askFilename', 0],
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
          eCfgEl.match = new RegExp(
            `^${cfgEl.extension.replace(/\*/g, '.*').replace(/\?/g, '.')}$`,
            'i',
          );
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
          eCfgEl.match = new RegExp(
            `^${cfgEl.extension.replace(/\*/g, '.*').replace(/\?/g, '.')}$`,
            'i',
          );
        } else {
          eCfgEl.match = /^text\/plain$/i;
        }
        eCfgEl.filetype = 'text';
      }
      this.stringCfg = enhancedStringCfg;

      this.photoCfg = this.module.getConfiguration('photo');
    }

    this.resolveReady();
  };

  Controller.prototype.parseString = function (value, meta) {
    try {
      if (meta.cfg.type) {
        var result = Structure._parse(meta.cfg.type, value);
      } else {
        result = value;
      }
      this.tmpVar(result, meta);
    } catch (e) {
      Debug.info('Value could not be parsed: ', value, e);
    }
  };

  function treatMultiplePaste(items) {
    var pitems = [];
    for (let i = 0; i < items.length; i++) {
      let item = items[i];
      pitems.push({
        kind: item.kind,
        type: item.type === 'text/plain' ? 'auto' : item.type,
        str: new Promise(function (resolve) {
          item.getAsString(resolve);
        }),
        id: i,
      });
    }

    return pitems;
  }

  Controller.prototype.open = function (data) {
    if (!(data.items && data.items.length) && !data.files.length) return;

    var items;

    var multiplePaste = true;
    for (let i = 0; i < data.items.length; i++) {
      if (data.items[i].kind !== 'string') multiplePaste = false;
    }
    if (data.items.length === 1) multiplePaste = false;

    if (multiplePaste) {
      items = treatMultiplePaste(data.items);
    } else {
      items = data.items;
    }

    this.module.model.tmpVars = new DataObject();
    this.module.model.tmpVarsArray = new DataObject();

    var defs = [];

    var cfg = this.fileCfg;
    var cfgString = this.stringCfg;

    var i, item, meta, def;
    if (items) {
      // only supported by Chrome
      if (multiplePaste) {
        var meta = {};
        meta.cfg = cfgString;
        meta.def = $.Deferred();
        defs.push(meta.def);
        this.treatMultipleString(items, meta);
      } else {
        for (i = 0; i < items.length; i++) {
          item = items[i];
          def = $.Deferred();
          defs.push(def);
          if (item.kind === 'file') {
            item = item.getAsFile();
            if (
              (meta = this.checkMetadata(
                item,
                cfg,
                mimeFromName('application/octet-stream'),
              ))
            ) {
              meta.def = def;
              this.read(item, meta);
            } else {
              def.resolve();
            }
          } else {
            meta = {};
            meta.cfg = cfgString;
            meta.def = def;
            this.treatString(item, meta);
          }
        }
      }
    } else {
      // other browsers are limited to drop files
      for (i = 0; i < data.files.length; i++) {
        item = data.files[i];
        def = $.Deferred();
        defs.push(def);
        if (
          (meta = this.checkMetadata(
            item,
            cfg,
            mimeFromName('application/octet-stream'),
          ))
        ) {
          meta.def = def;
          this.read(item, meta);
        } else {
          def.resolve();
        }
      }
    }

    $.when.apply(window, defs).done(this.flushData);
  };

  Controller.prototype.openPhoto = function (result) {
    var meta = this.checkPhotoMetadata(this.photoCfg);
    meta.def = $.Deferred();
    this.fileRead(result, meta);

    meta.def.done(this.flushData);
  };

  Controller.prototype.flushData = function () {
    this.createDataFromEvent('onRead', 'data', this.module.model.tmpVars);
    this.sendActionFromEvent('onRead', 'data', this.module.model.tmpVars);
    this.createDataFromEvent(
      'onRead',
      'dataarray',
      this.module.model.tmpVarsArray,
    );
    this.sendActionFromEvent(
      'onRead',
      'dataarray',
      this.module.model.tmpVarsArray,
    );
    this.module.model.tmpVars = new DataObject();
    this.module.model.tmpVarsArray = new DataObject();
  };

  Controller.prototype.treatMultipleString = function (items, meta) {
    ui.choose(items, {
      noConfirmation: true,
      returnRow: true,
      idField: 'id',
      columns: [
        {
          id: 'key',
          name: 'content-type',
          field: 'type',
        },
      ],
    }).then((row) => {
      if (row.type === 'auto') row.type = '';
      if (row == undefined) {
        meta.def.resolve();
        return;
      }
      row.getAsString = function (cb) {
        row.str.then(cb);
      };
      this.treatString(row, meta);
    });
  };

  Controller.prototype.treatString = function (item, meta) {
    var description = getDescription(meta.cfg);
    item.getAsString((str) => {
      if (this.module.getConfigurationCheckbox('askFilename', 'yes')) {
        ui.enterValue({
          description: description,
          label: 'Enter filename',
          validationMessage: 'Incorrect file extension',
          validation: (val) => {
            return this.checkMetadata(
              item,
              meta.cfg,
              mimeFromName('text/plain'),
              val,
            );
          },
        }).then((val) => {
          if (val == undefined) return;
          var m = this.checkMetadata(
            item,
            meta.cfg,
            mimeFromName('text/plain'),
            val,
          );
          if (!m) {
            meta.def.resolve();
            return;
          }
          Object.assign(meta, m);
          this.parseString(str, meta);
        });
      } else {
        var m = this.checkMetadata(item, meta.cfg, mimeFromName('text/plain'));
        if (!m) {
          meta.def.resolve();
          return;
        }
        Object.assign(meta, m);
        this.parseString(str, meta);
      }
    });
  };

  Controller.prototype.checkMetadata = function (item, cfg, getMime, name) {
    if (!cfg) {
      return Debug.warn('No file filter configured');
    }

    name = name || item.name || '';
    var mime = item.type || getMime(name);
    var split = name.split('.'),
      ext,
      lineCfg;
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
    if (!lineCfg) {
      var msg = `Did not find match for ${name} (${mime})`;
      ui.showNotification(msg, 'warn');
      return Debug.warn(msg);
    }

    return {
      filename: name,
      mime: lineCfg.mime || mime || 'application/octet-stream',
      cfg: lineCfg,
    };
  };

  Controller.prototype.checkPhotoMetadata = function (cfg) {
    var lineCfg = cfg[0];

    lineCfg.filetype = 'url';
    lineCfg.type = 'png';
    return {
      mime: 'image/png',
      cfg: lineCfg,
    };
  };

  Controller.prototype.fileRead = function (result, meta) {
    switch (meta.cfg.filetype) {
      case 'text': {
        this.parseString(result, meta);
        break;
      }
      case 'base64': {
        const b64idx = result.indexOf(';base64,');
        this.tmpVar(result.substr(b64idx + 8), meta);
        break;
      }
      case 'url':
      case 'buffer': {
        this.tmpVar(result, meta);
        break;
      }
    }
  };

  Controller.prototype.read = async function (item, meta) {
    if (
      meta.filename === 'image.png' &&
      this.module.getConfigurationCheckbox('checkOptions', 'promptAmbiguous')
    ) {
      const value = await ui.enterValue({
        label: 'Enter image name (without file extension)',
        validationMessage: 'Incorrect file extension',
        validation: (val) => {
          return this.checkMetadata(
            item,
            this.fileCfg,
            'image/png',
            `${val}.png`,
          );
        },
      });
      if (value == null) {
        meta.def.resolve();
        return;
      }
      // eslint-disable-next-line require-atomic-updates
      meta.filename = `${value}.png`;
    }
    var reader = new FileReader();
    reader.onload = (e) => {
      this.fileRead(e.target.result, meta);
    };
    reader.onerror = (e) => {
      Debug.error(e);
    };
    switch (meta.cfg.filetype) {
      case 'text': {
        reader.readAsText(item);
        break;
      }
      case 'base64':
      case 'url': {
        reader.readAsDataURL(item);
        break;
      }
      case 'buffer': {
        reader.readAsArrayBuffer(item);
        break;
      }
    }
  };

  Controller.prototype.tmpVar = function (obj, meta) {
    if (typeof obj !== 'object' && meta.cfg.type) {
      obj = {
        type: meta.cfg.type,
        value: obj,
      };
    }
    var name = meta.cfg.variable;
    var variable = new DataObject({
      encoding: meta.cfg.filetype,
      filename: meta.filename,
      mimetype: meta.mime,
      contentType: meta.mime,
      content: obj,
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
          },
        });
      })(i);
    }
    return emul;
  };

  function mimeFromName(defaultType) {
    return function (name) {
      return mimeTypes.lookup(name) || defaultType;
    };
  }

  function getDescription(cfg) {
    var d = '';
    for (let i = 0; i < cfg.length; i++) {
      var c = cfg[i];
      if (c.filter === 'mime') {
        d += 'Mime: ';
      } else {
        d += 'Extension: ';
      }
      d += `${c.extension}<br>`;
    }
    d += '<br><br>';
    return d;
  }

  return Controller;
});
