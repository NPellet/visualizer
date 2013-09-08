
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		onChange: function(mol) {
			this.setVarFromEvent('onStructureChange', mol);
		},

		configurationSend: {
			
			events: {
				'onStructureChange': {
					label: 'Molecular structure has changed'
				}
			},
			
			rels: {
				'mol': {
					label: 'Mol 2D'
				}
			}
		},
		
		configurationReceive: {
			
			mol: {
				type: ['molfile2D'],
				label: 'Mol 2D'
			}

		},

		moduleInformations: {
		},

		actions: {
			rel: {
				
			}
		},

		actionsReceive: {
			
		},

		doConfiguration: function(section) {

			return {};
		},
		
		doFillConfiguration: function() {
			return {}
		},
		
		doSaveConfiguration: function(confSection) {
			return;
		}


	});

	return controller;
});

