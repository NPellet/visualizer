define(['modules/default/defaultcontroller', 'src/util/datatraversing'], function(Default, Traversing) {



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
		moduleName: '2D NMR',
		description: 'Display 2D NMRs using the plot library',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: '2dnmr'
	};
	

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'jcampx': {
			type: ["jcamp"],
			label: 'Jcamp on top axis'
		},

		'jcampy': {
			type: ["jcamp"],
			label: 'Jcamp on left axis'
		},

		'jcampxy': {
			type: ["jcamp"],
			label: 'Jcamp on left and top axis'
		},

		'jcamp2d': {
			type: ["jcamp"],
			label: '2D Jcamp'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

	};
	
	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'jcampx', 'jcampy', 'jcampxy', 'jcamp2d' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		
	};
		
	controller.prototype.configurationStructure = function(section) {
		
	};

	return controller;
});
