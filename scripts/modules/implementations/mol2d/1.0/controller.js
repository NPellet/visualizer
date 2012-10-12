 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.mol2d == 'undefined')
	CI.Module.prototype._types.mol2d = {};

CI.Module.prototype._types.mol2d.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.mol2d.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
	
	},
	
	configurationSend: {
	},
	
	hoverEvent: function(data) {

	},
	
	configurationReceive: {
		"mol2d": {
			type: ['mol2d', 'molfile2D'],
			label: 'A mol 2D file',
			description: ''
		}	
	},
	
	moduleInformations: {
		moduleName: 'Mol 2D'
	},
	
	doConfiguration: function(section) {
		
		return;
/*
		var groupfield = new BI.Forms.GroupFields.List('module');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'charttype'
		});
		field.implementation.setOptions([{ title: "Horizontal Bar Chart", key: "hbarchart"}, { title: "Vertical Bar Chart", key: "vbarchart"}, { title: "Line chart", key: "linechart"}]);
		field.setTitle(new CI.Title('Chart type'));
	

		var field = groupfield.addField({
			type: 'Text',
			name: 'linewidth'
		});
		field.setTitle(new CI.Title('Line width'));
		
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'pointsize'
		});
		field.setTitle(new CI.Title('Point size'));
		

		
		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'legend'
		});
		field.setTitle(new CI.Title('Legend'));
		field.implementation.setOptions({"display": "Display"});
		return true;
		*/
	},
	
	doFillConfiguration: function() {
	
		return;

		/*
		var cfg = this.module.getConfiguration();
		var linewidth = cfg.linewidth || 0;
		var charttype = cfg.charttype || "linechart";
		var pointsize = cfg.pointsize || 7;
		var displayLegend = cfg.legend ? ['display'] : ''

		return {
			module: [{
				linewidth: [linewidth],
				pointsize: [pointsize],
				charttype: [charttype],
				legend: [displayLegend]
			}]
		}*/
	},
	
	
	doSaveConfiguration: function(confSection) {
		/*
		var group = confSection[0].module[0];
		
		var linewidth = group.linewidth[0];
		var charttype = group.charttype[0];
		var pointsize = group.pointsize[0];
		var legend = !!group.legend[0][0];

		this.module.definition.configuration = {
			linewidth: linewidth,
			pointsize: pointsize,
			charttype: charttype,
			legend: legend
		};*/

		
	}
}
