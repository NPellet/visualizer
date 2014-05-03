define(['modules/default/defaultcontroller'], function(Default) {

    function controller() {
    }
    ;

    controller.prototype = $.extend(true, {}, Default);

    controller.prototype.moduleInformation = {
        moduleName: 'Twig template',
        description: 'Display parts of an object using a twig template',
        author: 'Michaël Zasso',
        date: '02.04.2014',
        license: 'MIT',
        cssClass: 'twig'
    };

    controller.prototype.references = {
        "value": {
            label: 'Any object'
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
                            title: 'Template',
                            mode: 'html',
                            default: ''
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
