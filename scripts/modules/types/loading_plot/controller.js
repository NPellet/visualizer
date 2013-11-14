define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		hover: function(data) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onHover") {
					CI.API.setSharedVarFromJPath(actions[i].name, data, actions[i].jpath);
				}
		},

		onZoomChange: function(zoom) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onZoomChange") {
					CI.API.setSharedVarFromJPath(actions[i].name, zoom, actions[i].jpath);
				}
		},

		onMove: function(x, y) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onMove") {
					CI.API.setSharedVarFromJPath(actions[i].name, [x,y], actions[i].jpath);
				}
		},


		onChangeViewport: function(vp) {
			var actions;
			if(!(actions = this.module.vars_out()))	
				return;	
			for(var i = 0; i < actions.length; i++)
				if(actions[i].event == "onViewPortChange") {
					CI.API.setSharedVarFromJPath(actions[i].name, vp, actions[i].jpath);
				}
		},

		configurationSend: {

			events: {

				onHover: {
					label: 'Hovers an element',
					description: 'Pass the mouse over a line to select it'
				},

				onMove: {
					label: 'Move the map',
					description: 'Move the map'
				},

				onZoomChange: {
					label: 'Change the zoom',
					description: 'The zoom is changed'
				},

				onViewPortChange: {
					label: 'Viewport has changed',
					description: ''
				}
			},
			
			rels: {
				'element': {
					label: 'Element',
					description: 'Returns the selected row in the list'
				},

				'zoom': {
					label: 'Zoom',
					description: ''
				},

				'center': {
					label: 'Coordinates of the center',
					description: ''
				},

				'viewport': {
					label: 'Viewport',
					description: ''
				}
			}
			
		},
		
		configurationReceive: {
			loading: {
				type: ["loading"],
				label: 'Loading variable',
				description: 'The main variable'
			},

			preferences: {
				type: ["object"],
				label: 'Preferences',
				description: 'The preferences'
			},

			zoom: {
				type: ["number"],
				label: 'Zoom',
				description: ''	
			},

			center: {
				type: ["array"],
				label: 'Coordinates of the center',
				description: ''	
			},

			viewport: {
				type: "array",
				label: 'Viewport data (x,y,w,h)',
				description: ''
			}
		},
		
		moduleInformations: {
			moduleName: 'Loading plot'
		},
		
		doConfiguration: function(section) {

			var groupfield = new BI.Forms.GroupFields.List('general');
			section.addFieldGroup(groupfield);
			var field = groupfield.addField({
				type: 'Checkbox',
				name: 'navigation'
			});
			field.setTitle(new BI.Title('Navigation'));
			field.implementation.setOptions({'navigation': 'Navigation only'});
			
			var section2 = new BI.Forms.Section('_module_layers', {multiple: true});
			section2.setTitle(new BI.Title('Layer'));
			section.addSection(section2, 1);

			var groupfield = new BI.Forms.GroupFields.List('config');
			section2.addFieldGroup(groupfield);


			/* */
			var opts = [];
			var data = this.module.getDataFromRel('loading');
			var jpaths = [];
			if(data && data.value)
				for(var i = 0; i < data.value.series.length; i++) 
					opts.push({title: data.value.series[i].label, key: data.value.series[i].category });
			var field = groupfield.addField({
				type: 'Combo',
				name: 'el'
			});
			field.implementation.setOptions(opts);
			field.setTitle(new BI.Title('Layer'));
			/* */


			var field = groupfield.addField({
				type: 'Combo',
				name: 'type'
			});
			field.implementation.setOptions([{key: 'ellipse', title: 'Ellipse / Circle'}, {key: 'pie', title: 'Pie Chart'}, {key: 'img', title: 'Image'}]);
			field.setTitle(new BI.Title('Display as'));


			/* */
			/*var jpaths = [];
			
			CI.DataType.getJPathsFromElement(data.value.series[0].data[0], jpaths);
			var field = groupfield.addField({
				type: 'Combo',
				name: 'colorjpath'
			});
			field.setTitle(new BI.Title('Color (jPath)'));
			field.implementation.setOptions(jpaths);*/
			/* */


			/* */
			if(data.value)
				Traversing.getJPathsFromElement(data.value.series[0].data[0], jpaths);

			var field = groupfield.addField({
				type: 'Color',
				name: 'color'
			});
			field.setTitle(new BI.Title('Color (default)'));
			/* */


			var sectionLabels = new BI.Forms.Section('_loading_labels', {}, new BI.Title('Labels'));
			section2.addSection(sectionLabels);
			var groupfieldlabels = sectionLabels.addFieldGroup(new BI.Forms.GroupFields.List('_loading_labels_grp'));
			var field = groupfieldlabels.addField({
				type: 'Checkbox',
				name: 'labels'
			});
			field.setTitle(new BI.Title('Labels'))
			
			field.implementation.setOptions({'display_labels': 'Display', 'forcefield': 'Activate force field', 'blackstroke': 'Add a black stroke around label', 'scalelabel': 'Scale label with zoom'});


			var field = groupfieldlabels.addField({
				type: 'Text',
				name: 'labelsize'
			});
			field.setTitle(new BI.Title('Label size'));



			var field = groupfieldlabels.addField({
				type: 'Text',
				name: 'labelzoomthreshold'
			});
			field.setTitle(new BI.Title('Zoom above which labels are displayed'));


			var sectionHighlights = new BI.Forms.Section('_loading_highlight', {}, new BI.Title('Highlight'));
			section2.addSection(sectionHighlights);
			var groupfieldHighlight = sectionHighlights.addFieldGroup(new BI.Forms.GroupFields.List('_loading_highlight_grp'));


			groupfieldHighlight.addField({type: 'Text', name: 'highlightmag', title: new BI.Title('Magnification')});


			var field = groupfieldHighlight.addField({
				type: 'Checkbox',
				name: 'highlighteffect'
			});

			field.setTitle(new BI.Title('Highlight effects'));
			field.implementation.setOptions({ 'stroke': 'Thick yellow stroke'});



			return true;
		},
		
		doFillConfiguration: function() {
			
			var cfgLayers = this.module.getConfiguration().layers || [];
			
			var titles = [];
			var layers = [];
			for(var i = 0; i < cfgLayers.length; i++) {

				cfgLayers[i].highlightEffect = cfgLayers[i].highlightEffect || {};

				var cfgLocalLayer = { 

					groups: 
					{
						config: [
						{ 
							el: [cfgLayers[i].layer], 
							type: [cfgLayers[i].display], 
							color: [cfgLayers[i].color]
						}]
					},

					sections: {
						_loading_labels: [{
							groups: {
								_loading_labels_grp: [{
									labelzoomthreshold: [cfgLayers[i].labelzoomthreshold], 
									labelsize: [cfgLayers[i].labelsize], 
									labels: [[(cfgLayers[i].displayLabels ? 'display_labels' : null), (cfgLayers[i].forceField ? 'forcefield' : null), (cfgLayers[i].blackstroke ? 'blackstroke' : null), (cfgLayers[i].scalelabel ? 'scalelabel' : null)]] 
								}]
							}
						}],

						_loading_highlight: [{
							groups: {
								_loading_highlight_grp: [{
									highlightmag: [cfgLayers[i].highlightEffect.mag || 1],
									highlighteffect: [[(cfgLayers[i].highlightEffect.yStroke ? 'stroke' : null)]]
								}]
							}
						}]
					}
				};
				layers.push(cfgLocalLayer)
			}

			el = { 

				groups: {
					general: [{
						navigation: [[this.module.getConfiguration().navigation ? 'navigation' : '']]
					}]
				},
				sections: {
				_module_layers: layers
				}
			};
			return el;
		},
		
		doSaveConfiguration: function(confSection) {

			var displayLabels;
			var group = confSection[0]._module_layers;
			
			navigation = !!confSection[0].general[0].navigation[0][0];

			var layers = [];
			for(var i = 0; i < group.length; i++) {
				var labels = group[i]._loading_labels[0]._loading_labels_grp[0].labels[0];
				displayLabels = false, forcefield = false, blackstroke = false, scalelabel = false;
				for(var j = 0; j < labels.length; j++) {
					if(labels[j] == 'display_labels')
						displayLabels = true;
					if(labels[j] == 'forcefield')
						forcefield = true;
					if(labels[j] == 'blackstroke')
						blackstroke = true;
					if(labels[j] == 'scalelabel')
						scalelabel = true;
				}

				var h = group[i]._loading_highlight[0]._loading_highlight_grp[0].highlighteffect[0];
				var glow = false, yStroke = false;
				for(var j = 0; j < h.length; j++) {
					if(h[j] == 'stroke')
						yStroke = true;	
				}

				layers.push({ 
					layer: group[i].config[0].el[0], 
					labelsize: group[i]._loading_labels[0]._loading_labels_grp[0].labelsize[0], 
					display: group[i].config[0].type[0], 
					color: group[i].config[0].color[0],
					displayLabels: displayLabels, 
					forceField: forcefield, 
					labelzoomthreshold: group[i]._loading_labels[0]._loading_labels_grp[0].labelzoomthreshold[0], 
					scalelabel: scalelabel, 
					blackstroke: blackstroke,
					highlightEffect: {
						mag: group[i]._loading_highlight[0]._loading_highlight_grp[0].highlightmag[0],
						yStroke: yStroke
					}
				});
			}
			this.module.getConfiguration().layers = layers;	
			this.module.getConfiguration().navigation = navigation;	
		},

		"export": function() {
			
		}		
	});

	return controller;
});
