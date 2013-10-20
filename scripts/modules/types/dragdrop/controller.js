define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		init: function() {
			
		},

		onDropped: function(obj) {

			this.setVarFromEvent('onDropped', obj);
		},

		configurationSend: {

			events: {
				onDropped: {
					label: 'A file has been opened'
				}
			},
			
			rels: {
				'object': {
					label: 'Dropped file'
				}
			}		
		},
		
		actions: {
			rel: {

			}
		},

		actionsReceive: { },

		configurationReceive: {
				
		},
		
		
		configurationStructure: function(section) {
			
			var jpaths = this.module.model.getjPath();

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {
							vartype: {
								type: 'text',
								title: 'Variable type (optional)'
							},

							label: {
								type: 'text',
								title: 'Displayed text'
							}
						}
					}
				}
			}		
		},
		

		configAliases: {
			'vartype': function(cfg) { return cfg.groups.group[ 0 ].vartype[ 0 ]; },
			'label': function(cfg) { return cfg.groups.group[ 0 ].label[ 0 ]; }
		},


		"export": function() {
		}
	});

	return controller;
});
