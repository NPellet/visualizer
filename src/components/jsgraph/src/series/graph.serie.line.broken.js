define( [ './graph.serie.line' ], function( GraphLine ) {

  "use strict";

  var GraphSerie = function() {}
  $.extend( GraphSerie.prototype, GraphLine.prototype, {

    draw: function() { // Serie redrawing

      var data = this.data;
      var xData = this.xData;

      var lastIsDisplayed;
      var lastX, xpxLast, lastY, ypxLast, ratioX, ratio, ratioY;

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

      for ( ; i < l; i++ ) {


        currentLine = "M ";
        j = 0, k = 0, m = data[ i ].length;

        for ( ; j < m; j += 2 ) {
          
          xpx2 = this.getX( data[ i ][ j + incrXFlip ] );
          ypx2 = this.getY( data[ i ][ j + incrYFlip ] );

          if ( xpx2 == xpx && ypx2 == ypx ) {
            continue;
          }

          if( isNaN( xpx2 ) || isNaN( ypx2 ) ) {

            if( lastIsDisplayed ) {

              ratioX = ratioY = undefined;
              if( lastX && isNaN( xpx2 ) && this.getXAxis()._broken ) {
                ratioX = this.getXAxis().getRatioInRange( lastX, data[ i ][ j + incrXFlip ] );
                ratio = ratioX;
              }

              if( lastY && isNaN( ypx2 ) && this.getYAxis()._broken ) {
                ratioY = this.getYAxis().getRatioInRange( lastY, data[ i ][ j + incrYFlip ] );
                ratio = ratioY;
              }

              if( ratioX && ratioY ) {
                ratio = Math.min( ratioX, ratioY );
              }

              var xpx = this.getX( lastX ) + ( this.getXAxis().getInRange( lastX, data[ i ][ j + incrXFlip ] ) - this.getX( lastX ) ) * ratio
              var ypx = this.getX( lastY ) + ( this.getYAxis().getInRange( lastY, data[ i ][ j + incrYFlip ] ) - this.getY( lastY ) ) * ratio

              currentLine = this._addPoint( currentLine, xpx, ypx, k );
              this._createLine( currentLine, k );
              k = 0;
              currentLine = "M ";

              lastIsDisplayed = false;

            } else {

              lastX = data[ i ][ j + incrXFlip ];
              lastY = data[ i ][ j + incrYFlip ];
              continue;

            }
          }

          // Display the last one
          if( ! lastIsDisplayed ) {

              xpxLast = this.getX( lastX );
              ypxLast = this.getY( lastY );

              ratioX = ratioY = undefined;

              if( isNaN( xpxLast ) && this.getXAxis()._broken ) {
                ratioX = this.getXAxis().getRatioInRange( data[ i ][ j + incrXFlip ], lastX );
                ratio = ratioX;
              }

              if( isNaN( ypxLast ) && this.getYAxis()._broken ) {
                ratioY = this.getYAxis().getRatioInRange( data[ i ][ j + incrXFlip ], lastY );
                ratio = ratioY;
              }

              if( ratioX && ratioY ) {
                ratio = Math.min( ratioX, ratioY );
              }

              var xpx = this.getX( lastX ) + ( this.getXAxis().getInRange( data[ i ][ j + incrXFlip ], lastX ) - this.getX( lastX ) ) * ratio
              var ypx = this.getX( lastY ) + ( this.getYAxis().getInRange( data[ i ][ j + incrXFlip ], lastY ) - this.getY( lastY ) ) * ratio

              currentLine = this._addPoint( currentLine, xpx, ypx, k );



          }
         
          lastIsDisplayed = true;

          currentLine = this._addPoint( currentLine, xpx2, ypx2, k );
          k++;
          xpx = xpx2;
          ypx = ypx2;

          lastX = data[ i ][ j + incrXFlip ];
          lastY = data[ i ][ j + incrYFlip ];
        }

        this._createLine( currentLine, k );

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


  return GraphSerie;
} );