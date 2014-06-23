define(function() {

	var debugLevel = -1,
		console = window.console,
		entries = [];
		
	function addEntry(entry) {
		entries.push(entry);
	}

	var Debug = {
		
		setDebugLevel: function(level) {
			debugLevel = level;
		},
		
		error: function(message, error) {
			if(debugLevel >= 0) {
				if(error instanceof Error && error.stack) {
					arguments[1] = "\n"+error.stack;
				} else {
					entries.push.call(arguments, "\n"+Error().stack);
				}
				console.error.apply(console, arguments);
			}
			if(debugLevel > -1)
				addEntry("ERROR : "+ message);
		},
		
		warn: function(message) {
			if(debugLevel >= 1) {
				console.warn.apply(console, arguments);
			}
			if(debugLevel > -1)
				addEntry("WARN  : "+ message);
		},
		
		info: function(message) {
			if(debugLevel >= 2) {
				console.info.apply(console, arguments);
			}
			if(debugLevel > -1)
				addEntry("INFO  : "+ message);
		},
		
		debug: function(message) {
			if(debugLevel >= 3) {
				console.debug.apply(console, arguments);
			}
			if(debugLevel > -1)
				addEntry("DEBUG : " + message);
		},
		
		trace: function(message) {
			if(debugLevel >= 4) {
				console.log.apply(console, arguments);
			}
			if(debugLevel > -1)
				addEntry("TRACE : " + message);
		},
		
		dump: function() {
			console.log(entries.join("\n"));
			entries = [];
		},
		
		timer: function() {
			return new Timer();
		}

	};
	
	function formatTime(time, format) {
		if(format) {
			if(format==="ms") {
				return time+"ms";
			}
			if(format==="s") {
				return (time/1000)+"s";
			}
		}
		else
			return time;
	}
	
	function Timer() {
		this._start = Date.now();
		this._step = this._start;
	}
	
	Timer.prototype = {
		time: function(format) {
			return formatTime(Date.now()-this._start, format);
		},
		step: function(format) {
			var now = Date.now(),
				time = now-this._step;
			this._step = now;
			return formatTime(time, format);
		}
	};
	
	return Debug;

});