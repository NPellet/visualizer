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
		moduleName: 'Two dimensional list',
		description: 'Display an array of data in 2 dimensions using a table',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		'cell': {
			label: 'Data of the cell',
			type: 'object'
		},

		'list': {
			label: 'The array of data to display',
			type: 'array'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		'onHover': {
			label: 'Hovers a cell',
			refVariable: [ 'cell' ],
			refAction: [ 'cell' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'list' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		addElement: 'Add an element'
	};
	
		
	controller.prototype.configurationStructure = function( section ) {
	
		return {
			groups: {
				group: {

					options: { 
						type: 'list' 
					},

					fields: {

						fileuploadurl: {
							type: 'text',
							title: 'Upload URL'
						}
					}
				}
			}
		}
	};
		
	controller.prototype.configAliases = {
		'fileuploadurl': [ 'groups', 'group', 0, 'fileuploadurl', 0 ]
	};

	return controller;
});
