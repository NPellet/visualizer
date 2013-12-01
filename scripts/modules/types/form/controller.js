
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
				type: [ "object" ],
				label: 'Source object'
			}
		},
		
		configurationStructure: function() {

			return {
				groups: {
					group: {
						options: {
							type: 'list'
						},

						fields: {

							json: {
								type: 'textarea',
								title: 'Form structure'
							}
						}
					}
				}
			}
		},
		
		"export": function() {

		},

		configAliases: {
			structure: [ 'groups', 'group', 0, 'json', 0 ]//,
		//	varsout: [ 'groups', 'varsout', 0 ],
		}

	});

	return controller;
});
