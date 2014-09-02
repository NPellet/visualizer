define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { series: [ 'scatter' ] }, function( graphinstance ) {

			var modificators = [];
			modificators[ 20 ] = { shape: 'circle', r: 12, fill: 'rgba(0, 100, 255, 0.3)', stroke: 'rgb(0, 150, 255)' };
			
			var serie = graphinstance.newSerie("serieTest", { }, 'scatter')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( series[ 0 ] )
				.setDataStyle( 
					{ shape: 'circle', r: 2, fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgb(255, 100, 0)' },
					modificators
				);

			var shape = { type: 'line', strokeColor: 'black', strokeWidth: 1, pos: { x: series[ 0 ][ 40 ], y: series[ 0 ][ 41 ] }, pos2: { x: 2000, y: "20px" } };
			graphinstance.newShape( shape ).then( function( shape ) {
				shape.draw();
				shape.redrawImpl();
			});

			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		

	}, "Scatter plot", [ 


	"Display a scatter plot using <code>graph.newSerie(name, options, 'scatter')</code>. Setting the data remains the same", "To specify how the scattered points have to look like, use <code>serie.setDataStyle( general, modificators ).</code> The parameter <code>general</code> defines what all shapes look like. The parameter <code>modificator</code> (array) allows you to override the shapes for the points at the non-null indices of the array."


	]

	];

} );