define( [ './graph.axis.x', './graph.axis.broken' ], function( GraphXAxis, GraphBrokenAxis ) {

  "use strict";

  var GraphXAxisBroken = function( graph, topbottom, options ) {
	this.init( graph, options );
    this.top = topbottom == 'top';
  }

  $.extend( GraphXAxisBroken.prototype, GraphBrokenAxis.prototype, GraphXAxis.prototype );

  return GraphXAxisBroken;

} );