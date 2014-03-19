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
						preference : {
							type: 'combo',
							title: 'Node Type',
							default: 'Lines',
							options: [
								{title: 'Bars', key: 'Bars'},
								{title: 'Lines', key: 'Lines'},
								{title: 'Lines With Steps', key: 'Lines With Steps'}
							]
						},
						barWidth : {
							type: 'combo',
							title: 'Bars Width',
							options: [
								{title: '0.3', key: 0.3},
								{title: '0.4', key: 0.4},
								{title: '0.5', key: 0.5},
								{title: '0.6', key: 0.6},
								{title: '0.7', key: 0.7},
								{title: '0.8', key: 0.8},
								{title: '0.9', key: 0.9}
							]
						},
						stack: {
						type: 'checkbox',
							title: 'stack',
							default: false,
							options: { 'stack': 'withStack/withoutStack'}
						},
						fill: {
						type: 'checkbox',
						default: false,
							title: 'fill',
							options: { 'fill': 'withFilling/withoutFilling'}
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
	controller.prototype.configFunctions = {
		'stack': function(cfg) { return cfg.indexOf('stack') == -1 ? null : true; },
		'fill': function(cfg) { return cfg.indexOf('fill') == -1 ? false : true; }
	};
	
	controller.prototype.configAliases = {
		'preference': [ 'groups', 'group', 0, 'preference', 0 ],
		'barWidth': [ 'groups', 'group', 0, 'barWidth', 0],
		'stack': [ 'groups', 'group', 0, 'stack', 0 ],
		'fill': [ 'groups', 'group', 0, 'fill', 0 ],
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

