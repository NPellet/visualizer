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
		

	}, "Error bars", [ 

	"Scientific data often comes along with error bars. You can chose to display bars or boxes using the <code>serie.setErrorStyle();</code> method.",

	[ "Defining errors", "Errors are essentially stored in multi-level array, such as : <code>[ [ [ [ 0.5, 0.2 ], [ 0.8, 0.2 ] ] ] ]</code>"],
	"The first level corresponds to your data. Error at index n will be assigned to dat at index n",
	"The second level differentiates error bars in the x or the y direction. First argument is y, second is x",
	"The third level reprensents bars or boxes. To know which one is which, refer to the order you specified in <code>serie.setErrorStyle</code> function. Use false or null not to display errors of this level for this particular point",
	"The fourth level represents above/below or lefthand/righthand error bars/boxes. Use only one argument to make it symmetric."



	] 



	];

});