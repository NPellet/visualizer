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


				var axisProperties = { primaryGrid: false, secondaryGrid: false },

					xAxis = graphinstance.getXAxis( 0, axisProperties ),
					leftAxis = graphinstance.getLeftAxis( 0, axisProperties ),
					rightAxis = graphinstance.getRightAxis( 0, axisProperties );

				graphinstance.newSerie( "serieTest" )
					.setLabel( "My serie" )
					.setAxes( xAxis, leftAxis )
					.setData( series[ 0 ] );
					
				graphinstance.newSerie( "serieTest_2" )
					.setLabel( "My serie 2" )
					.setAxes( xAxis, rightAxis )
					.setData( series[ 1 ] )
					.setLineColor('red');

				graphinstance.setHeight( 250 );

				var legend = graphinstance.makeLegend( {

					backgroundColor: 'rgba( 255, 255, 255, 0.8 )',
					frame: true,
					frameWidth: '1',
					frameColor: 'rgba( 100, 100, 100, 0.5 )',

					movable: true

				});

				graphinstance.redraw( );
				graphinstance.drawSeries();	
				
				legend.setPosition(

					{ dx: "-10px", dy: "10px", x: "max", y: "max" }, 
					"right", // Reference point
					"top" // Reference point

				);



		 } );
		
	}, "Scaling different axis", [ 'Displaying a legend', "Legend in movable", "Wheel scales the selected serie"] ];

});