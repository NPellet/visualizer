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
		moduleName: 'Hashmap display',
		description: 'Displays a json element in a list',
		author: 'Norman Pellet',
		date: '28.12.2013',
		license: 'MIT',
		cssClass: 'hashmap'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		
		'hashmap': {
			label: 'Flat json object',
			type: 'object'
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
	controller.prototype.variablesIn = [ 'hashmap' ];

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
		
		var jpaths = this.module.model.getjPath( 'hashmap' );

		return {

			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {

						hideemptylines: {
							type: 'checkbox',
							title: 'Hide empty lines',
							options: {'hide': 'Hide empty lines'}
						}
					}
				},

				keys: {

					options: {
						type: 'table',
						multiple: true,
						title: 'Fields to display'
					},

					fields: {

						jpath: {
							type: 'combo',
							title: 'J-Path',
							options: jpaths
						},

						label: {
							type: 'text',
							title: 'Label'
						},

						printf: {
							type: 'text',
							title: 'printf'
						} 
					}

				}
			}
		}
	};

		
	controller.prototype.configAliases = {
		'keys': [ 'groups', 'keys', 0 ],
		'hideemptylines': [ 'groups', 'group', 0, 'hideemptylines', 0 ]
	};

	controller.prototype.configFunctions = {
		hideemptylines: function( cfg ) {
			return cfg[0] == 'hide';
		}
	};

 	return controller;
});