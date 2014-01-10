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
		moduleName: 'Iframe',
		description: 'Shows a integrated iframe with URL as an input',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'iframe'
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
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'url' ];

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
	};

 	return controller;
});
