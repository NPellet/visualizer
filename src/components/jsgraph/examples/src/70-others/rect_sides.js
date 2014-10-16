
define( function() {

	return [ function( domGraph ) {


window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;





		var serie = [];
		for( var i = 0; i < 500 ; i += 0.02 ) {
			serie.push( i );
			serie.push( Math.sin( i ) );
		}

		// Initial zoom boundaries
		var r = 100,
			l = 160;

		var div1 = document.createElement('div');
		var div2 = document.createElement('div');
		var domGraph = document.getElementById( domGraph );

		domGraph.appendChild( div1 );
		domGraph.appendChild( div2 );

		div2.style.width = '400px';
		div2.style.height = '100px';

		div1.style.width = '400px';
		div1.style.height = '250px';
		

		var shapeLeft, shapeRight;
		
		// Main graph
		var graphmain = new Graph( div1, { paddingBottom: 0 }, { } );

	    graphmain.newSerie()
	        .autoAxis()
	        .setData( serie )
	        .degrade( 1 )
	        .kill();

      	graphmain.getBottomAxis()._doZoomVal( r, l );

        graphmain.redraw();
		graphmain.drawSeries();
		

		// Zoom graph
		var graphzoom = new Graph( div2, { paddingTop: 5 } );
		graphzoom.getLeftAxis().setDisplay( false );
		graphzoom.getBottomAxis().toggleGrids( false );
		graphzoom.cacheOffset();
		
		var rectCreated = function( shape ) {
			shape.staticHandles( true );
			shape.setSelectable( false );
			shape.setMovable( false );
			shape.draw();
			shape.redraw();
			return shape;
		}			

		var rectOptions = {
			type: 'rect',
			pos: { x: "min", y: "min" },
			pos2: { x: r, y: "max" },
			fillColor: 'rgba(100, 100, 100, 0.6)',

			shapeOptions: {
				handles: {
					type: 'sides',
					sides: {
						top: false,
						bottom: false,
						right: false,
						left: false
					}
				}
			}
		};

	    graphzoom.newSerie()
	        .autoAxis()
	        .setData( serie );
	
	    graphzoom.redraw();
		graphzoom.drawSeries();

		graphzoom.newShape( $.extend( true, {}, rectOptions, { pos: { x: "min" }, pos2: { x: r }, shapeOptions: { handles: { sides: { right: true } } } } ) ).then( rectCreated ).then( function( shape ) {
			shapeLeft = shape;
		});


		graphzoom.newShape( $.extend( true, {}, rectOptions, {  pos: { x: l }, pos2: { x: "max" }, shapeOptions: { handles: { sides: { left: true } } } } ) ).then( rectCreated ).then( function( shape ) {
			shapeRight = shape;
		});


		function minInt() {
			return Math.round( ( graphzoom.getBottomAxis().getInterval( ) / 10 ) ) 
		}

		graphzoom.shapeHandlers.beforeMouseMove.push( 
			
			function(e) {

				var xy = graphzoom._getXY( e );
				var x = graphzoom.getBottomAxis().getVal( xy.x - graphzoom.getPaddingLeft() );

				if( this == shapeLeft ) {
					if( l - x < minInt() ) {
						return false;
					}
				} else {
					if( x - r < minInt() ) {
						return false;
					}
				}
			}
		);

		var currentRequest;

		graphzoom.shapeHandlers.mouseMove.push( 
				
			function() {

				if( this == shapeLeft ) {

					r = shapeLeft.getFromData( 'pos2' ).x;

				} else {

					l = shapeRight.getFromData( 'pos' ).x;
				
				}

				if( currentRequest ) {
					 window.cancelAnimationFrame( currentRequest );
				}

				currentRequest = requestAnimationFrame( function() {
					currentRequest = false;
					graphmain.getBottomAxis()._doZoomVal( r, l );
					graphmain.redraw();
					graphmain.drawSeries();			

				});

			}
		);


		}, 

		"2 Graphs - Zoom", 
		[ 'Use rectangles movement to allow zooming on a second graph !'] 
	];


} );
