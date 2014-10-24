define( [ './graph.axis.y', './graph.axis.broken' ], function( GraphYAxis, GraphBrokenAxis ) {

  "use strict";

  var GraphYAxisBroken = function( graph, leftright, options ) {

    this.init( graph, options );

    this.leftright = leftright;
    this.left = leftright == 'left';

  }

  $.extend( GraphYAxisBroken.prototype, GraphYAxis.prototype, GraphBrokenAxis.prototype, {


  	createBrokenLine: function( range ) {

  		var line = document.createElementNS( this.graph.ns, 'line' );
        line.setAttribute('x1', '-5');
        line.setAttribute('x2', '5');
        line.setAttribute('y1', '-3');
        line.setAttribute('y2', '3');
        line.setAttribute('stroke', 'black');

        return line;
  	},

  	placeBrokenLine: function( range, line, px ) {
		line.setAttribute('transform', 'translate(' + 0 + ', ' + px + ')');
  	}

  } );


  return GraphYAxisBroken;

} );