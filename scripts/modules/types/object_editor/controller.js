
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
			
		configurationSend: {
			events: {
				
			},
			rels: {
				
			}			
		},
		
		configurationReceive: {
			source: {
				type: ["object"],
				label: 'Object source',
				description: 'An object to edit'
			},

			sourcepartial: {
				type: ["object"],
				label: 'Partial object',
				description: ''
			}		
		},
		
		moduleInformations: {
			moduleName: 'Object editor'
		},
		
		doConfiguration: function(section) {

			return {
				groups: {
					'xml': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Textarea',
								name: 'json',
								title: 'XML'
							},

							{
								type: 'Checkbox',
								name: 'labels',
								title: 'Display labels',
								options: {'display': ''}
							}
						]
					}
				}
			}	

		},
		
		doFillConfiguration: function() {
			var json = this.module.getConfiguration().json || '';
			var label = this.module.getConfiguration().labels;
			if(label == undefined)
				label = true;
			
			return {	
				groups: {
					xml: [{
						json: [json],
						labels: [label ? ['display'] : []]	
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			
			this.module.getConfiguration().json = confSection[0].xml[0].json[0];
			this.module.getConfiguration().labels = !!confSection[0].xml[0].labels[0][0];
		},

		"export": function() {
			//return this.module.view.table.exportToTabDelimited();
		}

	});

	return controller;
});
