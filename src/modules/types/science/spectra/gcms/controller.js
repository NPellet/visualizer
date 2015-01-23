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
		name: 'GC-MS',
		description: 'Displays a GC-MS using the plot library',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'gcms'
	};
	
		
	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		

		fromtoGC: {
			label: 'From - To on GC',
			type: ['fromTo', 'object']
		},

		centerGC: {
			label: 'Center GC',
			type: ['number', 'string', 'array']
		},

		fromtoMS: {
			label: 'From - To on MS',
			type: 'fromTo'
		},

		ingredientList: {
			label: 'List of ingredients',
			type: 'array'
		},

		GCIntegration: {
			label: 'Integration on the GC',
			type: 'object'
		},

		MSTrace: {
			label: 'MS data corresponding to an integration',
			type: 'object'
		},

		MSIon: {
			label: 'An integrated ion trace',
			type: 'object'
		},

		gcms: {
			type: ["jcamp", "array", "object"],
			label: 'GC-MS data'
		},

		jcamp: {
			type: ["jcamp", "string"],
			label: 'GC-MS data via JCamp'
		},

		gc: {
			type: ["jcamp"],
			label: 'GC'	
		},
		
		ms: {
			type: ["array"],
			label: 'MS'	
		},

		msdata: {
			type: ["array"],
			label: "Parsed MS Data"
		},

		gcdata: {
			type: ["array"],
			label: "Parsed GC Data"
		},

		mscont: {
			type: ["jcamp"],
			label: 'Continuous MS'	
		},

		annotationgc: {
			type: ["array"],
			label: 'Array of annotations for the GC'
		},

		mzList: {
			type: ["array"],
			label: 'List of m/z selected'	
		},

		selectedIngredient: {
			type: ["object"],
			label: "Selected ingredient"
		},

		msIndex: {
			type: ['number'],
			label: 'MS Index'
		},

		msMouse: {
			type: [ 'array' ],
			label: 'Current MS Moused'
		},

		msAUC: {
			type: [ 'array' ],
			label: 'AUC MS'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onZoomGCChange: {
			label: 'Zoom over GC spectra',
			refAction: [ 'fromtoGC', 'centerGC' ]
		},

		onZoomMSChange: {
			label: 'Zoom over MS spectra',
			refAction: [ 'fromtoMS' ]
		},

		onIntegralSelect: {
			label: 'Integration is selected',
			refVariable: [ 'GCIntegration', 'MSTrace' ],
			refAction: [ 'GCIntegration', 'MSTrace' ]
		},

		onIntegralAdd: {
			label: 'Integral is added',
			refAction: [ 'GCIntegration' ]
		},

		onIntegralRemove: {
			label: 'Integral is removed',
			refAction: [ 'GCIntegration' ]
		},

		onIntegralChange: {
			label: 'Integral is changed',
			refAction: [ 'GCIntegration', 'MSTrace' ],
			refVariable: [ 'GCIntegration', 'MSTrace' ]
		},

		onMSTrackingAdded: {
			label: 'Add vertical tracking line over MS spectra',
			refAction: [ 'MSIon' ], // We can either send the ion trace by action or also by variable
			refVariable: [ 'MSIon' ] // Unused until 28.12.2013
		},

		onJCampParsed: {
			label: "After the Jcamp has been parsed",
			refVariable: [ 'msdata', 'gcdata' ]
		},

		onMZSelectionChange: {
			label: 'm/z selection has changed',
			refAction: [ 'mzList' ]
		},

		onIngredientSelected: {
			label: "Ingredient is selected",
			refAction: [ 'selectedIngredient' ]
		},

		onMSIndexChanged: {
			label: 'MS Index has changed',
			refAction: [ 'msIndex' ],
			refVariable: [ 'msMouse' ]
		},

		onMSChange: {
			label: 'MS has changed',
			refVariable: [ 'ms' ]
		}

	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'gcms', 'jcamp', 'gc', 'ms', 'mscont', 'annotationgc', 'ingredientList' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		fromtoGC: 'From - To on GC',
		fromtoMS: 'From - To on MS',
		zoomOnAnnotation: 'Zoom on annotation',
		annotation: 'Annotation',
		displayChemicalLabels: 'Display chemical labels',
		hideChemicalLabels: 'Hide chemical labels',
		centerGC: 'Center GC at value',
		externalMS: 'Set external MS',
		setMSIndexData: 'Change MS data index'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {
						
						continuous: {
							type: 'checkbox',
							title: 'MS Continuous',
							options: {'continuous': 'Continuous'}
						}
					}
				}
			}
		};
	};


	controller.prototype.configFunctions = {
		continuous: function( cfg ) {
			 return cfg[ 0 ] == "continuous";
		}
	};

	controller.prototype.configAliases = {
		'continuous': ['groups', 'group', 0, 'continuous', 0 ]
	};

 	return controller;
});
