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
				onChange: {
					label: 'On value change'
				}
			},
			
			rels: {
				
			}		
		},
		
		actions: {
			rel: {}
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
							
						]
					}
				}
			};
		},
		
		doFillConfiguration: function() {

			return {
				groups: {
					gencfg: [{
						
					}]
				}
			}
		},
			
		doSaveConfiguration: function(confSection) {	
			
		},

		"export": function() {
		}
	});

	return controller;
});
