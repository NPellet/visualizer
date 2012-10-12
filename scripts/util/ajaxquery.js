

if(!window[_namespaces['util']].Util) window[_namespaces['util']].Util = {};

window[_namespaces['util']].Util.AjaxQuery = function(options, doNotQueueIt) {
	
	this.options = $.extend(true, {}, window[_namespaces['util']].Util.AjaxQuery.prototype.defaults, options);
	this.setPriority(this.options.priority);
	
	if(!doNotQueueIt)
		window.ajaxManager.addQuery(this);
}

window[_namespaces['util']].Util.AjaxQuery.prototype = {
	
	defaults: {
		url: null,
		data: {},
		type: 'get',
		dataType: 'json',
		priority: 1
	},
	
	setPriority: function(priority) {
		if(typeof priority !== "number")
			return this.priority = 4;
		
		if(priority < 1 || priority > 4)
			return this.priority = 4;
		
		this.priority = Math.round(priority);
	},
	
	getPriority: function() {
		return this.priority;
	},
	
	launch: function() {
		
		var query = this;
		
		$.ajax({
			url: this.options.url,
			type: this.options.type,
			dataType: this.options.dataType,
			timeout: 120000,
			complete: function() {
				if(typeof query.managerCallback == "function")
					query.managerCallback(query);
			},
			
			success: function(data, xhr) {
				if(typeof query.options.success == "function")
					query.options.success(data, xhr);
			},
			
			error: function(xhr) {
				
				if(typeof query.options.error == "function")
					query.options.error(xhr);
			}
			
		});
		
	},
	
	useProxyUrl: function(url) {
		this.options.url = url.replace('<url>', escape(this.options.url));
	},
	
	_setManagerCallback: function(fct) {
		this.managerCallback = fct;
	},
	
	setLaunchedTime: function(time) {
		this.launchedTime = time;
	},
	
	getLaunchedTime: function() {
		return this.launchedTime;
	}
}
