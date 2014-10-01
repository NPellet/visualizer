
define( function() {

	return [ function( domGraph ) {

		var serie = [ 1, 2, 4, 3, 5, 2, 6, 9, 7, 20, 7.5, 23, 7.7, 3, 8, 78, 9, 72 ];

		var graphinstance = new Graph( domGraph, { }, { left: [ { type: 'broken', nbTicksPrimary: 5 } ] }, function( graphinstance ) {

			graphinstance.getLeftAxis().setBrokenRanges( [ [ 1, 10 ], [ 70, 80 ], [ 100, 110 ] ] );
			graphinstance.newSerie( 'name' )
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
