
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		onChange: function(mol, smiles) {
			this.setVarFromEvent('onStructureChange', smiles, 'smiles');
			this.setVarFromEvent('onStructureChange', new DataObject({type:"mol2d", value:mol}), 'mol');
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
				type: ['mol2d',"molfile2d"],
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

		configurationStructure: function(section) {

			return {
				groups: {

					group: {

						options: {
							type: 'list'
						},

						fields: {
							
							prefs: {

								type: 'checkbox',
								title: 'Options',
								default: [ 'oldlook' ],
								options: {
									'noxbutton': 'Hide X button',
								 	'rbutton': 'Show R button',
								 	'nohydrogens': 'Hide hydrogens',
								 	'query': 'Enable query features',
								 	'autoez': 'Automatic generation of SMULES with E,Z stereochemistry',
								 	'nocanonize': 'Prevent canonicalization and detection of aromaticity',
								 	'nostereo': 'No stereochemistry in SMILES',
								 	'reaction': 'Enable reaction input',
								 	'multipart': 'Allow multipart structures',
									'polarnitro': "Don't convert automatically nitro to unpolar form",
									'number': 'Allow to number atoms',
									'depict': 'Only display structure (no editing)',
									'border': 'With depict option, display the border around the molecule',
									'star': 'Display start button allowing hightlight of atoms (placed in the smiels)',
									'oldlook': 'Use the old look'
								}
							}
						}
					}
				}
			}
		},

		configAliases: {
			prefs: [ 'groups', 'group', 0, 'prefs', 0 ]
		}
	});

	return controller;
});

