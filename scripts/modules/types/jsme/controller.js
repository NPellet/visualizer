
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		onChange: function(mol, smiles) {
			this.setVarFromEvent('onStructureChange', mol, 'mol');
			this.setVarFromEvent('onStructureChange', smiles, 'smiles');
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
				},

				'smiles': {
					label: 'Smiles'
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

