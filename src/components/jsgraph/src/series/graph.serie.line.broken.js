define( [ './graph.serie' ], function( GraphLine ) {

  "use strict";

  var GraphSerie = function() {}
  $.extend( GraphSerie.prototype, GraphLine.prototype, {

    draw: function() { // Serie redrawing

      var data = this.data;
      var xData = this.xData;

      if ( this.degradationPx ) {
        data = getDegradedData( this );
        xData = data[ 1 ];
        data = data[ 0 ];
      }

      var x,
        y,
        xpx,
        ypx,
        xpx2,
        ypx2,
        i = 0,
        l = data.length,
        j = 0,
        k,
        m,
        currentLine,
        max,
        self = this;

      var shape, self = this;

      this._drawn = true;

      var next = this.groupLines.nextSibling;
      this.groupMain.removeChild( this.groupLines );


      this.markerCurrentFamily = null;
      var markerCurrentIndex = 0;
      var markerNextChange = -1; //this.markerPoints[ markerCurrentIndex ][ 0 ];

      var incrXFlip = 0;
      var incrYFlip = 1;

      if ( this.isFlipped() ) {
        incrXFlip = 1;
        incrYFlip = 0;
      }

      this.eraseMarkers();

      var totalLength = 0;
      for ( ; i < l; i++ ) {
        totalLength += data[ i ].length / 2;
      }

      i = 0;
      var allY = [],
        slotToUse,
        y = 0,
        z;


      var degradation = [];
      var buffer;

      var lookForMaxima = true;
      var lookForMinima = false;

      if ( this.options.autoPeakPicking ) {
        var lastYPeakPicking;
      }

      if ( this.mode == 'x_equally_separated' ) {

        for ( ; i < l; i++ ) {

          currentLine = "M ";
          j = 0, k = 0, m = data[ i ].length;

          for ( ; j < m; j += 1 ) {

            if ( this.markersShown() ) {

              this.getMarkerCurrentFamily( k );
            }

            if ( ! this.isFlipped() ) {

              xpx = this.getX( xData[ i ].x + j * xData[ i ].dx );
              ypx = this.getY( data[ i ][ j ] );
            } else {
              ypx = this.getX( xData[ i ].x + j * xData[ i ].dx );
              xpx = this.getY( data[ i ][ j ] );
            }


            currentLine = this._addPoint( currentLine, xpx, ypx, k );
            k++;

          }

          this._createLine( currentLine, i, k );

        }

      } else {

        for ( ; i < l; i++ ) {

          var toBreak = false;

          currentLine = "M ";
          j = 0, k = 0, m = data[ i ].length;

          for ( ; j < m; j += 2 ) {

            if ( this.markersShown() ) {

              this.getMarkerCurrentFamily( k );

            }

            xpx2 = this.getX( data[ i ][ j + incrXFlip ] );
            ypx2 = this.getY( data[ i ][ j + incrYFlip ] );

            if ( xpx2 == xpx && ypx2 == ypx ) {
              continue;
            }


            if( isNaN( xpx2 ) || isNaN( ypx2 ) ) {
              
              if( lastX && isNaN( xpx2 ) && this.getXAxis().isBroken() ) {

                var coord = this.getXAxis().getValueInRangeOf( );
              }
            }


            currentLine = this._addPoint( currentLine, xpx2, ypx2, k );
            k++;
            xpx = xpx2;
            ypx = ypx2;

            lastX = data[ i ][ j + incrXFlip ];
            lastY = data[ i ][ j + incrYFlip ];

          }

          this._createLine( currentLine, i, k );

          if ( toBreak ) {
            break;
          }
        }
      }

      if ( this.options.autoPeakPicking ) {
        makePeakPicking( this, allY );
      }

      i++;

      for ( ; i < this.lines.length; i++ ) {
        this.groupLines.removeChild( this.lines[ i ] );
        this.lines.splice( i, 1 );
      }

      insertMarkers( this );

      this.groupMain.insertBefore( this.groupLines, next );
      var label;
      for ( var i = 0, l = this.labels.length; i < l; i++ ) {
        this.repositionLabel( this.labels[ i ] );
      }
    }


    } );
  }

  return GraphSerie;
} );