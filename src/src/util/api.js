'use strict';

/**
 * Main visualizer API
 * @module src/util/api
 */
define(['src/util/datatraversing', 'src/util/actionmanager', 'src/main/variables'], function (Traversing, ActionManager, Variables) {

    var variableFilters;
    var viewLocked = false;

    // Default List of what should appear in the context menu
    // Based on the name attribute of the li tag of the context menu
    // If all is set everything will appear no matter what
    // If undefined is set then not setting the name attribute will add it anyway
    var contextMenu = ['undefined', 'all', 'global-configuration', 'configuration', 'copy', 'paste', 'duplicate', 'add', 'layers', 'remove', 'export', 'print', 'refresh', 'tofront', 'toback', 'move', 'custom', 'fullscreen'];

    var loadingHtml = $('<div id="loading-visualizer"><div class="title">Loading</div><div class="animation"><div /><div /><div /><div /></div><div class="subtitle" id="loading-message"></div></div>');
    var loading = {};
    var loadingNumber = 0;

    function createDataJpath(name, data, jpath, filter) {

        data = DataObject.check(data, true);

        if (data && data.getChild) {

            data.getChild(jpath).then(function (data) {

                Variables.setVariable(name, false, data, filter);
            });

        } else {
            Variables.setVariable(name, false, data, filter);
        }

    }

    function setHighlightId(id, value) {
        this.repositoryHighlights.set(id, value);
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

        resetVariables: function () {

            Variables.eraseAll();

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

        doAction: function (key, value) {
            this.repositoryActions.set(key, value);
        },

        executeAction: function (name, value) {

            ActionManager.execute(name, value);
        },

        getAllFilters: function () {
            return variableFilters;
        },

        setAllFilters: function (filters) {

            variableFilters = filters;
            variableFilters.unshift({file: '', name: 'No filter'});
        },

        viewLock: function () {
            $('body').addClass('locked');
            viewLocked = true;
        },

        isViewLocked: function () {
            return viewLocked;
        },

        setContextMenu: function (ctxMenu) {
            contextMenu = ctxMenu;
        },

        getContextMenu: function () {
            return contextMenu;
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
        var jpathNewVar = ( !sourceVariable ) ? jpath : sourceVariable.getjPath().concat(jpath);

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
     * Change the state of a highlight
     * @param {object|array} element - Object with a _highlight property or array of highlight IDs
     * @param {boolean} onOff
     */
    exports.setHighlight = function setHighlight(element, onOff) {
        if (!element)
            return;

        if (element instanceof Array) {
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

            $('#loading-message').append(loading[id]);
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

    return exports;

});