
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		zoomChanged: function(min, max) {
			var obj = {type: 'fromTo', value: {from: min, to: max}};
			this.sendAction('fromto', obj);
		},

		onMouseOverMarker: function(xy, infos) {
			this.infos=infos;
			this.setVarFromEvent('onMouseOverMarker', infos, 'markerInfos');
			this.setVarFromEvent('onMouseOverMarker', xy, 'markerXY');
		},

		onMouseOutMarker: function(xy, infos) {
			this.setVarFromEvent('onMouseOutMarker', infos, 'markerInfos');
			this.setVarFromEvent('onMouseOutMarker', xy, 'markerXY');
		},

		configurationSend: {
			
			events: {
				onZoomChange: {
					label: 'on zoom change',
					description: 'When the zoom changes'
				},

				onTrackMouse: {
					label: 'mouse tracking',
					description: ''
				},

				onAnnotationAdd: {
					label: 'Annotation added',
					description: ''
				},

				onMouseOverMarker: {
					label: 'Mouse over a marker',
					description: ''
				},

				onMouseOutMarker: {
					label: 'Mouse out of a marker',
					description: ''
				}
			},
			
			rels: {
				'x' : { label: 'X position' },
				'markerInfos' : { label: 'Marker infos' },
				'markerXY' : { label: 'Marker [x,y]' }
			}
		},
		
		configurationReceive: {
			chart: {
				type: ['array','object'],
				label: 'Chart object ',
				description: 'Chart object with x,y,infos'
			},

			xArray: {
				type: 'array',
				label: '1D Y array',
				description: '1D array of Y values'
			},

			xyArray: {
				type: 'array',
				label: '1D XY array',
				description: '1D array of XY values'
			},

			jcamp: {
				type: ['jcamp', 'string'],
				label: 'jcamp data',
				description: 'A jcamp file'
			},

			annotation: {
				type: ['array'],
				label: 'Annotation file'
			},

			fromTo: {
				type: 'fromTo',
				label: 'From - To data',
				description: 'From - To data'
			},

			zoneHighlight: {
				type: ['array'],
				label: 'Zone highlighted',
				description: ''
			}
		},

		moduleInformations: {
			moduleName: 'Spectrum viewer'
		},

		actions: {
			rel: {
				'fromto': 'From - To', 
				'mousetrack': 'X value',
				'annotation': 'Annotation'
			}
		},

		actionsReceive: {
			'fromto': 'From - To',
			'addSerie': 'Add a new serie',
			'removeSerie': 'Remove a serie'
		},

		configurationStructure: function(section) {

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
		},
		


		configFunctions: {

			'displayYAxis': function(cfg) { return cfg.indexOf('y') > -1; },
			'displayXAxis': function(cfg) { return cfg.indexOf('x') > -1; },
			'vertGridMain': function(cfg) { return cfg.indexOf('vmain') > -1; },
			'vertGridSec': function(cfg) { return cfg.indexOf('vsec') > -1; },
			'horGridMain': function(cfg) { return cfg.indexOf('hmain') > -1; },
			'horGridSec': function(cfg) { return cfg.indexOf('hsec') > -1; },

			'shiftxtozero': function(cfg) { return cfg.indexOf('shift') > -1 },
			'minX': function(cfg) { return parseFloat(cfg) || false; },
			'minY': function(cfg) { return parseFloat(cfg) || false; },
			'maxX': function(cfg) { return parseFloat(cfg) || false; },
			'maxY': function(cfg) { return parseFloat(cfg) || false; },

			'xastime': function(cfg) { return cfg.indexOf('xastime') > -1 },

			'flipX': function(cfg) { return cfg.indexOf('flipX') > -1 },
			'flipY': function(cfg) { return cfg.indexOf('flipY') > -1 }
		},

		
		configAliases: {

			'graphurl': [ 'groups', 'group', 0, 'graphurl', 0 ],
			'shiftxtozero': [ 'groups', 'group', 0, 'shiftxtozero', 0 ],
			'displayYAxis': [ 'groups', 'group', 0, 'displayAxis', 0 ],
			'yLabel': [ 'groups', 'group', 0, 'yLabel', 0 ],
			'displayXAxis': [ 'groups', 'group', 0, 'displayAxis', 0 ],
			'xLabel': [ 'groups', 'group', 0, 'xLabel', 0 ],
			'vertGridMain': [ 'groups', 'group', 0, 'grids', 0 ],
			'vertGridSec': [ 'groups', 'group', 0, 'grids', 0 ],
			'xastime': [ 'groups', 'group', 0, 'xastime', 0 ],
			'horGridMain': [ 'groups', 'group', 0, 'grids', 0 ],
			'horGridSec': [ 'groups', 'group', 0, 'grids', 0 ],
			'xLeftSpacing': [ 'groups', 'group', 0, 'xLeftSpacing', 0 ],
			'xRightSpacing': [ 'groups', 'group', 0, 'xRightSpacing', 0 ],
			'yBottomSpacing': [ 'groups', 'group', 0, 'yBottomSpacing', 0 ],
			'yTopSpacing': [ 'groups', 'group', 0, 'yTopSpacing', 0 ],
			'wheelAction': [ 'groups', 'group', 0, 'wheelAction', 0 ],
			'fullOut': [ 'groups', 'group', 0, 'fullOut', 0 ],
			'zoom': [ 'groups', 'group', 0, 'zoom', 0 ],
			'minX': [ 'groups', 'group', 0, 'minX', 0 ],
			'minY': [ 'groups', 'group', 0, 'minY', 0 ],
			'maxX': [ 'groups', 'group', 0, 'maxX', 0 ],
			'maxY': [ 'groups', 'group', 0, 'maxY', 0 ],
			'flipX': [ 'groups', 'group', 0, 'flip', 0 ],
			'flipY': [ 'groups', 'group', 0, 'flip', 0 ],
			'plotinfos': [ 'groups', 'plotinfos', 0 ]
		},



		/*
		doFillConfiguration: function() {
			
		//	var mode = this.module.getConfiguration().mode || 'peaks';
			
			var flipArray = [];
			if(this.module.getConfiguration().flipX)
				flipArray.push('flipX');
			if(this.module.getConfiguration().flipY)
				flipArray.push('flipY');
		
			var spectrainfos = { 'variable': [], 'plotcolor': [], 'plotcontinuous': [], strokewidth: [], peakpicking: [], markers: [], normalize: [] };

			var infos = this.module.getConfiguration().plotinfos || [];
			for(var i = 0, l = infos.length; i < l; i++) {
			
				spectrainfos.variable.push(infos[i].variable);
				spectrainfos.plotcolor.push(infos[i].plotcolor);
				spectrainfos.strokewidth.push(infos[i].strokewidth);
				spectrainfos.plotcontinuous.push([infos[i].plotcontinuous ? 'continuous' : null]);
				spectrainfos.peakpicking.push([infos[i].peakpicking ? 'picking' : null]);
				spectrainfos.markers.push([infos[i].markers ? 'markers' : null]);
				spectrainfos.normalize.push([infos[i].normalize || 'none']);
			}


			return {
				groups: {
					gencfg: [{
			//			mode: [mode],
						graphurl: [this.module.getConfiguration().graphurl],
						flip: [flipArray],
						displayAxis: [this.module.getConfiguration().displayAxis || ['x']],
					//	peakpicking: [this.module.getConfiguration().peakpicking || []],
						grids: [this.module.getConfiguration().grids || []],
						xLabel: [this.module.getConfiguration().xLabel],
						yLabel: [this.module.getConfiguration().yLabel],
						xRightSpacing: [this.module.getConfiguration().xRightSpacing],
						xLeftSpacing: [this.module.getConfiguration().xLeftSpacing],
						minX: [this.module.getConfiguration().minX],
						maxX: [this.module.getConfiguration().maxX],
						minY: [this.module.getConfiguration().minY],
						maxY: [this.module.getConfiguration().maxY],
						yTopSpacing: [this.module.getConfiguration().yTopSpacing],
						yBottomSpacing: [this.module.getConfiguration().yBottomSpacing],
						shiftxtozero: [this.module.getConfiguration().shiftxtozero ? ['shift'] : []],
						xastime: [this.module.getConfiguration().xastime ? ['xastime'] : []],


						zoom:  [this.module.getConfiguration().zoom],
						wheelAction:  [this.module.getConfiguration().wheelAction || 'none']
			//			plotcolor: this.module.getConfiguration().plotcolor || ['#000000']
					}],
					spectrainfos: [spectrainfos]
				}
			}	
		},
		
		doSaveConfiguration: function(confSection) {

			var flipX = false, flipY = false;
			var flipCfg = confSection[0].gencfg[0].flip[0];
			for(var i = 0; i < flipCfg.length; i++) {
				if(flipCfg[i] == 'flipX')
						flipX = true;
				if(flipCfg[i] == 'flipY')
						flipY = true;
			}

	//		this.module.getConfiguration().mode = confSection[0].gencfg[0].mode[0];
			this.module.getConfiguration().graphurl = confSection[0].gencfg[0].graphurl[0];

			this.module.getConfiguration().flipX = flipX;
			this.module.getConfiguration().flipY = flipY;

			this.module.getConfiguration().xLabel = confSection[0].gencfg[0].xLabel[0];
			this.module.getConfiguration().yLabel = confSection[0].gencfg[0].yLabel[0];
			
			this.module.getConfiguration().xRightSpacing = confSection[0].gencfg[0].xRightSpacing[0];
			this.module.getConfiguration().xLeftSpacing = confSection[0].gencfg[0].xLeftSpacing[0];
			this.module.getConfiguration().yTopSpacing = confSection[0].gencfg[0].yTopSpacing[0];
			this.module.getConfiguration().yBottomSpacing = confSection[0].gencfg[0].yBottomSpacing[0];

			this.module.getConfiguration().minX = parseFloat(confSection[0].gencfg[0].minX[0]) || null;
			this.module.getConfiguration().minY = parseFloat(confSection[0].gencfg[0].minY[0]) || null;
			this.module.getConfiguration().maxX = parseFloat(confSection[0].gencfg[0].maxX[0]) || null;
			this.module.getConfiguration().maxY = parseFloat(confSection[0].gencfg[0].maxY[0]) || null;

			this.module.getConfiguration().zoom = confSection[0].gencfg[0].zoom[0];
			this.module.getConfiguration().wheelAction = confSection[0].gencfg[0].wheelAction[0];
			this.module.getConfiguration().shiftxtozero = confSection[0].gencfg[0].shiftxtozero[0][0] == "shift";
			this.module.getConfiguration().xastime = confSection[0].gencfg[0].xastime[0][0] == "xastime";

			this.module.getConfiguration().displayAxis = confSection[0].gencfg[0].displayAxis[0];
			//this.module.getConfiguration().peakpicking = confSection[0].gencfg[0].peakpicking[0][0] == "true";
			this.module.getConfiguration().grids = confSection[0].gencfg[0].grids[0];
	//		this.module.getConfiguration().plotcolor = confSection[0].gencfg[0].plotcolor;


			for(var i = 0, l = confSection[0].spectrainfos[0].length; i < l; i++) {	
				confSection[0].
					spectrainfos[0][i].
					plotcontinuous = (!!confSection[0].spectrainfos[0][i].plotcontinuous[0]);

				confSection[0].
					spectrainfos[0][i].
					peakpicking = !!confSection[0].spectrainfos[0][i].peakpicking[0];

				confSection[0].
					spectrainfos[0][i].
					markers = !!confSection[0].spectrainfos[0][i].markers[0];
			}

			this.module.getConfiguration().plotinfos = confSection[0].spectrainfos[0];
		}

*/
	});

	return controller;
});

