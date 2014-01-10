define( [ 'modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api' ], function( Default, Traversing, API ) {
	
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
		moduleName: 'Complex grid',
		description: 'Displays a complex (but slower) grid with editable capability. Works async',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'jqgrid'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'row': {
			label: 'Row'
		},

		'list': {
			label: 'Table'
		},

		'selectedrows': {
			label: 'Selected rows'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onSelect: {
			label: 'A line is selected',
			refVariable: [ 'row' ],
			refAction: [ 'row' ]
		},
		
		onHover: {
			label: 'Hovers a line',
			refVariable: [ 'row' ],
			refAction: [ 'row' ]
		},

		onToggleOn: {
			label: 'On Toggle On',
			refVariables: [ 'selectedrows' ],
			refAction: [ 'row' ]
		},

		onToggleOff: {
			label: 'On Toggle Off',
			refVariables: [ 'selectedrows' ],
			refAction: [ 'row' ]
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'list' ];

	/*
		Received actions
	*/
	controller.prototype.actionsIn = {
		addRow: 'Add a new row',
		addColumn: 'Add a new column',
		removeColumn: 'Remove a column',
		removeRow: 'Remove a row'
	};
	
		
	controller.prototype.configurationStructure = function(section) {
		
		var jpaths = this.module.model.getjPath('element');
		return {
			groups: {

				group: {
					options: {
						type: 'list',
						multiple: false
					},

					fields: {

						nblines: {
							type: 'text',
							title: 'Lines per page',
							default: 20
						},

						toggle: {
							type: 'combo',
							title: 'Line toggling',
							options: [{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]
						},

						colorjpath: {
							type: 'combo',
							title: 'Color jPath',
							options: jpaths
						},

						filterRow: {
							type: 'jscode',
							title: 'Filter'
						}

					}
				},

				cols: {
					options: {
						type: 'table',
						multiple: true,
						title: 'Columns'
					},

					fields: {

						name: {
							type: 'text',
							title: 'Columns title'
						},

						jpath: {
							type: 'combo',
							title: 'jPath',
							options: jpaths
						},

						number: {
							type: 'checkbox',
							title: 'Number ?',
							options: {number: 'Yes'}
						},

						editable: {
							type: 'combo',
							title: 'Editable',
							default: 'none',
							options: [{key: 'none', title: 'No'}, {key: 'text', title: 'Text'}, {key: 'checkbox', title: 'Checkbox'}, {key: 'select', title: 'Combo'}]
						},

						options: {
							type: 'text',
							title: 'Options (; separated)'
						},

						width: {
							type: 'text',
							title: 'Width'
						}
					}
				}
			}
		}	
	};

	
	controller.prototype.onVarReceiveChange = function(name, rel, confSection) {

		var data = API.getVar( name );
		var jpaths = [];
		if(!data)
			return;
		
		if(data.getType() == 'array') 
			Traversing.getJPathsFromElement(data[0], jpaths);
		else if(data.getType() == 'arrayXY')
			Traversing.getJPathsFromElement(data, jpaths);

		if(jpaths.length > 1)
			confSection.getGroup('cols').getField('coljpath').implementation.setOptions(jpaths);
	};



	controller.prototype.configFunctions = {
		'colsjPaths': function(cfg) { return cfg || [] }
	},



	controller.prototype.configAliases = {
		'colsjPaths': [ 'groups', 'cols', 0 ],
		'nbLines': [ 'groups', 'group', 0, 'nblines', 0 ],
		'toggle': [ 'groups', 'group', 0, 'toggle', 0 ],
		'colorjPath': [ 'groups', 'group', 0, 'colorjpath', 0 ],
		'filterRow': [ 'groups', 'group', 0, 'filterRow', 0 ]
	};


	controller.prototype.lineHover = function(element) {
		
		if( ! element ) {
			return;
		}

		this.setVarFromEvent( 'onHover', element, 'row' );

		API.highlight( element, 1 );
	},

	controller.prototype.lineOut = function(element) {

		if( ! element ) {
			return;
		}

		API.highlight( element, 0 );
	};

	controller.prototype.lineClick = function( element ) {

		this.setVarFromEvent( 'onSelect', element, 'row' );
		this.sendAction( 'row', element, 'onSelect' );
	};

	controller.prototype.onToggleOn = function( element ) {

		this.sendAction( 'element', element, 'onToggleOn' );
		this.setVarFromEvent( 'onToggleOn', element );
	};

	controller.prototype.onToggleOff = function( element ) {

		this.sendAction( 'element', element, 'onToggleOff' );
		this.setVarFromEvent( 'onToggleOff', element );
	};

 	return controller;
});
