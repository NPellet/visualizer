
define( function() {

	return [ function( domGraph ) {

			var graphinstance = new Graph( domGraph, {}, {
  "bottom": [
    {
      "flipped": false,
      "primaryGrid": true,
      "secondaryGrid": false,
      "labelValue": "X axis",
      "forcedMin": false,
      "forcedMax": false
    }
  ],
  "left": [
    {
      "flipped": false,
      "primaryGrid": true,
      "secondaryGrid": true,
      "labelValue": "Y axis",
      "forcedMin": false,
      "forcedMax": false
    }
  ]
}, function( graphinstance ) {
			graphinstance.redraw( );
			
			graphinstance.newSerie("temp_nh")
				.autoAxis()
				.setData( series[ 0 ] );

graphinstance.redraw();
			graphinstance.drawSeries();
		});

		}, 

		"Basic example", 
		[ 'Setting up a chart takes only a couple lines. Call <code>new Graph( domElement );</code> to start a graph. Render it with <code>graph.redraw();</code>', 'To add a serie, call <code>graph.newSerie( "serieName" )</code>. To set data, call <code>serie.setData()</code> method.'] 
	];


} );
