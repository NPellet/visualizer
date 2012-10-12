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
		moduleName: 'JSON 1 Level'
	},
	
	doConfiguration: function(section) {

		var data = this.module.getDataFromRel('hashmap');
		
		var jpaths = [];
		CI.DataType.getJPathsFromElement(data, jpaths);

		var groupfield = new BI.Forms.GroupFields.Table('keys');
		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'title'
		});
		field.setTitle(new CI.Title('Columns title'));
	
		var field = groupfield.addField({
			type: 'Combo',
			name: 'key'
		});
		field.implementation.setOptions(jpaths);
		field.setTitle(new CI.Title('Key'));

		return true;
	},

	
	doFillConfiguration: function() {
		
		var keys = this.module.getConfiguration().keys;
		
		var titles = [];
		var jpaths = [];
		for(var i in keys) {
			titles.push(i);
			jpaths.push(keys[i]);
		}

		return {
			keys: [{
				title: titles,
				key: jpaths
			}]
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].keys[0];
		var cols = {};
		for(var i = 0; i < group.length; i++)
			cols[group[i].title] = group[i].key;

		this.module.getConfiguration().keys = cols;
	},
}
