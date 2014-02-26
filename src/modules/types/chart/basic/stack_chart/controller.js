define(['modules/default/defaultcontroller','src/util/datatraversing','src/util/api'], function(Default, Traversing, API) {
	
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
		moduleName: 'Stack chart',
		description: 'Display a Bars or Line or points chart based on flot',
		author: 'Khalid Arroub',
		date: '07.01.2014',
		license: 'MIT',
		cssClass: 'stack_chart'
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events

		onHover: {
			label: 'Hover a piece of chart',
			refVariable: [ 'piece' ]
		}
	};
	
	controller.prototype.onHover = function(element) {
		if( ! element ) {
			return;
		}
		this.setVarFromEvent( 'onHover', element, 'piece' );
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
		chart: {
			type: ['chart'],
			label: 'A json describing a chart'
		},
		
	};



	controller.prototype.elementHover = function(element) {
		if( ! element ) {
			return;
		}

		// this.setVarFromEvent( 'onHover', element, 'row' );
		if (this._highlighted) {
			API.highlight( this._highlighted, 0 );
		}
		API.highlight( element, 1 );
		this._highlighted=element;
	},

	controller.prototype.elementOut = function() {
		if (this._highlighted) {
			API.highlight( this._highlighted, 0 );
		}
	};


	/*
		Configuration of the module for receiving events, as a static object
		In the form of 
	*/
	controller.prototype.variablesIn = [ 'chart' ];
	

	controller.prototype.configurationStructure = function() {
		return {
			groups: {
				group: {
					options: {
						type: 'list'
					},

					fields: {
						nodeType : {
							type: 'combo',
							title: 'Node Type',
							default: 'Bars',
							options: [
								{title: 'Bars', key: 'Bars'},
								{title: 'Lines', key: 'Lines'},
								{title: 'withStack', key: 'withStack'},
								{title: 'WithoutStack', key: 'WithoutStack'}
							]
						},

						nodeSize: {
							type: 'text',
							title: 'Default node size'
						},

						nodeColor: {
							type: 'color',
							title: 'Default node color'
						},

						labelSize: {
							type: 'text',
							title: 'Default label size'
						},

						labelColor: {
							type: 'color',
							title: 'Default label color'
						},

						edgeWidth: {
							type: 'text',
							title: 'Default edge width'
						},

						edgeColor: {
							type: 'color',
							title: 'Default edge color'
						},

						strokeWidth: {
							type: 'text',
							title: 'Background line width'
						},

						strokeColor: {
							type: 'color',
							title: 'Background line color'
						}
					}
				}
			}
		}
	};
	
	controller.prototype.configAliases = {
		'nodeType': [ 'groups', 'group', 0, 'nodeType', 0 ],
		'nodeSize': [ 'groups', 'group', 0, 'nodeSize', 0 ],
		'nodeColor': [ 'groups', 'group', 0, 'nodeColor', 0 ],
		'labelSize': [ 'groups', 'group', 0, 'labelSize', 0 ],
		'labelColor': [ 'groups', 'group', 0, 'labelColor', 0 ],
		'edgeWidth': [ 'groups', 'group', 0, 'edgeWidth', 0 ],
		'edgeColor': [ 'groups', 'group', 0, 'edgeColor', 0 ],
		'strokeWidth': [ 'groups', 'group', 0, 'strokeWidth', 0 ],
		'strokeColor': [ 'groups', 'group', 0, 'strokeColor', 0 ]
	};


 	return controller;
});

