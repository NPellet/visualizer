'use strict';

/**
 * Main visualizer API
 * @module src/util/api
 */
define([
  './cache',
  './actionmanager',
  './util',
  './ui',
  './versioning',
  './config',
  'src/main/variables',
  'src/main/datas',
  'lodash',
  'src/main/grid',
], function (
  Cache,
  ActionManager,
  Util,
  UI,
  Versioning,
  Config,
  Variables,
  Data,
  _,
) {
  var variableFilters;

  var loadingSVG = Util.getLoadingAnimation(64, 'slateblue');
  var loadingHtml = $('<div>', { id: 'ci-loading' })
    .append(loadingSVG)
    .append(
      $('<div>', {
        id: 'ci-loading-message',
        class: 'ci-loading-subtitle',
      }),
    );
  var loading = {};
  var loadingNumber = 0;

  function setHighlightId(id, value, senderId) {
    this.repositoryHighlights.set(id, value, null, senderId);
  }

  var exports = {
    getRepositoryData() {
      return this.repositoryData;
    },

    setRepositoryData(repo) {
      this.repositoryData = repo;
    },

    getRepositoryHighlights() {
      return this.repositoryHighlights;
    },

    setRepositoryHighlights(repo) {
      this.repositoryHighlights = repo;
    },

    getRepositoryActions() {
      return this.repositoryActions;
    },

    setRepositoryActions(repo) {
      this.repositoryActions = repo;
    },

    listenHighlight() {
      if (!arguments[0] || arguments[0]._highlight === undefined) {
        return;
      }

      arguments[0] = arguments[0]._highlight;
      this.repositoryHighlights.listen.apply(
        this.repositoryHighlights,
        arguments,
      );
    },

    killHighlight() {
      this.repositoryHighlights.kill.apply(
        this.repositoryHighlights,
        arguments,
      );
    },

    highlightId: setHighlightId,

    getAllFilters() {
      return variableFilters;
    },

    setAllFilters(filters) {
      variableFilters = _([filters, variableFilters])
        .flatten()
        .filter((v) => v && v.name && v.file)
        .uniq((v) => v.file)
        .unshift({
          file: '',
          name: 'No filter',
        })
        .value();
    },

    isViewLocked() {
      return Versioning.isViewLocked();
    },

    viewLock() {
      return Versioning.viewLock();
    },

    getContextMenu() {
      return Config.contextMenu();
    },

    /* Extra functions used in filter testsuite. Allows compatibility of filters */
    /* eslint-disable no-unused-vars */
    dev_fctCalled(fct) {},
    dev_fctUncalled(fct) {},
    dev_assert(family, script, value) {},
    /* eslint-enable no-unused-vars */
  };

  /**
   * Check if a variable is defined
   * @param {string} varName - Name of the variable
   * @return {boolean}
   */
  exports.existVariable = function existVariable(varName) {
    return Variables.exist(varName);
  };
  exports.existVar = exports.existVariable;

  /**
   * Set a variable using a jpath
   * @param {string} name - Name of the variable
   * @param {Variable} [sourceVariable] - Source variable. If set, the new variable will be created relative to its jpath
   * @param {string[]} jpath
   * @param {string} [filter] - Url of the filter to use with this variable
   * @return {Promise}
   */
  exports.setVariable = function setVariable(
    name,
    sourceVariable,
    jpath,
    filter,
  ) {
    if (Array.isArray(sourceVariable)) {
      filter = jpath;
      jpath = sourceVariable;
      sourceVariable = null;
    }
    jpath = jpath || [];
    var jpathNewVar = !sourceVariable
      ? jpath
      : sourceVariable.getjPath().concat(jpath);

    return Variables.setVariable(name, jpathNewVar, false, filter);
  };
  exports.setVar = exports.setVariable;

  /**
   * Create new data and set a variable to it
   * @param {string} name - Name of the variable
   * @param {*} data - Data to set
   * @param {string} [filter] - Url of the filter to use with this variable
   * @return {Promise}
   */
  exports.createData = function createData(name, data, filter) {
    return exports.createDataJpath(name, data, [], filter);
  };

  exports.createDataJpath = function createDataJpath(
    name,
    data,
    jpath,
    filter,
  ) {
    data = Data.check(Data.resurrect(data), true);
    if (data && data.trace) {
      return data
        .trace(jpath)
        .then((data) => Variables.setVariable(name, false, data, filter));
    } else {
      return Variables.setVariable(name, false, data, filter);
    }
  };

  /**
   * Get a variable by name
   * @param {string} name - Name of the variable
   * @return {Variable}
   */
  exports.getVariable = function getVariable(name) {
    return Variables.getVariable(name);
  };
  exports.getVar = exports.getVariable;

  /**
   * Get the DataObject associated to a variable
   * @param {string} varName - Name of the variable
   * @return {*} - DataObject or undefined
   */
  exports.getData = function getData(varName) {
    return exports.getVariable(varName).getData();
  };

  /**
   * Change the state of a highlight
   * @param {object|Array} element - Object with a _highlight property or array of highlight IDs
   * @param {boolean} onOff
   */
  exports.setHighlight = function setHighlight(element, onOff) {
    if (!element) return;

    if (Array.isArray(element)) {
      element = { _highlight: element };
    }

    if (element._highlight === undefined) {
      return;
    }

    this.repositoryHighlights.set(element._highlight, onOff);
  };
  exports.highlight = exports.setHighlight;

  /**
   * Set a loading message or change the value of an existing message
   * @param {string} id - ID of the message
   * @param {string} [message] - Message content (default: value of the ID)
   */
  exports.loading = function setLoading(id, message) {
    if (!message) {
      message = id;
    }

    if (loadingNumber == 0) {
      $('#ci-visualizer').append(loadingHtml);
    }

    if (!loading[id]) {
      loading[id] = $(`<div>${message}</div>`);
      loadingNumber++;

      $('#ci-loading-message').append(loading[id]);
    } else {
      loading[id].html(message);
    }
  };

  /**
   * Remove a loading message
   * @param {string} id - ID of the message
   */
  exports.stopLoading = function stopLoading(id) {
    if (loading[id]) {
      loadingNumber--;
      loading[id].detach();
      loading[id] = null;

      if (loadingNumber == 0) {
        loadingHtml.detach();
      }
    }
  };

  /**
   * Send an action to all modules and global action scripts
   * @param {string} name - Action name
   * @param {*} [value] - Action value
   */
  exports.doAction = function doAction(name, value) {
    if (Data.isSpecialObject(value)) {
      value = value.get();
    }
    this.repositoryActions.set(name, value);
    ActionManager.execute(name, value);
  };

  exports.domToHTML = async function domToHTML(dom) {
    let canvases = dom.querySelectorAll('canvas');
    // clone the original dom, we also need to copy the canvas
    let domCopy = dom.cloneNode(true);
    let canvasesCopy = domCopy.querySelectorAll('canvas');
    for (let i = 0; i < canvases.length; i++) {
      const png = canvases[i].toDataURL('image/png');
      canvasesCopy[i].parentElement.innerHTML = `<img src="${png}" />`;
    }

    let svgs = dom.querySelectorAll('svg');
    let svgsCopy = domCopy.querySelectorAll('svg');

    const promises = [];

    for (let i = 0; i < svgs.length; i++) {
      const svgDOM = svgs[i];
      const svgDOMCopy = svgsCopy[i];
      const width = svgDOM.clientWidth;
      const height = svgDOM.clientHeight;
      const svgString = svgDOM.outerHTML;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const image = new Image();
      const svg = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svg);

      const promise = new Promise((resolve) => {
        image.addEventListener('load', () => {
          ctx.drawImage(image, 0, 0);
          const png = canvas.toDataURL('image/png');
          const img = document.createElement('img');
          img.src = png;
          svgDOMCopy.replaceWith(img);
          URL.revokeObjectURL(url);
          resolve();
        });
      });
      promises.push(promise);
      image.src = url;
    }

    await Promise.all(promises);
    return domCopy.innerHTML;
  };

  exports.copyHTMLToClipboard = async function copyHTMLToClipboard(html) {
    const type = 'text/html';
    if (typeof ClipboardItem === 'undefined') {
      UI.showNotification(
        'Copy to clipboard not supported in this browser',
        'error',
      );
      return;
    }
    const blob = new Blob([html], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
      () => {
        UI.showNotification('Copied to clipboard', 'success');
      },
      () => {
        UI.showNotification('Failed to copy to clipboard', 'error');
      },
    );
  };

  exports.getModule = function getModule(moduleId) {
    const ModuleFactory = require('modules/modulefactory');
    return ModuleFactory.getModule(moduleId);
  };

  exports.getModulePreferences = function getModulePreferences(moduleId) {
    const ModuleFactory = require('modules/modulefactory');
    const module = ModuleFactory.getModule(moduleId);
    const currentPreferences = module.definition.configuration;
    const aliases = module.controller.configAliases;

    function getValue(alias) {
      let path = aliases[alias];
      var currentElement = currentPreferences;
      for (let i = 0; i < path.length; i++) {
        currentElement = currentElement[path[i]];
        if (currentElement === undefined) {
          break;
        }
      }
      return currentElement;
    }

    const preferences = {};
    for (let alias in aliases) {
      preferences[alias] = getValue(alias);
    }

    return preferences;
  };

  exports.updateModulePreferences = function updateModulePreferences(
    moduleId,
    values,
  ) {
    const ModuleFactory = require('modules/modulefactory');
    const module = ModuleFactory.getModule(moduleId);
    var currentPreferences = module.definition.configuration;
    var aliases = module.controller.configAliases;

    var cfgEl;

    function getCfgEl(alias) {
      var cfgEl = currentPreferences;
      for (var i = 0, l = alias.length - 1; i < l; i++) {
        cfgEl = cfgEl[alias[i]];
        if (cfgEl === undefined) {
          break;
        }
      }
      return cfgEl;
    }

    for (var i in values) {
      if (Object.hasOwn(values, i)) {
        var alias = aliases[i];
        if (alias) {
          cfgEl = getCfgEl(aliases[i]);
          cfgEl[0] = values[i];
        }
      }
    }

    module.reload();
  };

  /**
   * @deprecated
   * Execute a global visualizer action. This is deprecated. Use API.doAction instead.
   * @param {string} name - Action name
   * @param {*} value - Action value
   */
  exports.executeAction = Util.deprecate(function executeAction(name, value) {
    ActionManager.execute(name, value);
  }, 'API.doAction is the recommended method.');

  /**
   * Cache a value in memory or retrieve it. The value can be retrieved anywhere API is available
   * @param {string} name - Name of the cached value
   * @param {*} [value] - New value to set
   * @return {*} The cached value or undefined if used as a setter
   */
  exports.cache = function cacheHandler(name, value) {
    if (arguments.length === 1) {
      return Cache.get(name);
    } else {
      Cache.set(name, value);
    }
  };

  /*
   * Set the cache to an empty object
   */
  exports.cache.clear = function clearCache() {
    return Cache.clear();
  };

  exports.getLayerNames = function () {
    return require('src/main/grid').getLayerNames();
  };

  exports.switchToLayer = function (name, options) {
    return require('src/main/grid').switchToLayer(name, options);
  };

  exports.getActiveLayerName = function () {
    return require('src/main/grid').getActiveLayerName();
  };

  exports.preventUnload = function (message) {
    // Needs to be global for clear.
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    window.onbeforeunload = function (e) {
      e.returnValue = message;
      return message;
    };
  };

  exports.clearPreventUnload = function () {
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    window.onbeforeunload = null;
  };

  exports.onAction = function onAction(names, callback) {
    return exports.getRepositoryActions().listen(names, callback);
  };

  exports.offAction = function (actionId) {
    return exports.getRepositoryActions().unlisten(actionId);
  };

  exports.require = Util.require;

  ActionManager.setAPI(exports);

  return exports;
});
