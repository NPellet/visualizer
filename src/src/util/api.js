'use strict';

/**
 * Main visualizer API
 * @module src/util/api
 */
define([
    'src/util/datatraversing',
    'src/util/actionmanager',
    'src/main/variables',
    'src/util/util',
    'src/main/datas',
    'src/util/versioning',
    'src/util/config',
    'lodash',
    'src/main/grid'
], function (Traversing, ActionManager, Variables, Util, Data, Versioning, Config, _) {

    var variableFilters;

    var loadingSVG = Util.getLoadingAnimation(64, 'slateblue');
    var loadingHtml = $('<div>', {id: 'ci-loading'})
        .append(loadingSVG)
        .append($('<div>', {id: 'ci-loading-message', 'class': 'ci-loading-subtitle'}));
    var loading = {};
    var loadingNumber = 0;

    function createDataJpath(name, data, jpath, filter) {
        if (data && data.__parent) {
            data = data.resurrect();
        }
        data = DataObject.check(data, true);

        if (data && data.trace) {

            data.trace(jpath).then(function (data) {

                Variables.setVariable(name, false, data, filter);
            });

        } else {
            Variables.setVariable(name, false, data, filter);
        }

    }

    function setHighlightId(id, value, senderId) {
        this.repositoryHighlights.set(id, value, null, senderId);
    }


    var exports = {

        getRepositoryData: function () {
            return this.repositoryData;
        },

        setRepositoryData: function (repo) {
            this.repositoryData = repo;
        },

        getRepositoryHighlights: function () {
            return this.repositoryHighlights;
        },

        setRepositoryHighlights: function (repo) {
            this.repositoryHighlights = repo;
        },

        getRepositoryActions: function () {
            return this.repositoryActions;
        },

        setRepositoryActions: function (repo) {
            this.repositoryActions = repo;
        },

        createDataJpath: createDataJpath,

        listenHighlight: function () {

            if (!arguments[0] || typeof arguments[0]._highlight == 'undefined') {
                return;
            }

            arguments[0] = arguments[0]._highlight;
            this.repositoryHighlights.listen.apply(this.repositoryHighlights, arguments);
        },

        killHighlight: function () {
            this.repositoryHighlights.kill.apply(this.repositoryHighlights, arguments);
        },

        highlightId: setHighlightId,

        getAllFilters: function () {
            return variableFilters;
        },

        setAllFilters: function (filters) {
            variableFilters = _([filters, variableFilters]).flatten().filter(function (v) {
                return v && v.name && v.file;
            }).uniq(function (v) {
                return v.file;
            }).unshift({
                file: '',
                name: 'No filter'
            }).value();
        },

        isViewLocked: function () {
            return Versioning.isViewLocked();
        },

        viewLock: function () {
            return Versioning.viewLock();
        },

        getContextMenu: function () {
            return Config.contextMenu();
        },

        /* Extra functions used in filter testsuite. Allows compatibility of filters */
        dev_fctCalled: function (fct) {
        },
        dev_fctUncalled: function (fct) {
        },
        dev_assert: function (family, script, value) {
        }

    };

    /**
     * Check if a variable is defined
     * @param {string} varName - Name of the variable
     * @returns {boolean}
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
     */
    exports.setVariable = function setVariable(name, sourceVariable, jpath, filter) {
        if (Array.isArray(sourceVariable)) {
            filter = jpath;
            jpath = sourceVariable;
            sourceVariable = null;
        }
        jpath = jpath || [];
        var jpathNewVar = (!sourceVariable) ? jpath : sourceVariable.getjPath().concat(jpath);

        Variables.setVariable(name, jpathNewVar, false, filter);
    };
    exports.setVar = exports.setVariable;

    /**
     * Create new data and set a variable to it
     * @param {string} name - Name of the variable
     * @param {*} data - Data to set
     * @param {string} [filter] - Url of the filter to use with this variable
     */
    exports.createData = function createData(name, data, filter) {
        Variables.setVariable(name, false, data, filter);
    };

    /**
     * Get a variable by name
     * @param {string} name - Name of the variable
     * @returns {Variable}
     */
    exports.getVariable = function getVariable(name) {
        return Variables.getVariable(name);
    };
    exports.getVar = exports.getVariable;

    /**
     * Get the DataObject associated to a variable
     * @param {string} varName - Name of the variable
     * @returns {*} - DataObject or undefined
     */
    exports.getData = function getData(varName) {
        return exports.getVariable(varName).getData();
    };

    /**
     * Change the state of a highlight
     * @param {object|array} element - Object with a _highlight property or array of highlight IDs
     * @param {boolean} onOff
     */
    exports.setHighlight = function setHighlight(element, onOff) {
        if (!element)
            return;

        if (Array.isArray(element)) {
            element = {_highlight: element};
        }

        if (typeof element._highlight == 'undefined') {
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
            loading[id] = $('<div>' + message + '</div>');
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

    /**
     * @deprecated
     * Execute a global visualizer action. This is deprecated. Use API.doAction instead.
     * @param {string} name - Action name
     * @param {*} value - Action value
     */
    exports.executeAction = Util.deprecate(function executeAction(name, value) {
        ActionManager.execute(name, value);
    }, 'API.doAction is the recommended method.');

    var cache = {};

    /**
     * Cache a value in memory or retrieve it. The value can be retrieved anywhere API is available
     * @param {string} name - Name of the cached value
     * @param {*} [value] - New value to set
     * @returns {*} The cached value or undefined if used as a setter
     */
    exports.cache = function cacheHandler(name, value) {
        if (arguments.length === 1) {
            return cache[name];
        } else {
            cache[name] = value;
        }
    };

    /**
     * Set the cache to an empty object
     */
    exports.cache.empty = function emptyCache() {
        cache = {};
    };

    exports.getLayerNames = function () {
        return require('src/main/grid').getLayerNames();
    };

    exports.switchToLayer = function (name) {
        return require('src/main/grid').switchToLayer(name);
    };

    exports.getActiveLayerName = function () {
        return require('src/main/grid').getActiveLayerName();
    };

    return exports;

});
