define( [ './graph.shape' ], function( GraphShape ) {

  var GraphCross = function( graph, options ) {

    this.options = options ||  {};

    this.init( graph );

    this.nbHandles = 1;

    this.createHandles( this.nbHandles, 'rect', {
      transform: "translate(-3 -3)",
      width: 6,
      height: 6,
      stroke: "black",
      fill: "white",
      cursor: 'nwse-resize'
    } );

  }

  $.extend( GraphCross.prototype, GraphShape.prototype, {

    getLength: function() {
      return this.options.length || 10;
    },

    createDom: function() {

      this._dom = document.createElementNS( this.graph.ns, 'path' );
      this._dom.setAttribute( 'd', 'M -' + ( this.getLength() / 2 ) + ' 0 h ' + ( this.getLength() ) + ' m -' + ( this.getLength() / 2 ) + ' -' + ( this.getLength() / 2 ) + ' v ' + ( this.getLength() ) + '' );

    },

    setPosition: function() {
      var position = this._getPosition( this.getFromData( 'pos' ) );

      if ( !position.x || !position.y ) {
        return;
      }

      this.setDom( 'transform', 'translate( ' + position.x + ', ' + position.y + ')' );

      this.currentPos1x = position.x;
      this.currentPos1y = position.y;

      return true;
    },

    redrawImpl: function() {

      this.setPosition();
      this.setHandles();

    },

    handleCreateImpl: function() {

      return;
    },

    handleMouseDownImpl: function( e ) {

      this.moving = true;

      return true;
    },

    handleMouseUpImpl: function() {

      this.triggerChange();
      return true;
    },

    handleMouseMoveImpl: function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {

      if ( this.isLocked() ) {
        return;
      }

      var pos = this.getFromData( 'pos' );
      var pos2 = this.getFromData( 'pos2' );

      if ( this.moving ) {

        pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
        pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );
      }

      this.redrawImpl();

      return true;

    },

    setHandles: function() {

      if ( this.isLocked() ) {
        return;
      }

      if ( !this._selected || this.currentPos1x == undefined ) {
        return;
      }

      this.addHandles();

      this.handle1.setAttribute( 'x', this.currentPos1x );
      this.handle1.setAttribute( 'y', this.currentPos1y );
    },

    selectStyle: function() {
      this.setDom( 'stroke', 'red' );
      this.setDom( 'stroke-width', '2' );
    }

  } );

  return GraphCross;

} );