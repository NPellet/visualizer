define([], function() {

	var debugLevel = -1;

	return {
		setDebugLevel: function(level) {
			debugLevel = level;
		},

		log: function(message, level) {
			level = level || 0;
			if(level <= debugLevel && console)
				console.log(message);
		}



	}

});