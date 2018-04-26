'use strict';

define(['jquery', 'modules/default/defaultcontroller'], function ($, Default) {
    function Controller() {}

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Quill text editor',
        description: 'The quill wysiwyg editor',
        author: 'Miguel Asencio',
        date: '01.03.2018',
        license: 'MIT',
        cssClass: 'quill_editor'
    };

    Controller.prototype.references = {
        quill: {
            label: 'A Quill Delta object'
        }
    };

    Controller.prototype.events = {
        onEditorChange: {
            label: 'The value in the editor has changed',
            refVariable: ['quill']
        }
    };

    Controller.prototype.variablesIn = [];

    Controller.prototype.onRemove = function () {};

    Controller.prototype.valueChanged = function (value) {
        if (this.module.getConfigurationCheckbox('storeInView', 'yes')) {
            this.module.definition.richtext = value;
        }
        this.createDataFromEvent(
            'onEditorChange',
            'quill',
            value
        );
    };

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        editable: {
                            type: 'checkbox',
                            title: 'Is Editable',
                            options: {isEditable: 'Yes'},
                            default: ['isEditable']
                        },
                        debouncing: {
                            type: 'float',
                            title: 'Debouncing (ms)',
                            default: 0
                        },
                        storeInView: {
                            type: 'checkbox',
                            title: 'Store content in view',
                            options: {yes: 'Yes'},
                            default: ['yes']
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.actionsIn = {
        insertHtml: 'Insert html',
        insertText: 'Insert text'
    };

    Controller.prototype.configAliases = {
        editable: ['groups', 'group', 0, 'editable', 0],
        storeInView: ['groups', 'group', 0, 'storeInView', 0],
        debouncing: ['groups', 'group', 0, 'debouncing', 0]
    };

    return Controller;
});
