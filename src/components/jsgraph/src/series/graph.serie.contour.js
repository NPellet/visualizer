define( [ './graph.serie.line' ], function( GraphSerie ) {

  "use strict";
  // http://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
  /**
   * Converts an HSL color value to RGB. Conversion formula
   * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
   * Assumes h, s, and l are contained in the set [0, 1] and
   * returns r, g, and b in the set [0, 255].
   *
   * @param   Number  h       The hue
   * @param   Number  s       The saturation
   * @param   Number  l       The lightness
   * @return  Array           The RGB representation
   */
   function hue2rgb(p, q, t){
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
    }
    
  function hslToRgb(h, s, l){
      var r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      }else{
          
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }




  var GraphSerieContour = function() {

    this.negativeDelta = 0;
    this.positiveDelta = 0;

    this.negativeThreshold = 0;
    this.positiveThreshold = 0;


  };

  $.extend( GraphSerieContour.prototype, GraphSerie.prototype, {

    setData: function( data, arg, type ) {

      var z = 0;
      var x, dx, arg = arg || "2D",
        type = type || 'float',
        i, l = data.length, j, k,
        arr, datas = [];


      if ( ! ( data instanceof Array ) ) {
        
        if( typeof data == 'object' ) {
          // Def v2
          this.minX = data.minX;
          this.minY = data.minY;
          this.maxX = data.maxX;
          this.maxY = data.maxY;

          data = data.segments;
          l = data.length;
        }
      }

      for (  i = 0; i < l; i++ ) {
        k = data[ i ].lines.length;
        arr = this._addData( type, k );

        for ( j = 0; j < k; j += 2 ) {

          arr[ j ] = data[ i ].lines[ j ];
          this._checkX( arr[ j ] );
          arr[ j + 1 ] = data[ i ].lines[ j + 1 ];
          this._checkY( arr[ j + 1 ] );
        }

        datas.push( {
          lines: arr,
          zValue: data[ i ].zValue
        } );
      }
      this.data = datas;
      this.graph._updateAxes();

      return this;
    },

    draw: function( doNotRedrawZone ) {

      this.currentLine = 0;
      var x, y, xpx, ypx, xpx2, ypx2, i = 0,
        l = this.data.length,
        j = 0,
        k, m, currentLine, domLine, arr;
      this.minZ = Infinity;
      this.maxZ = - Infinity;

      var next = this.groupLines.nextSibling;
      this.groupMain.removeChild( this.groupLines );
      this.zValues = {};

      var incrXFlip = 0;
      var incrYFlip = 1;
      if ( this.getFlip() ) {
        incrXFlip = 0;
        incrYFlip = 1;
      }

      var minY = this.getYAxis().getActualMin();
      var minX = this.getXAxis().getActualMin();

      var maxX = this.getXAxis().getActualMax();
      var maxY = this.getYAxis().getActualMax();

      this.counter = 0;
      this.currentLineId = 0;

      for ( ; i < l; i++ ) {
        this.currentLine = "";
        j = 0, k = 0;

        for ( arr = this.data[ i ].lines, m = arr.length; j < m; j += 4 ) {

          var lastxpx, lastypx;


          if( ( arr[ j + incrXFlip ] < minX && arr[ j + 2 + incrXFlip ] < minX ) ||  ( arr[ j + incrYFlip ] < minY && arr[ j + 2 + incrYFlip ] < minY ) || ( arr[ j + incrYFlip ] > maxY && arr[ j + 2 + incrYFlip ] > maxY || ( arr[ j + incrXFlip ] > maxX && arr[ j + 2 + incrXFlip ] > maxX )))  {
            continue;
          }

          xpx2 = this.getX( arr[ j + incrXFlip ] );
          ypx2 = this.getY( arr[ j + incrYFlip ] );

          xpx = this.getX( arr[ j + 2 + incrXFlip ] );
          ypx = this.getY( arr[ j + 2 + incrYFlip ] );

          if ( xpx == xpx2 && ypx == ypx2 ) {
            continue;
          }


          /*	if( j > 0 && ( lastxpx !== undefined && lastypx !== undefined && Math.abs( xpx2 - lastxpx ) <= 30 && Math.abs( ypx2 - lastypx ) <= 30 ) ) {
						currentLine += "L";
					} else {
						currentLine += "M";	
					}
*/

          this.currentLine += "M ";
          this.currentLine += xpx2;
          this.currentLine += " ";
          this.currentLine += ypx2;

          this.currentLine += "L ";
          this.currentLine += xpx;
          this.currentLine += " ";
          this.currentLine += ypx;

          this.counter++;

          lastxpx = xpx;
          lastypx = ypx;

          k++;
        }

        this.currentLine += " z";

        domLine = this._createLine( );
        domLine.setAttribute( 'data-zvalue', this.data[ i ].zValue );

        if ( this.zoneColors && this.zoneColors[ i ] ) {

          domLine.setAttribute( 'fill', this.zoneColors[  i ] );
        }

        this.zValues[ this.data[ i ].zValue ] = {
          dom: domLine
        };

        this.minZ = Math.min( this.minZ, this.data[ i ].zValue );
        this.maxZ = Math.max( this.maxZ, this.data[ i ].zValue );
      }

      i++;

      
      for ( i = this.currentLine + 1; i < this.lines.length; i++ ) {
        this.groupLines.removeChild( this.lines[ i ] );
        this.lines.splice( i, 1 );
      }


      i = 0;

      for ( ; i < l; i++ ) {
        this.setColorTo( this.lines[ i ], this.data[ i ].zValue, this.minZ, this.maxZ );
      }

      if ( this.graph.legend ) {
        this.graph.legend.update();
      }


      this.onMouseWheel( 0, { shiftKey: false } );
      this.groupMain.insertBefore( this.groupLines, next );
    },

    initimpl: function() {

      if( ! this.options.hasNegative ) {
        this.negativeThreshold = 0;
      }

    },

    onMouseWheel: function( delta, e, fixed, positive ) {

      delta /= 250;

      if( fixed !== undefined ) {

        if( ! positive ) {
          this.negativeThreshold = - fixed * this.minZ;
          this.negativeDelta = - Math.pow( Math.abs( ( this.negativeThreshold / ( - this.minZ ) ) ), 1/3);
        }

        if( positive ) {
          this.positiveThreshold = fixed * this.maxZ;
          this.positiveDelta = Math.pow( this.positiveThreshold / ( this.maxZ ), 1/3);
        }

      } else {

        if( ( ! e.shiftKey ) || ! this.options.hasNegative ) {

          this.positiveDelta = Math.min( 1, Math.max( 0, this.positiveDelta + Math.min( 0.1, Math.max( -0.1, delta ) ) ) );
          this.positiveThreshold = this.maxZ * ( Math.pow( this.positiveDelta, 3 ) );
      
        } else {

          this.negativeDelta = Math.min( 0, Math.max( -1, this.negativeDelta + Math.min( 0.1, Math.max( -0.1, delta ) ) ) ); 
          this.negativeThreshold = - this.minZ * ( Math.pow( this.negativeDelta, 3 ) );
      
        }

      }

      if( isNaN( this.positiveDelta ) ) {
        this.positiveDelta = 0;
      }

      if( isNaN( this.negativeDelta ) ) {
        this.negativeDelta = 0;
      }

      for ( var i in this.zValues ) {

        this.zValues[ i ].dom.setAttribute( 'display', ( ( i >= 0 && i >= this.positiveThreshold ) || ( i <= 0 && i <= this.negativeThreshold ) ) ? 'block' : 'none' );

      }
      

      if( this._shapeZoom ) {


        if( ! this.options.hasNegative ) {
          this._shapeZoom.hideHandleNeg(); 
        } else {
          
          this._shapeZoom.setHandleNeg( - ( Math.pow( this.negativeDelta, 3 ) ), this.minZ );  
          this._shapeZoom.showHandleNeg();
        }
        
        this._shapeZoom.setHandlePos( ( Math.pow( this.positiveDelta, 3 ) ), this.maxZ );
      }
    },

    setColors: function( colors ) {
      this.zoneColors = colors;
    },

    setDynamicColor: function( colors ) {

      this.lineColors = colors;

    },


    setNegative: function( bln ) {
      this.options.hasNegative = bln;

      if( bln ) {
        this.negativeThreshold = 0;
      }
    },

    setColorTo: function( line, zValue, min, max ) {

      if( ! this.lineColors ) {
        return;
      }

      var hsl = { h: 0, s: 0, l: 0 };

      for( var i in hsl ) {

        if( zValue > 0 ) {
          hsl[ i ] = this.lineColors.fromPositive[ i ] + ( ( this.lineColors.toPositive[ i ] - this.lineColors.fromPositive[ i ] ) * ( zValue / max ) );  
        } else {
          hsl[ i ] = this.lineColors.fromNegative[ i ] + ( ( this.lineColors.toNegative[ i ] - this.lineColors.fromNegative[ i ] ) * ( zValue / min ) );  
        }
      }

      hsl.h /= 360;

      var rgb = hslToRgb( hsl.h, hsl.s, hsl.l );
      
      line.setAttribute( 'stroke', 'rgb(' + rgb.join() + ')');
    },

     getSymbolForLegend: function() {

      if ( !this.lineForLegend ) {

        var line = document.createElementNS( this.graph.ns, 'ellipse' );

        line.setAttribute( 'cx', 7 );
        line.setAttribute( 'cy', 0 );
        line.setAttribute( 'rx', 8 );
        line.setAttribute( 'ry', 3 );

        line.setAttribute( 'cursor', 'pointer' );
        this.lineForLegend = line;

        
      }

      this.applyLineStyle( this.lineForLegend, this.maxZ );

      return this.lineForLegend;
    },



    applyLineStyle: function( line, overwriteValue ) {
      line.setAttribute( 'stroke', this.getLineColor() );
      line.setAttribute( 'stroke-width', this.getLineWidth() + ( this.isSelected() ? 2 : 0 ) );
      if ( this.getLineDashArray() )
        line.setAttribute( 'stroke-dasharray', this.getLineDashArray() );
      line.setAttribute( 'fill', 'none' );

      this.setColorTo( line, ( ( overwriteValue !== undefined ) ? overwriteValue : line.getAttribute( 'data-zvalue' ) ), this.minZ, this.maxZ );
      //  line.setAttribute('shape-rendering', 'optimizeSpeed');
    },


    setShapeZoom: function( shape ) {
      this._shapeZoom = shape;
    }



  } );

  return GraphSerieContour;

} );