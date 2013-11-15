
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
								title: 'JSON Structure'
							},

							labels: {
								type: 'checkbox',
								title: 'Display labels',
								options: {'display': ''}
							}
						}
					}
				}
			}
		},
		
		"export": function() {

		}

	});

	return controller;
});
