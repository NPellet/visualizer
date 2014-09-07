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


			var data = { x: 0.5, dx: 0.2, y: [] };

			for( var i = 1, l = 30; i < l ; i += 1 ) {
				data.y.push( Math.sin( i * 0.2 + 0.5 ) );
			}

			graphinstance.newSerie("serieTest")
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data )
				.setMarkers();

			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		

	}, "Interval data", [ 


	"Often you have little concern for the x values. Either they are irrelevant or they have always equal spacing. In this case the second data definition: <code>{ x: start, dx: delta, y: [] }</code> and replace <code>start</code>, <code>delta</code> by the starting x value and the increment at each point of the <code>y</code> array."] ];


});