define( function() {

	return [ function( domGraph ) {

		new Graph( domGraph, { }, {

				top: [ {
					flipped: true,
					axisDataSpacing: { min: 0, max: 0 },
					primaryGrid: false,
					secondaryGrid: false,			
					labelValue: "Top axis"
				} ],

				right: [ {
					forcedMin: 0,
					axisDataSpacing: { min: 0 },
					tickPosition: 2,
					secondaryGrid: false
				} ]

			}, function( graphinstance ) {	

				graphinstance.newSerie("temperatures")
					.setLabel( "My serie" )
					.autoAxis()
					.setData( series[ 5 ] )
					.setLineColor('red');

				graphinstance.autoscaleAxes();
				graphinstance.redraw( );
				graphinstance.drawSeries( );

			}
		);


	}, "Axis/Grid tuning", [ "Loading on other axis", "Changing grid properties", "Force axis boundaries", "Adjust data padding"] ]

} );