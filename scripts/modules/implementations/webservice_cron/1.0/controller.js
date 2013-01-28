 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.webservice_button == 'undefined')
	CI.Module.prototype._types.webservice_button = {};

CI.Module.prototype._types.webservice_button.Controller = function(module) {
	
	CI.Module.prototype._impl.controller.init(module, this);
}

CI.Module.prototype._types.webservice_button.Controller.prototype = {
	
	
	init: function() { },
	
	onClick: function() {
		var self = this;
		var cfg = this.module.getConfiguration().variables, variable, type, url;
		for(var i = 0, l = cfg.length; i < l; i++) {
			variable = cfg[i].variable;
			type = cfg[i].type;

			(function(type, variable) {
				var ajax = {
					url: cfg[i].url,
					dataType: 'json'
				};

				if(type == 'get') {
					ajax.success = function(data) {
						CI.Repo.set(variable, data);
						self.module.view.buttonUpdate(true);
					}
					ajax.method = 'get';
					ajax.type = 'get';

				} else {
					ajax.success = function(data) {
						self.module.view.buttonUpdate(true);
					}
console.log(CI.Repo.get(variable)[1]);
					ajax.data = {data: CI.Repo.get(variable)[1] };
					ajax.method = 'post';
					ajax.type = 'post';
				}

				ajax.error = function() {
					self.view.buttonUpdate(false);
				}

				$.ajax(ajax);

			}) (type, variable);
		}
	},

	configurationSend: {

		events: {

		},
		
		rels: {
			
		}		
	},
	
	configurationReceive: {

	},
	
	moduleInformations: {
		moduleName: 'Webservice Button'
	},

	
	doConfiguration: function(section) {
		
		
		var groupfield = new BI.Forms.GroupFields.List('cfg');
		section.addFieldGroup(groupfield);
		var field = groupfield.addField({
			type: 'Text',
			name: 'label'
		});
		field.setTitle(new BI.Title('Button label'));

		var groupfield = new BI.Forms.GroupFields.Table('varcfg');

		section.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Combo',
			name: 'variable'
		});
		field.setTitle(new BI.Title('Variable'));
		var objs = [];
		for(var i in CI.API.getAllSharedVariables()) {
			objs.push({key: i, title: i});
		}
		field.implementation.setOptions(objs);

		var field = groupfield.addField({
			type: 'Combo',
			name: 'type'
		});
		field.setTitle(new BI.Title('Type'));
		field.implementation.setOptions([{key: 'get', title: 'Fetch URL to variable'}, {key: 'put', title: 'Push variable to URL'}]);

		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('URL'));
		

		return true;
	},
	
	doFillConfiguration: function() {
		
		var cfg = this.module.getConfiguration().variables;
		
		var variables = [], types = [], url = [];
		for(var i in cfg) {
			variables.push(cfg[i].variable);
			types.push(cfg[i].type);
			url.push(cfg[i].url);
		}

		return {	

			groups: {
				
				cfg: [{
					label: [this.module.getConfiguration().label]
				}],

				varcfg: [{
					variable: variables,
					type: types,
					url: url
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].varcfg[0];
		var vars = [];
		for(var i = 0; i < group.length; i++)
			vars.push({ variable: group[i].variable, type: group[i].type, url: group[i].url });
	
		this.module.getConfiguration().variables = vars;
		this.module.getConfiguration().label = confSection[0].cfg[0].label[0];

	},

	"export": function() {
		return this.module.view.table.exportToTabDelimited();
	}
}
