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
		moduleName: 'Simple Form',
		description: 'A simple module allowing one to display a form in the module',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'form_simple'
	};
	

	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		formValue: {
			type: 'object',
			label: 'JSON Value of the form'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {
		onChange: {
			label: 'Form has changed',
			refVariable: [ 'formValue' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ ];


	controller.prototype.configurationStructure = function() {

		return {
			sections: {

				structure: FormCreator.makeConfig(),
		
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
	},
	
		
	controller.prototype.configAliases = {
		structure: [ 'sections', 'structure' ],
		tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
		tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ]
	};


	controller.prototype.valueChanged = function( newValue ) {
		this.setVarFromEvent('onChange', newValue, 'formValue');
	};
	
	return controller;
});
