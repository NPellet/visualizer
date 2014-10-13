define( function() {

	return [ 

    function( domGraph ) {

        var graphinstance = new Graph( domGraph, function( graphinstance ) {

          /*  graphinstance.getXAxis().forceMin( 0 );
            graphinstance.getXAxis().forceMax( 100 );

            graphinstance.getYAxis().forceMin( 0 );
            graphinstance.getYAxis().forceMax( 100 );
*/

            graphinstance.newShape({ 
                type: 'arrow', 
                pos: { x: "60px", y: "80px" },
                pos2: { dx: "-20px", dy: "-20px" },
               strokeColor: 'black',
               strokeWidth: 1

            }).then( function( shape ) {

              shape.draw();
              shape.redraw();
            } );



            graphinstance.newShape({ 
                type: 'rect', 
                pos: { x: 60, y: 80 },
                pos2: { x: 20, y: 20 },
               strokeColor: 'red',
               strokeWidth: 1

            }).then( function( shape ) {

              shape.draw();
              shape.redraw();
            } );

            graphinstance.updateAxes();


        graphinstance.redraw( );
        graphinstance.drawSeries();       


        } );


}, "Shapes", 

[
]
]


});


