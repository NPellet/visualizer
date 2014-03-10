define( [ 'modules/default/defaultcontroller', 'lib/formcreator/formcreator', 'src/util/datatraversing' ], function( Default, FormCreator, Traversing ) {
	
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
		input_object: {
			label: 'Input object'
		},

		formValue: {
			type: 'object',
			label: 'Value of the form'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {
		onChange: {
			label: 'Form has changed',
			refVariable: [ 'formValue' ]
		},

		formTriggered: {
			label: 'Form is triggered',
			refAction: [ 'formValue' ],
			refVariable: [ 'formValue' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'input_object' ];


	controller.prototype.configurationStructure = function() {

		var jpaths = [];
		arr = this.module.getDataFromRel('input_object');

		if( arr ) {
			arr = arr.get();
			Traversing.getJPathsFromElement( arr, jpaths );
		}


		return {
			sections: {

				structure: FormCreator.makeConfig({ jpaths: jpaths, name: 'Fill with'}),
				trigger: {
					options: { title: "Trigger" },
					groups: { trigger: { options: { type: 'list' }, fields: { triggerType: { type: "combo", title: "Trigger type", options: [ {key: 'btn', title: 'Button'}, { key: 'change', title: 'On change'} ] }}} }
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
	},
		
	controller.prototype.configAliases = {
		structure: [ 'sections', 'structure' ],
		tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
		tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ],
		trigger: [ 'sections', 'trigger', 0, 'groups', 'trigger', 0, 'triggerType', 0 ]
	};


	controller.prototype.valueChanged = function( newValue ) {
		this.setVarFromEvent('onChange', newValue, 'formValue');
	};

	controller.prototype.formTriggered = function( value ) {
		console.log( value );
		this.sendAction('formValue', value, 'formTriggered' );
	};
	
	return controller;
});
