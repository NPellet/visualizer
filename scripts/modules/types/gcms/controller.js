define(['modules/defaultcontroller', 'util/datatraversing'], function(Default, Traversing) {


	function controller() {

	};

	controller.prototype = $.extend(true, {}, Default, {


		configurationSend: {

			events: {
				
			},
			
			rels: {
				
			}
			
		},
		
		configurationReceive: {
			gcms: {
				type: ["array", "object"],
				label: 'GC-MS data'
			}		
		},
		
		actions: {
			//rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
		},


		actionsReceive: {
			'addSerie': 'Add a new serie',
			'removeSerie': 'Remove a serie'
		},


		moduleInformations: {
			moduleName: 'IV Stability Test'
		},
		
		doConfiguration: function(section) {

			return true;
		},
		
		doFillConfiguration: function() {


		},
			
		doSaveConfiguration: function(confSection) {	

		}
	});

	return controller;
});
