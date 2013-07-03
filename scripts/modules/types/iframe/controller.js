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
			url: {
				type: ["string"],
				label: 'URL',
				description: 'Iframe URL'
			}		
		},
		
		
		moduleInformations: {
			moduleName: 'Iframe'
		},
		
		
		
		
		doConfiguration: function(section) {
			
			return true;
		},
		
		doFillConfiguration: function() {
			
		},
		
		doSaveConfiguration: function(confSection) {
			
		},

		"export": function() {
			
		}
		
	});

	return controller;
});
