'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

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
        }
    };

    Controller.prototype.events = {
        onRendered: {
            label: 'Html was rendered',
            refVariable: ['renderedHtml'],
            refAction: ['renderedHtml']
        }
    };

    Controller.prototype.variablesIn = ['value', 'tpl'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        template: {
                            type: 'jscode',
                            title: 'Template',
                            mode: 'html',
                            'default': ''
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        template: ['groups', 'group', 0, 'template', 0]
    };

    Controller.prototype.onRendered = function (renderedHtml) {
        setTimeout(() => { // Figure out why I have to set timeout
            this.createDataFromEvent('onRendered', 'renderedHtml', renderedHtml);
        });
    };

    return Controller;
});
