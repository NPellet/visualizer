 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.plot == 'undefined')
	CI.Module.prototype._types.plot = {};

CI.Module.prototype._types.plot.Controller = function(module) {}

$.extend(CI.Module.prototype._types.plot.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	configurationSend: {

		events: {
			
		},
		
		rels: {
			
		}
		
	},
	
	configurationReceive: {
		"plotdata": {
			type: ['object'],
			label: 'The plot data',
			description: ''
		},

		"serieSet": {
			type: ['object'],
			label: 'A set of series',
			description: ''
		}
	},
	
	actions: {
		rel: {'addSerie': 'Add a serie', 'removeSerie': 'Remove a serie'}
	},

	moduleInformations: {
		moduleName: 'Chart (Norman)'
	},
	
	doConfiguration: function(section) {
		


		var group = new BI.Forms.GroupFields.Table('spectrainfos');
		section.addFieldGroup(group);

		field = group.addField({
			'type': 'Combo',
			'name': 'variable',
			title: new BI.Title('Variable')
		});

		var vars = [];
		var currentCfg = this.module.definition.dataSource;

		if(currentCfg)
			for(var i = 0; i < currentCfg.length; i++) {
				if(currentCfg[i].rel == 'serieSet')
					vars.push({title: currentCfg[i].name, key: currentCfg[i].name});
			}

		field.implementation.setOptions(vars);


		field = group.addField({
			'type': 'Color',
			'name': 'plotcolor',
			title: new BI.Title('Color')
		});


		return true;
	},
	
	doFillConfiguration: function() {


		var spectrainfos = { 'variable': [], 'plotcolor': [] };
		var infos = this.module.getConfiguration().plotinfos || [];
		for(var i = 0, l = infos.length; i < l; i++) {
			spectrainfos.variable.push(infos[i].variable);
			spectrainfos.plotcolor.push(infos[i].plotcolor);
		}

		return {
			groups: {
				spectrainfos: [spectrainfos]
			}
		}	
	},
	
	
	doSaveConfiguration: function(confSection) {	
		this.module.getConfiguration().plotinfos = confSection[0].spectrainfos[0];
	}
});
