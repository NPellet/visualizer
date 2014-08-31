define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { series: [ 'scatter', 'line', 'zone' ] }, function( graphinstance ) {

			// BEGIN IGNORE ON BUILD
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

					}
				}


				

			}
			// END IGNORE ON BUILD
			var serie = graphinstance.newSerie("serieTest", { }, 'scatter')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( series[ 0 ] )
				.setDataStyle( { shape: 'circle', r: 2, fill: 'rgba(255, 0, 0, 0.3)', stroke: 'rgba(255, 100, 0, 0.6)' } );



			var serie = graphinstance.newSerie("serieTest", { }, 'line')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata )
				.setLineColor( 'olive' )
				.setLineWidth( 2 )
				.setLineStyle( 3 );
			


			var serie = graphinstance.newSerie("serieTest", { }, 'zone')
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata2 )
				.setFillColor('rgba(200, 100, 100, 0.2)')
				.setLineColor('rgba(200, 100, 100, 0.4)');


		
			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		

	}, "Various series", [ 


	"Don't just display standard series ! Customize your line color, thickness and profile using <code>setLineColor</code>, <code>setLineWidth</code> and <code>setLineStyle</code>.",
	"Use scatter series if your data represent individual events. This way you can customize any point ! Use <code>setDataStyle</code> to customize the shape of your data points",
	"If you want do represent minimas / maximas, use the zone serie ! It takes one more additional term in the data: <code>serie.setData( [ x1, min1, max1, x2, min2, max2, ... ])</code>. Use <code>setFillColor</code> and <code>setLineColor</code> to change how the zone should look like."


	]


	];

} );