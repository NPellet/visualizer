define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { 

			plugins: {
				'graph.plugin.shape': { },
			},

			pluginAction: {
				'graph.plugin.shape': { shift: false, ctrl: false }
			}

		}, function( graphinstance ) {


			var data = { x: 0.5, dx: 0.01, y: [] };

			for( var i = 1, l = 1000; i < l ; i ++ ) {
				data.y.push( Math.log( i ) * ( Math.random() + 3 ) );
			}

			graphinstance.newSerie("serieTest")
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data );

			graphinstance.redraw( );
			graphinstance.drawSeries();	



		} );
		

	}, "Display x interval data", [ "Use dx series"] ];


});