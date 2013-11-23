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

		actionsReceive: {
			
		},

		configurationReceive: {
				
		},

		configurationStructure: function() {
			return {};
		},
		
		"export": function() {
		}
	});

	return controller;
});
