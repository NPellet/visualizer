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
		moduleName: 'IV stability',
		description: 'Dedicated module to show IV Stability files',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'url': {
			type: ["string"],
			label: 'URL',
			description: 'Iframe URL'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'url' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		addSerie: 'Add a new serie',
		removeSerie: 'Remove a serie'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
	};

		
	controller.prototype.configAliases = {
	};

 	return controller;
});
