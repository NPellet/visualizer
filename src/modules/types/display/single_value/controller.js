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
		moduleName: 'Display value',
		description: 'Display a displayable element',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'single_value'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		"value": {
			label: 'Any displayable object'
			
		},
		
		"color": {
			type: "string",
			label: "A color to fill the module with"
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
	controller.prototype.variablesIn = [ 'value', 'color' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
		return {

			groups: {

				group: {
					options: {
						type: 'list'
					},

					fields: {

						defaultvalue: {
							type: 'wysiwyg',
							title: 'Default value'
						},

						fontcolor: {
							type: 'color',
							title: 'Foreground color'
						},

						font: {
							type: 'combo',
							title: 'Font',
							options: [
								{title: 'Arial', key: 'arial'},
								{title: 'Arial Black', key: 'arial black'},
								{title: 'Comic Sans MS', key: 'comic sans ms'},
								{title: 'Courier', key: 'courier'},
								{title: 'Courier new', key: 'courier new'},
								{title: 'Georgia', key: 'georgia'},
								{title: 'Helvetica', key: 'helvetica'},
								{title: 'Impact', key: 'impact'},
								{title: 'Palatino', key: 'palatino'},
								{title: 'Times new roman', key: 'times new roman'},
								{title: 'Trebuchet MS', key: 'trebuchet ms'},
								{title: 'Verdana', key: 'verdana'}
							],

							displaySource:  {
								'arial': 1,
								'verdana': 4,
								'trebuchet ms': 3,
								'palatino': 5
							}
						},

						fontsize: {

							displayTarget: [1,3,4],

							type: 'combo',
							title: 'Font size',
							options: [
								{title: '8pt', key: '8pt'},
								{title: '9pt', key: '9pt'},
								{title: '10pt', key: '10pt'},
								{title: '11pt', key: '11pt'},
								{title: '12pt', key: '12pt'},
								{title: '13pt', key: '13pt'},
								{title: '14pt', key: '14pt'},
								{title: '18pt', key: '18pt'},
								{title: '24pt', key: '24pt'},
								{title: '30pt', key: '30pt'},
								{title: '36pt', key: '36pt'},
								{title: '48pt', key: '48pt'},
								{title: '64pt', key: '64pt'}
							]
						},
						
						align: {
							type: 'combo',
							title: 'Alignment',
							options: [
								{title: 'Left', key: 'left'},
								{title: 'Center', key: 'center'},
								{title: 'Right', key: 'right'}
							]
						},

						valign: {
							type: 'combo',
							title: 'Vertical align',
							options: [
								{title: 'Top', key: 'top'},
								{title: 'Middle', key: 'middle'},
								{title: 'Bottom', key: 'bottom'}
							]
						},

						sprintf: {
							type: 'text',
							title: 'Sprintf'
						},

						sprintfOrder: {
							type: 'text',
							title: 'Sprintf var order',
							multiple: true
						},

						preformatted: {
							type: 'checkbox',
							title: 'Preformatted',
							options: { 'pre': 'Display as preformatted text'}
						},
					}
				}
			}
		}
	};

	controller.prototype.configFunctions = {
		'preformatted': function(cfg) { return cfg.indexOf('pre') == -1 ? 'normal' : 'pre'; }
	};

	controller.prototype.configAliases = {
		'fontcolor': [ 'groups', 'group', 0, 'fontcolor', 0 ],
		'font': [ 'groups', 'group', 0, 'font', 0 ],
		'fontsize': [ 'groups', 'group', 0, 'fontsize', 0 ],
		'align': [ 'groups', 'group', 0, 'align', 0 ],
		'valign': [ 'groups', 'group', 0, 'valign', 0 ],
		'defaultvalue': [ 'groups', 'group', 0, 'defaultvalue', 0 ],
		'sprintf': [ 'groups', 'group', 0, 'sprintf', 0 ],
		'sprintfOrder': [ 'groups', 'group', 0, 'sprintfOrder' ],
		'preformatted': [ 'groups', 'group', 0, 'preformatted', 0 ],
	}

 	return controller;
});