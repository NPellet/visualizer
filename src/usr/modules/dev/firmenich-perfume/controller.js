define( [ 'modules/default/defaultcontroller' ], function( Default ) {
	
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
		moduleName: 'Firmenich perfume creation',
		description: 'Allows the creation of a perfume',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'firmenich_perfume_crea'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		
		"ingredients": {
			label: 'Ingredients',
			type: 'array'
		},
		
		"bases": {
			label: 'Bases',
			type: 'array'
		},

		"perfume": {
			type: 'object',
			label: 'Perfume'
		},


		"perfumeInformation": {
			type: 'object',
			label: 'Perfume Information'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onPerfumeAdded': {
			label: 'Perfume is added'
		},

		'onCompositionChange': {
			label: 'Composition has changed',
			refAction: [ 'perfume' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'ingredients', 'bases', 'perfumeInformation' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		addPerfume: 'Add a perfume to the table',
		addIngredient: 'Add an ingredient'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {

						url: {
							type: 'text',
							title: 'Search URL'
						},

						button: {
							type: 'checkbox',
							title: 'Search button',
							options: { button: '' }
						},

						buttonlabel: {
							type: 'text',
							title: 'Button text'
						},

						buttonlabel_exec: {
							type: 'text',
							title: 'Button text (executing)'
						},

						onloadsearch: {
							type: 'checkbox',
							title: 'Make one query on load',
							options: { button: '' }
						},

						resultfilter: {
							type: 'jscode',
							title: 'Result data filter'
						}
					}
				},

				searchparams: {
					options: {
						type: 'table',
						multiple: true,
						title: 'Seach parameters'
					},

					fields: {
						name: {
							type: 'text',
							title: 'Term name'
						},

						label: {
							type: 'text',
							title: 'Term label'
						},

						defaultvalue: {
							type: 'text',
							title: 'Default value'
						},

						fieldtype: {
							type: 'combo',
							title: 'Field type',
							options: [
								{ key: 'text', title: 'Text'},
								{ key: 'textarea', title: 'Textarea'},
								{ key: 'combo', title: 'Combo'},
								{ key: 'checkbox', title: 'Checkbox'}
							]
						},

						fieldoptions: {
							type: 'text',
							title: 'Field options (a:b;)'
						}
					}
				},

			},

			sections: {
				postvariables: {
					options: {
						multiple: false,
						title: 'POST variables'
					},

					groups: {
						postvariables: {
							options: {
								type: 'table',
								multiple: true
							},

							fields: {
								
								variable: {
									type: 'text',
									title: 'Variable'
								},

								name: {
									type: 'text',
									title: 'Form variable name'
								},

								filter: {
									type: 'combo',
									title: 'Filter',
									options: [{key: 'none', title: 'None'}, {key: 'value', title: 'Only value'}]
								}
							}
						},
					}

				}

			}
		}
	};

	controller.prototype.configFunctions = {
		'button': function(cfg) { return cfg.indexOf('button') > -1; }
	};

	controller.prototype.configAliases = {
		'button': [ 'groups', 'group', 0, 'button', 0 ],
		'url': [ 'groups', 'group', 0, 'url', 0 ],
		'searchparams': [ 'groups', 'searchparams', 0 ],
		'buttonlabel': [ 'groups', 'group', 0, 'buttonlabel', 0 ],
		'buttonlabel_exec': [ 'groups', 'group', 0, 'buttonlabel_exec', 0 ],
		'onloadsearch': [ 'groups', 'group', 0, 'onloadsearch', 0, 0 ],
		'resultfilter': [ 'groups', 'group', 0, 'resultfilter', 0 ],
		'postvariables': [ 'sections', 'postvariables', 0, 'groups', 'postvariables', 0 ]
	};


	controller.prototype.compositionChanged = function( perfume ) {

		this.sendAction( 'perfume', perfume, 'onCompositionChange' );
	}

 	return controller;
});
