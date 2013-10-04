
define(['jquery'], function($) {

	var _workers = {};
	var _callbacks = {};
	
	return {
		create: function(name, scriptUrl) {
			
			if(_workers[name] !== undefined)
				return;
			
			_workers[name] = new Worker(scriptUrl);
			_callbacks[name] = [];
			_workers[name].onmessage = function(event) {
				var cbks = _callbacks[name];
				var response = event.data;
				for(var i = 0; i < cbks.length; i++) {
					if(cbks[i].time == response.time) {
						cbks[i].callback(response.message);
						cbks.splice(i, 1);
						return;
					}
				}
			}
		},
		
		send: function(name, message, callback) {
			
			if(_workers[name] == undefined)
				this.create(name, name);

			var date = Date.now();
			_workers[name].postMessage({ time: date, message: message });
			_callbacks[name].push({ time: date, callback: callback });
		},
		
		terminate: function(name) {
			
			if(_workers[name] == undefined)
				return;
			
			_workers[name].terminate();
		},
		
		hasWorkerInit: function(workerName) {
			return !!_workers[workerName];
		}
	};
});
