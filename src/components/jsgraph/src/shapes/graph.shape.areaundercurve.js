define( [ './graph.shape' ], function( GraphShape ) {

  "use strict";

  var GraphSurfaceUnderCurve = function( graph ) {
    this.init( graph );
  }

  $.extend( GraphSurfaceUnderCurve.prototype, GraphShape.prototype, {
    createDom: function() {

      var self = this;
      this._dom = document.createElementNS( this.graph.ns, 'path' );
      //this._dom.setAttribute( 'pointer-events', 'stroke' );

      this.nbHandles = 2;
      this.createHandles( this.nbHandles, 'line', {
        'stroke-width': '3',
        'stroke': 'transparent',
        'pointer-events': 'stroke',
        'cursor': 'ew-resize'
      } );

      /*			this.handle1 = document.createElementNS(this.graph.ns, 'line');
			this.handle1.setAttribute(');

			this.handle2 = document.createElementNS(this.graph.ns, 'line');
			this.handle2.setAttribute('stroke-width', '3');
			this.handle2.setAttribute('stroke', 'transparent');
			this.handle2.setAttribute('pointer-events', 'stroke');
			this.handle2.setAttribute('cursor', 'ew-resize');*/

      //			this.setDom('cursor', 'move');
      //			this.doDraw = undefined;

      /*			this.graph.contextListen( this._dom, [
				
				['<li><a><span class="ui-icon ui-icon-cross"></span> Remove integral</a></li>', 
				function(e) {
					self.kill();
					self.graph.triggerEvent('onAnnotationRemove', self.data);
				}]

			]);*/

    },

    handleCreateImpl: function() {
      this.resize = true;
      this.resizingElement = 2;
    },

    handleMouseDownImpl: function( e ) {

    },

    handleMouseUpImpl: function() {

    },

    handleMouseMoveImpl: function( e, deltaX, deltaY ) {

      if ( this.isLocked() ) {
        return;
      }

      var pos = this.getFromData( 'pos' );
      var pos2 = this.getFromData( 'pos2' );

      if ( this.moving ) {

        pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
        pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );
        pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.getXAxis() );
        pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.getYAxis() );

      } else if( this.serie ) {

        this.resizingPosition = ( ( this.reversed && this.handleSelected == 2 ) || ( !this.reversed && this.handleSelected == 1 ) ) ? this.getFromData( 'pos' ) : this.getFromData( 'pos2' );

        var value = this.serie.searchClosestValue( this.getXAxis().getVal( this.graph._getXY( e ).x - this.graph.getPaddingLeft() ) );

        if ( !value ) {
          return;
        }

        if ( this.resizingPosition.x != value.xMin )
          this.preventUnselect = true;

        this.resizingPosition.x = value.xMin;
      }

      this.position = this.setPosition();
      this.setHandles();
    },

    redrawImpl: function() {
      //var doDraw = this.setPosition();
      //	this.setDom('fill', 'url(#' + 'patternFill' + this.graph._creation + ')')

      if ( this.position != this.doDraw ) {
        this.group.setAttribute( "visibility", this.position ? "visible" : 'hidden' );
        this.doDraw = this.position;
      }
    },

    setPosition: function() {

      if( ! this.serie ) {
        return;
      }

      var posXY = this._getPosition( this.getFromData( 'pos' ) ),
        posXY2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) ),
        w = Math.abs( posXY.x - posXY2.x ),
        x = Math.min( posXY.x, posXY2.x );

      this.reversed = x == posXY2.x;

      if ( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth() ) {
        return false;
      }

      var v1 = this.serie.searchClosestValue( this.getFromData( 'pos' ).x ),
        v2 = this.serie.searchClosestValue( this.getFromData( 'pos2' ).x ),
        v3,
        i,
        j,
        init,
        max,
        k,
        x,
        y,
        firstX,
        firstY,
        currentLine,
        maxY = 0,
        minY = Number.MAX_VALUE;

      if ( !v1 || !v2 ) {
        return false;
      }

      if ( v1.xBeforeIndex > v2.xBeforeIndex ) {
        v3 = v1;
        v1 = v2;
        v2 = v3;
      }

      for ( i = v1.dataIndex; i <= v2.dataIndex; i++ ) {
        currentLine = "M ";
        init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
        max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[ i ].length;
        k = 0;

        for ( j = init; j <= max; j += 2 ) {

          x = this.serie.getX( this.serie.data[ i ][ j + 0 ] ),
          y = this.serie.getY( this.serie.data[ i ][ j + 1 ] );

          maxY = Math.max( this.serie.data[ i ][ j + 1 ], maxY );
          minY = Math.min( this.serie.data[ i ][ j + 1 ], minY );

          if ( j == init ) {
            this.firstX = x;
            this.firstY = y;
          }
          currentLine = this.serie._addPoint( currentLine, x, y, k );
          k++;
        }

        this.lastX = x;
        this.lastY = y;

        if ( !this.firstX || !this.firstY || !this.lastX || !this.lastY ) {
          return;
        }

        currentLine += " V " + this.getYAxis().getPx( 0 ) + " H " + this.firstX + " z";
        this.setDom( 'd', currentLine );
      }

      this.maxY = this.serie.getY( maxY );
      if ( this._selected ) {
        this.select();
      }

      return true;
    },

    setHandles: function() {

      if ( !this.firstX ) {
        return;
      }
      this.handle1.setAttribute( 'x1', this.firstX );
      this.handle1.setAttribute( 'x2', this.firstX );

      this.handle2.setAttribute( 'x1', this.lastX );
      this.handle2.setAttribute( 'x2', this.lastX );

      this.handle1.setAttribute( 'y1', this.getYAxis().getMaxPx() );
      this.handle1.setAttribute( 'y2', this.serie.getY( 0 ) );

      this.handle2.setAttribute( 'y1', this.getYAxis().getMaxPx() );
      this.handle2.setAttribute( 'y2', this.serie.getY( 0 ) );
    },

    selectStyle: function() {
      this.setDom( 'stroke', 'red' );
      this.setDom( 'stroke-width', '2' );
      this.setDom( 'fill', 'rgba(255, 0, 0, 0.1)' );
    },

    setLabelPosition: function( labelIndex )  {

      var x = ( this.firstX + this.lastX ) / 2 + "px";
      var y = ( this.lastPointY + this.firstPointY ) / 2 + "px";
      var flip = this.serie.isFlipped();

      this._setLabelPosition( labelIndex, {
        x: flip ? y : x,
        y: flip ? x : y
      } );
    },

    getFieldsConfig: function() {

      return {

        'strokeWidth': {
          type: 'float',
          default: 1,
          title: "Stroke width"
        },

        'strokeColor': {
          type: 'color',
          title: "Stroke color"
        },

        'fillColor': {
          type: 'color',
          title: "Fill color"
        }
      }
    }
  } );

  return GraphSurfaceUnderCurve;
} );