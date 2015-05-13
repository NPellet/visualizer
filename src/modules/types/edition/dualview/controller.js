'use strict';

define(['modules/default/defaultcontroller', 'modules/types/edition/onde/controller', 'modules/types/display/template-twig/controller'], function(Default, OndeC, TwigC) {

    function controller() {
		this.twigC = new TwigC();
		this.ondeC = new OndeC();
    }

    controller.prototype = $.extend(true, {}, Default);

	controller.prototype.setModule = function(module) {
		this.module = module;
		this.twigC.module = module.twigM;
		this.twigC.module.controller = this.twigC;
		this.ondeC.module = module.ondeM;
		this.ondeC.module.controller = this.ondeC;
	};
	
	controller.prototype.init = function() {
		this.twigC.init();
		this.ondeC.init();
	};

    controller.prototype.moduleInformation = {
        name: 'Edit/Display',
        description: 'Dual-view module, with a displayer that is based on Twig and a JSON editor based on Onde.',
        author: 'Michaël Zasso',
        date: '13.05.2014',
        license: 'MIT',
        cssClass: 'dualview'
    };

    controller.prototype.references = {
        value: {
            label: 'Any object'
        }
    };

    controller.prototype.variablesIn = ['value'];

    controller.prototype.configurationStructure = function() {

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
                        },
						schema: {
							type: 'jscode',
							title: 'Schema',
							mode: 'json',
							default: '{}'
						},
						button_text: {
							type: 'text',
							title: 'Text of the save button',
							default: 'Save'
						}
                    }
                }
            }
        };
    };
	
	controller.prototype.configFunctions = {
		mode: function(){return 'schema';},
		schemaSource: function(){return 'config';},
		output: function(){return 'modified';}
	};

    controller.prototype.configAliases = {
        template: ['groups', 'group', 0, 'template', 0],
		schema: ['groups', 'group', 0, 'schema', 0],
		button_text: ['groups', 'group', 0, 'button_text', 0],
		mode: [],
		schemaSource: [],
		output: []
    };

    return controller;
});
