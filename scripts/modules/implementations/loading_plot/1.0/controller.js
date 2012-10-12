 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.loading_plot == 'undefined')
	CI.Module.prototype._types.loading_plot = {};

CI.Module.prototype._types.loading_plot.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.loading_plot.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
	},
	
	hover: function(data) {

		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;	
		for(var i = 0; i < actions.length; i++)
			if(actions[i].event == "onHover")
				CI.API.setSharedVarFromJPath(actions[i].name, data, actions[i].jpath);
	

	},

	configurationSend: {

		events: {

			onHover: {
				label: 'Hovers an element',
				description: 'Pass the mouse over a line to select it'
			}
		},
		
		rels: {
			'element': {
				label: 'Element',
				description: 'Returns the selected row in the list'
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
		}
	},
	
	moduleInformations: {
		moduleName: 'Loading plot'
	},
	
	doConfiguration: function(section) {
		
		var section2 = new BI.Forms.Section('_module_layers', {multiple: true});
		section2.setTitle(new CI.Title('Layer'));
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
		field.setTitle(new CI.Title('Layer'));
		/* */


		var field = groupfield.addField({
			type: 'Combo',
			name: 'type'
		});
		field.implementation.setOptions([{key: 'ellipse', title: 'Ellipse / Circle'}, {key: 'pie', title: 'Pie Chart'}]);
		field.setTitle(new CI.Title('Display as'));


		/* */
		/*var jpaths = [];
		
		CI.DataType.getJPathsFromElement(data.value.series[0].data[0], jpaths);
		var field = groupfield.addField({
			type: 'Combo',
			name: 'colorjpath'
		});
		field.setTitle(new CI.Title('Color (jPath)'));
		field.implementation.setOptions(jpaths);*/
		/* */


		/* */
		CI.DataType.getJPathsFromElement(data.value.series[0].data[0], jpaths);
		var field = groupfield.addField({
			type: 'Color',
			name: 'color'
		});
		field.setTitle(new CI.Title('Color (default)'));
		/* */


		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'labels'
		});
		field.setTitle(new CI.Title('Labels'))
		
		field.implementation.setOptions({'display_labels': 'Display', 'forcefield': 'Activate force field', 'blackstroke': 'Add a black stroke around label', 'scalelabel': 'Scale label with zoom'});


		var field = groupfield.addField({
			type: 'Text',
			name: 'labelsize'
		});
		field.setTitle(new CI.Title('Label size'));



		var field = groupfield.addField({
			type: 'Text',
			name: 'labelzoomthreshold'
		});
		field.setTitle(new CI.Title('Zoom for label display'));



		return true;
	},
	
	doFillConfiguration: function() {
		
		var cfgLayers = this.module.getConfiguration().layers || [];
		
		var titles = [];
		var layers = [];
		for(var i = 0; i < cfgLayers.length; i++) {
			var cfgLocalLayer = { groups: {config: [{ el: [cfgLayers[i].layer], type: [cfgLayers[i].display], labelzoomthreshold: [cfgLayers[i].labelzoomthreshold], labelsize: [cfgLayers[i].labelsize], /*colorjpath: [cfgLayers[i].colorjpath], */color: [cfgLayers[i].color], labels: [[(cfgLayers[i].displayLabels ? 'display_labels' : null), (cfgLayers[i].forceField ? 'forcefield' : null), (cfgLayers[i].blackstroke ? 'blackstroke' : null), (cfgLayers[i].scalelabel ? 'scalelabel' : null)]] }] } };
			layers.push(cfgLocalLayer)
		}

		el = { sections: {
			_module_layers: layers
			}
		};
		return el;
	},
	
	doSaveConfiguration: function(confSection) {

		var displayLabels;
		var group = confSection[0]._module_layers;
		
		var layers = [];
		for(var i = 0; i < group.length; i++) {
			var labels = group[i].config[0].labels[0];
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
			layers.push({ layer: group[i].config[0].el[0], labelsize: group[i].config[0].labelsize[0], display: group[i].config[0].type[0], color: group[i].config[0].color[0], /*colorjpath: group[i].config[0].colorjpath[0],*/ displayLabels: displayLabels, forceField: forcefield, labelzoomthreshold: group[i].config[0].labelzoomthreshold[0], scalelabel: scalelabel, blackstroke: blackstroke });
		}
	
		this.module.getConfiguration().layers = layers;	
	},

	export: function() {
		
	}

}
