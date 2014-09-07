define( function() {

	return [ function( domGraph ) {

		var graphinstance = new Graph( domGraph, { 

			wheel: {
				type: 'plugin',
				plugin: 'graph.plugin.zoom',
				options: {
					direction: 'y'
				}
			},

			plugins: {
				'graph.plugin.zoom': { }
			}

		 }, function( graphinstance ) {

		 		var series = [ [], [], [] ];

		 		for( var i = 0; i < Math.PI * 2 ; i += 0.1 ) {

		 			series[ 0 ].push( i );
		 			series[ 1 ].push( i );
		 			series[ 2 ].push( i );

		 			series[ 0 ].push( Math.sin( i ) );
		 			series[ 1 ].push( Math.cos( i ) );
		 			series[ 2 ].push( Math.sin( i ) * Math.cos( i ) );
		 		}

		
				graphinstance.newSerie( "sin" )
					.setLabel( "f(x) = sin(x)" )
					.autoAxis()
					.setData( series[ 0 ] )	
					.setLineColor( '#bd1a1a' )
					.showMarkers()
					.setMarkers( 

					[
						{

							type: 1,
							points: [ 'all' ],
							fill: true

						},

						{

							type: 4,
							points: [ [ 32, 36 ], 55 ],
							fill: 'transparent',
							strokeWidth: 4,
							zoom: 1,
							fillColor: 'green',
							strokeColor: 'orange'

						},

						{

							type: 3,
							points: [ 10, 22, 42, [57,59] ],
							fill: 'transparent',
							strokeWidth: 4,
							zoom: 1,
							strokeColor: 'green'

						}

					]

					);
					
		

				graphinstance.newSerie( "cos" )
					.setLabel( "f(x) = cos(x)" )
					.autoAxis()
					.setData( series[ 1 ] )	
					.setLineColor( '#e0a1de' )
					.showMarkers()
					.setMarkers( 

					[
						{

							type: 1,
							points: [ 3,5,19,50 ],
							fill: true

						},

						{

							type: 4,
							points: [ 5,12,53,22 ],
							fill: 'transparent',
							strokeWidth: 1,
							zoom: 3,
							strokeColor: 'blue',
							

						},

						{

							type: 3,
							points: [ 18, 32,29 ],
							fill: 'transparent',
							strokeWidth: 1,
							zoom:3,
							
							strokeColor: 'olive'

						}

					]

					);
					
		

				graphinstance.redraw( );
				graphinstance.drawSeries();	

		 } );
		
	}, "Display markers", [ 


		'Set any style of markers you want through the <code>serie.setMarkers</code> method. It takes an array of objects as an argument. Every object must have the property <code>type</code> which defines which shape should be used.',
		'Use the property <code>points</code> to specify which points should bear this shape. Use the value "<code>all</code>" for all markers. Use <code>[ number, number ]</code> to specify individual points or use <code>[ [ from, to ], [ from, to ] ]</code> to specify ranges. Points and ranges can be mixed together.',
		'Use the property <code>zoom</code> to magnify the marker. Use <code>fill</code>, <code>strokeColor</code>, <code>strokeWidth</code> to change the style of the marker.'


	] ];

});