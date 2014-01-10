
define(['modules/default/defaultcontroller'], function(Default) {
	
	function controller() {};
	controller.prototype = $.extend(true, {}, Default, {

		initimpl: function() {
			this.timeout = [];
			this.doVariables();
		},

		doVariables: function() { 

			this.clearTimeouts();
			
			var self = this;
			var cfg = this.module.getConfiguration().variables, variable, type, time;

			if(!cfg)
				return;

			for(var i = 0, l = cfg.length; i < l; i++) {
				variable = cfg[i].variable;
				type = cfg[i].type;
				time = cfg[i].repeat;
				url = cfg[i].url;

				this.setTimeout(type, variable, time, url);
			}
		},

		clearTimeouts: function() {

			for(var i = 0, l = this.timeout.length; i < l; i++) {
				if(this.timeout[i])
					window.clearTimeout(this.timeout[i]);
				this.timeout[i] = false;
			}
		},

		setTimeout: function(type, variable, time, url) {
			if(this.timeout[variable]) {
				window.clearTimeout(this.timeout[variable]);
				this.timeout[variable] = false;
			}

			var self = this;
			window.setTimeout(function() {
				self.doAjax(type, variable, time, url);
			}, time * 1000);
		},

		doAjax: function(type, variable, time, url) {
			var self = this;
			var cfg = this.module.getConfiguration().variables
			var ajax = {
				url: url,
				dataType: 'json'
			};

			if(type == 'get') {
				ajax.success = function(data) {
					CI.API.setSharedVar(variable, data);
					self.module.view.log(true, variable);
				}
				ajax.method = 'get';
				ajax.type = 'get';

			} else {
				ajax.success = function(data) {
					CI.API.setSharedVar(variable, data);
					self.module.view.log(true, variable);	
				}
				var variable = CI.Repo.get(variable);
				if(!variable)
					return;

				ajax.data = {data: variable[1] };
				ajax.method = 'post';
				ajax.type = 'post';
			}

			ajax.complete = function() {

				self.setTimeout(type, variable, time, url);
			}

			ajax.error = function() {
				self.module.view.log(false, variable);
				
			}

			$.ajax(ajax);
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
			moduleName: 'Webservice Crontab'
		},

		
		doConfiguration: function(section) {
			
			var groupfield = new BI.Forms.GroupFields.Table('varcfg');

			section.addFieldGroup(groupfield);
			
			var field = groupfield.addField({
				type: 'Text',
				name: 'variable'
			});
			field.setTitle(new BI.Title('Variable'));
	//		var objs = [];
			/*for(var i in CI.API.getAllSharedVariables()) {
				objs.push({key: i, title: i});
			}
			field.implementation.setOptions(objs);
	*/
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
			

			var field = groupfield.addField({
				type: 'Text',
				name: 'repeat'
			});
			field.setTitle(new BI.Title('Repetition time (s)'));
			
			return true;
		},


		
		doFillConfiguration: function() {
			
			var cfg = this.module.getConfiguration().variables;
			
			var variables = [], types = [], url = [], repeat = [];
			for(var i in cfg) {
				variables.push(cfg[i].variable);
				types.push(cfg[i].type);
				url.push(cfg[i].url);
				repeat.push(cfg[i].repeat);
			}

			return {	

				groups: {
					
					varcfg: [{
						variable: variables,
						type: types,
						url: url,
						repeat: repeat
					}]
				}
			}
		},
		
		doSaveConfiguration: function(confSection) {
			var group = confSection[0].varcfg[0];
			var vars = [];
			for(var i = 0; i < group.length; i++) {
				vars.push({ variable: group[i].variable, type: group[i].type, url: group[i].url, repeat: group[i].repeat });
			}
		
			this.module.getConfiguration().variables = vars;
			
			this.doVariables();
		}

	});

	return controller;
});



