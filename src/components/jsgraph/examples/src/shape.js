
define( function() {

	return [ function( domGraph ) {

			var serie = [];
			for( var i = 0; i < 5 ; i ++ ) {
				serie.push( i );
				serie.push( i * i );
			}



			var graphinstance = new Graph( domGraph, {


				onMouseMoveData: function( event, datas ) {

					datas.square = datas.square || {};
					$( this._dom ).children('.data').html( ( 'Interpolated: x: ' + Math.round( datas.square.trueX * 100 ) / 100 ) + "; y: " + ( Math.round( datas.square.interpolatedY * 100 ) / 100 + "<br />X is between " + datas.square.xBefore + " and " + datas.square.xAfter ) ) 

				} }, function( graphinstance ) {

				$( graphinstance._dom ).append("<div class='data'></div>");


				graphinstance.newSerie("square", { trackMouse: true } )
					.setLabel( "My serie" )
					.autoAxis()
					.setLineColor('grey')
					.setData( serie )
					.setMarkers( );


				var shape = { type: 'cross', strokeColor: 'red', strokeWidth: 1, pos: { x: 1, y: 5 } };

				graphinstance.makeShape( shape ).then( function( shape ) {
					shape.draw();
					shape.redrawImpl();
				});


				graphinstance.redraw( );
				graphinstance.drawSeries();	

			} );
			

			

		}, 

		"Default functionnality", 
		[ 'Displays the serie markers', 'Displays a cross', 'Tracks mouse'] 

	];


} );
