define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { series: [ 'scatter', 'line', 'zone' ] }, function( graphinstance ) {

			var modificators = [];
			//modificators[ 20 ] = { shape: 'circle', r: 12, fill: 'rgba(0, 100, 255, 0.3)', stroke: 'rgb(0, 150, 255)' };
			
			var seriedata = [];

			var seriedata2 = [];

			for( var i = 0, l = series[ 0 ].length ; i < l ; i += 2 ) {

				if( i > 5 ) {
					seriedata.push( series[ 0 ][ i ] );
					seriedata.push( ( series[ 0 ][ i + 1 ] + series[ 0 ][ i - 1 ] + series[ 0 ][ i - 3 ] + series[ 0 ][ i - 5 ] ) / 4 );

					if( i < series[ 0 ].length - 9 ) {
						seriedata2.push( series[ 0 ][ i ] );
						seriedata2.push( Math.max( series[ 0 ][ i + 1 ], series[ 0 ][ i + 3 ], series[ 0 ][ i + 5 ], series[ 0 ][ i + 7 ], series[ 0 ][ i + 9 ], series[ 0 ][ i - 1 ], series[ 0 ][ i - 3 ], series[ 0 ][ i - 5 ] ) * 1.5  );
						seriedata2.push( Math.min( series[ 0 ][ i + 1 ], series[ 0 ][ i + 3 ], series[ 0 ][ i + 5 ],  series[ 0 ][ i + 7 ], series[ 0 ][ i + 9 ], series[ 0 ][ i + 1 ], series[ 0 ][ i - 1 ], series[ 0 ][ i - 3 ], series[ 0 ][ i - 5 ] ) * 1.5 );

					//seriedata2.push( Math.max( series[ 0 ][ i + 1 ], series[ 0 ][ i - 1 ] ) * 2 );
					//seriedata2.push( Math.min( series[ 0 ][ i + 1 ], series[ 0 ][ i - 1 ] ) * 2 );
					

					}
				}


				

			}

			var serie = graphinstance.newSerie("serieTest", { }, 'scatter')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( series[ 0 ] )
				.setDataStyle( 
					{ shape: 'circle', r: 2, fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgb(255, 100, 0)' },
					modificators
				);



			var serie = graphinstance.newSerie("serieTest", { }, 'line')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata )
				


			var serie = graphinstance.newSerie("serieTest", { }, 'zone')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata2 )
				.setFillColor('rgba(200, 100, 100, 0.2)')
				.setLineColor('rgba(200, 100, 100, 0.4)');


		
			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		

	}, "Scatter serie", [ "Display a scatter plot", "Add an annotation onto it"] ];

} );