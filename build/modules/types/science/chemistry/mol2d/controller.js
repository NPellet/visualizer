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
		moduleName: 'CWC molfile displayer',
		description: 'Display 2D molfiles',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'mol2d'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		mol2d: {
			type: ['mol2d', 'molfile2D'],
			label: 'A mol 2D file',
		},

		atomLabels: {
			type: ['array'],
			label: 'An array containing the labels of the atoms'
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
	controller.prototype.variablesIn = [ 'mol2d', 'atomLabels' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		return { };
	};

		
	controller.prototype.configAliases = { };

 	return controller;
});