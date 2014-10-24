define( function() {

	return [ 

    function( domGraph ) {

        var graphinstance = new Graph( domGraph, { title: 'Solar cell j-V curve'} );
	// BEGIN IGNORE ON BUILD
	var series = [ [], [], [] ];

	var j = 0,
	min = 0,
	jmax = 0;

	for( var i = -1; i < 1.5 ; i += 0.01 ) {

		series[ 0 ].push( i );
		series[ 0 ].push( -20.5 + Math.pow( 2.71, ( i * 6 ) ) / 10 );


		series[ 1 ].push( i );
		series[ 1 ].push( i * series[ 0 ][ j * 2 + 1 ] );

		if( series[ 1 ][ j * 2 + 1 ] < min ) {
			min = series[ 1 ][ j * 2 + 1 ];
			jmax = i;
		}

		j++;
	}
	// END IGNORE ON BUILD
var axisProperties = { primaryGrid: false, secondaryGrid: false, nbTicksPrimary: 5 },
  xAxis = graphinstance.getXAxis( 0, axisProperties ),
  leftAxis = graphinstance.getLeftAxis( 0, axisProperties ),
  rightAxis = graphinstance.getRightAxis( 0, axisProperties );

  graphinstance.newSerie( "current" )
  .autoAxis()
  .setData( series[ 0 ] )
  .setLineColor('black');

  graphinstance.newSerie( "power" )
  .autoAxis()
  .setYAxis( graphinstance.getRightAxis() )
  .setData( series[ 1 ] )
  .setLineColor('red');

  graphinstance.getYAxis().forceMin( - 21 );
  graphinstance.getYAxis().forceMax( 5 );
  graphinstance.getXAxis().forceMin( 0 );
  graphinstance.getXAxis().forceMax( 1 );

  graphinstance.newShape({ 
      type: 'arrow', 
      pos: { x: jmax },
      pos2: { dx: "-20px", dy: "-20px" },
      label: {
       text: 'Max power point',
       position: { x: jmax, dx: "-25px", dy: "-25px" },
       anchor: 'middle' 
   },
   strokeColor: 'black',
   strokeWidth: 1

}).then( function( shape ) {

  shape.setSerie( graphinstance.getSerie( 0 ) );
  shape.draw();
  shape.redraw();
} );

graphinstance.getRightAxis().adapt0To( graphinstance.getYAxis(), 'min', -10 );

graphinstance.getXAxis().setLabel( 'Voltage (V)' );
graphinstance.getYAxis().setLabel( 'Current (mA cm-2)' );
graphinstance.getRightAxis().setLabel( 'Power output (mW)' );

graphinstance.getYAxis().setLineAt0( true );
graphinstance.redraw( );
graphinstance.drawSeries();				


}, "2 aligned axes", 

[
[ 'Add more axis', 'Add as many axis on your graph as you want. Axis on the same side of the graph stack on each other automatically'], 
'You are required to link your series to the axis you want. <code>autoAxis()</code> will bind the serie to the first bottom axis and first left axis.',
'Use <code>axis.adapt0To( otherAxis[, mode, value ] )</code> to adapt the 0 of the axis to another one. If <code>mode</code> (min/max) and value are specified, the min or the max of the axis will take the value <code>value</code>. The other one will be determined by the position of the zero.'
]
];

});


