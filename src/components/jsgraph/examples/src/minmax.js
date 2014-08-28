define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { series: [ 'zone', 'line' ] }, function( graphinstance ) {

			var data = [];
			var data2 = [];
			var data3 = [];
			

			for( var i = 0; i < 4 ; i += 0.2 ) {

				data.push( [ i, Math.sin( i ) ] );
				
				data2.push( i );
				data2.push( Math.sin( i, 2 ) - ( ( 0.2 + Math.random() ) * 1 ) );
				data2.push( Math.sin( i, 2 ) + ( ( 0.2 + Math.random() ) * 1 ) );


				data3.push( i );
				data3.push( Math.sin( i, 2 ) - ( ( 1.2 + Math.random() ) * 2 ) );
				data3.push( Math.sin( i, 2 ) + ( ( 1.2 + Math.random() ) * 2 ) );
			}



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

	
		} );
		
	}, "Min/Max serie", [ "Display a \"Zone\" serie" ] ];

});