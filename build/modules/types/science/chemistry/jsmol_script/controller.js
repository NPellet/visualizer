define(['modules/default/defaultcontroller'], function(Default) {
	
	function controller() {};

    controller.prototype = $.extend( true, {}, Default );


    controller.prototype.moduleInformation = {
        moduleName: 'JSMol Script',
        description: 'Display a JSMol module',
        author: 'Nathanaêl Khodl, Luc Patiny',
        date: '30.12.2013',
        license: 'MIT',
        cssClass: 'jsmol_script'
    };


	controller.prototype.configurationSend = {
		events: {
			onActionSent: {
				label: 'Send the JSMol script',
				description: 'On button click'
			}
		},
		
		rels: {
			'jsmolscript': {
				label: 'JSMol Script',
				description: 'Return the current script'
			}
			
		}
	},

	controller.prototype.actions = {
		rel: {'jsmolscript': 'Script JSMol'}
	},
	
	// Called by view
	controller.prototype.onButtonClick = function() {
        var cfg = $.proxy(this.module.getConfiguration, this.module);
		var obj = new DataObject({type: 'jsmolscript', value:cfg("script")[0]});
		this.sendAction('jsmolscript', obj);
	}
	

	
    controller.prototype.configurationStructure = function(section) {
        return {
            groups: {
                'group': {
                    options: {
                        type: 'list'
                    },

                    fields: {

                        padding :{
                            type: 'text',
                            name: 'padding',
                            title: 'Padding (px)',
                            default:'6'
                        },

                        btnvalue :{
                            type: 'text',
                            name: 'btnvalue',
                            title: 'Button text',
                            default:'Execute script'
                        },

                        iseditable :{
                            name: 'iseditable',
                            title: 'Display editor',
                            default: 'true',
                            type: 'checkbox',
                            options: { 'true': 'Show the script editor'}
                        },

                        script : {
                            type: 'jscode',
                            name: 'script',
                            title: 'Script'
                        }
                    }
                }
            }
        }
    }

    controller.prototype.configAliases = {
        'padding': [ 'groups', 'group', 0, 'padding', 0],
        'btnvalue': [ 'groups', 'group', 0, 'btnvalue', 0],
        'iseditable': [ 'groups', 'group', 0 , 'iseditable', 0],
        'script': [ 'groups', 'group', 0, 'script']
    }

		


	return controller;
});