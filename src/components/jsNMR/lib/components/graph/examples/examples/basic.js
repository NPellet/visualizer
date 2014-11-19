
define( function() {

	return [ function( domGraph ) {

			var graphinstance = new Graph( domGraph, function( graphinstance ) {

				graphinstance.setHeight( 240 );
				graphinstance.setWidth( 200 );

				graphinstance.newSerie("temp_nh")
					.setLabel( "My serie" )
					.autoAxis()
					.setData( series[ 0 ] );

				graphinstance.getYAxis().setLabel( "Anomaly (°C)");
				graphinstance.getXAxis().setLabel( "Years");

				graphinstance.redraw( );
				graphinstance.drawSeries();	

			} );
			

		}, 

		"Default functionnality", 
		[ 'Basic chart', 'Axis labels', 'Set graphinstance dimension'] 

	];


} );
