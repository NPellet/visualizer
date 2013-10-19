define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		configurationSend: {
		},
		
		hoverEvent: function(data) {

		},

		
		configurationReceive: {
			"mol2d": {
				type: ['mol2d', 'molfile2D'],
				label: 'A mol 2D file',
				description: ''
			},

			atomLabels: {
				type: ['array'],
				label: 'An array containing the labels of the atoms',
				description: ''	
			}
		},

		configurationStructure: function() { return {}; }
	});

	return controller;
});