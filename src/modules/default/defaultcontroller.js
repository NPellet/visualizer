'use strict';

define(['src/util/api', 'src/util/util', 'src/main/grid'], function (API, Util, Grid) {

    return {

        setModule: function (module) {
            this.module = module;
        },

        init: function () {
            this.initImpl();
        },

        initImpl: function () {
            this.resolveReady();
        },

        getToolbar: function () {
            var tb = this.module.definition.toolbar;
            if (tb) {
                var common = this.module.definition.toolbar.common[0].toolbar[0];
                var custom = this.module.definition.toolbar.custom[0];
            }

            if (!common) common = ['Open Preferences'];

            var toolbar = [
                {
                    onClick: function () {
                        this.exportData();
                    },
                    title: 'Export Data',
                    cssClass: 'fa fa-sign-out',
                    ifLocked: true
                },
                {
                    onClick: function () {
                        this.printView();
                    },
                    title: 'Print',
                    cssClass: 'fa fa-print',
                    ifLocked: true
                },
                {
                    onClick: function () {
                        this.enableFullscreen();
                    },
                    title: 'Show fullscreen',
                    cssClass: 'fa fa-expand',
                    ifLocked: true
                },
                {
                    onClick: function () {
                        this.doConfig(2);
                    },
                    title: 'Open Preferences',
                    cssClass: 'fa fa-wrench',
                    ifLocked: false
                }
                //{
                //    onClick: function() {
                //        this.doConfig(3);
                //    },
                //    title: "Variables in",
                //    cssClass: 'fa fa-sign-in fa-lg',
                //    ifLocked: true
                //}
                //{
                //    onClick: function() {
                //        this.doConfig(4)
                //    },
                //    title: "Variables out",
                //    cssClass: 'fa fa-sign-out fa-lg'
                //},
                //{
                //    onClick: function() {
                //        Grid.removeModule(this);
                //    },
                //    title: "Remove module",
                //    cssClass: 'fa fa-close fa-lg'
                //}
            ];

            if (common) {
                toolbar = toolbar.filter(t => {
                    return common.some(c => {
                        return c === t.title;
                    });
                });
            }

            if (custom) {
                for (let i = 0; i < custom.length; i++) {
                    let el = {
                        ifLocked: true,
                        title: custom[i].title,
                        cssClass: 'fa ' + custom[i].icon,
                        onClick: function () {
                            API.doAction(custom[i].action);
                        }
                    };
                    if (custom[i].position === 'begin') {
                        toolbar.unshift(el);
                    } else {
                        toolbar.push(el);
                    }
                }
            }

            return toolbar;
        },

        inDom: Util.noop,

        setVarFromEvent: function (event, rel, relSource, jpath, callback) {

            var varsOut, i = 0, first = true;

            if (!(varsOut = this.module.vars_out())) {
                return;
            }

            for (; i < varsOut.length; i++) {

                if (varsOut[i].event == event && (varsOut[i].rel == rel || !rel) && varsOut[i].name) {

                    if (first && callback) {
                        first = false;
                        callback.call(this);
                    }

                    varsOut[i].jpath = varsOut[i].jpath || []; // Need not be undefined

                    if (typeof varsOut[i].jpath == 'string') {
                        varsOut[i].jpath = varsOut[i].jpath.split('.');
                        varsOut[i].jpath.shift();
                    }

                    API.setVar(varsOut[i].name, this.module.getVariableFromRel(relSource), jpath.concat(varsOut[i].jpath), varsOut[i].filter);
                }
            }
        },

        createDataFromEvent: function (event, rel, data, callback) {

            var varsOut, i = 0, first = true;

            if (!(varsOut = this.module.vars_out())) {
                return;
            }

            for (; i < varsOut.length; i++) {

                if (varsOut[i].event == event && (varsOut[i].rel == rel || !rel) && varsOut[i].name) {

                    if (first && callback) {
                        first = false;
                        data = callback.call(this);
                    }

                    API.createDataJpath(varsOut[i].name, data, varsOut[i].jpath, varsOut[i].filter);
                }
            }
        },

        sendActionFromEvent: function (event, rel, value) {
            var actionsOut = this.module.actions_out(),
                i,
                jpath,
                actionname;

            if (!actionsOut) {
                return;
            }

            i = actionsOut.length - 1;

            for (; i >= 0; i--) {

                if (actionsOut[i].name && actionsOut[i].rel === rel && ((event && event === actionsOut[i].event) || !event)) {

                    actionname = actionsOut[i].name;
                    jpath = actionsOut[i].jpath;

                    if (value && jpath) {

                        if (!value.getChild) {
                            value = DataObject.check(value, true);
                        }
                        (function (actionname) {

                            value.getChild(jpath).then(function (returned) {

                                API.doAction(actionname, returned);
                            });
                        })(actionname);
                    } else {
                        API.doAction(actionname, value);
                    }
                }
            }
        },

        sendAction: Util.deprecate(function sendAction(rel, value, event) {
            return this.sendActionFromEvent(event, rel, value);
        }, 'Use sendActionFromEvent instead.'),

        allVariablesFor: function (event, rel, callback) {

            var varsOut, i = 0;

            if (!(varsOut = this.module.vars_out())) {
                return;
            }

            for (; i < varsOut.length; i++) {

                if (varsOut[i].event == event && (varsOut[i].rel == rel || !rel)) {

                    callback(varsOut[i]);
                }
            }
        },

        'export': Util.noop,

        print: function () {
            return this.module.getDomContent()[0].innerHTML;
        },

        configurationStructure: Util.noop,

        configFunctions: {},

        configAliases: {},

        events: {},

        variablesIn: [],

        actionsIn: {
            _editPreferences: 'Edit preferences'
        },

        resolveReady: function () {
            this.module._resolveController();
        },

        onBeforeRemove: function () {
            return true;
        },

        onRemove: Util.noop

    };

});
