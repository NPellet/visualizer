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

}


$.extend(CI.Module.prototype._types.spectra_displayer.Controller.prototype, CI.Module.prototype._impl.controller, {

	zoomChanged: function(min, max) {
		var obj = {type: 'fromTo', value: {from: min, to: max}};
		this.sendAction('fromto', obj);
	},
	
	configurationSend: {
		
		events: {
			onZoomChange: {
				label: 'on zoom change',
				description: 'When the zoom changes'
			}
		},
		
		rels: { }
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
		rel: {'fromto': 'From - To'}
	},

	doConfiguration: function(section) {
		var groupfield = new BI.Forms.GroupFields.List('gencfg');
		section.addFieldGroup(groupfield);

	/*	var field = groupfield.addField({
			type: 'Options',
			name: 'mode'
		});
*/
//		field.setTitle(new BI.Title('Mode'));
//		field.implementation.setOptions({ 'peaks': 'Display as peaks', 'curve': 'Display as a curve' });


		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'flip'
		});
		field.setTitle(new BI.Title('Axis flipping'));
		field.implementation.setOptions({ 'flipX': 'Flip X', 'flipY': 'Flip Y' });



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
				if(currentCfg[i].rel == 'jcamp')
					vars.push({title: currentCfg[i].name, key: currentCfg[i].name});
			}

		field.implementation.setOptions(vars);


		field = group.addField({
			'type': 'Color',
			'name': 'plotcolor',
			title: new BI.Title('Color')
		});


		field = group.addField({
			'type': 'Checkbox',
			'name': 'plotcontinuous',
			title: new BI.Title('Continuous')
		});
		field.implementation.setOptions({'continuous': 'Continuous'});

		return true;
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
					flip: [flipArray],
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
		this.module.getConfiguration().flipX = flipX;
		this.module.getConfiguration().flipY = flipY;
//		this.module.getConfiguration().plotcolor = confSection[0].gencfg[0].plotcolor;
		
		for(var i = 0, l = confSection[0].spectrainfos[0].length; i < l; i++) {
			
			confSection[0].
				spectrainfos[0][i].
				plotcontinuous = 
				(!!confSection[0].spectrainfos[0][i].plotcontinuous[0]);
			}
		
			
		this.module.getConfiguration().plotinfos = confSection[0].spectrainfos[0];
	},

/*	addToReceivedVars: function(group) {
		var field = group.addField({
			type: 'Checkbox',
			name: 'continuous'
		});
		field.implementation.setOptions({'continuous': 'Continuous plot'});
		field.setTitle(new BI.Title('Continuous'));
	},

	fillReceivedVars: function(ref, el, i) {
		ref.continuous = ref.continuous || [];

		this.module.getConfiguration().continuous = this.module.getConfiguration().continuous || {};
		
		if(this.module.getConfiguration().continuous[ref.name[i]])
			ref.continuous.push(['continuous']);
	},

	processReceivedVars: function(val) {
		this.module.getConfiguration().continuous = {};
		for(var i = 0, l = val.length; i < l; i++) {
			if(val[i].continuous[0] && val[i].continuous[0][0])
				this.module.getConfiguration().continuous[val[i].name] = true;
		}
	}*/
});
