define( [], function() {

  "use strict";

  var GraphSerieNonInstanciable = function() {
    throw "This serie is not instanciable";
  }

  GraphSerieNonInstanciable.prototype = {

    setAdditionalData: function( data ) {
      this.additionalData = data;
      return this;
    },

    getAdditionalData: function() {
      return this.additionalData;
    },

    /**
     *	Possible data types
     *	[100, 0.145, 101, 0.152, 102, 0.153]
     *	[[100, 0.145, 101, 0.152], [104, 0.175, 106, 0.188]]
     *	[[100, 0.145], [101, 0.152], [102, 0.153], [...]]
     *	[{ x: 100, dx: 1, y: [0.145, 0.152, 0.153]}]
     *
     *	Converts every data type to a 1D array
     */

    setData: function( data, arg, type ) {

      var z = 0,
        x,
        dx,
        arg = arg || "2D",
        type = type || 'float',
        arr,
        total = 0,
        continuous;

      this.minX = +Infinity;
      this.minY = +Infinity;
      this.maxX = -Infinity;
      this.maxY = -Infinity;

      if ( !data instanceof Array ) {
        return;
      }

      // Single object
      var datas = [];
      if ( !( data instanceof Array ) && typeof data == 'object' ) {
        data = [ data ];
      } else if ( data instanceof Array && !( data[ 0 ] instanceof Array ) ) { // [100, 103, 102, 2143, ...]
        data = [ data ];
        arg = "1D";
      }

      var _2d = ( arg == "2D" );

      // [[100, 0.145], [101, 0.152], [102, 0.153], [...]] ==> [[[100, 0.145], [101, 0.152], [102, 0.153], [...]]]
      if ( data[ 0 ] instanceof Array && arg == "2D" && !( data[ 0 ][ 0 ] instanceof Array ) ) {
        data = [ data ];
      }

      if ( data[ 0 ] instanceof Array ) {
        for ( var i = 0, k = data.length; i < k; i++ ) {

          arr = this._addData( type, _2d ? data[ i ].length * 2 : data[ i ].length );
          datas.push( arr );
          z = 0;

          for ( var j = 0, l = data[ i ].length; j < l; j++ ) {

            if ( _2d ) {
              arr[ z ] = ( data[ i ][ j ][ 0 ] );
              this._checkX( arr[ z ] );
              z++;
              arr[ z ] = ( data[ i ][ j ][ 1 ] );
              this._checkY( arr[ z ] );
              z++;
              total++;

            } else { // 1D Array
              arr[ z ] = data[ i ][ j ];
              this[ j % 2 == 0 ? '_checkX' : '_checkY' ]( arr[ z ] );

              z++;
              total += j % 2 ? 1 : 0;

            }
          }
        }

      } else if ( typeof data[ 0 ] == 'object' ) {

        this.mode = 'x_equally_separated';

        var number = 0,
          numbers = [],
          datas = [],
          k = 0,
          o;
        for ( var i = 0, l = data.length; i < l; i++ ) { // Several piece of data together
          number += data[ i ].y.length;
          continuous = ( i != 0 ) && ( !data[ i + 1 ] || data[ i ].x + data[ i ].dx * ( data[ i ].y.length ) == data[ i + 1 ].x );
          if ( !continuous ) {
            datas.push( this._addData( type, number ) );
            numbers.push( number );
            number = 0;
          }
        }

        this.xData = [];

        number = 0, k = 0, z = 0;

        for ( var i = 0, l = data.length; i < l; i++ ) {
          x = data[ i ].x, dx = data[ i ].dx;

          this.xData.push( {
            x: x,
            dx: dx
          } );

          o = data[ i ].y.length;
          this._checkX( x );
          this._checkX( x + dx * o );

          for ( var j = 0; j < o; j++ ) {
            /*datas[k][z] = (x + j * dx);
						this._checkX(datas[k][z]);
						z++;*/
            // 30 june 2014. To save memory I suggest that we do not add this stupid data.

            datas[ k ][ z ] = ( data[ i ].y[ j ] );
            this._checkY( datas[ k ][ z ] );
            z++;
            total++;

          }
          number += data[ i ].y.length;

          if ( numbers[ k ] == number ) {
            k++;
            number = 0;
            z = 0;
          }
        }
      }

      // Determination of slots for low res spectrum
      var w = ( this.maxX - this.minX ) / this.graph.getDrawingWidth(),
        ws = [];

      var min = this.graph.getDrawingWidth() * 4;
      var max = total / 4;

      var min = this.graph.getDrawingWidth();
      var max = total;

      this.data = datas;

      if ( min > 0 ) {

        while ( min < max ) {
          ws.push( min );
          min *= 4;
        }

        this.slots = ws;

        if ( this.options.useSlots ) {

          this.calculateSlots();
        }
      }

      if ( this.isFlipped() ) {

        var maxX = this.maxX;
        var maxY = this.maxY;
        var minX = this.minX;
        var minY = this.minY;

        this.maxX = maxY;
        this.maxY = maxX;

        this.minX = minY;
        this.minY = minX;
      }

      this.graph._updateAxes();

      return this;
    },

    _addData: function( type, howmany ) {

      switch ( type ) {
        case 'int':
          var size = howmany * 4; // 4 byte per number (32 bits)
          break;
        case 'float':
          var size = howmany * 8; // 4 byte per number (64 bits)
          break;
      }

      var arr = new ArrayBuffer( size );

      switch ( type ) {
        case 'int':
          return new Int32Array( arr );
          break;

        default:
        case 'float':
          return new Float64Array( arr );
          break;
      }
    },

    kill: function( noRedraw ) {

      this.graph.plotGroup.removeChild( this.groupMain );

      if ( this.picks && this.picks.length ) {
        for ( var i = 0, l = this.picks.length; i < l; i++ ) {
          this.picks[ i ].kill();
        }
      }

      this.graph.series.splice( this.graph.series.indexOf( this ), 1 );

      if ( !noRedraw )  {
        this.graph.redraw();
      }
    },

    isMinOrMax: function( bool, xy, minmax ) {

      if ( bool == undefined ) {
        return this._isMinOrMax.x.min || this._isMinOrMax.x.max || this._isMinOrMax.y.min || this._isMinOrMax.y.max;
      }

      if ( minmax == undefined && xy != undefined ) {
        this._isMinOrMax[ xy ].min = bool;
        this._isMinOrMax[ xy ].max = bool;
        return;
      }

      if ( xy != undefined && minmax != undefined ) {
        this._isMinOrMax[ xy ][ minmax ] = bool;
      }
    },

    hide: function() {
      this.hidden = true;
      this.groupMain.setAttribute( 'display', 'none' );

      this.getSymbolForLegend().setAttribute( 'opacity', 0.5 );
      this.getTextForLegend().setAttribute( 'opacity', 0.5 );

      this.hideImpl();
    },

    show: function() {
      this.hidden = false;
      this.groupMain.setAttribute( 'display', 'block' );

      this.getSymbolForLegend().setAttribute( 'opacity', 1 );
      this.getTextForLegend().setAttribute( 'opacity', 1 );

      this.showImpl();

      this.draw();
    },

    hideImpl: function() {},
    showImpl: function() {},

    toggleShow: function() {
      if ( !this.shown ) {
        this.show();
        return;
      }

      this.hide();
    },

    isShown: function() {
      return !this.hidden;
    },

    getX: function( val ) {
      return Math.round( this.getXAxis().getPx( val ) * 5 ) / 5;
    },

    getY: function( val ) {
      return Math.round( this.getYAxis().getPx( val ) * 5 ) / 5;
    },

    isSelected: function() {
      return this.selected;
    },

    _checkX: function( val ) {
      this.minX = Math.min( this.minX, val );
      this.maxX = Math.max( this.maxX, val );
    },

    _checkY: function( val ) {
      this.minY = Math.min( this.minY, val );
      this.maxY = Math.max( this.maxY, val );
    },

    getName: function() {
      return this.name;
    },

    /* AXIS */

    autoAxis: function() {
      this.setXAxis( !this.isFlipped() ? this.graph.getXAxis() : this.graph.getYAxis() );
      this.setYAxis( !this.isFlipped() ? this.graph.getYAxis() : this.graph.getXAxis() );

      this.graph._updateAxes();

      return this;
    },

    setXAxis: function( axis ) {
      
      if ( typeof axis == "number" )
        this.xaxis = this.isFlipped() ? this.graph.getYAxis( axis ) : this.graph.getXAxis( axis );
      else
        this.xaxis = axis;

      return this;
    },

    setYAxis: function( axis ) {
      if ( typeof axis == "number" )
        this.xaxis = this.isFlipped() ? this.graph.getXAxis( axis ) : this.graph.getYAxis( axis );
      else
        this.yaxis = axis;

      return this;
    },

    getXAxis: function() {
      return this.xaxis;
    },

    getYAxis: function() {
      return this.yaxis;
    },

    setAxes: function() {

      for ( var i = 0; i < 2; i++ ) {

        if ( arguments[ i ] ) {
          this[ ( arguments[ i ].isXY() == 'x' ? 'setXAxis' : 'setYAxis' ) ]( arguments[ i ] );
        }
      }

      return this;
    },

    /* */

    /* DATA MIN MAX */

    getMinX: function() {
      return this.minX;
    },

    getMaxX: function() {
      return this.maxX;
    },

    getMinY: function() {
      return this.minY;
    },

    getMaxY: function() {
      return this.maxY;
    },

    getSymbolForLegend: function() {

      if ( !this.lineForLegend ) {

        var line = document.createElementNS( this.graph.ns, 'line' );
        this.applyLineStyle( line );

        line.setAttribute( 'x1', 5 );
        line.setAttribute( 'x2', 25 );
        line.setAttribute( 'y1', 0 );
        line.setAttribute( 'y2', 0 );

        line.setAttribute( 'cursor', 'pointer' );

        this.lineForLegend = line;
      }

      return this.lineForLegend;

    },

    getTextForLegend: function() {

      if ( !this.textForLegend ) {

        var text = document.createElementNS( this.graph.ns, 'text' );
        text.setAttribute( 'transform', 'translate(35, 3)' );
        text.setAttribute( 'cursor', 'pointer' );
        text.textContent = this.getLabel();

        this.textForLegend = text;
      }

      return this.textForLegend;
    },

    setLegendSymbolStyle: function() {
      this.applyLineStyle( this.getSymbolForLegend() );
    },

    getIndex: function() {
      return this.graph.series.indexOf( this );
    },
    
    getLabel: function() {
      return this.options.label || this.name;
    },

    setLabel: function( label ) {
      this.options.label = label;
      return this;
    },

    /* FLIP */

    setFlip: function( bol ) {
      this.options.flip = bol;
    },

    getFlip: function() {
      return this.options.flip;
    },

    isFlipped: function() {
      return this.options.flip;
    },

    isXMonotoneous: function() {
      return this.xmonotoneous ||  false;
    }

  };

  return GraphSerieNonInstanciable;
} );