define( function() {

	return [ function( domGraph ) {

		
		var graphinstance = new Graph( domGraph, { series: [ 'contour' ] }, function( graphinstance ) {

			var serie = graphinstance.newSerie("serieTest", {}, "contour")
				.setLabel( "My serie" )
				.autoAxis()
				.setData( contour );
				
/*
			var colors = [];
			for( var i = 0, l = contour.length ; i < l ; i ++ ) {
				colors.push( hslToRgb(0 + i / l, 1, 0.5) );
			}

			serie.setColors( colors );
*/
			graphinstance.getXAxis().forceMin( -5 );
			graphinstance.getXAxis().forceMax( 5 );

			graphinstance.getYAxis().forceMin( -5 );
			graphinstance.getYAxis().forceMax( 5 );

			graphinstance.redraw( );
			graphinstance.drawSeries();	

		} );
		
	}, "Contour plot", [ 


	"You can use the serie type <code>contour</code> to display contour lines. The serie data must be object having the properties <code>zValue</code> and <code>lines</code>, which is an linear array containing a multiple of 4 elements (xfrom, yfrom, xto, yto)",
	'An example of a contour lines generator can be downloaded <a href="https://github.com/cheminfo/jcampconverter">here</a>.'

	] ];

});


