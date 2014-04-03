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
		moduleName: 'chartjs',
		description: 'Display a Radar chart - Polar area chart - Pie chart et Doughnut chart based on chartjs',
		author: 'Khalid Arroub',
		date: '07.01.2014',
		license: 'MIT',
		cssClass: ''
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
						
						start: {
							type: 'text',
							title: 'Start Value Of Y Axis'
						},

						end: {
							type: 'text',
							title: 'End Value Of Y Axis'
						},

						step: {
							type: 'text',
							title: 'Steps Between'
						},

						point: {
							type: 'checkbox',
								title: 'point',
								options: { 'point': 'Show Point Area'},
						},
						lineshape : {
							type: 'combo',
							title: 'Line Shape',
							options: [
								{title: 'Arc', key: 'arc'},
								{title: 'Line', key: 'line'}
								
							],

							displayTarget: [ 'b' ]
						}

						

					}
				}
			}
		}
	};
	
	controller.prototype.configFunctions = {
		'point': function(cfg) { return cfg.indexOf('point') == -1 ? true : false; }
	};
	controller.prototype.configAliases = {
		'start': [ 'groups', 'group', 0, 'start', 0 ],
		'end': [ 'groups', 'group', 0, 'end', 0],
		'step': [ 'groups', 'group', 0, 'step', 0 ],
		'lineshape': [ 'groups', 'group', 0, 'lineshape', 0 ],
		'point': [ 'groups', 'group', 0, 'point', 0 ]
	};


 	return controller;
});

