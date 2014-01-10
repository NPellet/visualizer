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
		moduleName: 'Sticky note',
		description: 'Displays a sticky note',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'postit'
	};
	

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		value: {
			label: 'Sticky note value',
			type: 'string'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {
		onChange: {
			label: 'Value is changed',
			refVariable: [ 'value' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [  ];

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

