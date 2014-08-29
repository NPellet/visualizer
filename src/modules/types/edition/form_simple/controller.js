define( [ 'modules/default/defaultcontroller', 'lib/formcreator/formcreator', 'src/util/datatraversing' ], function( Default, FormCreator, Traversing ) {
	
	"use strict";
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
			label: 'Input object',
			type: 'object'
		},

		output_object: {
			type: 'object',
			label: 'Output object'
		},

        formatted_output: {
            type: 'object',
            label: 'Formatted output object'
        }
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {
		onChange: {
			label: 'Form has changed',
			refVariable: [ 'output_object', 'formatted_output' ]
		},

		formTriggered: {
			label: 'Form is triggered',
			refAction: [ 'output_object' ],
			refVariable: [ 'output_object', 'formatted_output' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'input_object' ];


	controller.prototype.configurationStructure = function() {

		var jpaths = [];
		var arr = this.module.getDataFromRel('input_object');

		if( arr ) {
			arr = arr.get();
			Traversing.getJPathsFromElement( arr, jpaths );
		}

		return {
			sections: {

				structure: FormCreator.makeConfig({ jpaths: jpaths, name: 'Fill with'}),
				trigger: {
					options: { title: "Trigger" },
					groups: { trigger: { options: { type: 'list' }, fields: {
                                                    triggerType: { type: "combo", title: "Trigger type", options: [ {key: 'btn', title: 'Button'}, { key: 'change', title: 'On change'} ], displaySource: { btn:'btn' } },
                                                    buttonLabel : { type: 'text', title: 'Button label', 'default': 'OK', displayTarget: ['btn']}
                                                }} }
				},
		
				formdata: {

					options: {
						title: 'Form data'
					},

					groups: {

						formdata: {

							options: {
								type: 'list',
								multiple: false
							},

							fields: {
								replaceEntryVar: {
									type: "checkbox",
									title: "Replace entry variable",
									options: {"replace": ""}
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
									type: 'jscode',
									title: 'HTML template',
                                    mode: 'html',
                                    default: '<span class="form-dyn" data-form-content="field:name:label"></span>\n<div class="form-dyn" data-form-content="field:name:dom"></div>'
								}
							}
						}
					}
				}
			}
		};
	};

	controller.prototype.configFunctions = {
		replaceObj: function( val ) {
			return val == "replace";
		}
	};

	controller.prototype.configAliases = {
		structure: [ 'sections', 'structure' ],
		tpl_file: [ 'sections', 'template', 0, 'groups', 'template', 0, 'file', 0 ],
		tpl_html: [ 'sections', 'template', 0, 'groups', 'template', 0, 'html', 0 ],
		trigger: [ 'sections', 'trigger', 0, 'groups', 'trigger', 0, 'triggerType', 0 ],
		replaceObj: [ 'sections', 'formdata', 0, 'groups', 'formdata', 0, 'replaceEntryVar', 0, 0 ],
      	btnLabel: [ 'sections', 'trigger', 0, 'groups', 'trigger', 0, 'buttonLabel', 0 ]
	};


	controller.prototype.valueChanged = function( newValue ) {

		if( this.module.getConfiguration( "replaceObj" ) ) {

			this.setVarFromEvent( 'onChange', 'output_object', 'input_object', [] );

		} else {
            this.createDataFromEvent( 'onChange', 'formatted_output', formatValue(newValue) );
			this.createDataFromEvent( 'onChange', 'output_object', newValue );
		}
	};

	controller.prototype.formTriggered = function( value ) {
		this.sendAction('formValue', value, 'formTriggered' );
	};

    function formatValue(value) {
        var result = {};
        var objToFormat = value.sections.main[0].groups.main[0];
        for(var i in objToFormat) {
            result[i] = formatFieldValue(objToFormat[i]);
        }
        return result;
    }

    function formatFieldValue(value) {
        if(value.length === 1) {
            return value[0];
        } else {
            return value;
        }
    }
	
	return controller;
});
