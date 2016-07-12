'use strict';

define([
    'jquery',
    'lodash',
    'src/util/context',
    'src/util/api',
    'src/util/util',
    'src/util/fullscreen',
    'src/util/debug',
    'src/main/variables',
    'src/util/ui',
    'version',
    'forms/form',
    'src/main/grid'
], function ($, _, ContextMenu, API, Util, Fullscreen, Debug, Variables, ui, Version, Form) {
    function init(module) {
        //define object properties
        var originalURL = String(module.definition.getChildSync(['url'], true).get());
        var moduleURL = Util.rewriteRequirePath(originalURL);
        if (moduleURL[moduleURL.length - 1] !== '/') {
            moduleURL = moduleURL + '/';
        }

        module.viewReady = new Promise(function (res, rej) {
            module._resolveView = res;
        });

        module.controllerReady = new Promise(function (res, rej) {
            module._resolveController = res;
        });

        module.modelReady = new Promise(function (res, rej) {
            module._resolveModel = res;
        });

        module._onReady = Promise.all([module.viewReady, module.controllerReady, module.modelReady]);
        module._onReady.then(function () {
            module.updateAllView();
        }, function (err) {
            Debug.error('Caught error in module ready state', err);
        }).catch(function (err) {
            Debug.error('Caught error while updating module', err);
        });

        return new Promise(
            function (resolve, reject) {
                if (!moduleURL) {
                    reject();
                    return;
                }

                if (Version.includedModuleCss.indexOf(Util.moduleIdFromUrl(originalURL)) > -1) {
                    module._cssLoaded = Promise.resolve();
                } else {
                    module._cssLoaded = Util.loadCss(moduleURL + 'style.css');
                }
                require([
                    moduleURL + 'model',
                    moduleURL + 'view',
                    moduleURL + 'controller'
                ], function (M, V, C) {
                    module.model = new M();
                    module.view = new V();
                    module.controller = new C();

                    if (!module.controller.moduleInformation) {
                        return;
                    }

                    module.dom = $(module.buildDom());
                    module.bindToolbar();

                    module.domContent = module.dom.children().children('.ci-module-content');
                    module.domHeader = module.dom.children().children('.ci-module-header');
                    module.domLoading = module.dom.children().children('.ci-module-loading');
                    module.domWrapper = module.dom;

                    module.view.setModule(module);
                    module.controller.setModule(module);
                    module.model.setModule(module);

                    module.view.initDefault();
                    module.view.init();
                    module.controller.init();
                    module.model.init();

                    resolve(module);
                }, function (err) {
                    return reject(err);
                });
            }
        );
    }

    var Module = function (definition) {
        this.definition = DataObject.recursiveTransform(definition);
        this.definition.configuration = this.definition.configuration || new DataObject();

        this.definition.layers = this.definition.layers || new DataObject(); // View on which layers ?

        this.ready = init(this);
        this.ready.catch(function (err) {
            Debug.error('Caught error in module initialization.', err);
        });
    };

    Module.prototype = {
        buildDom: function () {
            var html = '';
            html += '<div class="ci-module-wrapper ci-module-displaywrapper ci-module-';
            html += this.controller.moduleInformation.cssClass;


            html += '" data-module-id="';
            html += this.definition.id;
            html += '"';

            html += ' style="z-index: ';
            html += this.definition.zindex || 0;
            html += '"';

            html += '><div class="ci-module"><div class="ci-module-header';


            html += '"><div class="ci-module-header-title">';
            html += this.definition.title;
            html += '</div>';
            html += '<div class="ci-module-header-toolbar">';
            html += '<ul>';
            html += '</ul>';
            html += '</div>';
            html += '</div><div class="ci-module-content">';

            html += '</div>';

            html += '<div class="ci-module-loading">Loading ...</div>';
            html += '</div>';
            return html;
        },

        setCustomStyle: function () {
            var css = this.definition.css;
            if (!css) return;
            css = css[0];
            var style = {
                fontSize: css.fontSize[0],
                fontFamily: css.fontFamily[0]
            };
            this.dom.find('.ci-module-content').css(style);
        },

        drawToolbar: function () {
            var isLocked = API.isViewLocked();
            var $ul = this.dom.find('.ci-module-header-toolbar ul');
            var toolbar = this.controller.getToolbar();
            var html = '';
            for (var i = 0; i < toolbar.length; i++) {
                if (!toolbar[i].ifLocked && isLocked) continue;
                html += '<li title="' + (toolbar[i].title || '') + '">';
                if (toolbar[i].icon) {
                    html += '<img src="' + toolbar[i].icon + '"/>';
                }
                if (toolbar[i].cssClass) {
                    html += '<span style="color: rgba(170, 170, 170, 0.9);" class="' + toolbar[i].cssClass + '"/>';
                }
                html += '</li>';
            }
            $ul.html(html);
        },

        bindToolbar: function () {
            var that = this;
            this.dom.find('.ci-module-header-toolbar ul').on('click', 'li', function (event) {
                var toolbar = that.controller.getToolbar();
                var title = $(event.target).parent('li').attr('title');
                var t = _.find(toolbar, val => val.title === title);
                if (t && t.onClick) {
                    t.onClick.apply(that);
                }
            });
        },

        onReady: function () {
            return this._onReady;
        },

        /**
         * Called to update the view (normally after a change of data)
         */
        updateView: function (rel) {
            this.onReady().then(function () {
                var val = API.getVariable(this.getNameFromRel(rel));
                if (!val) {
                    return;
                }
                if (this.view.update && this.view.update[rel]) {
                    this.view.update[rel].call(this.view, val[1], val[0][0]);
                }
            }, function (err) {
                Debug.error('Error during view update', err);
            });
        },

        updateAllView: function () {
            if (!this.view.update || !this.definition) {
                return;
            }
            var vars = this.vars_in();
            for (var i = 0; i < vars.length; i++) {
                var variable = API.getVar(vars[i].name);
                if (variable.isDefined()) {
                    this.model.onVarChange(variable);
                }
            }
        },

        /**
         * Returns the DOM object which corresponds to the module's content
         */
        getDomContent: function () {
            if (typeof this.domContent !== 'undefined')
                return this.domContent;
            throw 'The module has not been loaded yet';
        },

        /**
         * Returns the DOM object which corresponds to the module's wrapper
         */
        getDomWrapper: function () {
            if (typeof this.domWrapper !== 'undefined') {
                return this.domWrapper;
            }
            throw 'The module has not been loaded yet';
        },

        /**
         * Returns the DOM object which corresponds to the module's view
         */
        getDomView: function () {
            if (typeof this.view.getDom == 'function') {
                return this.view.getDom();
            }
            throw 'The module\'s view doest not implement the getDom function';
        },

        /**
         * Returns the DOM object which corresponds to the module's header
         */
        getDomHeader: function () {
            if (typeof this.domHeader !== 'undefined') {
                return this.domHeader;
            }
            throw 'The module has not been loaded yet';
        },

        /**
         * Returns all accepted types defined in the controller
         */
        getAcceptedTypes: function (rel) {
            var accept = this.controller.references;
            if (accept) {
                return accept[rel];
            }
            return false;
        },


        getDataFromRel: function (rel) {
            if (!this.model || !this.model.data) {
                return;
            }
            var data = this.model.data[rel];
            if (data) {
                return data[Object.keys(data)[0]];
            }
            return false;
        },

        getVariableFromRel: function (rel) {
            var name = this.getNameFromRel(rel);
            return API.getVar(name);
        },

        getNameFromRel: function (rel) {
            var vars = this.vars_in();
            for (var i = 0; i < vars.length; i++) {
                if (vars[i].rel == rel) {
                    return vars[i].name;
                }
            }
            return false;
        },

        getData: function () {
            return this.model.data;
        },

        getDataRelFromName: function (name) {
            var vars = this.vars_in();
            var rels = [];
            for (var i = 0; i < vars.length; i++) {
                if (vars[i].name == name) {
                    rels.push(vars[i].rel);
                }
            }
            return rels;
        },

        getActionRelFromName: function (name) {
            var vars = this.actions_in();
            for (var i = 0; i < vars.length; i++) {
                if (vars[i].name == name) {
                    return vars[i].rel;
                }
            }
            return false;
        },

        inDom: function () {
            this.drawToolbar();
            this.setCustomStyle();
            this.view.inDom();
            this.controller.inDom();
            this.model.inDom();

            var that = this;
            if (!API.isViewLocked()) {
                ContextMenu.listen(this.getDomWrapper().get(0), [
                    ['<li name="fullscreen"><a><span class="ui-icon ui-icon-arrow-4-diag"></span> Fullscreen</a></li>',
                        function () {
                            that.enableFullscreen();
                        }],
                    ['<li name="export"><a><span class="ui-icon ui-icon-suitcase"></span> Export</a></li>',
                        function () {
                            that.exportData();
                        }],
                    ['<li name="config-example"><a><span class="ui-icon ui-icon-suitcase"></span> Config example</a></li>',
                        function () {
                            that.exportConfigExample();
                        }],
                    ['<li name="print"><a><span class="ui-icon ui-icon-print"></span> Print</a></li>',
                        function () {
                            that.printView();
                        }],
                    ['<li name="configuration"><a><span class="ui-icon ui-icon-gear"></span> Parameters</a></li>',
                        function () {
                            that.doConfig();
                        }]
                ]);
            }
        },

        enableFullscreen: function () {
            Fullscreen.requestFullscreen(this);
        },

        toggleLayer: function (newLayerShown, layerOut) {
            var layer;
            if (layer = this.getLayer(newLayerShown)) {
                if (!layer.display) {
                    this.hide();
                    return;
                } else {
                    this.show();
                }

                this.setTitle(layer.title);
                this.setDisplayWrapper(layer.wrapper);

                this.setBackgroundColor(layer.bgColor || [255, 255, 255, 1]);

                this.activeLayerName = newLayerShown;

                var Grid = require('src/main/grid');
                Grid.setModuleSize(this);
                Grid.moduleResize(this);

                return layer;
            }
        },

        eachLayer: function (callback) {
            for (var i in this.definition.layers) {
                callback(this.definition.layers[i], i);
            }
        },

        setLayers: function (layers, blankLayer, modify_layer, blank, activeLayer) {
            this.definition.layers = this.definition.layers || new DataObject();

            if (modify_layer) {
                if (modify_layer.remove) {
                    delete this.definition.layers[modify_layer.remove];
                } else if (modify_layer.rename) {
                    this.definition.layers[modify_layer.rename.new] = this.definition.layers[modify_layer.rename.old];
                    delete this.definition.layers[modify_layer.rename.old];
                }
            } else {
                for (var i in layers) {
                    if (this.definition.layers[i]) {
                        continue;
                    }

                    // new layer
                    this.definition.layers[i] = new DataObject();

                    if (blankLayer) {
                        $.extend(true, this.definition.layers[i], Module.prototype.emptyConfig);
                        this.definition.layers[i].name = i;
                        if (i !== activeLayer) {
                            this.definition.layers[i].display = false;
                        }
                    } else {
                        $.extend(true, this.definition.layers[i], this.getLayer(this.getActiveLayerName()));
                        if (blank) {
                            this.definition.layers[i].display = false;
                        }
                    }

                    this.definition.layers[i] = this.definition.layers[i].duplicate();
                }
            }
        },

        getActiveLayerName: function () {
            return this.activeLayerName;
        },

        getLayer: function (layerName) {
            if (!layerName) {
                return false;
            }
            return this.definition.layers[layerName];
        },

        hide: function () {
            this.getDomWrapper().hide();
        },

        show: function () {
            this.getDomWrapper().show();
        },

        doConfig: function (sectionToOpen) {
            var that = this;
            var div = ui.dialog({
                autoPosition: true,
                noHeader: true,
                width: '80%'
            });

            var references = this.controller.references,
                events = this.controller.events,
                i, l, keys;

            // Filters
            var filter = API.getAllFilters(),
                allFilters;

            function makeFilters(arraySource) {
                if (!arraySource) {
                    return;
                }

                var target = [];
                if (Array.isArray(arraySource)) {
                    for (var i = 0; i < arraySource.length; i++) {

                        target.push({
                            key: arraySource[i].file || '',
                            title: arraySource[i].name,
                            children: makeFilters(arraySource[i].children)
                        });
                    }
                }
                return target;
            }

            allFilters = makeFilters(filter);

            // AUTOCOMPLETE VARIABLES
            var autoCompleteVariables = [];
            keys = Variables.getNames();
            for (i = 0; i < keys.length; i++) {
                autoCompleteVariables.push({title: keys[i], label: keys[i]});
            }

            // AUTOCOMPLETE ACTIONS
            var autoCompleteActions = [];
            keys = API.getRepositoryActions().getKeys();
            for (i = 0; i < keys.length; i++) {
                autoCompleteActions.push({title: keys[i], label: keys[i]});
            }

            // Receive configuration
            var varsIn = that.controller.variablesIn;
            var varsInList = [];
            for (i = 0, l = varsIn.length; i < l; i++) {
                if (!references[varsIn[i]]) {
                    continue;
                }

                varsInList.push({
                    key: varsIn[i],
                    title: references[varsIn[i]].label
                });
            }

            // Send configuration
            var alljpaths = [];
            for (i in references) {
                alljpaths[i] = that.model.getjPath(i);
            }

            function makeReferences(event, type) {
                if (!events[event]) {
                    return {};
                }

                var referenceList;
                switch (type) {
                    case 'event':
                        referenceList = events[event].refVariable || [];
                        break;

                    case 'action':
                        referenceList = events[event].refAction || [];
                        break;
                }

                var list = [];
                for (var i = 0; i < referenceList.length; i++) {
                    list.push({
                        key: referenceList[i],
                        title: references[referenceList [i]].label
                    });
                }

                return list;
            }

            // VARIABLES OUT
            // ACTIONS OUT
            var eventsVariables = [];
            var eventsActions = [];

            for (i in events) {
                // If this event can send a variable
                if (events[i].refVariable) {
                    eventsVariables.push({
                        title: events[i].label,
                        key: i
                    });
                }

                // If this event can send an action
                if (events[i].refAction) {
                    eventsActions.push({
                        title: events[i].label,
                        key: i
                    });
                }
            }

            // ACTIONS IN
            var actionsIn = this.controller.actionsIn || {};
            var actionsInList = [];

            for (i in actionsIn) {
                actionsInList.push({
                    title: actionsIn[i],
                    key: i
                });
            }

            var allLayers = {};
            that.eachLayer(function (layer, key) {
                allLayers[key] = key;
            });

            var form = new Form({});

            form.init({
                onValueChanged: function (value) {
                }
            });

            var structure = {
                sections: {
                    module_infos: {
                        options: {
                            title: 'Module informations',
                            icon: 'info_rhombus'
                        },
                        groups: {
                            group: {
                                options: {
                                    type: 'text'
                                }
                            }
                        }
                    },
                    module_config: {
                        options: {
                            title: 'General configuration',
                            icon: 'page_white_paint'
                        },
                        groups: {
                            layerDisplay: {
                                options: {
                                    title: 'Display on layers',
                                    type: 'list'
                                },
                                fields: {
                                    displayOn: {
                                        type: 'checkbox',
                                        title: 'Display on layers',
                                        options: allLayers
                                    }
                                }
                            },
                            commonToolbar: {
                                options: {
                                    title: 'Common toolbar options',
                                    type: 'list'
                                },
                                fields: {
                                    toolbar: {
                                        type: 'checkbox',
                                        title: 'Common toolbar options',
                                        options: {
                                            'Open Preferences': 'Open Preferences',
                                            'Show fullscreen': 'Show fullscreen',
                                            'Export Data': 'Export Data',
                                            Print: 'Print'


                                        },
                                        default: ['Open Preferences']
                                    }
                                }
                            },
                            customToolbar: {
                                options: {
                                    title: 'Custom toolbar options',
                                    type: 'table',
                                    multiple: true
                                },
                                fields: {
                                    title: {
                                        type: 'text',
                                        title: 'Title',
                                        default: ''
                                    },
                                    icon: {
                                        title: 'Icon',
                                        type: 'text',
                                        default: ''
                                    },
                                    action: {
                                        title: 'Action',
                                        type: 'text',
                                        default: ''
                                    },
                                    position: {
                                        title: 'Position',
                                        type: 'combo',
                                        options: [
                                            {key: 'begin', title: 'Begin'},
                                            {key: 'end', title: 'End'}
                                        ],
                                        default: 'begin'
                                    }
                                }
                            },
                            customCss: {
                                options: {
                                    title: 'Custom css',
                                    type: 'list'
                                },
                                fields: {
                                    fontSize: {
                                        type: 'text',
                                        title: 'Font size',
                                        default: ''
                                    },
                                    fontFamily: {
                                        type: 'text',
                                        title: 'Font Family',
                                        default: ''
                                    }
                                }
                            }
                        },
                        sections: {
                            layer: {
                                options: {
                                    title: 'Shown on layers'
                                },
                                groups: {
                                    group: {
                                        options: {
                                            type: 'list',
                                            multiple: true,
                                            title: true
                                        },
                                        fields: {
                                            layerName: {
                                                type: 'text',
                                                multiple: false,
                                                title: 'Layer name',
                                                displayed: false
                                            },
                                            moduletitle: {
                                                type: 'text',
                                                multiple: false,
                                                title: 'Module title'
                                            },
                                            bgcolor: {
                                                type: 'spectrum',
                                                multiple: false,
                                                title: 'Background color'
                                            },
                                            modulewrapper: {
                                                type: 'checkbox',
                                                title: 'Module boundaries',
                                                options: {display: ''}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            };

            var specificStructure = that.controller.configurationStructure();
            if (specificStructure) {
                structure.sections.module_specific_config = $.extend(specificStructure, {
                    options: {
                        title: 'Module configuration',
                        icon: 'page_white_wrench'
                    }
                });
            }

            if (varsInList.length > 0) {
                structure.sections.vars_in = {
                    options: {
                        title: 'Variables in',
                        icon: 'basket_put'
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'table',
                                multiple: true
                            },
                            fields: {
                                rel: {
                                    type: 'combo',
                                    title: 'Reference',
                                    options: varsInList
                                },
                                name: {
                                    type: 'text',
                                    title: 'From variable',
                                    options: autoCompleteVariables
                                },
                                filter: {
                                    type: 'combo',
                                    title: 'Filter variable',
                                    options: allFilters
                                }
                            }
                        }
                    }
                };
            }

            if (eventsVariables.length > 0) {
                structure.sections.vars_out = {
                    options: {
                        title: 'Variables out',
                        icon: 'basket_remove'
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'table',
                                multiple: true
                            },
                            fields: {
                                event: {
                                    type: 'combo',
                                    title: 'Event',
                                    options: eventsVariables
                                },
                                rel: {
                                    type: 'combo',
                                    title: 'Reference'
                                },
                                jpath: {
                                    type: 'combo',
                                    title: 'jPath',
                                    options: {},
                                    extractValue: Util.jpathToArray,
                                    insertValue: Util.jpathToString
                                },
                                filter: {
                                    type: 'combo',
                                    title: 'Filter variable',
                                    options: allFilters
                                },
                                name: {
                                    type: 'text',
                                    title: 'To variable'
                                }
                            }
                        }
                    }
                };
            }

            if (actionsInList.length > 0) {
                structure.sections.actions_in = {
                    options: {
                        title: 'Actions in',
                        icon: 'door_in'
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'table',
                                multiple: true
                            },
                            fields: {
                                rel: {
                                    type: 'combo',
                                    title: 'Reference',
                                    options: actionsInList
                                },
                                name: {
                                    type: 'text',
                                    title: 'Action name',
                                    options: autoCompleteActions
                                }
                            }
                        }
                    }
                };
            }

            if (eventsActions.length > 0) {
                structure.sections.actions_out = {
                    options: {
                        title: 'Actions out',
                        icon: 'door_out'
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'table',
                                multiple: true
                            },
                            fields: {
                                event: {
                                    type: 'combo',
                                    title: 'On event',
                                    options: eventsActions
                                },
                                rel: {
                                    type: 'combo',
                                    title: 'Reference'
                                },
                                jpath: {
                                    type: 'combo',
                                    title: 'jPath',
                                    options: {},
                                    extractValue: Util.jpathToArray,
                                    insertValue: Util.jpathToString
                                },
                                name: {
                                    type: 'text',
                                    title: 'Action name'
                                }
                            }
                        }
                    }
                };
            }

            form.setStructure(structure);

            form.onStructureLoaded().done(function () {
                if (form.getSection('vars_out')) {
                    form.getSection('vars_out').getGroup('group').getField('event').options.onChange = function (fieldElement) {
                        if (!fieldElement.groupElement) {
                            return;
                        }
                        $.when(fieldElement.groupElement.getFieldElementCorrespondingTo(fieldElement, 'rel'))
                            .then(function (el) {
                                if (el) {
                                    el.setOptions(makeReferences(fieldElement.value, 'event'));
                                }
                            });
                    };

                    form.getSection('vars_out').getGroup('group').getField('rel').options.onChange = function (fieldElement) {
                        if (!fieldElement.groupElement) {
                            return;
                        }
                        $.when(fieldElement.groupElement.getFieldElementCorrespondingTo(fieldElement, 'jpath'))
                            .then(function (el) {
                                if (el) {
                                    el.setOptions(alljpaths[fieldElement.value]);
                                }
                            });
                    };
                }

                if (form.getSection('actions_out')) {
                    form.getSection('actions_out').getGroup('group').getField('event').options.onChange = function (fieldElement) {
                        if (!fieldElement.groupElement) {
                            return;
                        }
                        $.when(fieldElement.groupElement.getFieldElementCorrespondingTo(fieldElement, 'rel'))
                            .then(function (el) {
                                if (el) {
                                    el.setOptions(makeReferences(fieldElement.value, 'action'));
                                }
                            });
                    };

                    form.getSection('actions_out').getGroup('group').getField('rel').options.onChange = function (fieldElement) {
                        if (!fieldElement.groupElement) {
                            return;
                        }
                        $.when(fieldElement.groupElement.getFieldElementCorrespondingTo(fieldElement, 'jpath'))
                            .then(function (el) {
                                if (el) {
                                    el.setOptions(alljpaths[fieldElement.value]);
                                }
                            });
                    };
                }

                var moduleInfosHtml =
                        '<table class="moduleInformation">' +
                        '<tr><td>Module name</td><td>' + that.controller.moduleInformation.name + '</td></tr>' +
                        '<tr><td></td><td><small>' + that.controller.moduleInformation.description + '</small></td></tr>' +
                        '<tr><td>Module author</td><td>' + that.controller.moduleInformation.author + '</td></tr>' +
                        '<tr><td>Creation date</td><td>' + that.controller.moduleInformation.date + '</td></tr>' +
                        '<tr><td>Released under</td><td>' + that.controller.moduleInformation.license + '</td></tr>' +
                        '</table>'
                    ;

                var allLayers = [];
                var allLayerDisplay = [];

                if (that.definition.toolbar) {
                    var commonToolbar = that.definition.toolbar.common;
                    var customToolbar = that.definition.toolbar.custom;
                }

                if (that.definition.css) {
                    var customCss = that.definition.css;
                }


                that.eachLayer(function (layer, name) {
                    if (layer.display) {
                        allLayerDisplay.push(name);
                    }
                    allLayers.push({
                        _title: name,
                        layerName: [name],
                        moduletitle: [layer.title],
                        bgcolor: [layer.bgColor || [255, 255, 255, 0]],
                        modulewrapper: [(layer.wrapper === true || layer.wrapper === undefined) ? 'display' : '']
                    });
                });

                var fill = {
                    sections: {
                        module_config: [{
                            groups: {
                                layerDisplay: [{displayOn: [allLayerDisplay]}],
                                commonToolbar,
                                customToolbar,
                                customCss
                            },
                            sections: {layer: [{groups: {group: allLayers}}]}
                        }],
                        module_infos: [{groups: {group: [moduleInfosHtml]}}],
                        module_specific_config: [that.definition.configuration || {}],
                        vars_out: [{groups: {group: [that.vars_out()]}}],
                        vars_in: [{groups: {group: [that.vars_in()]}}],
                        actions_in: [{groups: {group: [that.actions_in()]}}],
                        actions_out: [{groups: {group: [that.actions_out()]}}]
                    }
                };
                form.fill(fill);
            });

            form.addButton('Cancel', {color: 'blue'}, function () {
                div.dialog('close');
            });

            form.addButton('Save', {color: 'green'}, function () {
                var value = form.getValue().sections;
                if (that.controller.onBeforeSave) {
                    that.controller.onBeforeSave(value);
                }
                that.definition.layers = that.definition.layers || {};
                var l = value.module_config[0].sections.layer[0].groups.group;
                var allDisplay = value.module_config[0].groups.layerDisplay[0].displayOn[0];
                for (var i = 0, ll = l.length; i < ll; i++) {
                    that.definition.layers[l[i].layerName[0]].display = allDisplay.indexOf(l[i].layerName[0]) > -1;
                    that.definition.layers[l[i].layerName[0]].title = l[i].moduletitle[0];
                    that.definition.layers[l[i].layerName[0]].bgColor = l[i].bgcolor[0];
                    that.definition.layers[l[i].layerName[0]].wrapper = l[i].modulewrapper[0].indexOf('display') > -1;
                }

                that.definition.toolbar = {};
                that.definition.toolbar.custom = value.module_config[0].groups.customToolbar;
                that.definition.toolbar.common = value.module_config[0].groups.commonToolbar;

                that.definition.css = value.module_config[0].groups.customCss;

                if (value.vars_out) {
                    that.setSendVars(value.vars_out[0].groups.group[0]);
                }

                if (value.vars_in) {
                    that.setSourceVars(value.vars_in[0].groups.group[0]);
                }

                if (value.actions_in) {
                    that.setActionsIn(value.actions_in[0].groups.group[0]);
                }

                if (value.actions_out) {
                    that.setActionsOut(value.actions_out[0].groups.group[0]);
                }

                if (value.module_specific_config) {
                    that.definition.configuration = value.module_specific_config[0];
                }

                that.reload();
                div.dialog('close');
            });

            form.onLoaded().done(function () {
                div.html(form.makeDom(1, sectionToOpen || 2));
                form.inDom();
            });
        },


        resetReady: function () {
            var that = this;
            that.viewReady = new Promise(function (res) {
                that._resolveView = res;
            });

            that.controllerReady = new Promise(function (res) {
                that._resolveController = res;
            });
            that._onReady = Promise.all([that.viewReady, that.controllerReady]);
        },

        getConfiguration: function (aliasName, fallbackValue) {
            var cfgEl = this.definition.configuration,
                alias = this.controller.configAliases[aliasName],
                toReturn;

            if (alias) {
                for (var i = 0, l = alias.length; i < l; i++) {
                    cfgEl = cfgEl[alias[i]];

                    if (typeof cfgEl === 'undefined') {

                        toReturn = this._getConfigurationDefault(alias, aliasName);
                        break;
                    }
                }
            } else {
                Debug.warn('Alias ' + aliasName + ' not defined ');
            }
            if (toReturn == undefined)
                toReturn = this._doConfigurationFunction(cfgEl, aliasName);
            if (toReturn == undefined)
                toReturn = fallbackValue;

            return toReturn;

        },

        getConfigurationCheckbox: function (aliasName, optionName) {
            var conf = this.getConfiguration(aliasName);
            if (!Array.isArray(conf)) {
                return false;
            }

            return conf.indexOf(optionName) > -1;
        },

        _getConfigurationDefault: function (alias, aliasName) {

            this._cfgStructure = this._cfgStructure || this.controller.configurationStructure();

            var cfgEl = this._cfgStructure;

            for (var i = 0, l = alias.length; i < l; i++) {
                if (typeof alias[i] == 'number') {
                    continue;
                }

                if (cfgEl.fields) {
                    i--;
                    cfgEl = cfgEl.fields;
                    continue;
                }

                cfgEl = cfgEl[alias[i]];
                if (!cfgEl) {
                    Debug.warn('Error in configuration file - Alias is not a correct jPath');
                    return false;
                }

            }

            return this._doConfigurationFunction(cfgEl.default, aliasName);
        },

        _doConfigurationFunction: function (element, aliasName) {
            if (this.controller.configFunctions[aliasName]) {
                try {
                    return this.controller.configFunctions[aliasName](element);
                } catch (e) {
                    return element;
                }
            }
            return element;
        },

        /**
         * Returns the data for the module's model
         */
        getValue: function () {
            if (typeof this.model.getValue == 'function')
                return this.model.getValue();
        },

        /**
         * Returns the current position of the module
         */
        getPosition: function (activeLayer) {
            var layer = this.getLayer(activeLayer);
            return layer.position;
        },

        /**
         * Returns the current size of the module
         */
        getSize: function (activeLayer) {
            var layer = this.getLayer(activeLayer);
            return layer.size;
        },

        getWidthPx: function () {
            return this.getDomContent().innerWidth();
        },

        getHeightPx: function () {
            return this.getDomContent().innerHeight();
        },

        getId: function () {
            return DataObject.resurrect(this.definition.id);
        },

        setId: function (id) {
            this.definition.set('id', id);
        },


        setSourceVars: function (vars) {
            this.definition.set('vars_in', vars, true);
        },

        setSendVars: function (vars) {
            this.definition.set('vars_out', vars, true);
        },

        setActionsIn: function (vars) {
            this.definition.set('actions_in', vars, true);
        },

        setActionsOut: function (vars) {
            this.definition.set('actions_out', vars, true);
        },

        vars_in: function () {
            // Backward compatibility
            if (!this.definition.vars_in && this.definition.dataSource) {
                this.definition.vars_in = this.definition.dataSource;
                delete this.definition.dataSource;
            }
            this.definition.vars_in = this.definition.vars_in || new DataArray();
            return this.definition.vars_in.filter(function (val) {
                return val ? (val.name && val.rel ? true : false) : false;
            });
        },

        vars_out: function () {
            // Backward compatibility
            if (!this.definition.vars_out && this.definition.dataSend) {
                this.definition.vars_out = this.definition.dataSend;
                delete this.definition.dataSend;
            }
            return this.definition.vars_out = this.definition.vars_out || new DataArray();
        },


        actions_in: function () {
            // Backward compatibility
            if (!this.definition.actions_in && this.definition.actionsIn) {
                this.definition.actions_in = this.definition.actionsIn;
                delete this.definition.actionsIn;
            }
            return this.definition.actions_in = this.definition.actions_in || new DataArray();
        },


        actions_out: function () {
            // Backward compatibility
            if (!this.definition.actions_out && this.definition.actionsOut) {
                this.definition.actions_out = this.definition.actionsOut;
                delete this.definition.actionsOut;
            }
            return this.definition.actions_out = this.definition.actions_out || new DataArray();
        },

        getDefinition: function () {
            return this.definition;
        },

        getTitle: function () {
            return this.definition.title;
        },

        setTitle: function (title) {
            this.definition.set('title', title);
            this.domHeader.find('.ci-module-header-title').text(title);
        },

        exportData: function () {
            var that = this;
            ui.dialog('<div class="ci-module-export"><textarea></textarea></div>', {
                title: 'Export data from module ' + that.getTitle(),
                width: '70%',
                height: 500,
                noWrap: true
            }).children('textarea').text(that.controller['export']());
        },

        printView: function () {
            var content = this.controller.print();
            var openWindow = window.open('', '', '');
            openWindow.document.write(content);
            openWindow.document.close();
            openWindow.focus();
        },

        setBackgroundColor: function (color) {
            this.domContent.get(0).style.backgroundColor = 'rgba(' + color.join(',') + ')';
        },

        setDisplayWrapper: function (bln) {
            this.getDomWrapper()[(bln === true || bln == undefined) ? 'addClass' : 'removeClass']('ci-module-displaywrapper');
            try {
                this.getDomWrapper().resizable((bln === true || bln == undefined) ? 'enable' : 'disable');
            } catch (e) {
                // do nothing
            }
        },

        blankVariable: function (variableName) {
            var rels = this.getDataRelFromName(variableName);
            for (var i = 0; i < rels.length; i++) {
                if (this.view.blank[rels[i]]) {
                    this.view.blank[rels[i]].call(this.view, variableName);
                } else {
                    Util.warnOnce('missing-blank-' + this.controller.moduleInformation.name + '_' + rels[i],
                        'Module ' + this.controller.moduleInformation.name + ': no blank method defined for rel ' + rels[i]);
                }
            }
        },

        startLoading: function (variableName) {
            var rels = this.getDataRelFromName(variableName);
            for (var i = 0; i < rels.length; i++) {
                this.view.startLoading(rels[i]);
            }
        },

        endLoading: function (variableName) {
            var rels = this.getDataRelFromName(variableName);
            for (var i = 0; i < rels.length; i++) {
                this.view.endLoading(rels[i]);
            }
        },

        get emptyConfig() {
            return new DataObject({
                position: {left: 0, top: 0},
                size: {width: 20, height: 20},
                zIndex: 0,
                display: true,
                title: '',
                bgColor: [255, 255, 255, 0],
                wrapper: true,
                created: true
            });
        },

        reload: function () {
            if (this.view.unload) {
                this.view.unload();
            }
            this.resetReady();
            this.controller.init();
            this.view.init();
            this.drawToolbar();
            this.setCustomStyle();
            this.view.inDom();
            this.toggleLayer(this.getActiveLayerName());
            this.model.resetListeners();
            this.updateAllView();
        },

        getConfigExample: function () {
            var aliases = this.controller.configAliases,
                definition = this.controller.configurationStructure();

            var result = {};
            for (var i in aliases) {
                if (aliases.hasOwnProperty(i)) {
                    result[i] = getExampleFromAlias(definition, aliases[i]);
                }
            }

            return result;
        },

        exportConfigExample: function () {
            var that = this;
            ui.dialog('<div class="ci-module-export"><textarea></textarea></div>', {
                title: 'Config example',
                width: '70%',
                height: 500,
                noWrap: true
            }).children('textarea').text(JSON.stringify(that.getConfigExample(), null, 4));
        }
    };

    function getExampleFromAlias(element, alias) {
        var l = alias.length,
            name;
        for (var i = 0; i < l; i++) {
            name = alias[i];
            if (typeof name === 'string') {
                element = element[name];
            } else if (i === l - 1) {
                if (element.options) {
                    if (element.options.type === 'table') {
                        var tableElement = getTableFieldExample(element.fields);
                        if (element.options.multiple) {
                            tableElement = [tableElement];
                        }
                        return tableElement;
                    } else {
                        return getFieldExample(element);
                    }
                } else {
                    return getFieldExample(element);
                }
            } else if (element.fields) {
                element = element.fields;
            }
        }
    }

    function getTableFieldExample(field) {
        var result = {};
        for (var i in field) {
            if (field.hasOwnProperty(i)) {
                result[i] = getFieldExample(field[i]);
            }
        }
        return result;
    }

    function getFieldExample(field) {
        switch (field.type) {
            case 'checkbox':
                var result = [];
                for (var i in field.options) {
                    result.push(i);
                }
                return result;
            case 'color':
            case 'spectrum':
                return [0, 0, 0, 1];
            case 'combo':
                var val = field.options[0];
                if (val) {
                    val = val.key;
                } else {
                    val = '';
                }
                if (field.extractValue) {
                    val = field.extractValue(val);
                }
                return val;
            case 'float':
                return field.default || 0;
            case 'jscode':
            case 'text':
            case 'textarea':
            case 'wysiwyg':
                return field.default || '';
            case 'slider':
            case 'textstyle':
            default:
                Debug.error('Unknow field type: ' + field.type);
                return field.default || '';
        }
    }

    return Module;

});
