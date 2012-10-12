
CI.WebWorker = {
	
	_workers: {},
	_callbacks: {},
	
	create: function(name, scriptUrl) {
		
		if(CI.WebWorker._workers[name] !== undefined)
			return;
		console.log(scriptUrl);
		CI.WebWorker._workers[name] = new Worker(scriptUrl);
		CI.WebWorker._callbacks[name] = [];
		
		CI.WebWorker._workers[name].onmessage = function(event) {
			var cbks = CI.WebWorker._callbacks[name];
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
		
		if(CI.WebWorker._workers[name] == undefined)
			return;
		
		var date = Date.now();
		
		//console.log(CI.WebWorker._workers[name]);
		CI.WebWorker._workers[name].postMessage({ time: date, message: message });
		CI.WebWorker._callbacks[name].push({ time: date, callback: callback });
	},
	
	terminate: function(name) {
		
		if(CI.WebWorker._workers[name] == undefined)
			return;
		
		CI.WebWorker._workers[name].terminate();
	},
	
	hasWorkerInit: function(workerName) {
		return !!CI.WebWorker._workers[workerName];
	}
}