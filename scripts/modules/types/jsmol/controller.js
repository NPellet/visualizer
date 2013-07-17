define(['modules/defaultcontroller', 'util/datatraversing', 'util/api'], function(Default, Traversing, API) {
	
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

		},
		
		
		moduleInformations: {
			moduleName: 'JSMol'
		},
		
		
		actions: {
			rel: {}
		},

		actionsReceive: {
			
		},
		
		
		doConfiguration: function(section) {
			
			var data = Traversing.getValueIfNeeded(this.module.data),
				jpaths = [];
			
			if(Traversing.getType(data) == 'array') 
				Traversing.getJPathsFromElement(data[0], jpaths);
			else if(Traversing.getType(data) == 'arrayXY')
				Traversing.getJPathsFromElement(data, jpaths);
			
			return {
			}		
		},
		
		doFillConfiguration: function() {
			return {};
		},
		
		doSaveConfiguration: function(confSection) {
			
		},

		"export": function() {

		}

	});

	return controller;
});