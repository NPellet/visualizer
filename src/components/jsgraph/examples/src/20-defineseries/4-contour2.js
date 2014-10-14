define( function() {

	return [ function( domGraph ) {

	
		
		var graphinstance = new Graph( domGraph, { series: [ 'contour' ] }, function( graphinstance ) {

			var serie = graphinstance.newSerie("serieTest", {}, "contour")
				.setLabel( "My serie" )
				.autoAxis()
				.setData( {

					minX: -5,
					maxX: 5,
					minY: -5,
					maxY: 5,
					segments: contour

				} );
				
			graphinstance.redraw( );
			graphinstance.drawSeries( );	

		} );
		
	}, "Contour plot v2", [ 


	"In the version 2, you should include the contour line minimums and maximums, to be taken into account by the axes autoscaling. This is an alternative to the <code>forceMin</code> and <code>forceMax</code> methods in the version 1.",
	

	] ];

});


