 /*
 * controller.js
 * version: dev
 *
 * Copyright 2012 Norman Pellet - norman.pellet@epfl.ch
 * Dual licensed under the MIT or GPL Version 2 licenses.
 */

if(typeof CI.Module.prototype._types.webservice_button == 'undefined')
	CI.Module.prototype._types.webservice_button = {};

CI.Module.prototype._types.webservice_button.Controller = function(module) {}

$.extend(CI.Module.prototype._types.webservice_button.Controller.prototype, CI.Module.prototype._impl.controller, {
	
	onClick: function() {
		var self = this;
		var cfg = this.module.getConfiguration().variables, variable, type, url;
		var def = $.Deferred();
		var ordef = def;

		for(var i = 0, l = cfg.length; i < l; i++) {

			variable = cfg[i].variable;
			type = cfg[i].type;

			(function(type, variable, k) {
				var ajax = {
					url: cfg[k].url
				};

				ajax.success = function(data) {

					for(var j = 0; j < cfg[k].subvars.length; j++)
						CI.API.setSharedVarFromJPath(cfg[k].subvars[j].variableget, data, cfg[k].subvars[j]._jpath || '');
					self.module.view.buttonUpdate(true);
				}

				if(type == 'get') {
					ajax.method = 'get';
					ajax.type = 'get';
				} else {
					ajax.method = 'post';
					ajax.type = 'post';
				}

				ajax.error = function() {
					self.module.view.buttonUpdate(false);
				}

				def = def.then(function(resolved) {
					variableobj = CI.Repo.get(variable);
					if(!variableobj || !variableobj[1])
						return;
					ajax.data = {data: variableobj[1] };
					return $.ajax(ajax);
				});

			}) (type, variable, i);
		}

		ordef.resolve(true);
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


		var section2 = new BI.Forms.Section('varcfg', {multiple: true}, new BI.Title('Variable'));
		section.addSection(section2);

		var groupfield = new BI.Forms.GroupFields.List('vardetails');
		section2.addFieldGroup(groupfield);
		
		var field = groupfield.addField({
			type: 'Text',
			name: 'url'
		});
		field.setTitle(new BI.Title('URL'));
	
		var field = groupfield.addField({
			type: 'Text',
			name: 'variable'
		});
		field.setTitle(new BI.Title('Source variable'));


		var groupfield = new BI.Forms.GroupFields.Table('varvar');
		section2.addFieldGroup(groupfield);
	
		var field = groupfield.addField({
			type: 'Text',
			name: 'variableget'
		});
		field.setTitle(new BI.Title('Target variable'));


		var jpathfield = groupfield.addField({
			type: 'Combo',
			name: '_jpath'
		});
		jpathfield.setTitle(new BI.Title('jPath'));


		field.onChange(function(index, value) {
			
			var jpath = [], variable = CI.Repo.get(value);
			if(!variable)
				return;
			
			CI.DataType.getJPathsFromElement(variable[1], jpath);
			var jpathfield = this.group.getField('_jpath');
			jpathfield.implementation.setOptions(jpath, index);
		});

		/*var objs = [];
		for(var i in CI.API.getAllSharedVariables()) {
			objs.push({key: i, title: i});
		}
		field.implementation.setOptions(objs);
*/
		var field = groupfield.addField({
			type: 'Combo',
			name: 'type'
		});
		field.setTitle(new BI.Title('Method'));
		field.implementation.setOptions([{key: 'get', title: 'Get'}, {key: 'put', title: 'Post'}]);



		return true;
	},
	
	doFillConfiguration: function() {
		
		var cfg = this.module.getConfiguration().variables;
		
		var types = [], url = [], variablesget = [];
		for(var i in cfg) {
			variablesget.push(cfg[i].variableget);
			types.push(cfg[i].type);
			url.push(cfg[i].url);
		}


		var vars = [];
		for(var i in cfg) {
			var variableget = [], type = [], jpath = [];
			if(cfg[i].subvars)
				for(var j = 0; j < cfg[i].subvars.length; j++) {
					//variable.push(cfg[i].subvars[j].variable);
					variableget.push(cfg[i].subvars[j].variableget);
					type.push(cfg[i].subvars[j].type);
					jpath.push(cfg[i].subvars[j].jpath);
				}

		while(cfg[i].url instanceof Array)
			cfg[i].url = cfg[i].url[0];

		while(cfg[i].variable instanceof Array)
			cfg[i].variable = cfg[i].variable[0];

			vars.push({
				groups: {
					'vardetails': [{
						url: [cfg[i].url],
						variable: [cfg[i].variable]
					}],
					'varvar': [{
						variableget: variableget,
						type: type,
						_jpath: jpath
					}]
				}
			});
		}

		

		return {	

			sections: {
				varcfg: vars
			},

			groups: {
				cfg: [{
					label: [this.module.getConfiguration().label]
				}]
			}
		}
	},
	
	doSaveConfiguration: function(confSection) {
		var group = confSection[0].varcfg;
		var vars = [];
		var obj;
		for(var i = 0; i < group.length; i++) {
			obj = { 
				url: group[i].vardetails[0].url[0],
				variable: group[i].vardetails[0].variable[0],
				subvars: group[i].varvar[0]
			};
			vars.push(obj);
		}
	
		this.module.getConfiguration().variables = vars;
		this.module.getConfiguration().label = confSection[0].cfg[0].label[0];
	},

	"export": function() {
		return this.module.view.table.exportToTabDelimited();
	}
});
