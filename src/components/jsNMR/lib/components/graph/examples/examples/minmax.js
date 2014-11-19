define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { series: [ 'zone', 'line' ] }, function( graphinstance ) {

			graphinstance.setHeight( 250 );	

			var data = [];
			var data2 = [];
			

			for( var i = 0; i < 40 ; i += 2 ) {

				data.push( [ i, Math.pow( i, 2 ) ] );
				
				data2.push( i );
				data2.push( Math.pow( i, 2 ) - ( ( 0.2 + Math.random() ) * 300 ) );
				data2.push( Math.pow( i, 2 ) + ( ( 0.2 + Math.random() ) * 300 ) );
			}

			var serie = graphinstance.newSerie("serieTest", { }, 'zone')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data2 )
				.setFillColor('rgba(200, 100, 100, 0.2)')
				.setLineColor('rgba(200, 100, 100, 0.9)');


			var serie = graphinstance.newSerie("serieTest", { }, 'line')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data )
				.setLineColor('rgba(150, 70, 50, 1)')

				
			graphinstance.redraw( );
			graphinstance.drawSeries();	

	
		} );
		
	}, "Min/Max serie", [ "Display a \"Zone\" serie" ] ];

});