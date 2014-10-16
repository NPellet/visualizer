define( [ './graph.serie.line' ], function( GraphLine ) {

  "use strict";

  var GraphSerie = function() {}
  $.extend( GraphSerie.prototype, GraphLine.prototype, {




    draw: function() { // Serie redrawing

      this.drawInit();

      var data = this._dataToUse;
      var xData = this._xDataToUse;
      var slotToUse = this._slotToUse;

      var shape, self = this;

      this.removeLinesGroup();


      this.eraseMarkers();

      this.lookForMaxima = true;
      this.lookForMinima = false;


      

      if ( this.mode == 'x_equally_separated' ) {

          throw "Not supported";

      } else {

        this._draw_standard();

      }
    
      i++;

      this.removeExtraLines();
      
      //insertMarkers( this );

      this.insertLinesGroup();

      
      var label;
      for ( var i = 0, l = this.labels.length; i < l; i++ ) {
        this.repositionLabel( this.labels[ i ] );
      }
    },





    _draw_standard: function() { // Serie redrawing


    var self = this,
          data = this._dataToUse,
          toBreak,
          i = 0,
          l = data.length,
          j,
          k,
          m,
          x,
          y,
          xpx,
          ypx,
          xpx2,
          ypx2;

      var lastRangeX, lastRangeY, lastX, lastY, lastXPx, lastYPx, insertMarkers;


      var incrXFlip = 0;
      var incrYFlip = 1;

      if ( this.isFlipped() ) {

        incrXFlip = 1;
        incrYFlip = 0;

      }

      for ( ; i < l; i++ ) {

        toBreak = false;

        this.currentLine = "";
        j = 0, k = 0, m = data[ i ].length;


        for ( ; j < m; j += 2 ) {
          
          x = data[ i ][ j + incrXFlip ];
          y = data[ i ][ j + incrYFlip ];

          var rangeX = this.getXAxis().getRange ? this.getXAxis().getRange( x ) : [ 1, this.getX( x ) ];
          var rangeY = this.getYAxis().getRange ? this.getYAxis().getRange( y ) : [ 1, this.getY( y ) ];

//console.log( rangeX, rangeY );


          // We just gets into a new range, we must get the old point and draw it in the current range
          if( 
            ( rangeX[ 0 ] != lastRangeX || rangeY[ 0 ] != lastRangeY ) && 
              rangeX[ 0 ] !== undefined && 
              rangeY[ 0 ] !== undefined && 
              j > 0
            ) {

              // Direct range change => add the new point to the old range
              if( 
                lastRangeX !== undefined && 
                lastRangeY !== undefined
              ) {

                this.break( lastX, lastY, lastXPx, lastYPx, x, y, k );
                this._createLine( );
              }


              this.break( x, y, rangeX[ 1 ], rangeY[ 1 ], lastX, lastY, k );
              
              // We must add the old point to the current range
              // use lastX, lastY for the last point

              this._addPoint( rangeX[ 1 ], rangeY[ 1 ] )
              

              // Just breaks
          } else if( rangeX[ 0 ] == undefined || rangeY[ 0 ] == undefined && lastRangeX && lastRangeY ) {

            //currentLine = this.break( x, y, rangeX[ 1 ], rangeY[ 1 ], lastX, lastY, currentLine, k );
            this.break( lastX, lastY, lastXPx, lastYPx, x, y, k );
            this._createLine( );
            
          
            // Adds the current point to the old range and break it
          } else if( ! isNaN( rangeX[ 1 ] ) && ! isNaN( rangeY[ 1 ] ) ) {
            
            this._addPoint( rangeX[ 1 ], rangeY[ 1 ] )
            
          } else {

            //continue;
          }

          lastRangeX = rangeX[ 0 ];
          lastRangeY = rangeY[ 0 ];

          lastX = x;
          lastY = y;

          lastXPx = rangeX[ 1 ];
          lastYPx = rangeY[ 1 ];
      }

      this._createLine(  );
    }
  },



  break: function( refX, refY, refXPx, refYPx, x, y ) {

    var xRatio, yRatio, ratio, xPotential, yPotential, xBoundary, yBoundary;
    var xpx, ypx;

    if( this.getXAxis()._broken ) {
      //xPotential = this.getXAxis().getInRange( refX, x );
      xBoundary = this.getXAxis().getBoundary( refX, x );
      xRatio = ( xBoundary - refX ) / ( x - refXPx );
    } else {
      xRatio = 1;
      xPotential = x;
    }

    if( this.getYAxis()._broken ) {
      //yPotential = this.getYAxis().getInRange( refY, y );

      yBoundary = this.getYAxis().getBoundary( refY, y );
      yRatio = ( yBoundary - refY ) / ( y - refY );
    } else {
      yRatio = 1;
      yPotential = y;
    }

    var ratio = Math.min( yRatio, xRatio ),
        x = ratio * ( x - refX ) + refX,
        y = ratio * ( y - refY ) + refY;

    if( this.getXAxis()._broken ) {
      xpx = this.getXAxis().getInRange( refX, x );
    } else {
      xpx = this.getX( x );
    }

    if( this.getYAxis()._broken ) {
      ypx = this.getYAxis().getInRange( refY, y );
    } else {
      ypx = this.getY( y );
    }
    
    return this._addPoint( xpx, ypx );
  },
  


  } );


  return GraphSerie;
} );