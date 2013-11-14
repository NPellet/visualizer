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

			/*
			'element': {
					label: 'Row',
					description: 'Returns the selected row in the list'
				
			*/
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

        /*
		configurationReceive: {

			"script":{
				type:['string','text'],
				label:"Script text"
			},

			"iseditable":{
				type:['boolean','text'],
				label:"Is editable boolean"
			},
			
			"btnvalue": {
				type: ['string'],
				label: 'Button text',
				description: ''
			}
		},
		*/
		
		
		moduleInformations: {
			moduleName: 'Script Action'
		},
		

        /*
		doConfiguration: function(section) {
			
			return {
				groups: {
					'module': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'text',
								name: 'btnvalue',
								title: 'Button text'
							},

							{
								type: 'Checkbox',
								options: { 'allow': 'Show the script editor'},
								name: 'iseditable',
								title: 'Display editor'
							},

							{
								type: 'JScode',
								name: 'script',
								title: 'Script'
							}
						]
					}
				}
			}
			
		},


		doFillConfiguration: function() {
			
			var defaultbtnvalue = this.module.getConfiguration().btnvalue || "Execute script";
			var defaultscript = this.module.getConfiguration().script || "";
			var defaultiseditable = this.module.getConfiguration().iseditable || "allow" ;

			return {
				groups: {
					module: [{
						btnvalue: [defaultbtnvalue],
						script: [defaultscript],
						iseditable: [defaultiseditable],
					}]
				}
			}
			
		},
		
		
		doSaveConfiguration: function(confSection) {

			var group = confSection[0].module[0];
			var btnvalue = group.btnvalue[0];
			var script = group.script[0];
			var iseditable = group.iseditable[0];

			this.module.definition.configuration = {
				btnvalue: btnvalue,
				script: script,
				iseditable: iseditable,
			};
			
		}
		*/


        configurationStructure: function(section) {

            //var jpaths = this.module.model.getjPath();

            return {
                groups: {
                    'group': {
                        options: {
                            type: 'list'
                        },

                        fields: {

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
            'btnvalue': [ 'groups', 'group', 0, 'btnvalue'],
            'iseditable': [ 'groups', 'group', 0 , 'iseditable'],
            'script': [ 'groups', 'group', 0, 'script']
        }

		
	});

	return controller;
});