'use strict';

define(['modules/types/client_interaction/code_editor/controller', 'src/util/api', 'src/util/debug', 'src/util/sandbox', 'src/util/util'], function (CodeEditor, API, Debug, Sandbox, Util) {

    function Controller() {
        CodeEditor.call(this);
        this.currentScript = null;
        this.outputObject = {};
        this.reloaded = true;
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

    Controller.prototype.actionsIn.execute = 'Execute the code';

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
                            default: []
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
            var self = this;
            this.reloaded = false;
            var prom = new Promise(function (resolve, reject) {
                require(self.neededUrls, function () {
                    var libs = new Array(self.neededUrls.length);
                    for (var i = 0; i < self.neededUrls.length; i++) {
                        libs[i] = arguments[i];
                    }
                    if (self._executor) { // close previous sandbox
                        self._executor._sandbox.close();
                    }
                    var executor = new ScriptExecutor(self, libs);
                    self.currentScript = newScript;
                    self._executor = executor;
                    self._loadingExecutor = null;
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

    function ScriptExecutor(controller, libs) {
        this.controller = controller;
        this.libs = libs;
        var context = getNewContext(this);
        var theCode = this.controller.module.view._code;
        this._sandbox = new Sandbox();
        this._sandbox.setContext(context);
        this._sandbox.run(
            'var __exec__ = function(' +
            controller.neededAliases +
            ') {' + theCode + '\n};'
        );
        this.wasSet = false;
        this.theFunction = this._sandbox.getContext().__exec__;
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
        var done = function () {
            executor.done();
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
            var err = e;
            if (e && e.stack) {
                err = e.stack;
            }
            Debug.error('Code executor error', err);
        }

        this.setOutput();

    };

    ScriptExecutor.prototype.setOutput = function () {
        var self = this;
        this._done.then(function () {
            if (self.wasSet) {
                self.controller.createDataFromEvent('onScriptEnded', 'outputValue', self.controller.outputObject);
            }
        }, function (e) {
            Debug.error('Code executor error', e);
        });
    };

    ScriptExecutor.prototype.async = function () {
        if (this._async) return;
        this._async = true;
        var self = this;
        this._done = new Promise(function (resolve, reject) {
            self.done = function (v) {
                if (v instanceof Error) {
                    reject(v);
                } else {
                    resolve(v);
                }
            };
        });
    };

    ScriptExecutor.prototype.done = function () {
    };

    return Controller;

});
