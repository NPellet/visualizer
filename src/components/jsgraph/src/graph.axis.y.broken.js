define( [ './graph.axis.y', './graph.axis.broken' ], function( GraphYAxis, GraphBrokenAxis ) {

  "use strict";

  var GraphYAxisBroken = function( graph, leftright, options ) {

    this.init( graph, options );

    this.leftright = leftright;
    this.left = leftright == 'left';

  }

  $.extend( GraphYAxisBroken.prototype, GraphYAxis.prototype, GraphBrokenAxis.prototype );


  return GraphYAxisBroken;

} );