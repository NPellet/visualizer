define( [ 'modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api' ], function( Default, Traversing, API ) {
	
	/**
	 * Creates a new empty controller
	 * @class Controller
	 * @name Controller
	 * @constructor
	 */
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'JSME',
		description: 'Displays and interacts with the JSME plugin',
		author: 'Norman Pellet, Luc Patiny',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'jsme'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'mol': {
			label: 'Mol 2D',
			type: [ 'mol2d', 'molfile2d' ]

		},

		'jme': {
			label: 'JME file format',
			type: [ 'jme' ]

		},

		'smiles': {
			label: 'Smiles'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onStructureChange: {
			label: 'Molecular structure has changed',
			refVariable: [ 'mol', 'smiles', 'jme' ]
		}

	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'smiles', 'mol', 'jme' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
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
		};
	}

	controller.prototype.onChange = function(mol, smiles, jme) {
		this.setVarFromEvent('onStructureChange', smiles, 'smiles');
		this.setVarFromEvent('onStructureChange', new DataObject( { type:"mol2d", value: mol } ), 'mol');
		this.setVarFromEvent('onStructureChange', new DataObject( { type:"jme", value: jme } ), 'jme');
	};

	controller.prototype.configAliases = {
		prefs: [ 'groups', 'group', 0, 'prefs', 0 ]
	}

	return controller;

});