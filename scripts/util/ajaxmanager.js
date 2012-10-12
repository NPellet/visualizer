
if(!window[_namespaces['util']].Util) window[_namespaces['util']].Util = {};

window[_namespaces['util']].Util.AjaxManager = function() {
	this.queries = [[],[],[],[]];
	this.queued = 0;
	this.running = 0;
	this.runningQueries = {};
}

window[_namespaces['util']].Util.AjaxManager.prototype = {
	
	createQuery: function(options, doNotQuery) {
		return new window[_namespaces['util']].Util.AjaxQuery(options, doNotQuery);
	},
	
	addQuery: function(query) {
		var priority = query.getPriority() - 1;
		this.queries[priority].push(query);
		this.queued++;
		
		this.doNextQuery();
	},
	
	doNextQuery: function() {
		
		if(this.countRunningQueries() > 6)
			return;
		
		var query;
		
		for(var i = 0; i < 4; i++) {
			if(query = this.getNextQuery(i)) {
				this._doQuery(query);
				return;
			}
		}
		
		if(this.running == 0)
			this.setTimeout();
	},
	
	setTimeout: function() {
		this.timeout = window.setTimeout(this.doNextQuery, 3000);
	},
	
	clearTimeout: function() {
		window.clearTimeout(this.timeout);
	},
	
	countRunningQueries: function() {
		var c = 0;
		for(var i in this.runningQueries)
			c++;
			
		return;
	},
	
	_doQuery: function(query) {
		var priority = query.getPriority() - 1;
		this.queries[priority].splice(0, 1);
		var manager = this;
		var date = Date.now();
		
		while(typeof this.runningQueries[date] !== "undefined")
			date++;
			
		this.runningQueries[date] = query;
		
		if(this.proxyUrl !== undefined)
			query.useProxyUrl(this.proxyUrl);
			
		query._setManagerCallback(function(query) {
			
			/* Force to release the pointer (for the garbager) */
			manager.runningQueries[query.getLaunchedTime()] = null;
			delete manager.runningQueries[query.getLaunchedTime()];
			manager.running--;
			
		});
		
		this.running++;
		this.queued--;
		query.setLaunchedTime(date);
		query.launch();
		this.clearTimeout();
		this.doNextQuery();
	},
	
	getNextQuery: function(priority) {

		if(this.queries[priority].length > 0)
			return this.queries[priority][0];
	},
	
	setProxyUrl: function(url) {
		this.proxyUrl = url;
	}
}
