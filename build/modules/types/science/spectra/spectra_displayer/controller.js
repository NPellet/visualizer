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
		moduleName: 'Plotter',
		description: 'Displays a plot, either data or jcamp',
		author: 'Norman Pellet',
		date: '24.12.2013',
		license: 'MIT',
		cssClass: 'spectra_displayer'
	};
	


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
	
		// ouput	
		x: { 
			label: 'X position',
			type: 'number'
		},

		markerInfos: {
			label: 'Marker infos',
			type: 'object'
		 },

		markerXY: {
			label: 'Marker [x,y]',
			type: 'array'
		},

		// input
		chart: {
			type: ['array','object'],
			label: 'Chart object'
		},

		xArray: {
			type: 'array',
			label: '1D Y array'
		},

		xyArray: {
			type: 'array',
			label: '1D XY array'
		},

		jcamp: {
			type: ['jcamp', 'string'],
			label: 'Jcamp data'
		},

		annotations: {
			type: ['array'],
			label: 'Annotation file'
		},

		fromTo: {
			type: 'fromTo',
			label: 'From - To data'
		}
	};


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		onZoomChange: {
			label: 'Zoom changed',
			refAction: [ 'fromTo' ] 
		},

		onTrackMouse: {
			label: 'Mouse tracking',
			refVariable: [ 'x' ],
			refAction: [ 'x' ]
		},

		onAnnotationAdd: {
			label: 'Annotation added',
			refAction: [ 'annotation' ]
		},

		onMouseOverMarker: {
			label: 'Mouse over a marker',
			refVariable: [ 'markerInfos', 'markerXY' ]
		},

		onMouseOutMarker: {
			label: 'Mouse out of a marker',
			
		}
	};
	

	/*
		Configuration of the module for receiving events, as a static object
	*/
	controller.prototype.variablesIn = [ 'chart', 'xArray', 'xyArray', 'jcamp', 'annotations', 'fromTo' ];

	/*
		Received actions
		In the form of

		{
			actionRef: 'actionLabel'
		}
	*/
	controller.prototype.actionsIn = {
		'fromTo': 'From-To',
		'addSerie': 'Add a serie',
		'removeSerie': 'Remove a serie',
		'removeSerieByName': 'Remove serie (name as input)'
	};
	

	controller.prototype.configurationStructure = function(section) {
		
		var vars = [];
		var currentCfg = this.module.definition.vars_in;

		if(currentCfg) {

			var i = 0,
				l = currentCfg.length;

			for( ; i < l ; i++) {
				if( currentCfg[i].rel == 'jcamp' || currentCfg[i].rel == 'xArray' || currentCfg[i].rel == 'xyArray' || currentCfg[i].rel == 'chart') {
					vars.push({ 
						title: currentCfg[i].name,
						key: currentCfg[i].name
					});
				}
			}
		}


		if( this.module.view.seriesActions ) {

			for(var i = 0, l = this.module.view.seriesActions.length ; i < l; i++ ) {

				vars.push({ 
					title: this.module.view.seriesActions[i][2],
					key: this.module.view.seriesActions[i][2]
				});
			}
		}

		return {
			groups: {

				group: {

					options: {
						type: 'list'
					},

					fields: {

						graphurl: {
							type: 'text',
							title: 'Graph URL',
							default: ''
						},

						flip: {
							type: 'checkbox',
							title: 'Axis flipping',
							options: { 'flipX': 'Flip X', 'flipY': "Flip Y"},
							caseDisplay: {
								flipX: 1,
								flipY: 2
							},
							default: []
						},

						displayAxis: {
							type: 'checkbox',
							title: 'Display axis',
							options: { 
								'x': 'X', 
								'y': 'Y'
							},
							displayCase: [ 1 ],
							default: ['y']
						},

						grids: {
							type: 'checkbox',
							title: 'Grids',
							displayCase: [ 2 ],
							options: { 'hmain': 'Horizontal Main', 'hsec': 'Honrizontal Seconday', 'vmain': 'Vertical Main', 'vsec': 'Vertical Secondary' },
							default: []
						},

						xLabel: {
							type: 'text',
							title: 'X axis label',
							default: ''
						},

						yTopSpacing: {
							type: 'text',
							title: 'Spacing above the data',
							default: 0
						},

						yBottomSpacing: {
							type: 'text',
							title: 'Spacing below the data',
							default: 0
						},

						xLeftSpacing: {
							type: 'text',
							title: 'Spacing left',
							default: 0
						},

						xRightSpacing: {
							type: 'text',
							title: 'Spacing right',
							default: 0
						},

						yLabel: {
							type: 'text',
							title: 'Y axis label',
							default: ''
						},

						minX: {
							type: 'text',
							title: 'Min X',
							default: ''
						},

						maxX: {
							type: 'text',
							title: 'Max X',
							default: ''
						},

						minY: {
							type: 'text',
							title: 'Min Y',
							default: ''
						},

						maxY: {
							type: 'text',
							title: 'Max Y',
							default: ''
						},

						zoom: {
							type: 'combo',
							title: 'Zoom',
							options: [{key: 'x', title: 'X only'}, {key: 'y', title: 'Y only'}, {key: 'xy', title: 'XY'}, {key: 'none', title: 'None'}],
							default: 'none'
						},


						shiftxtozero: {
							type: 'checkbox',
							title: 'Shift X to Min',
							options: {'shift': ''},
							default: []
						},


						xastime: {
							type: 'checkbox',
							title: 'X axis as time',
							options: {'xastime': ''},
							default: []
						},

						wheelAction: {
							type: 'combo',
							title: 'Mouse Wheel',
							options: [{key: 'zoomX', title: 'Zoom X'}, {key: 'zoomY', title: 'Zoom Y'}, {key: 'none', title: 'None'}],
							default: 'none'
						},

						fullOut: {
							type: 'combo',
							title: 'Full out on load',
							options: [{key: 'none', title: 'Never'}, {key: 'xAxis', title: 'X axis'}, {key: 'yAxis', title: 'Y axis'}, {key: 'both', title: 'Both axis'}],
							default: 'both'
						}
					}
				},


				plotinfos: {

					options: {
						type: 'table',
						multiple: true
					},

					fields: {
						
						variable: {
							type: 'combo',
							title: 'Variable',
							options: vars,
							default: ''
						},

						plotcolor: {
							type: 'color',
							title: 'Color',
							default: [1, 1, 255, 1]
						},


						strokewidth: {
							type: 'text',
							title: 'Width (px)',
							default: '1'
						},

						plotcontinuous: {
							type: 'checkbox',
							title: 'Continuous',
							options: {'continuous': 'Continuous'},
							default: ['continuous']
						},

						peakpicking: {
							type: 'checkbox',
							title: 'Peak Picking',
							options: {'picking': 'Peak Picking'},
							default: []
						},


						markers: {
							type: 'checkbox',
							title: 'Markers',
							options: {'markers': 'Show markers'},
							default: []
						},

						normalize: {
							type: 'combo',
							title: 'Normalize',
							options: [{key: 'none', title: 'None'}, {key: 'max1', title: 'Set max to 1'}, {key: 'sum1', title: 'Set sum to 1'}, {key: 'max1min0', title: 'Max 1, Min 0'} ],
							default: 'none'
						},

						optimizeSlots: {
							type: 'checkbox',
							title: 'Optimize with slots',
							options: { 'slots': '' },
							default: []
						}
					}
				}
			}
		}
	};

	
	controller.prototype.configFunctions = {

		displayYAxis: function(cfg) { return cfg.indexOf('y') > -1; },
		displayXAxis: function(cfg) { return cfg.indexOf('x') > -1; },
		vertGridMain: function(cfg) { return cfg.indexOf('vmain') > -1; },
		vertGridSec: function(cfg) { return cfg.indexOf('vsec') > -1; },
		horGridMain: function(cfg) { return cfg.indexOf('hmain') > -1; },
		horGridSec: function(cfg) { return cfg.indexOf('hsec') > -1; },

		shiftxtozero: function(cfg) { return cfg.indexOf('shift') > -1 },
		minX: function(cfg) { return parseFloat(cfg) || false; },
		minY: function(cfg) { return parseFloat(cfg) || false; },
		maxX: function(cfg) { return parseFloat(cfg) || false; },
		maxY: function(cfg) { return parseFloat(cfg) || false; },

		xastime: function(cfg) { return cfg.indexOf('xastime') > -1 },

		flipX: function(cfg) { return cfg.indexOf('flipX') > -1 },
		flipY: function(cfg) { return cfg.indexOf('flipY') > -1 }
	};

		
	controller.prototype.configAliases = {

		graphurl: [ 'groups', 'group', 0, 'graphurl', 0 ],
		shiftxtozero: [ 'groups', 'group', 0, 'shiftxtozero', 0 ],
		displayYAxis: [ 'groups', 'group', 0, 'displayAxis', 0 ],
		yLabel: [ 'groups', 'group', 0, 'yLabel', 0 ],
		displayXAxis: [ 'groups', 'group', 0, 'displayAxis', 0 ],
		xLabel: [ 'groups', 'group', 0, 'xLabel', 0 ],
		vertGridMain: [ 'groups', 'group', 0, 'grids', 0 ],
		vertGridSec: [ 'groups', 'group', 0, 'grids', 0 ],
		xastime: [ 'groups', 'group', 0, 'xastime', 0 ],
		horGridMain: [ 'groups', 'group', 0, 'grids', 0 ],
		horGridSec: [ 'groups', 'group', 0, 'grids', 0 ],
		xLeftSpacing: [ 'groups', 'group', 0, 'xLeftSpacing', 0 ],
		xRightSpacing: [ 'groups', 'group', 0, 'xRightSpacing', 0 ],
		yBottomSpacing: [ 'groups', 'group', 0, 'yBottomSpacing', 0 ],
		yTopSpacing: [ 'groups', 'group', 0, 'yTopSpacing', 0 ],
		wheelAction: [ 'groups', 'group', 0, 'wheelAction', 0 ],
		fullOut: [ 'groups', 'group', 0, 'fullOut', 0 ],
		zoom: [ 'groups', 'group', 0, 'zoom', 0 ],
		minX: [ 'groups', 'group', 0, 'minX', 0 ],
		minY: [ 'groups', 'group', 0, 'minY', 0 ],
		maxX: [ 'groups', 'group', 0, 'maxX', 0 ],
		maxY: [ 'groups', 'group', 0, 'maxY', 0 ],
		flipX: [ 'groups', 'group', 0, 'flip', 0 ],
		flipY: [ 'groups', 'group', 0, 'flip', 0 ],
		plotinfos: [ 'groups', 'plotinfos', 0 ]
	};

	controller.prototype.zoomChanged = function( min, max ) {
		
		var obj = { 
			type: 'fromTo',
			value: { 
				from: min,
				to: max
			}
		};

		this.sendAction( 'fromto', obj );
	};

	controller.prototype.onMouseOverMarker = function( xy, infos ) {
		this.infos=infos;
		this.setVarFromEvent( 'onMouseOverMarker', infos, 'markerInfos' );
		this.setVarFromEvent( 'onMouseOverMarker', xy, 'markerXY' );
	};

	controller.prototype.onMouseOutMarker = function( xy, infos ) {
		this.setVarFromEvent( 'onMouseOutMarker', infos, 'markerInfos' );
		this.setVarFromEvent( 'onMouseOutMarker', xy, 'markerXY' );
	};

 	return controller;
});
