
define( function() {

	return [ function( domGraph ) {

		var serie = [ 0,20, 1, 2, 4, 3, 5, 2, 6, 9, 7, 20, 7.5, 23, 7.7, 3, 8, 78, 9, 72, 21,107,26,104 ];

		var graphinstance = new Graph( domGraph, { }, { left: [ { type: 'broken', nbTicksPrimary: 5, breakingSpacing: 10 } ], bottom: [ { type: 'broken' } ] }, function( graphinstance ) {

			graphinstance.getLeftAxis().setBrokenRanges( [ [ 1, 10 ], [ 70, 80 ], [ 100, 110 ] ] );
			graphinstance.getBottomAxis().setBrokenRanges( [ [ 0, 10 ], [ 20, 30 ] ] );

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
