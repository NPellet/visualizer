
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		zoomChanged: function(min, max) {
			var obj = {type: 'fromTo', value: {from: min, to: max}};
			this.sendAction('fromto', obj);
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
				}
			},
			
			rels: {
				'x' : 'X position'
			}
		},
		
		configurationReceive: {
			xArray: {
				type: 'array',
				label: 'Array 1D',
				description: 'Array 1D'
			},

			xyArray: {
				type: 'array',
				label: 'Array XY',
				description: 'Array XY'
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
				'mousetrack': 'X value'
			}
		},

		actionsReceive: {
			'fromto': 'From - To',
			'addSerie': 'Add a new serie',
			'removeSerie': 'Remove a serie'
		},

		doConfiguration: function(section) {



			var vars = [];
			var currentCfg = this.module.definition.dataSource;

			if(currentCfg)
				for(var i = 0; i < currentCfg.length; i++) {
					if(currentCfg[i].rel == 'jcamp' || currentCfg[i].rel == 'xArray')
						vars.push({title: currentCfg[i].name, key: currentCfg[i].name});
				}

			return {
				groups: {
					'gencfg': {
						config: {
							type: 'list'
						},

						fields: [

							{
								type: 'Text',
								name: 'graphurl',
								title: 'Graph URL'
							},

							{
								type: 'Checkbox',
								name: 'flip',
								title: 'Axis flipping',
								options: { 'flipX': 'Flip X', 'flipY': "Flip Y"}
							},

							{
								type: 'Checkbox',
								name: 'displayAxis',
								title: 'Display axis',
								options: { 'x': 'X', 'y': "Y"}
							},

							{
								type: 'Checkbox',
								name: 'grids',
								title: 'Grids',
								options: { 'hmain': 'Horizontal Main', 'hsec': 'Honrizontal Seconday', 'vmain': 'Vertical Main', 'vsec': 'Vertical Secondary' }
							},

							{
								type: 'Text',
								name: 'xLabel',
								title: 'X axis label'
							},

							{
								type: 'Text',
								name: 'yTopSpacing',
								title: 'Spacing above the data'
							},

							{
								type: 'Text',
								name: 'yBottomSpacing',
								title: 'Spacing below the datal'
							},

							{
								type: 'Text',
								name: 'xLeftSpacing',
								title: 'Spacing left'
							},

							{
								type: 'Text',
								name: 'xRightSpacing',
								title: 'Spacing right'
							},

							{
								type: 'Text',
								name: 'yLabel',
								title: 'Y axis label'
							},

							{
								type: 'Text',
								name: 'minX',
								title: 'Min X'
							},

							{
								type: 'Text',
								name: 'maxX',
								title: 'Max X'
							},

							{
								type: 'Text',
								name: 'minY',
								title: 'Min Y'
							},

							{
								type: 'Text',
								name: 'maxY',
								title: 'Max Y'
							},

							{
								type: 'Combo',
								name: 'zoom',
								title: 'Zoom',
								options: [{key: 'x', title: 'X only'}, {key: 'y', title: 'Y only'}, {key: 'xy', title: 'XY'}, {key: 'none', title: 'None'}]
							},


							{
								type: 'Combo',
								name: 'wheelAction',
								title: 'Mouse Wheel',
								options: [{key: 'zoomX', title: 'Zoom x'}, {key: 'zoomY', title: 'Zoom Y'}, {key: 'none', title: 'None'}]
							}
						]
					},

					'spectrainfos': {
						config: {
							type: 'table'
						},

						fields: [
							{
								type: 'Combo',
								name: 'variable',
								title: 'Variable',
								options: vars
							},

							{
								type: 'Color',
								name: 'plotcolor',
								title: 'Color'
							},


							{
								type: 'Checkbox',
								name: 'plotcontinuous',
								title: 'Continuous',
								options: {'continuous': 'Continuous'}
							}
						]
					}
				}
			}		



		},
		
		doFillConfiguration: function() {
			
		//	var mode = this.module.getConfiguration().mode || 'peaks';
			
			var flipArray = [];
			if(this.module.getConfiguration().flipX)
				flipArray.push('flipX');
			if(this.module.getConfiguration().flipY)
				flipArray.push('flipY');
		
			var spectrainfos = { 'variable': [], 'plotcolor': [], 'plotcontinuous': [] };

			var infos = this.module.getConfiguration().plotinfos || [];
			for(var i = 0, l = infos.length; i < l; i++) {
			
				spectrainfos.variable.push(infos[i].variable);
				spectrainfos.plotcolor.push(infos[i].plotcolor);
				spectrainfos.plotcontinuous.push([infos[i].plotcontinuous ? 'continuous' : null]);
			}

			return {
				groups: {
					gencfg: [{
			//			mode: [mode],
						graphurl: [this.module.getConfiguration().graphurl],
						flip: [flipArray],
						displayAxis: [this.module.getConfiguration().displayAxis || ['x']],
						grids: [this.module.getConfiguration().grids || []],
						xLabel: [this.module.getConfiguration().xLabel],
						yLabel: [this.module.getConfiguration().yLabel],
						xRightSpacing: [this.module.getConfiguration().xRightSpacing],
						xLeftSpacing: [this.module.getConfiguration().xLeftSpacing],
						minX: [this.module.getConfiguration().minX || ''],
						maxX: [this.module.getConfiguration().maxX || ''],
						minY: [this.module.getConfiguration().minY || ''],
						maxY: [this.module.getConfiguration().maxY || ''],
						yTopSpacing: [this.module.getConfiguration().yTopSpacing],
						yBottomSpacing: [this.module.getConfiguration().yBottomSpacing],
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

			this.module.getConfiguration().minX = parseFloat(confSection[0].gencfg[0].minX[0]);
			this.module.getConfiguration().minY = parseFloat(confSection[0].gencfg[0].minY[0]);
			this.module.getConfiguration().maxX = parseFloat(confSection[0].gencfg[0].maxX[0]);
			this.module.getConfiguration().maxY = parseFloat(confSection[0].gencfg[0].maxY[0]);

			this.module.getConfiguration().zoom = confSection[0].gencfg[0].zoom[0];
			this.module.getConfiguration().wheelAction = confSection[0].gencfg[0].wheelAction[0];

			this.module.getConfiguration().displayAxis = confSection[0].gencfg[0].displayAxis[0];
			this.module.getConfiguration().grids = confSection[0].gencfg[0].grids[0];
	//		this.module.getConfiguration().plotcolor = confSection[0].gencfg[0].plotcolor;
			
			for(var i = 0, l = confSection[0].spectrainfos[0].length; i < l; i++) {	
				confSection[0].
					spectrainfos[0][i].
					plotcontinuous = 
					(!!confSection[0].spectrainfos[0][i].plotcontinuous[0]);
			}
				
			this.module.getConfiguration().plotinfos = confSection[0].spectrainfos[0];
		}


	});

	return controller;
});

