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
		moduleName: 'GC-MS',
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
			type: 'fromTo'
		},

		fromtoMS: {
			label: 'From - To on MS',
			type: 'fromTo'
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
			type: ["jcamp"],
			label: 'MS'	
		},

		mscont: {
			type: ["jcamp"],
			label: 'Continuous MS'	
		},

		annotationgc: {
			type: ["array"],
			label: 'Array of annotations for the GC'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onZoomGCChange: {
			label: 'Zoom over GC spectra',
			refAction: [ 'fromtoGC' ]
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
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'gcms', 'jcamp', 'gc', 'ms', 'mscont', 'annotationgc' ];

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
		hideChemicalLabels: 'Hide chemical labels'
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
