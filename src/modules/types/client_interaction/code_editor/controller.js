define(['modules/default/defaultcontroller'], function (Default) {

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
        }
    };

    Controller.prototype.events = {
        onEditorChange: {
            label: 'The value in the editor has changed',
            refVariable: ['value', 'jsonValue']
        },
        onButtonClick: {
            label: 'The button was clicked',
            refAction: ['value', 'jsonValue'],
            refVariable: ['value', 'jsonValue']
        }
    };

    Controller.prototype.variablesIn = ['value'];

    Controller.prototype.configurationStructure = function () {
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
                                {title: 'XML', key: 'xml'}
                            ],
                            default: 'text'
                        },
                        btnvalue: {
                            type: 'text',
                            title: 'Button text',
                            default: 'Send script'
                        },
                        iseditable: {
                            title: 'Display editor',
                            default: ['editable'],
                            type: 'checkbox',
                            options: {
                                editable: 'Show the code editor'
                            }
                        },
                        hasButton: {
                            title: 'Display button',
                            default: ['button'],
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
        btnvalue: [ 'groups', 'group', 0, 'btnvalue', 0],
        iseditable: [ 'groups', 'group', 0 , 'iseditable', 0],
        hasButton: [ 'groups', 'group', 0 , 'hasButton', 0],
        script: [ 'groups', 'group', 0, 'script', 0]
    };

    Controller.prototype.onEditorChanged = function (value) {
        this.createDataFromEvent('onEditorChange', 'value', value);

        var json = getJsonValue(value);
        this.createDataFromEvent('onEditorChange', 'jsonValue', json);
    };

    Controller.prototype.onButtonClick = function (value) {
        this.createDataFromEvent('onButtonClick', 'value', value);
        this.sendAction('value', value, 'onButtonClick');

        var json = getJsonValue(value);
        this.createDataFromEvent('onButtonClick', 'jsonValue', json);
        this.sendAction('jsonValue', json, 'onButtonClick');
    };

    function getJsonValue(str) {
        try {
            return JSON.parse(str);
        } catch(e) {
            return null;
        }
    }

    return Controller;

});