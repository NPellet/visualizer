
define( function() {

	return [ function( domGraph ) {

			// BEGIN IGNORE ON BUILD

			var serie = [],
				serie2 = [];
			for( var i = 0; i < 5 ; i ++ ) {
				serie.push( i );
				serie.push( i * i );

				serie2.push( i );
				serie2.push( i );
			}

			// END IGNORE ON BUILD

			var graphinstance = new Graph( domGraph, {


				onMouseMoveData: function( event, datas ) {

					datas.square = datas.square || {};
					$( this._dom ).children('.data').html( ( 'Interpolated: x: ' + Math.round( datas.square.trueX * 100 ) / 100 ) + "; y: " + ( Math.round( datas.square.interpolatedY * 100 ) / 100 + "<br />X is between " + datas.square.xBefore + " and " + datas.square.xAfter ) ) 

				} }, function( graphinstance ) {

				$( graphinstance._dom ).append("<div class='data'></div>");

				graphinstance.newSerie("square", { trackMouse: true } )
					.setLabel( "My serie" )
					.autoAxis()
					.setLineColor('red')
					.setData( serie )
					.setMarkers( [ { type: 1, zoom: 3, strokeColor: 'red', points: 'all' } ] );


				graphinstance.newSerie("round", { trackMouse: true } )
					.setLabel( "My serie" )
					.autoAxis()
					.setLineColor('green')
					.setData( serie2 )
					.setMarkers( [ { type: 2, zoom: 3, strokeColor: 'green', points: 'all' } ] );

				graphinstance.redraw( );
				graphinstance.drawSeries();	

			} );
			
		}, 

		"Track mouse", 
		[ 'Use the mouse tracking functionnality to get feedback on your data where the mouse is located', 'Register a simple callback on the graph to enable interpolation calculation and access of the closest data points of each series.'] 

	];


} );
