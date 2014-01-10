define( [ 'modules/default/defaultcontroller', 'lib/formcreator/formcreator' ], function( Default, FormCreator ) {
	
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
		moduleName: 'Filter',
		description: 'A filtering module that takes variables in, modifies them, and outputs some other variables',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'filter'
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
		'onFilter': {
			label: 'Filtering is done'
		},

		'onBeforeFilter': {
			label: 'Before filtering script it called'
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
		return {

			groups: {
				cfg: {
					options: {
						type: 'list'
					},

					fields: {

						script: {
							type: 'jscode',
							title: 'Filtering script'
						}
					}
				}
			},

			sections: {
				filterElement: FormCreator.makeConfig( )
			}
		}
	};

		
	controller.prototype.configFunctions = {
		varsout: function( cfg ) {
			if( ! ( cfg instanceof Array ) ) {
				return [];
			}
			return cfg;
		},

		script: function( cfg ) {
			if( ! cfg ) {
				return '';
			}

			return cfg;
		},

		filters: function( cfg ) {
			if( ! ( cfg instanceof Array ) ) {
				return [];
			}
			return cfg;
		}
	};

	controller.prototype.configAliases = {
		filters: [ 'sections', 'filterElement' ],
		script: [ 'groups', 'cfg', 0, 'script', 0 ]
	};

 	return controller;
});
