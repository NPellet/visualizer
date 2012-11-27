 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.grid_selector == 'undefined')
	CI.Module.prototype._types.grid_selector = {};

CI.Module.prototype._types.grid_selector.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.grid_selector.Controller.prototype = {
	
	init: function() {
		var module = this.module;
		var actions;
		this._currentValue = {};
		if(!(actions = this.module.definition.dataSend))	
			return;
	},

	
	configurationSend: {

		events: {

			onSave: {
				label: 'Ok button is hit'
			}
			
		},
		
		rels: {
			
		}
		
	},
	
	configurationReceive: {
		source: {
			type: ["object"],
			label: 'Object source',
			description: 'An object to edit'
		}		
	},
	
	
	moduleInformations: {
		moduleName: 'Object editor'
	},
	
	
	doConfiguration: function(section) {

		var sectionAllFields = section.addSection(new BI.Forms.Section('fields', { multiple: true },  new BI.Title('Fields')), 1);
		var group = sectionAllFields.addFieldGroup(new BI.Forms.GroupFields.List('fielddetails'));

		var type = group.addField({
			type: 'Combo',
			name: 'fieldtype',
			title: new BI.Title('Field type')
		});
		type.implementation.setOptions([
			{title: 'Text', key: 'Text'},
			{title: 'Combo box', key: 'Combo'},
			{title: 'Check box', key: 'Checkbox'},
			{title: 'Wysiwyg editor', key: 'Wysiwyg'},
			{title: 'Color picker', key: 'Color'},
			{title: 'Date / time', key: 'Datetime'}
		]);

		group.addField({
			type: 'Text',
			name: 'fieldlabel',
			title: new BI.Title('Field title')
		});

		group.addField({
			type: 'Combo',
			name: 'jpath',
			title: new BI.Title('JPath to edit')
		});


		var group = sectionAllFields.addFieldGroup(new BI.Forms.GroupFields.Table('fieldoptions'));

		group.addField({
			type: 'Text',
			name: 'combovalue',
			title: new BI.Title('Combo option value')
		});


		group.addField({
			type: 'Text',
			name: 'combolabel',
			title: new BI.Title('Combo option label')
		});


		return true;
	},
	
	doFillConfiguration: function() {
		var cfg = this.module.getConfiguration().fields || [];
		var allFields = [], field;

		for(var i = 0, l = cfg.length; i < l; i++) {
			field = {};
			allFields.push(field);

			var values = [], labels = [];
			for(var j = 0; j < cfg[i].options.length; j++) {
				values.push(cfg[i].options[j].value);
				labels.push(cfg[i].options[j].label);
			}

			field.groups = {};
			field.groups.fielddetails = [{ fieldtype: [ cfg[i].fieldtype ], fieldlabel: [ cfg[i].fieldlabel ], jpath: [ cfg[i].jpath ] }];
			field.groups.fieldoptions = [{ combovalue: values, combolabel: labels}]
		}

		return {	
			sections: {
				fields: allFields
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		
		var cfg = [], field, options;

		for(var i = 0, l = confSection[0].fields.length; i < l; i++) {
			field = {};
			
			field.fieldtype = confSection[0].fields[i].fielddetails[0].fieldtype[0];
			field.fieldlabel = confSection[0].fields[i].fielddetails[0].fieldlabel[0];
			field.jpath = confSection[0].fields[i].fielddetails[0].jpath[0];
			field.options = [];

			options = confSection[0].fields[i].fieldoptions[0];
			field.options = options;
					cfg.push(field);
		}


		this.module.getConfiguration().fields = cfg;
	},

	"export": function() {
		//return this.module.view.table.exportToTabDelimited();
	}
}
