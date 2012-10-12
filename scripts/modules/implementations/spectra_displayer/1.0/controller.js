 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.spectra_displayer == 'undefined')
	CI.Module.prototype._types.spectra_displayer = {};

CI.Module.prototype._types.spectra_displayer.Controller = function(module) {
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.spectra_displayer.Controller.prototype = {
	
	init: function() {
	},

	zoomChanged: function(min, max) {
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
		for(var i = 0; i < actions.length; i++) {
			CI.API.blankSharedVar(actions[i].name);
			if(actions[i].event == "onZoomChange") {
				//console.log('Ok set');
				CI.API.setSharedVarFromJPath(actions[i].name, {type: 'fromTo', value: {from: min, to: max}}, actions[i].jpath);
			}
		}
	},
	
	configurationSend: {
		
		events: {
			onZoomChange: {
				label: 'on zoom change',
				description: 'When the zoom changes'
			}
		},
		
		rels: {
			'fromTo': {
				label: 'From - To',
				description: 'Sends the coordinates of the zoom'
			}
		}
	},
	
	configurationReceive: {
		jcamp: {
			type: 'jcamp',
			label: 'jcamp data',
			description: 'A jcamp file'
		},

		fromTo: {
			type: 'fromTo',
			label: 'From - To data',
			description: 'From - To data'
		}
	},

	moduleInformations: {
		moduleName: 'Jcamp display (CDWC)'
	},



	
	doConfiguration: function(section) {
		var groupfield = new BI.Forms.GroupFields.List('gencfg');
		section.addFieldGroup(groupfield);

		var field = groupfield.addField({
			type: 'Options',
			name: 'mode'
		});

		field.setTitle(new CI.Title('Mode'));
		field.implementation.setOptions({ 'peaks': 'Display as peaks', 'curve': 'Display as a curve' });


		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'flip'
		});
		field.setTitle(new CI.Title('Axis flipping'));
		field.implementation.setOptions({ 'flipX': 'Flip X', 'flipY': 'Flip Y' });


		return true;
	},
	
	doFillConfiguration: function() {
		
		var mode = this.module.getConfiguration().mode || 'peaks';
		
		var flipArray = [];
		if(this.module.getConfiguration().flipX)
			flipArray.push('flipX');
		if(this.module.getConfiguration().flipY)
			flipArray.push('flipY');
	
		return {
			gencfg: [{
				mode: [mode],
				flip: [flipArray],
			}]
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

		this.module.getConfiguration().mode = confSection[0].gencfg[0].mode[0];
		this.module.getConfiguration().flipX = flipX;
		this.module.getConfiguration().flipY = flipY;
	}
}
