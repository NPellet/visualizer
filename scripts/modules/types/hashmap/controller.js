define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: { },
		configurationReceive: {
			'hashmap': {
				type: [ 'object' ],
				label: 'A simple 1 level json object',
				description: ''
			}	
		},
		
		configurationStructure: function(section) {

			var jpaths = this.module.model.getjPath( 'hashmap' );			
			return {

				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {

							hideemptylines: {
								type: 'checkbox',
								title: 'Hide empty lines',
								options: {'hide': 'Hide empty lines'}
							}
						}
					},

					keys: {

						options: {
							type: 'table',
							multiple: true,
							title: 'Fields to display'
						},

						fields: {

							jpath: {
								type: 'combo',
								title: 'J-Path',
								options: jpaths
							},

							label: {
								type: 'text',
								title: 'Label'
							},

							printf: {
								type: 'text',
								title: 'printf'
							} 
						}

					}
				}
			}
		},
	
		configAliases: {
			'keys': function(cfg) { return cfg.groups.keys[ 0 ]; },
			'hideemptylines': function(cfg) { return cfg.groups.group[ 0 ].hideemptylines[ 0 ][ 0 ] == 'hide'; }
		}
	});

	return controller;
});
