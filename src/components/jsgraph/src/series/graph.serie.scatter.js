define( [ '../graph._serie' ], function( GraphSerieNonInstanciable ) {

  "use strict";

  var GraphSerieScatter = function() {}
  $.extend( GraphSerieScatter.prototype, GraphSerieNonInstanciable.prototype, {

    defaults: {
      label: ""
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

      if ( !data instanceof Array ) {
        return this;
      }

      if ( data instanceof Array && !( data[ 0 ] instanceof Array ) ) { // [100, 103, 102, 2143, ...]
        arg = "1D";
      }

      var _2d = ( arg == "2D" );

      arr = this._addData( type, _2d ? data.length * 2 : data.length );

      z = 0;

      for ( var j = 0, l = data.length; j < l; j++ ) {

        if ( _2d ) {
          arr[ z ] = ( data[ j ][ 0 ] );
          this._checkX( arr[ z ] );
          z++;
          arr[ z ] = ( data[ j ][ 1 ] );
          this._checkY( arr[ z ] );
          z++;
          total++;
        } else { // 1D Array
          arr[ z ] = data[ j ];
          this[ j % 2 == 0 ? '_checkX' : '_checkY' ]( arr[ z ] );
          z++;
          total += j % 2 ? 1 : 0;

        }
      }

      this.graph._updateAxes();

      this.data = arr;

      return this;
    },

    init: function( graph, name, options ) {

      var self = this;

      this.graph = graph;
      this.name = name;

      this.id = Math.random() + Date.now();

      this.shown = true;
      this.options = $.extend( true, {}, GraphSerieScatter.prototype.defaults, options );
      this.data = [];

      this._isMinOrMax = {
        x: {
          min: false,
          max: false
        },
        y: {
          min: false,
          max: false
        }
      };

      this.groupPoints = document.createElementNS( this.graph.ns, 'g' );
      this.groupMain = document.createElementNS( this.graph.ns, 'g' );

      this.additionalData = {};
      /*
			this.groupPoints.addEventListener('mouseover', function(e) {
			
			});


			this.groupPoints.addEventListener('mouseout', function(e) {
			
			});
*/
      this.minX = Number.MAX_VALUE;
      this.minY = Number.MAX_VALUE;
      this.maxX = Number.MIN_VALUE;
      this.maxY = Number.MIN_VALUE;

      this.groupMain.appendChild( this.groupPoints );
      this.currentAction = false;

      if ( this.initExtended1 ) {
        this.initExtended1();
      }

      this.stdStyle = {
        shape: 'circle',
        cx: 0,
        cy: 0,
        r: 3,
        stroke: 'transparent',
        fill: "black"
      }
    },

    empty: function() {

      while ( this.group.firstChild ) {
        this.group.removeChild( this.group.firstChild );
      }
    },

    select: function() {
      this.selected = true;

    },

    unselect: function() {
      this.selected = false;
    },

    setDataStyle: function( std, extra ) {

      this.stdStylePerso = std;
      this.extraStyle = extra;

      return this;
    },

    draw: function() { // Serie redrawing

      var x,
        y,
        xpx,
        ypx,
        j = 0,
        k,
        m,
        currentLine,
        max,
        self = this;

      this._drawn = true;

      this.groupMain.removeChild( this.groupPoints );

      var incrXFlip = 0;
      var incrYFlip = 1;

      if ( this.getFlip() ) {
        incrXFlip = 1;
        incrYFlip = 0;
      }

      var totalLength = this.data.length / 2;

      j = 0, k = 0, m = this.data.length;

      var error;
      //	var pathError = "M 0 0 ";

      if ( this.errorstyles ) {

        for ( var i = 0, l = this.errorstyles.length; i < l; i++ ) {
          this.errorstyles[ i ].paths = {
            top: "",
            bottom: "",
            left: "",
            right: ""
          };

        }

      }

      for ( ; j < m; j += 2 ) {

        xpx = this.getX( this.data[ j + incrXFlip ] );
        ypx = this.getY( this.data[ j + incrYFlip ] );

        var valY = this.data[ j + incrYFlip ],
          coordY;

        if ( this.error && ( error = this.error[ j / 2 ] ) ) {

          //		pathError += "M " + xpx + " " + ypx;

          if ( error[ 0 ] ) {
            this.doErrorDraw( 'y', error[ 0 ], this.data[ j + incrYFlip ], ypx, xpx, ypx );
          }

          if ( error[ 1 ] ) {
            this.doErrorDraw( 'x', error[ 1 ], this.data[ j + incrXFlip ], xpx, xpx, ypx );
          }

        }

        this._addPoint( xpx, ypx, j / 2 );
      }

      if ( this.errorstyles ) {

        for ( var i = 0, l = this.errorstyles.length; i < l; i++ ) {

          for ( var j in this.errorstyles[ i ].paths ) {

            if ( this.errorstyles[ i ][ j ] && this.errorstyles[ i ][ j ].dom ) {
              this.errorstyles[ i ][ j ].dom.setAttribute( 'd', this.errorstyles[ i ].paths[ j ] );
            }
          }
        }
      }

      this.groupMain.appendChild( this.groupPoints );
    },

    doErrorDraw: function( orientation, error, originVal, originPx, xpx, ypx ) {

      if ( !( error instanceof Array ) )  {
        error = [ error ];
      }

      var functionName = orientation == 'y' ? 'getY' : 'getX';
      var bars = orientation == 'y' ? [ 'top', 'bottom' ] : [ 'left', 'right' ];
      var j;

      if ( isNaN( xpx ) ||  isNaN( ypx ) ) {
        return;
      }

      for ( var i = 0, l = error.length; i < l; i++ ) {

        if ( error[ i ] instanceof Array ) { // TOP

          j = bars[ 0 ];
          this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
          this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal + error[ i ][ 0 ] ), originPx );

          j = bars[ 1 ];
          this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
          this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal - error[ i ][ 1 ] ), originPx );

        } else {

          j = bars[ 0 ];

          this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
          this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal + error[ i ] ), originPx );
          j = bars[ 1 ];
          this.errorstyles[ i ].paths[ j ] += " M " + xpx + " " + ypx;
          this.errorstyles[ i ].paths[ j ] += this.makeError( orientation, i, this[ functionName ]( originVal - error[ i ] ), originPx );
        }
      }
    },

    makeError: function( orientation, level, coord, origin ) {

      switch ( this.errorstyles[  level ].type ) {

        case 'bar':
          return this[ "makeBar" + orientation.toUpperCase() ]( coord, origin );
          break;

        case 'box':
          return this[ "makeBox" + orientation.toUpperCase() ]( coord, origin );
          break;
      }
    },

    makeBarY: function( coordY, origin ) {

      return " V " + coordY + " m -10 0 h 20 m -10 0 V " + origin + " ";
    },

    makeBoxY: function( coordY, origin ) {
      return " m 5 0 V " + coordY + " h -10 V " + origin + " m 5 0 ";
    },

    makeBarX: function( coordX, origin ) {
      return " H " + coordX + " m 0 -10 v 20 m 0 -10 H " + origin + " ";
    },

    makeBoxX: function( coordX, origin ) {
      return " v 5 H " + coordX + " v -10 H " + origin + " v 5 ";
    },

    _addPoint: function( xpx, ypx, k ) {

      var g = document.createElementNS( this.graph.ns, 'g' );
      g.setAttribute( 'transform', 'translate(' + xpx + ', ' + ypx + ')' );

      if ( this.extraStyle && this.extraStyle[ k ] ) {

        this.doShape( g, this.extraStyle[ k ] );

      } else if ( this.stdStylePerso ) {

        this.doShape( g, this.stdStylePerso );

      } else {

        this.doShape( g, this.stdStyle );
      }

      this.groupPoints.appendChild( g );
    },

    doShape: function( group, shape ) {

      var el = document.createElementNS( this.graph.ns, shape.shape );
      for ( var i in shape ) {
        if ( i !== "shape" ) {
          el.setAttribute( i, shape[ i ] );
        }
      }

      group.appendChild( el );
    },

    setDataError: function( error ) {
      this.error = error;
      return this;
    },

    setErrorStyle: function( errorstyles ) {

      var self = this;

      errorstyles = errorstyles ||  [ 'box', 'bar' ];

      // Ensure array
      if ( !Array.isArray( errorstyles ) ) {
        errorstyles = [ errorstyles ];
      }

      var styles = [];
      var pairs = [
        [ 'y', 'top', 'bottom' ],
        [ 'x', 'left', 'right' ]
      ];

      function makePath( style ) {

        style.dom = document.createElementNS( self.graph.ns, 'path' );
        style.dom.setAttribute( 'fill', style.fillColor || 'none' );
        style.dom.setAttribute( 'stroke', style.strokeColor || 'black' );

        self.groupMain.appendChild( style.dom );
      }

      for ( var i = 0; i < errorstyles.length; i++ ) {
        // i is bar or box

        styles[ i ] = {};

        if ( typeof errorstyles[ i ] == "string" ) {

          errorstyles[ i ] = {
            type: errorstyles[ i ],
            y: {}
          };

        }

        styles[ i ].type = errorstyles[ i ].type;

        for ( var j = 0, l = pairs.length; j < l; j++ ) {

          if ( errorstyles[ i ][ pairs[ j ][ 0 ] ] ) { //.x, .y

            errorstyles[ i ][ pairs[ j ][ 1 ] ] = $.extend( true, {}, errorstyles[ i ][ pairs[ j ][ 0 ] ] );
            errorstyles[ i ][ pairs[ j ][ 2 ] ] = $.extend( true, {}, errorstyles[ i ][ pairs[ j ][ 0 ] ] );

          }

          for ( var k = 1; k <= 2; k++ ) {

            if ( errorstyles[ i ][ pairs[ j ][ k ] ] ) {

              styles[ i ][ pairs[ j ][ k ] ] = errorstyles[ i ][ pairs[ j ][ k ] ];
              makePath( styles[ i ][ pairs[ j ][ k ] ] );
            }
          }
        }
      }
      /*
				// None is defined
				if( ! errorstyles[ i ].top && ! errorstyles[ i ].bottom ) {

					styles[ i ].top = errorstyles[ i ];
					styles[ i ].top.dom = document.createElementNS( this.graph.ns, 'path' );
					styles[ i ].bottom = errorstyles[ i ];
					styles[ i ].bottom.dom = document.createElementNS( this.graph.ns, 'path' );

				} else if( errrostyles[ i ].top ) {

					styles[ i ].bottom = null; // No bottom displayed
					styles[ i ].top = errrostyles[ i ].top;
					styles[ i ].top.dom = document.createElementNS( this.graph.ns, 'path' );

				} else {

					styles[ i ].bottom = errorstyles[ i ].bottom;
					styles[ i ].bottom.dom = document.createElementNS( this.graph.ns, 'path' );
					styles[ i ].top = null;
				}
*/

      this.errorstyles = styles;

    }
  } );

  return GraphSerieScatter;
} );