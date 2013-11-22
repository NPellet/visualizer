define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
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

		actions: {
			rel: {'jsmolscript': 'Script JSMol'}
		},
		
		// Called by view
		onButtonClick:function(){
            var cfg = $.proxy(this.module.getConfiguration, this.module);
			var obj = new DataObject({type: 'jsmolscript', value:cfg("script")[0]});
			this.sendAction('jsmolscript', obj);
		},
		
		moduleInformations: {
			moduleName: 'Script Action'
		},
		
        configurationStructure: function(section) {

            //var jpaths = this.module.model.getjPath();

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
        },

        configAliases: {
            'padding': [ 'groups', 'group', 0, 'padding', 0],
            'btnvalue': [ 'groups', 'group', 0, 'btnvalue', 0],
            'iseditable': [ 'groups', 'group', 0 , 'iseditable', 0],
            'script': [ 'groups', 'group', 0, 'script']
        }

		
	});

	return controller;
});