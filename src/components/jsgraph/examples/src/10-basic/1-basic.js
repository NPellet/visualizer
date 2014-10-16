
define( function() {

	return [ function( domGraph ) {

	var graphinstance = new Graph( domGraph, { }, { }, function( graphinstance ) {
		graphinstance.redraw( );
			
      graphinstance.newSerie("temp_nh", { useSlots: true } )
        .autoAxis()
        .setData( series[ 0 ] );

	graphinstance.redraw();
	graphinstance.drawSeries();
	//graphinstance.drawSeries();

/*
      var serie2 = [ 1850, 100, 1900 , 0, 1950, -100 ];
      graphinstance.newSerie("222")
        .autoAxis()
        .setData( serie2 )
        .setMarkers();
  */    
	

	});

		}, 

		"Basic example", 
		[ 'Setting up a chart takes only a couple lines. Call <code>new Graph( domElement );</code> to start a graph. Render it with <code>graph.redraw();</code>', 'To add a serie, call <code>graph.newSerie( "serieName" )</code>. To set data, call <code>serie.setData()</code> method.'] 
	];


} );
