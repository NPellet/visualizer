
define(['modules/defaultcontroller','util/datatraversing'], function(Default,Traversing) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() {
			this.values = {};
		},

		onClick: function() {
			var self = this;
			var cfg = this.module.getConfiguration().variables, variable, type, url;
			var def = $.Deferred();
			var ordef = def;

			for(var i = 0, l = cfg.length; i < l; i++) {

				type = cfg[i].type;

				(function(type, variable, k) {
					var ajax = {
						url: cfg[k].url
					};

					ajax.success = function(data) {
						self.values[cfg[k].url] = data;
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
						ajax.data = {};
						for(var j = 0; j < cfg[k].varsource.length; j++) {
							ajax.data[cfg[k].varsource[j].name] = CI.Repo.get(cfg[k].varsource[j].variable);
							ajax.data[cfg[k].varsource[j].name] = ajax.data[cfg[k].varsource[j].name][1];
						}

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
			
			
			var groupfield = new BI.Forms.GroupFields.List('cfg'), self = this;
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
			
			var url = groupfield.addField({
				type: 'Text',
				name: 'url'
			});
			url.setTitle(new BI.Title('URL'));
		


			var groupfield = new BI.Forms.GroupFields.Table('varsource');
			section2.addFieldGroup(groupfield);
		
			var field3 = groupfield.addField({
				type: 'Text',
				name: 'name'
			});
			field3.setTitle(new BI.Title('Name in URL'));


			var field3 = groupfield.addField({
				type: 'Text',
				name: 'variable'
			});
			field3.setTitle(new BI.Title('Source variable'));



			var groupfield = new BI.Forms.GroupFields.Table('varvar');
			section2.addFieldGroup(groupfield);
		
			var field2 = groupfield.addField({
				type: 'Text',
				name: 'variableget'
			});
			field2.setTitle(new BI.Title('Target variable'));


			var jpathfield = groupfield.addField({
				type: 'Combo',
				name: '_jpath'
			});
			jpathfield.setTitle(new BI.Title('jPath'));

			url.onChange(function(index, value) {
				
				var jpath = [], variable = self.values[value];
				if(!variable)
					return;
				Traversing.getJPathsFromElement(variable, jpath);
				this.group.section.fieldGroups[2].fields[1].implementation.setOptions(jpath);
			});

			return true;
		},
		
		doFillConfiguration: function() {
			
			var cfg = this.module.getConfiguration().variables;
			
			var types = [], url = [], variablesget = [], variablepushname = [], variablepush = [];
			for(var i in cfg) {
				variablesget.push(cfg[i].variableget);
				url.push(cfg[i].url);
			}


			var vars = [];
			for(var i in cfg) {
				var variableget = [], type = [], jpath = [];
				if(cfg[i].subvars) {
					for(var j = 0; j < cfg[i].subvars.length; j++) {
						variableget.push(cfg[i].subvars[j].variableget);
						jpath.push(cfg[i].subvars[j].jpath);
					}
				}


				if(cfg[i].varsource) {
					for(var j = 0; j < cfg[i].varsource.length; j++) {
						variablepush.push(cfg[i].varsource[j].variable);
						variablepushname.push(cfg[i].varsource[j].name);
					}
				}

			while(cfg[i].url instanceof Array)
				cfg[i].url = cfg[i].url[0];

				vars.push({
					groups: {
						'vardetails': [{
							url: [cfg[i].url]
						}],
						'varvar': [{
							variableget: variableget,
							_jpath: jpath
						}],
						'varsource': [{
							name: variablepushname,
							variable: variablepush
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
					subvars: group[i].varvar[0],
					varsource: group[i].varsource[0]
				};
				vars.push(obj);
			}
		
			this.module.getConfiguration().variables = vars;
			this.module.getConfiguration().label = confSection[0].cfg[0].label[0];
		},

		"export": function() {
		}


	});

	return controller;
});



