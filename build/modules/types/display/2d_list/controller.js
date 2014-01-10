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
		license: 'MIT',
		cssClass: '2d_list'
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
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		addElement: 'Add an element'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
		var jpaths = this.module.model.getjPath();
		
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {

						colnumber: {
							type: 'text',
							default: 5,
							title: 'Number of columns'
						},

						valjPath: {
							type: 'combo',
							title: 'Value jPath',
							options: jpaths
						},

						colorjPath: {
							type: 'combo',
							title: 'Color jPath',
							options: jpaths
						},

						width: {
							type: 'text',
							title: 'Cell width'
						},

						height: {
							type: 'text',
							title: 'Cell height'
						}
					}
				}
			}
		}
	};

		
	controller.prototype.configAliases = {
		'colnumber': [ 'groups', 'group', 0, 'colnumber', 0 ],
		'colorjpath': [ 'groups', 'group', 0, 'colorjPath', 0 ],
		'valjpath': [ 'groups', 'group', 0, 'valjPath', 0 ]
	};

 	return controller;
});