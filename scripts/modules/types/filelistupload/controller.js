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
			filelist: {
				type: ["array"],
				label: 'List',
				description: 'A list of files'
			}		
		},
		
		actions: {
		
		},

		actionsReceive: {
		
		},
		
		
		configurationStructure: function() {

			return {
				groups: {
					group: {

						options: { 
							type: 'list' 
						},

						fields: {

							fileuploadurl: {
								type: 'text',
								title: 'Upload URL'
							}

						}
					}
				}
			}
		},
		

		configAliases: {
			'fileuploadurl': function(cfg) { return cfg.groups.group[ 0 ].fileuploadurl[ 0 ]; }
		},

		"export": function() {
		
		}

	});

	return controller;
});