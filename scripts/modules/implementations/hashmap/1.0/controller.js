 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.hashmap == 'undefined')
	CI.Module.prototype._types.hashmap = {};

CI.Module.prototype._types.hashmap.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.hashmap.Controller.prototype = {
	
	
	init: function() {
		
		var module = this.module;
		var actions;
		if(!(actions = this.module.definition.dataSend))	
			return;
	
	},
	
	configurationSend: {

		
	},
	
	configurationReceive: {
		"hashmap": {
			type: ['object'],
			label: 'A simple 1 level json object',
			description: ''
		}	
	},
	
	moduleInformations: {
		moduleName: 'Object viewer'
	},
	
	doConfiguration: function(section) {

		var data = this.module.getDataFromRel('hashmap');
		
		var jpaths = [];
		CI.DataType.getJPathsFromElement(data, jpaths);

		var groupfield = new BI.Forms.GroupFields.List('cfg');
		section.addFieldGroup(groupfield);


		var field = groupfield.addField({
			type: 'Checkbox',
			name: 'hide_empty'
		});
		field.setTitle(new BI.Title('Empty lines'));
		field.implementation.setOptions({'hide': 'Hide empty lines'});


		var groupfield = new BI.Forms.GroupFields.Table('keys');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'title'
		});
		field.setTitle(new BI.Title('Columns title'));
	
		var field = groupfield.addField({
			type: 'Combo',
			name: 'key'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new BI.Title('Key'));



		var field = groupfield.addField({
			type: 'Text',
			name: 'printf'
		});
		field.setTitle(new BI.Title('Printf'));
	

		return true;
	},

	
	doFillConfiguration: function() {
		
		var keys = this.module.getConfiguration().keys;
		var hide = this.module.getConfiguration().hideemptylines ? ['hide'] : [];
		var titles = [], jpaths = [], printf = [];
		for(var i in keys) {
			titles.push(i);
			jpaths.push(keys[i].key || null);
			printf.push(keys[i].printf || null);
		}

		return {
			groups: {

				cfg: [{
					hide_empty: hide
				}],

				keys: [{
					title: titles,
					key: jpaths,
					printf: printf
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].keys[0];
		this.module.getConfiguration().hideemptylines = (confSection[0].cfg[0].hide_empty[0][0] == 'hide');
		var cols = {};
		for(var i = 0; i < group.length; i++)
			cols[group[i].title] = {key: group[i].key, printf: group[i].printf};

		this.module.getConfiguration().keys = cols;
	},
}
