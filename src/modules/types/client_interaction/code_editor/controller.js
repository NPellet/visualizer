'use strict';

define(['modules/default/defaultcontroller', 'src/data/structures', 'src/util/debug'], function (Default, Structure, Debug) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        name: 'Code editor',
        description: 'Write code in any language and send the content to another module',
        author: 'Michaël Zasso',
        date: '27.08.2014',
        license: 'MIT'
    };

    Controller.prototype.references = {
        value: {
            label: 'String containing the code'
        },
        jsonValue: {
            label: 'JSON-parsed value'
        },
        typedValue: {
            label: 'The typed value'
        }
    };

    Controller.prototype.events = {
        onEditorChange: {
            label: 'The value in the editor has changed',
            refVariable: ['value', 'jsonValue', 'typedValue']
        },
        onButtonClick: {
            label: 'The button was clicked',
            refAction: ['value', 'jsonValue'],
            refVariable: ['value', 'jsonValue', 'typedValue']
        }
    };

    Controller.prototype.variablesIn = ['value'];

    Controller.prototype.configurationStructure = function () {
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
                        mode: {
                            type: 'combo',
                            title: 'Mode',
                            options: [
                                {title: 'Text', key: 'text'},
                                {title: 'Javascript', key: 'javascript'},
                                {title: 'JSON', key: 'json'},
                                {title: 'HTML', key: 'html'},
                                {title: 'XML', key: 'xml'},
                                {title: 'Markdown', key: 'markdown'}
                            ],
                            'default': 'text'
                        },
                        outputType: {
                            type: 'combo',
                            title: 'Type of output value (optional)',
                            options: typeList
                        },
                        btnvalue: {
                            type: 'text',
                            title: 'Button text',
                            'default': 'Send script'
                        },
                        iseditable: {
                            title: 'Display editor',
                            'default': ['editable'],
                            type: 'checkbox',
                            options: {
                                editable: 'Show the code editor'
                            }
                        },
                        hasButton: {
                            title: 'Display button',
                            'default': ['button'],
                            type: 'checkbox',
                            options: {
                                button: 'Show the button'
                            }
                        },
                        script: {
                            type: 'jscode',
                            title: 'Code',
                            mode: 'html'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        mode: ['groups', 'group', 0, 'mode', 0],
        btnvalue: ['groups', 'group', 0, 'btnvalue', 0],
        iseditable: ['groups', 'group', 0, 'iseditable', 0],
        hasButton: ['groups', 'group', 0, 'hasButton', 0],
        script: ['groups', 'group', 0, 'script', 0],
        outputType: ['groups', 'group', 0, 'outputType', 0],
    };

    Controller.prototype.onEditorChanged = function (value) {
        this.createDataFromEvent('onEditorChange', 'value', value);

        var json = getJsonValue(value);
        this.createDataFromEvent('onEditorChange', 'jsonValue', json);
        var typedValue = this.getTypedValue(value);
        if(typedValue !== null)
            this.createDataFromEvent('onEditorChange', 'typedValue', typedValue);
    };

    Controller.prototype.onButtonClick = function (value) {
        this.createDataFromEvent('onButtonClick', 'value', value);
        this.sendActionFromEvent('onButtonClick', 'value', value);

        var json = getJsonValue(value);
        this.createDataFromEvent('onButtonClick', 'jsonValue', json);
        this.sendActionFromEvent('onButtonClick', 'jsonValue', json);

        var typedValue = this.getTypedValue(value);
        if(typedValue !== null)
        this.createDataFromEvent('onButtonClick', 'typedValue', typedValue);
        //this.sendAction()
    };

    Controller.prototype.getTypedValue = function(val) {
        var type = this.module.getConfiguration('outputType');
        if(!type) return null;
        return {
            type: this.module.getConfiguration('outputType'),
            value: val
        };
    };

    function getJsonValue(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    return Controller;

});
