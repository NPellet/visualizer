
define( function() {

	return [ function( domGraph ) {

		var serie = [ 1,2,3,5,5,7,20,105,24,102,26,109,30,50,35,15,50,4 ];

		var graphinstance = new Graph( domGraph, { series: [ 'line.broken' ] }, { left: [ { type: 'broken', nbTicksPrimary: 5 } ] }, function( graphinstance ) {

			graphinstance.getLeftAxis().setBrokenRanges( [ [ 1, 10 ],  [ 100, 110 ] ] );
			graphinstance.newSerie( 'name', {}, 'line.broken' )
				.autoAxis()
				.setData( serie )
					
			graphinstance.redraw( );
			graphinstance.drawSeries();	
		} );
	
		},

		"Broken axis", 
		[ 

		]


	];


} );
