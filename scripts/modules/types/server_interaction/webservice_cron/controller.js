
define(['modules/defaultcontroller'], function(Default) {
	
	function controller() { };

	// Extends the default properties of the default controller
	controller.prototype = $.extend( true, {}, Default );


	/*
		Information about the module
	*/
	controller.prototype.moduleInformation = {
		moduleName: 'Webservice Cron',
		description: 'Cron service allowing to fetch data from the server',
		author: 'Norman Pellet, Luc Patiny',
		date: '08.01.2014',
		license: 'MIT',
		cssClass: 'webservice_cron'
	};

	controller.prototype.initimpl = function() {
		this.timeout = [];
		this.doVariables();
	};


	/*
		Configuration of the input/output references of the module
	*/
	controller.prototype.references = {
	
		// ouput	
		result: { 
			label: 'Global result',
			type: 'object'
		}
	}


	/*
		Configuration of the module for sending events, as a static object
	*/
	controller.prototype.events = {

		// List of all possible events
		onUpdateResult: {
			label: 'Updated result',
			refVariable: [ 'result' ] 
		}
	};



	controller.prototype.doVariables = function() { 

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
	};

	controller.prototype.clearTimeouts = function() {

		for(var i = 0, l = this.timeout.length; i < l; i++) {
			if(this.timeout[i])
				window.clearTimeout(this.timeout[i]);
			this.timeout[i] = false;
		}
	};

	controller.prototype.setTimeout = function(type, variable, time, url) {
		if(this.timeout[variable]) {
			window.clearTimeout(this.timeout[variable]);
			this.timeout[variable] = false;
		}

		var self = this;
		window.setTimeout(function() {
			self.doAjax(type, variable, time, url);
		}, time * 1000);
	};

	controller.prototype.doAjax = function(type, variable, time, url) {
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
	};




	
	controller.prototype.configurationStructure = function(section) {
		
		return {
			groups: {

				cronInfos: {

					options: {
						type: 'table',
						multiple: true
					},

					fields: {
						
						variable: {
							type: 'text',
							title: 'Variable',
							default: ''
						},

						url: {
							type: 'text',
							title: 'URL',
							default: ''
						},

						repeat: {
							type: 'text',
							title: 'Repetition time (s)',
							default: '60'
						}
					}
				}
			}
		}
	};


	controller.prototype.configAliases = {
		cronInfos: [ 'groups', 'cronInfos', 0 ]
	};

	return controller;
});



