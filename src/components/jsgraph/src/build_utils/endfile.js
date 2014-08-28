

	};

	if( typeof define === "function" && define.amd ) {
		define( [ 'jquery' ], function( $ ) {
			return Graph( $ );
		});
	} else if( window ) {

		if( ! window.jQuery ) {
			throw "jQuery has not been loaded. Abort graph initialization."
			return;
		}

		window.Graph = Graph( window.jQuery );
	}

} ) );