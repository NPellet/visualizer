'use strict';

define(['modules/types/client_interaction/code_editor/controller', 'src/util/api', 'src/util/debug'], function (CodeEditor, API, Debug) {

    function Controller() {
    }

    Controller.prototype = Object.create(CodeEditor.prototype);

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
        display: ['groups', 'group', 0, 'display', 0],
        libs: ['groups', 'libs', 0],
        buttons: ['groups', 'buttons', 0]
    };

    Controller.prototype.onButtonClick = function (name) {
        var executor = this.getExecutor();
        executor.setButton(name);
        executor.execute();
    };

    Controller.prototype.onVariableIn = function () {
        var executor = this.getExecutor();
        executor.setVariable();
        executor.execute();
    };

    Controller.prototype.onActionIn = function (name, value) {
        var executor = this.getExecutor();
        executor.setAction(name, value);
        executor.execute();
    };

    Controller.prototype.getExecutor = function () {
        return new ScriptExecutor(this);
    };

    Controller.prototype.initImpl = function () {
        var neededLibs = this.module.getConfiguration('libs');
        this.require = {
            start: 'require' + getRequireStart(neededLibs),
            end: '\n});'
        };
        this.resolveReady();
    };

    function ScriptExecutor(controller) {
        this.controller = controller;
        this.context = new ScriptExecutorContext(this);
        this.outputVariable = {};
    }

    ScriptExecutor.prototype.setButton = function (name) {
        this.context.event = 'button';
        this.context.button = name;
    };

    ScriptExecutor.prototype.setVariable = function () {
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
        this.outputVariable[name] = value;
    };

    var methods = ['getVariables', 'getEvent', 'getButton', 'get', 'getDefined', 'set', 'getAction', 'sendAction', 'setAsync', 'done'];
    var strMethods = methods.join(',');
    var mappedMethods = methods.map(function (val) {
        return '__c__.' + val + '.bind(__c__)';
    }).join(',');

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

        this._done = Promise.resolve();

        var strToEval =
            this.controller.require.start +
            'try {\n' +
            '(function (' + strMethods + ', Debug) {\n' +
            this.controller.module.view._code +
            '\n}).call(__c__,' + mappedMethods + ');\n' +
            '} catch(e) {Debug.error("Code executor error", e)}\n' +
            '__e__.setOutput();\n' +
            this.controller.require.end;

        evaluate(strToEval, this.context, this);

    };

    ScriptExecutor.prototype.setOutput = function () {
        var self = this;
        this._done.then(function () {
            self.controller.lastData = self.outputVariable;
            self.controller.createDataFromEvent('onScriptEnded', 'outputValue', self.outputVariable);
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

    function ScriptExecutorContext(executor) {
        this.__executor__ = executor;
    }


    ScriptExecutorContext.prototype = {
        getVariables: function () {
            return this.variables;
        },
        getEvent: function () {
            return this.event;
        },
        getButton: function () {
            return this.button;
        },
        'get': function (name) {
            return this.variables[name];
        },
        getDefined: function () {
            return this.defined;
        },
        'set': function (name, value) {
            this.__executor__.doVariable(name, value);
        },
        getAction: function () {
            return this.action;
        },
        sendAction: function (name, value) {
            API.doAction(name, value);
        },
        setAsync: function () {
            this.__executor__.async();
        },
        done: function () {
            this.__executor__.done();
        }
    };

    function getRequireStart(neededLibs) {
        var required = '( [ "src/util/api"';
        var callback = 'function( API';

        if (neededLibs) {
            for (var i = 0; i < neededLibs.length; i++) {
                var neededLib = neededLibs[i];
                if (neededLib.lib) {
                    required += ', "' + neededLib.lib + '"';
                    callback += ', ' + (neededLib.alias || 'required_anonymous_' + i);
                }
            }
        }

        return required + ' ], ' + callback + ' ){\n';
    }

    function evaluate(__s__, __c__, __e__,
                      Controller, getRequireStart, ScriptExecutorContext, ScriptExecutor, CodeEditor, methods, strMethods, mappedMethods // redefine module variables to prevent modification
    ) {
        eval(__s__);
    }

    return Controller;
});
