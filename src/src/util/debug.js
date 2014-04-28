define(function() {

	var debugLevel = -1,
		console = window.console,
		entries = [];
		
	function addEntry(entry) {
		entries.push(entry);
	}

	return {
		
		setDebugLevel: function(level) {
			debugLevel = level;
		},
		
		error: function(message) {
			if(debugLevel >= 0) {
				console.error(message);
			}
			if(debugLevel > -1)
				addEntry("ERROR : "+ message);
		},
		
		warn: function(message) {
			if(debugLevel >= 1) {
				console.warn(message);
			}
			if(debugLevel > -1)
				addEntry("WARN  : "+ message);
		},
		
		info: function(message) {
			if(debugLevel >= 2) {
				console.info(message);
			}
			if(debugLevel > -1)
				addEntry("INFO  : "+ message);
		},
		
		debug: function(message) {
			if(debugLevel >= 3) {
				console.log(message);
			}
			if(debugLevel > -1)
				addEntry("DEBUG : " + message);
		},
		
		trace: function(message) {
			if(debugLevel >= 4) {
				
			}
			if(debugLevel > -1)
				addEntry("TRACE : " + message);
		},
		
		dump: function() {
			console.log(entries.join("\n"));
			entries = [];
		}

	};

});