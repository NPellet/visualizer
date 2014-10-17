define( [ './graph.axis.x', './graph.axis.broken' ], function( GraphXAxis, GraphBrokenAxis ) {

  "use strict";

  var GraphXAxisBroken = function( graph, topbottom, options ) {
	this.init( graph, options );
    this.top = topbottom == 'top';
  }

  $.extend( GraphXAxisBroken.prototype, GraphXAxis.prototype, GraphBrokenAxis.prototype, {

  	createBrokenLine: function( range ) {

  		var line = document.createElementNS( this.graph.ns, 'line' );
        line.setAttribute('x1', '-3');
        line.setAttribute('x2', '3');
        line.setAttribute('y1', '-5');
        line.setAttribute('y2', '5');
        line.setAttribute('stroke', 'black');

        return line;
  	},

  	placeBrokenLine: function( range, line, px ) {
		line.setAttribute('transform', 'translate(' + px + ', ' + 0 + ')');
  	}
  } );

  return GraphXAxisBroken;

} );