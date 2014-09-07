define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph );



// BEGIN IGNORE ON BUILD
			var data = [];
			var data2 = [];
			var data3 = [];
			

			for( var i = 0; i < 4 ; i += 0.2 ) {

				data.push( [ i, Math.sin( i ) + 0.2 * Math.random() ] );
				
				data2.push( i );
				data2.push( Math.sin( i, 2 ) - ( ( 0.4 + Math.random() ) * 1 ) );
				data2.push( Math.sin( i, 2 ) + ( ( 0.4 + Math.random() ) * 1 ) );
		

				data3.push( i );
				data3.push( Math.sin( i, 2 ) - ( ( 1.2 + Math.random() ) * 2 ) );
				data3.push( Math.sin( i, 2 ) + ( ( 1.2 + Math.random() ) * 2 ) );
			}
// END IGNORE ON BUILD


			var serie = graphinstance.newSerie("serieTest", { }, 'zone')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data3 )
				.setFillColor('rgba(100, 100, 300, 0.2)')
				.setLineColor('transparent');

			var serie = graphinstance.newSerie("serieTest", { }, 'zone')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data2 )
				.setFillColor('rgba(200, 100, 100, 0.6)')
				.setLineColor('rgba(200, 100, 100, 0.9)');

			var serie = graphinstance.newSerie("serieTest", { }, 'line')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data )
				.setLineColor('rgba(150, 70, 50, 1)')

			graphinstance.redraw( );
			graphinstance.drawSeries();	

	
		} 
		
	, "Min/Max serie", [ 


	"To display zone series, use the <code>zone</code> keyword in the <code>graph.newSerie( serieName, serieOptions, serieType )</code>.",
	"Setting the data is slightly different that the usual line serie, as you need three data per point (x,min,max). You can however still use a linear array to set your data just as you would for a line serie",
	"As of today every point needs to be defined. There is no way to define a point for the lower bound and not the upper bound."


	]

 ]
});