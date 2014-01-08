/*!
 * dummy_module/controller.js
 * Controller file for dummy module, as a demonstration purpose
 *
 * Copyright (c) 2011-2014, Norman Pellet (norman.pellet@gmail.com)
 * Dual licensed under the MIT license.
 *
 * Find the complete project under
 *    https://github.com/NPellet/visualizer/
 *
 * @summary     Controller file for a dummy module
 * @file        controller.js
 * @version     1.0
 * @author      Norman Pellet
 * @license     MIT
 *
 *

	@depends: jquery
	@depends: modules/defaultcontroller.js
	@depends: util/api.js
*************************************************************************/

define(['jquery', 'modules/defaultcontroller', 'util/api'], function($, Default, API) {
	
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
		moduleName: 'Demonstration module',
		description: 'This module shows the basic features that can be implemented',
		author: 'Norman Pellet',
		date: '23.12.2013',
		license: 'MIT',
		cssClass: 'dummy_module'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {

		'row': {
			label: 'Row'
		},

		'list': {
			label: 'Data of the table'
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
		'onClick': { // When the user clicks on a line of the table
			label: 'Click on a line',
			refVariable: [ 'row', 'table' ],
			refAction: [ 'row', 'table' ]
		},
		
		'onHover': {
			label: 'Hovers a line',
			refVariable: [ 'row' ],
			refAction: [ 'table' ] // For instance, we could decide that through actions, we may only send the whole table
		}
	};
	

	/*
		Configuration of the module for receiving variables as a static array of references
	*/
	controller.prototype.variablesIn = ["list"];
		

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		addRow: 		'Add a new row',
		addColumn: 		'Add a new column',
		removeColumn: 	'Remove a column',
		removeRow: 		'Remove a row'
	};
	
	
	

	/*
		Handling mouse events over the table
	*/


	/**
	 * Called from the view when a line is hovered
	 *
	 * @param {Object} element Array element that is hovered
	 */
	controller.prototype.onLineHover =  function( element ) {
		
		// No corresponding element ?
		if( ! element ) {
			return;
		}

		// Calls parent method that sets any variable corresponding to
		// the event "onHover"
		// and the rel "row"
		this.setVarFromEvent( 'onHover', element, 'row' );

		// We may also want to send out the whole table when a row is hovered, for whatever purpose
		this.setVarFromEvent( 'onHover', this.model.getDataFromRel( 'table' ), 'table' );

		// We highlight the element through the API
		API.highlight( element, 1 );	
	};


	/**
	 * Called from the view when the mouse leaves an element
	 * No variable is set when this event is triggered
	 *
	 * @param {Object} element Array element that the mouse just left
	 */
	controller.prototype.onLineOut =  function( element ) {
		
		// No corresponding element ?
		if( ! element ) {
			return;
		}

		// We un-highlight the element through the API
		API.highlight( element, 0 );
	};


	/**
	 * Called from the view when a line is hovered
	 *
	 * @param {Object} element Array element that was clicked
	 */
	controller.prototype.onLineClick =  function( element ) {
		
		// No corresponding element ?
		if( ! element ) {
			return;
		}

		this.setVarFromEvent( 'onClick', element, 'row' );
		this.setVarFromEvent( 'onClick', this.model.getDataFromRel( 'table' ), 'table' );
	};





	/**
	 * Configures the module specific configuration form
	 *
	 * @param {FormSection} section Section containing the module specific fields
	 */
	controller.prototype.configurationStructure = function(section) {
		
		// We get all the available jpaths for a row
		var jpaths = this.module.model.getjPath( 'row' );

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
							options: [
								{key: "0", title: "No"},
								{key: "single", title:"Single row"},
								{key: "multiple", title:"Multiple rows"}
							]
						},

						colorjpath: {
							type: 'combo',
							title: 'Color jPath',
							options: jpaths
						},

						displaySearch: {
							type: 'checkbox',
							options: { 'allow': 'Allow searching' }
						},


						filterRow: {
							type: 'jscode',
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

		var data = API.getVar(name);
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


	/*
		List of all aliases that may be called from the view through this.module.getConfiguration(aliasName)
		It corresponds to an array directing to the specific field of the config form
	*/
	controller.prototype.configAliases = {
		'colsjPaths': [ 'groups', 'cols', 0 ],
		'nbLines': [ 'groups', 'group', 0, 'nblines', 0 ],
		'toggle': [ 'groups', 'group', 0, 'toggle', 0 ],
		'colorjPath': [ 'groups', 'group', 0, 'colorjpath', 0 ],
		'displaySearch': [ 'groups', 'group', 0, 'displaySearch', 0, 0 ],
		'filterRow': [ 'groups', 'group', 0, 'filterRow', 0 ]
	};


	/*
		List all function modifiers called after configAliases has been retrieved.
		If no modifier is specified, then getConfiguration() returns the alias value
	*/
	controller.prototype.configFunctions = {
		'colsjPaths': function(cfg) { return cfg || [] }
	};


	/**
	 * Exports the module
	 *
	 */
	controller.prototype["export"] = function() {
			
	};

	return controller;
	
});