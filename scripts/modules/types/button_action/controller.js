define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
	
		onClick: function(on) {
			
			var text = this.module.getConfiguration( 'text' );

			this.sendAction('string', text, 'onClick');
			this.sendAction('string', text, (on ? 'onToggleOn' : 'onToggleOff'));
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
		
		configurationStructure: function(section) {

			return {

				groups: {

					group: {

						options: {
							type: 'list'
						},

						fields: {

							label: {
								type: 'text',								
								title: 'Button label',
								default: 'Action'
							},

							text: {
								type: 'text',
								title: 'Action text to send'
							}
						}
					}
				}
			};
		},
		

		configAliases: {
			'label': [ 'groups', 'group', 0, 'label', 0 ],
			'text': [ 'groups', 'group', 0, 'text', 0 ]
		},

		"export": function() {
		}
	});

	return controller;
});
