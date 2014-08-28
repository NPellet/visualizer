define( function() {

	return [ function( domGraph ) {

		var seriedata = [],
			error = [];

		for( var i = 0; i < 5; i += 0.5  ) {
			seriedata.push([ i , Math.sin( i ) ]);
			error.push( [ [ [ Math.random() / 10, Math.random() / 10 ], [  ( 1 + Math.random() ) / 5, ( 1 + Math.random() )  / 5 ] ] ] );
		}

		var graphinstance = new Graph( domGraph );

		graphinstance.newSerie("serieTest", {}, "scatter", function( serie ) {

			serie
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata )
				.setDataError( error )
				.setErrorStyle( [ 'box', 'bar' ] );

			graphinstance.redraw( );
			graphinstance.drawSeries();	
		});
		

	}, "Error bars", [ "Display error bars"] ];

});