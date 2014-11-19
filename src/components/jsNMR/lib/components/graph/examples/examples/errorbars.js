define( function() {

	return [ function( domGraph ) {

		var seriedata = [],
			error = [];

		for( var i = 0; i < 1; i += 0.2  ) {
			seriedata.push([ i , Math.pow( i, 2 ) ]);
			error.push( [ [ [ Math.random() / 5, Math.random() / 5 ] ] ] );
		}

		var graphinstance = new Graph( domGraph );

		graphinstance.newSerie("serieTest", {}, "scatter", function( serie ) {

			serie
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata )
				.setMaxErrorLevel( 1 )
				.setDataError( error );

			graphinstance.redraw( );
			graphinstance.drawSeries();	
		});
			


	}, "Error bars", [ "Display error bars"] ];

});