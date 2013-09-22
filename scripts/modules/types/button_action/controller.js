define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
	
		onClick: function(on) {
			var self = this;
			this.sendAction('string', this.module.getConfiguration().text, 'onClick');
			this.sendAction('string', this.module.getConfiguration().text, (on ? 'onToggleOn' : 'onToggleOff'));
		},

		configurationSend: {

			events: {
				onToggleOn: {
					label: 'Toggle On'
				},

				onToggleOff: {
					label: 'Toggle Off'
				},

				onClick: {
					label: 'Click'
				}
			},
			
			rels: {
				
			}		
		},
		
		actions: {
			rel: {'string': 'Action string'}
		},

		actionsReceive: { },

		configurationReceive: {
				
		},
		
		doConfiguration: function(section) {

			return {
				groups: {
					'gencfg': {
						config: {
							type: 'list'
						},

						fields: [
							{
								type: 'Text',
								name: 'label',
								title: 'Button label'
							},

							{
								type: 'Text',
								name: 'text',
								title: 'Action text to send'
							}


						]
					}
				}
			};
		},
		
		doFillConfiguration: function() {

			return {
				groups: {
					gencfg: [{
						label: [this.module.getConfiguration().label],
						text: [this.module.getConfiguration().text]
					}]
				}
			}
		},
			
		doSaveConfiguration: function(confSection) {	
			this.module.getConfiguration().text = confSection[0].gencfg[0].text[0];
			this.module.getConfiguration().label = confSection[0].gencfg[0].label[0];
		},

		"export": function() {
		}
	});

	return controller;
});
