define( [ 'modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api' ], function( Default, API ) {
	
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
			type: [ 'mol2d', 'molfile2d', 'string' ]

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
                                'nopaste': 'Remove the paste menu',
								'border': 'With depict option, display the border around the molecule',
								'star': 'Display start button allowing hightlight of atoms (placed in the smiels)',
								'oldlook': 'Use the old look'
							}
						},
						labelsize: {
							type: 'combo',
							title: 'Label size',
							options: [
								{title: '6pt', key: '6'},
								{title: '7pt', key: '7'},
								{title: '8pt', key: '8'},
								{title: '9pt', key: '9'},
								{title: '10pt', key: '10'},
								{title: '11pt', key: '11'},
								{title: '12pt', key: '12'},
								{title: '13pt', key: '13'},
								{title: '14pt', key: '14'},
								{title: '16pt', key: '16'},
								{title: '18pt', key: '18'},
								{title: '24pt', key: '24'}
							],
							default: 14
						},
						bondwidth: {
							type: 'combo',
							title: 'Bond width',
							options: [
								{title: '1px', key: '1'},
								{title: '1.5px', key: '1.5'},
								{title: '2px', key: '2'}
							],
							default: 1
						}
					}
				}
			}
		};
	}

	controller.prototype.onChange = function(mol, smiles, jme) {
		this.createDataFromEvent('onStructureChange', 'smiles', smiles);
		this.createDataFromEvent('onStructureChange', 'mol', new DataObject( { type:"mol2d", value: mol } ));
		this.createDataFromEvent('onStructureChange', 'jme', new DataObject( { type:"jme", value: jme } ));
	};

	controller.prototype.configAliases = {
		'prefs': [ 'groups', 'group', 0, 'prefs', 0 ],
		'labelsize': [ 'groups', 'group', 0, 'labelsize', 0 ],
		'bondwidth': [ 'groups', 'group', 0, 'bondwidth', 0 ]
	}

	return controller;

});