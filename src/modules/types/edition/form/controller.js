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
		moduleName: 'Form',
		description: 'A complex module allowing one to display a templated form in the module',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'form'
	};
	

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

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
	controller.prototype.variablesIn = [ ];


	controller.prototype.configurationStructure = function() {

		return {
			sections: {

				structure: {

					options: {
						title: 'Form structure'
					},

					groups: {
						group: {
							options: {
								type: 'list'
							},

							fields: {

								json: {
									type: 'textarea',
									title: 'Form structure'
								}
							}
						}
					}
				},
			

				template: {

					options: {
						title: 'Template'
					},

					groups: {
						template: {
							options: {
								type: 'list',
								multiple: false
							},

							fields: {
								file: {
									type: 'text',
									title: 'Template file'
								},
								
								html: {
									type: 'textarea',
									title: 'HTML template'
								}
							}
						}
					}
				}
			}
		}
	};


	controller.prototype.configAliases ={
		structure: [ 'sections', 'structure', 0, 'groups', 'group', 0, 'json', 0 ],
		tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
		tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ]
	}

	return controller;
});
