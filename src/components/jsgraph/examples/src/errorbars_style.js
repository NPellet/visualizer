define( function() {

	return [ function( domGraph ) {

		var seriedata = [],
			error = [];

		for( var i = 0; i < 5; i += 0.5  ) {
			seriedata.push([ i , Math.sin( i ) ]);
			error.push( [ [ false, [  ( 1 + Math.random() ) / 5, ( 1 + Math.random() )  / 5 ] ], [ [ Math.random() / 2, Math.random() / 2 ] ] ] );
		}

		var graphinstance = new Graph( domGraph );

		graphinstance.newSerie("serieTest", {}, "scatter", function( serie ) {

			serie
				.setLabel( "My serie" )
				.autoAxis()
				.setData( seriedata )
				.setDataError( error )
				.setErrorStyle( [ 'bar', 'box' ], { bar: { x: {} }, box: { top: { strokeColor: 'green', fillColor: 'olive' }, bottom: { strokeColor: 'red', fillColor: "#800000" }  } } );

			graphinstance.redraw( );
			graphinstance.drawSeries();	
		});
		

	}, "Error bars", [ "Display error bars"] ];

});