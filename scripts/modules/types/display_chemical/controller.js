define(function(['modules/defaultcontroller'], function(Default)) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {
	
		init: function() {
			
			var module = this.module;
			var actions;
			if(!(actions = this.module.definition.dataSend))	
				return;
					
			if(typeof actions.onEntryHover !== "undefined")
				console.log('Implement it =)');
			// do something if you want !
		},
		
		configurationSend: {

			events: {
				onEntryHover: {
					label: 'mouse over a chemical',
					description: 'When the mouses moves over a new entry in the array'
				}
			},
			
			rels: {
				'listelement': {
					label: 'Element in the list',
					description: 'Returns the selected element in the list'
				}
			}
		
		},
		
		configurationReceive: {
			chemical: {
				type: 'chemical',
				label: 'Chemical',
				description: 'Receives any chemical'
			}
		},
		
		
		moduleInformations: {
			moduleName: 'Chemical displayer'
		}

	});

	return controller;
});