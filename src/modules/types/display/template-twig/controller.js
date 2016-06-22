'use strict';

define(['jquery', 'modules/default/defaultcontroller'], function ($, Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Twig template',
        description: 'Display parts of an object using a twig template',
        author: 'Michaël Zasso',
        date: '02.04.2014',
        license: 'MIT',
        cssClass: 'twig'
    };

    Controller.prototype.references = {
        value: {
            label: 'Any object'
        },
        tpl: {
            label: 'Template',
            type: 'string'
        },
        renderedHtml: {
            label: 'Rendered HTML',
            type: 'string'
        },
        form: {
            label: 'form object'
        },
        style: {
            label: 'Style object'
        }
    };

    Controller.prototype.events = {
        onRendered: {
            label: 'Html was rendered',
            refVariable: ['renderedHtml'],
            refAction: ['renderedHtml']
        },
        onFormChanged: {
            label: 'Form changed',
            refVariable: ['form'],
            refAction: ['form']
        },
        onFormSubmitted: {
            label: 'Form submitted',
            refVariable: ['form'],
            refAction: ['form']
        }
    };

    Controller.prototype.variablesIn = ['value', 'tpl', 'form', 'style'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        selectable: {
                            type: 'checkbox',
                            title: 'Selectable',
                            options: {
                                yes: 'Yes'
                            }
                        },
                        template: {
                            type: 'jscode',
                            title: 'Template',
                            mode: 'html',
                            'default': ''
                        },
                        modifyInForm: {
                            type: 'checkbox',
                            title: 'Modify form in',
                            options: {
                                yes: 'Yes'
                            }
                        },
                        debouncing: {
                            type: 'float',
                            title: 'Debouncing',
                            default: 0
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        template: ['groups', 'group', 0, 'template', 0],
        selectable: ['groups', 'group', 0, 'selectable', 0],
        modifyInForm: ['groups', 'group', 0, 'modifyInForm', 0],
        debouncing: ['groups', 'group', 0, 'debouncing', 0]
    };

    Controller.prototype.onRendered = function (renderedHtml) {
        setTimeout(() => { // Figure out why I have to set timeout
            this.createDataFromEvent('onRendered', 'renderedHtml', renderedHtml);
            this.sendActionFromEvent('onRendered', 'renderedHtml', renderedHtml);
        }, 0);
    };

    Controller.prototype.onFormChanged = function (out) {
        this._doForm('onFormChanged', out);
    };

    Controller.prototype.onFormSubmitted = function (out) {
        this._doForm('onFormSubmitted', out);
    };


    Controller.prototype._doForm = function (event, out) {
        this.createDataFromEvent(event, 'form', out);
        this.sendActionFromEvent(event, 'form', out);

        if (this.module.getConfigurationCheckbox('modifyInForm', 'yes') && this.module.view.formObject) {
            this.module.view.formObject.mergeWith(JSON.parse(JSON.stringify(out)), this.module.getId());
        }
    };

    return Controller;
});
