define(['modules/default/defaultcontroller'], function(Default) {

    function controller() {
    }
    ;

    controller.prototype = $.extend(true, {}, Default);

    controller.prototype.moduleInformation = {
        moduleName: 'Template',
        description: 'Display parts of an object using a mustache template',
        author: 'Michaël Zasso',
        date: '21.01.2014',
        license: 'MIT',
        cssClass: 'mustache'
    };

    controller.prototype.references = {
        "value": {
            label: 'Any object',
            type: 'object'
        },
        "tpl" : {
            label: 'Template',
            type: 'string'
        }

    };

    controller.prototype.variablesIn = ['value', 'tpl'];

    controller.prototype.configurationStructure = function(section) {

        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        template: {
                            type: 'jscode',
                            title: 'Template'
                        }

                    }
                }
            }
        };
    };

    controller.prototype.configAliases = {
        'template': ['groups', 'group', 0, 'template', 0]
    };

    return controller;
});