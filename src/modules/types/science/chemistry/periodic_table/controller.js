'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Periodic table',
        description: 'Display the periodic table of elements',
        author: 'Daniel Kostro',
        date: '09.06.2015',
        license: 'MIT',
        cssClass: 'periodic-table'
    };

    Controller.prototype.references = {
        template: {
            label: 'Template'
        },
        value: {
            label: 'Periodic tabel elements'
        }
    };

    Controller.prototype.variablesIn = ['template', 'value'];

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

    Controller.prototype.configAliases = {};

    return Controller;

});
