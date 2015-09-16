'use strict';

define(['modules/types/client_interaction/code_editor/controller', 'src/util/api', 'src/util/debug', 'src/util/sandbox', 'src/util/util'], function (CodeEditor, API, Debug, Sandbox, Util) {

    function Controller() {
        CodeEditor.call(this);
        this.currentScript = null;
        this.outputObject = {};
        this.reloaded = true;
        this.scriptID = 0;
    }

    Util.inherits(Controller, CodeEditor);

    Controller.prototype.moduleInformation = {
        name: 'Code executor',
        description: 'Write code that can be executed on input variable, action or just the push of a button',
        author: 'Michaël Zasso',
        date: '12.01.2015',
        license: 'MIT'
    };

    Controller.prototype.references = {
        inputValue: {
            label: 'Input value'
        },
        outputValue: {
            label: 'Output value'
        }
    };

    Controller.prototype.events = {
        onScriptEnded: {
            label: 'Code execution ended',
            refVariable: ['outputValue']
        }
    };

    Controller.prototype.variablesIn = ['inputValue'];

    Controller.prototype.actionsIn = $.extend({}, Controller.prototype.actionsIn, {execute: 'Execute the code'});

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        display: {
                            type: 'checkbox',
                            title: 'Display',
                            options: {
                                editor: 'Code editor',
                                buttons: 'Buttons'
                            },
                            'default': ['editor', 'buttons']
                        },
                        execOnLoad: {
                            type: 'checkbox',
                            title: 'Execute on load',
                            options: {
                                yes: 'Yes'
                            },
                            'default': []
                        },
                        script: {
                            type: 'jscode',
                            title: 'Code',
                            'default': ''
                        }
                    }
                },
                libs: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Required libraries'
                    },
                    fields: {
                        lib: {
                            type: 'text',
                            title: 'url'
                        },
                        alias: {
                            type: 'text',
                            title: 'alias'
                        }
                    }
                },
                buttons: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Buttons'
                    },
                    fields: {
                        name: {
                            type: 'text',
                            title: 'Name',
                            'default': 'button1'
                        },
                        label: {
                            type: 'text',
                            title: 'Label',
                            'default': 'Execute'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        script: ['groups', 'group', 0, 'script', 0],
        execOnLoad: ['groups', 'group', 0, 'execOnLoad', 0],
        display: ['groups', 'group', 0, 'display', 0],
        libs: ['groups', 'libs', 0],
        buttons: ['groups', 'buttons', 0]
    };

    Controller.prototype.onButtonClick = function (name) {
        this.initExecutor().then(function (executor) {
            executor.setButton(name);
            executor.execute();
        });
    };

    Controller.prototype.onLoadScript = function () {
        this.initExecutor().then(function (executor) {
            executor.setLoadScript();
            executor.execute();
        });
    };

    Controller.prototype.onVariableIn = function (name) {
        this.initExecutor().then(function (executor) {
            executor.setVariable(name);
            executor.execute();
        });
    };

    Controller.prototype.onActionIn = function (name, value) {
        this.initExecutor().then(function (executor) {
            executor.setAction(name, value);
            executor.execute();
        });
    };

    Controller.prototype.initImpl = function () {
        var neededLibs = this.module.getConfiguration('libs');
        var urls = [];
        var aliases = [];
        if (neededLibs) {
            for (var i = 0; i < neededLibs.length; i++) {
                var neededLib = neededLibs[i];
                if (neededLib.lib) {
                    urls.push(neededLib.lib);
                    aliases.push(neededLib.alias || 'required_anonymous_' + i);
                }
            }
        }

        urls.unshift('src/util/api');
        aliases.unshift('API');

        this.neededUrls = urls;
        this.neededAliases = aliases.join(', ');
        this.resolveReady();
        this.reloaded = true;

        if (this.module.getConfigurationCheckbox('execOnLoad', 'yes')) {
            this.onLoadScript(); // exec the script
        }
    };

    Controller.prototype.initExecutor = function () {
        var promise;
        var newScript = this.module.view._code;
        if (!this.reloaded && this.currentScript == newScript) {
            promise = Promise.resolve(this._executor || this._loadingExecutor);
        } else {
            var that = this;
            this.reloaded = false;
            var prom = new Promise(function (resolve, reject) {
                require(that.neededUrls, function () {
                    var libs = new Array(that.neededUrls.length);
                    for (var i = 0; i < that.neededUrls.length; i++) {
                        libs[i] = arguments[i];
                    }
                    var executor = new ScriptExecutor(that, libs);
                    that.currentScript = newScript;
                    that._executor = executor;
                    that._loadingExecutor = null;
                    resolve(executor);
                });
            });
            this._loadingExecutor = prom;
            promise = prom;
        }
        return promise.then(function (executor) {
            executor.init();
            return executor;
        });
    };

    Controller.prototype.onGlobalPreferenceChange = function () {
        this.reloaded = true;
    };

    function ScriptExecutor(controller, libs) {
        this.controller = controller;
        this.title = String(controller.module.definition.title);
        this.libs = libs;
        var context = getNewContext(this);
        var theCode = this.controller.module.view._code;
        this._sandbox = new Sandbox();
        this._sandbox.setContext(context);
        try {
            this.theFunction = this._sandbox.run(
                '(function(' +
                controller.neededAliases +
                ') {' + theCode + '\n})',
                'CodeExecutor' + this.controller.module.getId()
            );
        } catch (e) {
            reportError(this.title, e);
        }
        this.wasSet = false;
    }

    function getNewContext(executor) {
        var setter = function (name, value) {
            executor.wasSet = true;
            executor.doVariable(name, value);
        };
        var clear = function () {
            executor.wasSet = true;
            executor.controller.outputObject = {};
        };
        var unset = function (name) {
            executor.wasSet = true;
            delete executor.controller.outputObject[name];
        };
        var done = function (e) {
            executor.done(e);
        };
        var setAsync = function () {
            executor.async();
        };
        var sendAction = function (name, value) {
            API.doAction(name, value);
        };
        var context = {
            variables: {},
            event: null,
            button: null,
            action: null,
            defined: 0,
            'set': setter,
            'get': function (name) {
                var variable = this.variables[name];
                if (variable) {
                    return variable.get();
                }
            },
            sendAction: sendAction,
            setAsync: setAsync,
            done: done,
            clear: clear,
            unset: unset
        };

        var ctx = {
            getVariable: function () {
                return context.variable;
            },
            getVariables: function () {
                return context.variables;
            },
            getEvent: function () {
                return context.event;
            },
            getButton: function () {
                return context.button;
            },
            getAction: function () {
                return context.action;
            },
            getDefined: function () {
                return context.defined;
            },
            'set': setter,
            'get': function (name) {
                return context.get(name);
            },
            sendAction: sendAction,
            setAsync: setAsync,
            done: done,
            clear: clear,
            unset: unset
        };
        executor.context = context;
        return ctx;
    }

    ScriptExecutor.prototype.init = function () {
        this.context.event = null;
        this.context.button = null;
        this.context.action = null;
        this.context.variable = null;
        this.context.variables = {};
        this.context.defined = 0;
    };

    ScriptExecutor.prototype.setButton = function (name) {
        this.context.event = 'button';
        this.context.button = name;
    };

    ScriptExecutor.prototype.setLoadScript = function () {
        this.context.event = 'load';
    };

    ScriptExecutor.prototype.setVariable = function (name) {
        this.context.variable = name;
        this.context.event = 'variable';
    };

    ScriptExecutor.prototype.setAction = function (name, value) {
        this.context.event = 'action';
        this.context.action = {
            name: name,
            value: value
        };
    };

    ScriptExecutor.prototype.doVariable = function (name, value) {
        this.controller.outputObject[name] = value;
    };

    ScriptExecutor.prototype.execute = function () {
        var variables = this.controller.module.view._input;
        var ctxVariables = {};
        var varNum = 0;
        for (var i in variables) {
            if (variables[i] != null) {
                varNum++;
                ctxVariables[i] = variables[i];
            }
        }
        this.context.variables = ctxVariables;
        this.context.defined = varNum;

        this.wasSet = false;

        this._async = false;
        this._done = Promise.resolve();

        try {
            this.theFunction.apply(this.context, this.libs);
        } catch (e) {
            reportError(this.title, e);
        }

        this.setOutput();

    };

    ScriptExecutor.prototype.setOutput = function () {
        var that = this;
        this._done.then(function () {
            if (that.wasSet) {
                that.controller.createDataFromEvent('onScriptEnded', 'outputValue', that.controller.outputObject);
            }
        }, function (e) {
            reportError(that.title, e);
        });
    };

    ScriptExecutor.prototype.async = function () {
        if (this._async) return;
        this._async = true;
        var that = this;
        this._done = new Promise(function (resolve, reject) {
            that.done = function (v) {
                if (Util.objectToString(v) === 'Error') {
                    reject(v);
                } else {
                    resolve();
                }
            };
        });
    };

    ScriptExecutor.prototype.done = function () {
    };

    function reportError(title, e) {
        var message = '';
        if (e && e.stack) {
            message = e.message;
            e = e.stack;
        }
        var str = 'Code executor error';
        if (title) {
            str += ' (' + title + ')';
        }
        if (message) {
            str += ': ' + message;
        }
        Debug.error(str);
        Debug.warn(e);
    }

    return Controller;

});
