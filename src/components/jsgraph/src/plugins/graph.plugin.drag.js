define( [], function() {

  var plugin = function() {};

  plugin.prototype = {

    init: function() {},

    onMouseDown: function( graph, x, y, e, target ) {
      this._draggingX = x;
      this._draggingY = y;

      return true;
    },

    onMouseMove: function( graph, x, y, e, target ) {
      var deltaX = x - this._draggingX;
      var deltaY = y - this._draggingY;

      graph._applyToAxes( function( axis ) {
        axis.setCurrentMin( axis.getVal( axis.getMinPx() - deltaX ) );
        axis.setCurrentMax( axis.getVal( axis.getMaxPx() - deltaX ) );
      }, false, true, false );

      graph._applyToAxes( function( axis ) {
        axis.setCurrentMin( axis.getVal( axis.getMinPx() - deltaY ) );
        axis.setCurrentMax( axis.getVal( axis.getMaxPx() - deltaY ) );
      }, false, false, true );

      this._draggingX = x;
      this._draggingY = y;

      graph.redraw( true );
      graph.drawSeries();
    }
  }

  return plugin;
} );