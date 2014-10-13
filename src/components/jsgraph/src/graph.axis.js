define( [ 'jquery' ], function( $ ) {

  var GraphAxis = function() {}

  GraphAxis.prototype = {

    defaults: {
      lineAt0: false,
      display: true,
      flipped: false,
      axisDataSpacing: {
        min: 0.1,
        max: 0.1
      },
      unitModification: false,
      primaryGrid: true,
      secondaryGrid: true,
      shiftToZero: false,
      tickPosition: 1,
      nbTicksPrimary: 3,
      nbTicksSecondary: 10,
      ticklabelratio: 1,
      exponentialFactor: 0,
      exponentialLabelFactor: 0,
      wheelBaseline: "min",
      logScale: false,
      allowedPxSerie: 100,
      forcedMin: false,
      forcedMax: false
    },

    init: function( graph, options, overwriteoptions ) {

      this.unitModificationTimeTicks = [
        [ 1, [ 1, 2, 5, 10, 20, 30 ] ],
        [ 60, [ 1, 2, 5, 10, 20, 30 ] ],
        [ 3600, [ 1, 2, 6, 12 ] ],
        [ 3600 * 24, [ 1, 2, 3, 4, 5, 10, 20, 40 ] ]
      ];

      var self = this;
      this.graph = graph;
      this.options = $.extend( true, {}, GraphAxis.prototype.defaults, overwriteoptions, options );

      this.group = document.createElementNS( this.graph.ns, 'g' );
      this.hasChanged = true;
      this.groupGrids = document.createElementNS( this.graph.ns, 'g' );
      this.graph.axisGroup.insertBefore( this.groupGrids, this.graph.axisGroup.firstChild );
      this.rectEvent = document.createElementNS( this.graph.ns, 'rect' );
      this.rectEvent.setAttribute( 'pointer-events', 'fill' );
      this.rectEvent.setAttribute( 'fill', 'transparent' );
      this.group.appendChild( this.rectEvent );

      this.setEvents();

      this.graph.axisGroup.appendChild( this.group ); // Adds to the main axiszone

      this.line = document.createElementNS( this.graph.ns, 'line' );
      this.line.setAttribute( 'stroke', 'black' );
      this.line.setAttribute( 'shape-rendering', 'crispEdges' );
      this.line.setAttribute( 'stroke-linecap', 'square' );
      this.groupTicks = document.createElementNS( this.graph.ns, 'g' );
      this.groupTickLabels = document.createElementNS( this.graph.ns, 'g' );

      this.group.appendChild( this.groupTicks );
      this.group.appendChild( this.groupTickLabels );
      this.group.appendChild( this.line );

      this.labelValue;

      this.label = document.createElementNS( this.graph.ns, 'text' );
      this.labelTspan = document.createElementNS( this.graph.ns, 'tspan' );
      this.label.appendChild( this.labelTspan );

      this.expTspan = document.createElementNS( this.graph.ns, 'tspan' );
      this.label.appendChild( this.expTspan );
      this.expTspan.setAttribute( 'dx', 10 );
      this.expTspanExp = document.createElementNS( this.graph.ns, 'tspan' );
      this.label.appendChild( this.expTspanExp );
      this.expTspanExp.setAttribute( 'dy', -5 );
      this.expTspanExp.setAttribute( 'font-size', "0.8em" );

      this.label.setAttribute( 'text-anchor', 'middle' );

      this.groupGrids.setAttribute( 'clip-path', 'url(#_clipplot' + this.graph._creation + ')' );

      this.group.appendChild( this.label );

      this.groupSeries = document.createElementNS( this.graph.ns, 'g' );
      this.group.appendChild( this.groupSeries );

      this.ticks = [];
      this.series = [];
      this.totalDelta = 0;
      this.currentAction = false;

      this.group.addEventListener( 'mousemove', function( e ) {
        e.preventDefault();
        var coords = self.graph._getXY( e );
        self.handleMouseMoveLocal( coords.x, coords.y, e );

        for ( var i = 0, l = self.series.length; i < l; i++ ) {
          self.series[ i ].handleMouseMove( false, true );

          if ( self.currentAction == 'labelDragging' )
            self.series[ i ].handleLabelMove( coords.x, coords.y );

          if ( self.currentAction == 'labelDraggingMain' )
            self.series[ i ].handleLabelMainMove( coords.x, coords.y );
        }
      } );

      this.group.addEventListener( 'mouseup', function( e ) {
        e.preventDefault();
        self.handleMouseUp();
      } );

      this.group.addEventListener( 'mouseout', function( e ) {
        e.preventDefault();
        var coords = self.graph._getXY( e );
        self.handleMouseOutLocal( coords.x, coords.y, e );
      } );

      this.labels = [];
      this.group.addEventListener( 'click', function( e ) {
        e.preventDefault();
        var coords = self.graph._getXY( e );
        self.addLabel( self.getVal( coords.x - self.graph.getPaddingLeft() ) );
      } );

      this.axisRand = Math.random();
      this.clip = document.createElementNS( this.graph.ns, 'clipPath' );
      this.clip.setAttribute( 'id', '_clip' + this.axisRand )
      this.graph.defs.appendChild( this.clip );

      this.clipRect = document.createElementNS( this.graph.ns, 'rect' );
      this.clip.appendChild( this.clipRect );
      this.clip.setAttribute( 'clipPathUnits', 'userSpaceOnUse' );
    },

    handleMouseMoveLocal: function() {},

    setEvents: function() {
      var self = this;
      this.rectEvent.addEventListener( 'mousedown', function( e ) {

        e.stopPropagation();
        e.preventDefault();
        if ( e.which == 3 || e.ctrlKey ) {
          return;
        }
        var coords = self.graph._getXY( e );

        self.graph.currentAction = 'zooming';
        self.graph._zoomingMode = self instanceof GraphXAxis ? 'x' : 'y';
        self.graph._zoomingXStart = coords.x;
        self.graph._zoomingYStart = coords.y;
        self.graph._zoomingXStartRel = coords.x - self.graph.getPaddingLeft();
        self.graph._zoomingYStartRel = coords.y - self.graph.getPaddingTop();
        self.this._zoomingSquare.setAttribute( 'width', 0 );
        self.this._zoomingSquare.setAttribute( 'height', 0 );

        switch ( self.graph._zoomingMode ) {
          case 'x':
            self.this._zoomingSquare.setAttribute( 'y', self.graph.getPaddingTop() + self.shift - self.totalDimension );
            self.this._zoomingSquare.setAttribute( 'height', self.totalDimension );
            break;
          case 'y':
            self.this._zoomingSquare.setAttribute( 'x', self.graph.getPaddingLeft() + self.shift - self.totalDimension );
            self.this._zoomingSquare.setAttribute( 'width', self.totalDimension );
            break;
        }

        self.this._zoomingSquare.setAttribute( 'display', 'block' );
      } );
    },

    addLabel: function( x ) {

      for ( var i = 0, l = this.series.length; i < l; i++ ) {

        if ( this.series[ i ].currentAction !== false ) {
          continue;
        }

        this.series[ i ].addLabelObj( {
          x: x
        } );
      }
    },

    hide: function() {
      this.options.display = false;
      return this;
    },

    show: function() {
      this.options.display = true;
      return this;
    },

    setDisplay: function( bool ) {
      this.options.display = !!bool;
      return this;
    },

    isDisplayed: function() {
      return this.options.display;
    },

    setLineAt0: function( bool ) {
      this.options.lineAt0 = !!bool;
    },

    adapt0To: function( axis, mode, value ) {

      if ( axis ) {
        this._adapt0To = [ axis, mode, value ];
      } else {
        this._adapt0To = false;
      }

    },

    getAdapt0ToMin: function() {

      if ( this._adapt0To[ 1 ] == "min" ) {
        return this._adapt0To[ 2 ]
      } else {
        return this._adapt0To[ 2 ] * ( this._adapt0To[ 0 ].getMinValue() / this._adapt0To[ 0 ].getMaxValue() )
      }
    },

    getAdapt0ToMax: function() {

      if ( this._adapt0To[ 1 ] == "max" ) {
        return this._adapt0To[ 2 ]
      } else {
        return this._adapt0To[ 2 ] * ( this._adapt0To[ 0 ].getMaxValue() / this._adapt0To[ 0 ].getMinValue() )
      }
    },

    setAxisDataSpacing: function( val1, val2 ) {
      this.options.axisDataSpacing.min = val1;
      this.options.axisDataSpacing.max = val2 || val1;
    },

    setAxisDataSpacingMin: function( val ) {
      this.options.axisDataSpacing.min = val;
    },

    setAxisDataSpacingMax: function( val ) {
      this.options.axisDataSpacing.max = val;
    },

    setMinPx: function( px ) {
      this.minPx = px;
    },
    setMaxPx: function( px ) {
      this.maxPx = px;
    },
    getMinPx: function() {
      return this.isFlipped() ? this.maxPx : this.minPx;
    },
    getMaxPx: function( px ) {
      return this.isFlipped() ? this.minPx : this.maxPx;
    },
    getMathMaxPx: function() {
      return this.maxPx;
    },

    // Returns the true minimum of the axis. Either forced in options or the one from the data
    getMinValue: function() {
      return !this._adapt0To ? ( this.options.forcedMin || ( this.options.forcedMin === 0 ? 0 : this.dataMin ) ) : ( this.getAdapt0ToMin() );
    },

    getMaxValue: function() {
      return !this._adapt0To ? ( this.options.forcedMax || ( this.options.forcedMax === 0 ? 0 : this.dataMax ) ) : ( this.getAdapt0ToMax() );
    },

    setMinValueData: function( min ) {
      this.dataMin = min;
    },
    setMaxValueData: function( max ) {
      this.dataMax = max;
    },

    forceMin: function( val ) {
      this.options.forcedMin = val;
      return this;
    },
    forceMax: function( val ) {
      this.options.forcedMax = val;
      return this;
    },

    getNbTicksPrimary: function() {
      return this.options.nbTicksPrimary;
    },

    getNbTicksSecondary: function() {
      return this.options.nbTicksSecondary;
    },

    handleMouseMove: function( px, e ) {
      this.mouseVal = this.getVal( px );
    },

    handleMouseWheel: function( delta, e ) {

      delta = Math.min( 0.2, Math.max( -0.2, delta ) );
      var baseline;

      if ( this.options.wheelBaseline == "min" ) {
        baseline = this.getActualMin();
      } else if ( this.options.wheelBaseline == "max" ) {
        baseline = this.getActualMax();
      } else {
        baseline = this.options.wheelBaseline;
      }

      this._doZoomVal(
        ( ( this.getActualMax() - baseline ) * ( 1 + delta ) ) + baseline, ( ( this.getActualMin() - baseline ) * ( 1 + delta ) ) + baseline
      );

      this.graph.redraw( );
      //	this.graph.drawSeries(true);

    },

    handleMouseUp: function( px, e ) {

      if ( this.currentAction == 'labelDragging' || this.currentAction == 'labelDraggingMain' ) {
        for ( var i = 0, l = this.series.length; i < l; i++ ) {
          this.series[ i ].handleLabelUp();
        }
        this.currentAction = false;

      }
      /* else if(this.graph.isZooming())
				this._handleZoom(px);*/

    },

    zoom: function( val1, val2 ) {
      return this._doZoomVal( val1, val2 );
    },

    _doZoomVal: function( val1, val2, mute ) {

      return this._doZoom( this.getPx( val1 ), this.getPx( val2 ), val1, val2, mute );
    },

    _doZoom: function( px1, px2, val1, val2, mute ) {

      //if(this.options.display || 1 == 1) {
      var val1 = val1 !== undefined ? val1 : this.getVal( px1 );
      var val2 = val2 !== undefined ? val2 : this.getVal( px2 );
      this.setCurrentMin( Math.min( val1, val2 ) );
      this.setCurrentMax( Math.max( val1, val2 ) );

      this._hasChanged = true;
      if ( this.options.onZoom && !mute )
        this.options.onZoom( this.currentAxisMin, this.currentAxisMax );
      //	}
    },

    getSerieShift: function() {
      return this._serieShift;
    },

    getSerieScale: function() {
      return this._serieScale;
    },

    getMouseVal: function() {
      return this.mouseVal;
    },

    isFlipped: function() {
      return this.options.flipped;
    },

    getUnitPerTick: function( px, nbTick, valrange ) {

      var pxPerTick = px / nbTicks; // 1000 / 100 = 10 px per tick
      if ( !nbTick )
        nbTick = px / 10;
      else
        nbTick = Math.min( nbTick, px / 10 );

      // So now the question is, how many units per ticks ?
      // Say, we have 0.0004 unit per tick
      var unitPerTick = valrange / nbTick;

      if ( this.options.unitModification == 'time' ) {
        // Determine the time domain using max.

        var max = this.getModifiedValue( this.getMaxValue() ),
          units = [
            [ 60, 'min' ],
            [ 3600, 'h' ],
            [ 3600 * 24, 'd' ]
          ];
        if ( max < 3600 ) { // to minutes
          umin = 0;
        } else if ( max < 3600 * 24 ) {
          umin = 1;
        } else {
          umin = 2;
        }

        var breaked = false;
        for ( var i = 0, l = this.unitModificationTimeTicks.length; i < l; i++ ) {
          for ( var k = 0, m = this.unitModificationTimeTicks[ i ][ 1 ].length; k < m; k++ ) {
            if ( unitPerTick < this.unitModificationTimeTicks[ i ][ 0 ] * this.unitModificationTimeTicks[ i ][ 1 ][ k ] ) {
              breaked = true;
              break;
            }
          }
          if ( breaked )
            break;
        }

        //i and k contain the good variable;
        if ( i !== this.unitModificationTimeTicks.length )
          unitPerTickCorrect = this.unitModificationTimeTicks[ i ][ 0 ] * this.unitModificationTimeTicks[ i ][ 1 ][ k ];
        else
          unitPerTickCorrect = 1;

      } else {
        // We take the log
        var decimals = Math.floor( Math.log( unitPerTick ) / Math.log( 10 ) );
        /*
					Example:
						13'453 => Math.log10() = 4.12 => 4
						0.0000341 => Math.log10() = -4.46 => -5
				*/

        var numberToNatural = unitPerTick * Math.pow( 10, -decimals );

        /*
					Example:
						13'453 (4) => 1.345
						0.0000341 (-5) => 3.41
				*/

        this.decimals = -decimals;

        var possibleTicks = [ 1, 2, 5, 10 ];
        var closest = false;
        for ( var i = possibleTicks.length - 1; i >= 0; i-- )
          if ( !closest || ( Math.abs( possibleTicks[ i ] - numberToNatural ) < Math.abs( closest - numberToNatural ) ) ) {
            closest = possibleTicks[ i ];
          }

          // Ok now closest is the number of unit per tick in the natural number
          /*
					Example:
						13'453 (4) (1.345) => 1
						0.0000341 (-5) (3.41) => 5 
				*/

          // Let's scale it back
        var unitPerTickCorrect = closest * Math.pow( 10, decimals );
        /*
					Example:
						13'453 (4) (1.345) (1) => 10'000
						0.0000341 (-5) (3.41) (5) => 0.00005
				*/
      }

      var nbTicks = valrange / unitPerTickCorrect;
      var pxPerTick = px / nbTick;

      return [ unitPerTickCorrect, nbTicks, pxPerTick ];
    },

    setMinMaxToFitSeries: function() {

      var interval = this.getInterval();

      this.currentAxisMin = this.getMinValue() - ( this.options.axisDataSpacing.min * interval );
      this.currentAxisMax = this.getMaxValue() + ( this.options.axisDataSpacing.max * interval );

      if ( this.options.logScale ) {
        this.currentAxisMin = Math.max( 1e-50, this.currentAxisMin );
        this.currentAxisMax = Math.max( 1e-50, this.currentAxisMax );
      }

      if ( isNaN( this.currentAxisMin ) || isNaN( this.currentAxisMax ) ) {
        this.currentAxisMax = undefined;
        this.currentAxisMin = undefined;
      }

    },

    getInterval: function() {
      return this.getMaxValue() - this.getMinValue()
    },

    _getActualInterval: function() {
      return this.getActualMax() - this.getActualMin();
    },

    getActualMin: function() {
      return this.currentAxisMin == this.currentAxisMax ? this.currentAxisMin - 1 : this.currentAxisMin;
    },

    getActualMax: function() {
      return this.currentAxisMax == this.currentAxisMin ? this.currentAxisMax + 1 : this.currentAxisMax;
    },

    setCurrentMin: function( val ) {

      this.currentAxisMin = val;
      if ( this.options.logScale ) {
        this.currentAxisMin = Math.max( 1e-50, val );
      }
    },

    setCurrentMax: function( val ) {
      this.currentAxisMax = val;

      if ( this.options.logScale )
        this.currentAxisMax = Math.max( 1e-50, val );
    },

    flip: function( bool ) {
      this.options.flipped = bool;
      return this;
    },

    /**
     *	@param doNotResetMinMax Whether min max of the axis should fit the one of the series
     */
    _draw: function() { // Redrawing of the axis
      var visible;

      switch ( this.options.tickPosition ) {
        case 3:
          this.tickPx1 = -2;
          this.tickPx2 = 0;
          break;

        case 2:
          this.tickPx1 = -1;
          this.tickPx2 = 1;
          break;

        case 1:
          this.tickPx1 = 0;
          this.tickPx2 = 2;
          break;
      }

      // Remove all ticks
      while ( this.groupTicks.firstChild )
        this.groupTicks.removeChild( this.groupTicks.firstChild );

      // Remove all ticks
      while ( this.groupTickLabels.firstChild )
        this.groupTickLabels.removeChild( this.groupTickLabels.firstChild );

      // Remove all grids
      while ( this.groupGrids.firstChild )
        this.groupGrids.removeChild( this.groupGrids.firstChild );

      if ( this.currentAxisMin == undefined || !this.currentAxisMax == undefined ) {
        this.setMinMaxToFitSeries(); // We reset the min max as a function of the series
      }

      // The data min max is stored in this.dataMin, this.dataMax

      var widthPx = this.maxPx - this.minPx;
      var valrange = this._getActualInterval();

      /* Number of px per unit */
      /* Example: width: 1000px
			/* 			10 - 100 => 11.11
			/*			0 - 2 => 500
			/*			0 - 0.00005 => 20'000'000
														*/

      if ( !this.options.display ) {
        this.line.setAttribute( 'display', 'none' );
        return 0;
      }

      this.line.setAttribute( 'display', 'block' );

      if ( !this.options.hideTicks ) {
        if ( !this.options.logScale ) {
          // So the setting is: How many ticks in total ? Then we have to separate it

          if ( this.options.scientificTicks ) {
            this.scientificExp = Math.floor( Math.log( Math.max( Math.abs( this.getActualMax() ), Math.abs( this.getActualMin() ) ) ) / Math.log( 10 ) );
          }

          var widthHeight = this.drawLinearTicksWrapper( widthPx, valrange );
          
        } else {
          var widthHeight = this.drawLogTicks();
        }
      } else {
        var widthHeight = 0;
      }

      /************************************/
      /*** DRAWING LABEL ******************/
      /************************************/

      var label;
      if ( label = this.getLabel() ) {
        this.labelTspan.textContent = label;
        if ( this.getExponentialLabelFactor() ) {
          this.expTspan.nodeValue = 'x10';
          this.expTspanExp.nodeValue = this.getExponentialLabelFactor();
          visible = true;
        } else if ( this.options.scientificTicks ) {
          this.expTspan.textContent = 'x10';
          this.expTspanExp.textContent = this.scientificExp;
          visible = true;
        } else
          visible = false;

        this.expTspan.setAttribute( 'display', visible ? 'block' : 'none' );
        this.expTspanExp.setAttribute( 'display', visible ? 'block' : 'none' );
      }

      /************************************/
      /*** DRAW CHILDREN IMPL SPECIFIC ****/
      /************************************/
      this.drawSpecifics();
      if ( this.options.lineAt0 && this.getActualMin() < 0 && this.getActualMax() > 0 )
        this._draw0Line( this.getPx( 0 ) );

      return widthHeight + ( label ? 20 : 0 );
    },

    drawLinearTicksWrapper: function( widthPx, valrange ) {

      var nbTicks1 = this.getNbTicksPrimary();
      var primaryTicks = this.getUnitPerTick( widthPx, nbTicks1, valrange );
      var nbSecondaryTicks = this.secondaryTicks();
      if ( nbSecondaryTicks ) {
        var nbSecondaryTicks = nbSecondaryTicks; // Math.min(nbSecondaryTicks, primaryTicks[2] / 5);
      }

      // We need to get here the width of the ticks to display the axis properly, with the correct shift
      return this.drawTicks( primaryTicks, nbSecondaryTicks );
    },

    setTickLabelRatio: function( tickRatio ) {
      this.options.ticklabelratio = tickRatio;
    },

    draw: function() {

      this._widthLabels = 0;
      var drawn = this._draw();
      this._widthLabels += drawn;
      return drawn; // ??? this.series.length > 0 ? 100 : drawn;
    },

    drawTicks: function( primary, secondary ) {

      var unitPerTick = primary[ 0 ],
        min = this.getActualMin(),
        max = this.getActualMax(),
        widthHeight = 0,
        secondaryIncr,
        incrTick,
        subIncrTick,
        loop = 0;

      if ( secondary ) {
        secondaryIncr = unitPerTick / secondary;
      }

      incrTick = this.options.shiftToZero ? this.dataMin - Math.ceil( ( this.dataMin - min ) / unitPerTick ) * unitPerTick : Math.floor( min / unitPerTick ) * unitPerTick;
      this.incrTick = primary[ 0 ];
      this.resetTicks();

      while ( incrTick < max ) {
        loop++;
        if ( loop > 200 )
          break;
        if ( secondary ) {
          subIncrTick = incrTick + secondaryIncr;
          //widthHeight = Math.max(widthHeight, this.drawTick(subIncrTick, 1));
          var loop2 = 0;
          while ( subIncrTick < incrTick + unitPerTick ) {
            loop2++;
            if ( loop2 > 100 )
              break;
            if ( subIncrTick < min || subIncrTick > max ) {
              subIncrTick += secondaryIncr;
              continue;
            }
            this.drawTick( subIncrTick, false, Math.abs( subIncrTick - incrTick - unitPerTick / 2 ) < 1e-4 ? 3 : 2 );
            subIncrTick += secondaryIncr;
          }
        }

        if ( incrTick < min || incrTick > max ) {
          incrTick += primary[ 0 ];
          continue;
        }

        this.drawTick( incrTick, true, 4 );
        incrTick += primary[ 0 ];
      }

      this.widthHeightTick = this.getMaxSizeTick();
      return this.widthHeightTick;
    },

    resetTicks: function() {},

    secondaryTicks: function() {
      return this.options.nbTicksSecondary;
    },

    drawLogTicks: function() {
      var min = this.getActualMin(),
        max = this.getActualMax();
      var incr = Math.min( min, max );
      var max = Math.max( min, max );

      var optsMain = {
        fontSize: '1.0em',
        exponential: true,
        overwrite: false
      }
      if ( incr < 0 )
        incr = 0;
      var pow = incr == 0 ? 0 : Math.floor( Math.log( incr ) / Math.log( 10 ) );
      var incr = 1,
        k = 0,
        val;
      while ( ( val = incr * Math.pow( 10, pow ) ) < max ) {
        if ( incr == 1 ) { // Superior power
          if ( val > min )
            this.drawTick( val, true, 5, optsMain );
        }
        if ( incr == 10 ) {
          incr = 1;
          pow++;
        } else {
          if ( incr != 1 && val > min )
            this.drawTick( val, true, 2, {
              overwrite: incr,
              fontSize: '0.6em'
            } );
          incr++;
        }
      }
      return 5;
    },

    getPx: function( value ) {
      return this.getPos( value );
    },

    getPos: function( value ) {
      //			if(this.getMaxPx() == undefined)
      //				console.log(this);
      //console.log(this.getMaxPx(), this.getMinPx(), this._getActualInterval());
      // Ex 50 / (100) * (1000 - 700) + 700

      //console.log( value, this.getActualMin(), this.getMaxPx(), this.getMinPx(), this._getActualInterval() );
      if ( !this.options.logScale ) {
        
        return ( value - this.getActualMin() ) / ( this._getActualInterval() ) * ( this.getMaxPx() - this.getMinPx() ) + this.getMinPx();
      } else {
        // 0 if value = min
        // 1 if value = max
        if ( value < 0 )
          return;

        var value = ( ( Math.log( value ) - Math.log( this.getActualMin() ) ) / ( Math.log( this.getActualMax() ) - Math.log( this.getActualMin() ) ) ) * ( this.getMaxPx() - this.getMinPx() ) + this.getMinPx();

        return value;
      }
    },

    getRelPx: function( value ) {
      return ( value / this._getActualInterval() ) * ( this.getMaxPx() - this.getMinPx() );
    },

    getRelVal: function( px ) {

      return px / ( this.getMaxPx() - this.getMinPx() ) * this._getActualInterval();
    },

    getVal: function( px ) {

      // Ex 50 / (100) * (1000 - 700) + 700
      return ( px - this.getMinPx() ) / ( this.getMaxPx() - this.getMinPx() ) * this._getActualInterval() + this.getActualMin();
    },

    valueToText: function( value ) {

      if ( this.options.scientificTicks ) {
        value /= Math.pow( 10, this.scientificExp );
        return value.toFixed( 1 );
      } else {

        value = value * Math.pow( 10, this.getExponentialFactor() ) * Math.pow( 10, this.getExponentialLabelFactor() );
        if ( this.options.shiftToZero )
          value -= this.dataMin;
        if ( this.options.ticklabelratio )
          value *= this.options.ticklabelratio;
        if ( this.options.unitModification ) {
          value = this.modifyUnit( value, this.options.unitModification );
          return value;
        }
        var dec = this.decimals - this.getExponentialFactor() - this.getExponentialLabelFactor();
        if ( dec > 0 )
          return value.toFixed( dec );

        return value.toFixed( 0 );
      }
    },

    getModifiedValue: function( value ) {
      if ( this.options.ticklabelratio )
        value *= this.options.ticklabelratio;

      if ( this.options.shiftToZero )
        value -= this.getMinValue() * ( this.options.ticklabelratio || 1 );
      return value;
    },

    modifyUnit: function( value, mode ) {
      switch ( mode ) {
        case 'time': // val must be in seconds => transform in hours / days / months
          var max = this.getModifiedValue( this.getMaxValue() ),
            units = [
              [ 60, 'min' ],
              [ 3600, 'h' ],
              [ 3600 * 24, 'd' ]
            ];
          if ( max < 3600 ) { // to minutes
            umin = 0;
          } else if ( max < 3600 * 24 ) {
            umin = 1;
          } else if ( max < 3600 * 24 * 30 ) {
            umin = 2;
          }
          break;
      }

      var incr = this.incrTick;
      var text = "",
        valueRounded;

      value = value / units[ umin ][ 0 ];

      valueRounded = Math.floor( value );

      text = valueRounded + units[ umin ][ 1 ];
      umin--;

      while ( incr < 1 * units[ umin + 1 ][ 0 ] && umin > -1 ) {

        first = false;
        value = ( value - valueRounded ) * units[ umin + 1 ][ 0 ] / units[ umin ][ 0 ];
        valueRounded = Math.round( value );
        text += " " + valueRounded + units[ umin ][ 1 ];
        umin--;
      }

      return text;
    },

    getExponentialFactor: function() {
      return this.options.exponentialFactor;
    },

    setExponentialFactor: function( value ) {
      this.options.exponentialFactor = value;
    },

    setExponentialLabelFactor: function( value ) {
      this.options.exponentialLabelFactor = value;
    },

    getExponentialLabelFactor: function() {
      return this.options.exponentialLabelFactor;
    },

    setLabel: function( value ) {
      this.options.labelValue = value;
      return this;
    },

    getLabel: function() {
      return this.options.labelValue;
    },

    setShift: function( shift, totalDimension ) {
      this.shift = shift;
      this.totalDimension = totalDimension; // Width (axis y) or height (axis x) of the axis.
      this._setShift();
    },

    getShift: function() {
      return this.shift;
    },

    setTickPosition: function( pos ) {
      switch ( pos ) {
        case 3:
        case 'outside':
          pos = 3;
          break;

        case 2:
        case 'centered':
          pos = 2;
          break;

        default:
        case 1:
        case 'inside':
          pos = 1;
          break;
      }

      this.options.tickPosition = pos;
      return this;
    },

    toggleGrids: function( bool ) {
      this.options.primaryGrid = bool;
      this.options.secondaryGrid = bool;
      return this;
    },

    togglePrimaryGrid: function( bool ) {
      this.options.primaryGrid = bool;
      return this;
    },

    toggleSecondaryGrid: function( bool ) {
      this.options.secondaryGrid = bool;
      return this;
    },

    doGridLine: function( primary, x1, x2, y1, y2 ) {
      var gridLine = document.createElementNS( this.graph.ns, 'line' );
      gridLine.setAttribute( 'shape-rendering', 'crispEdges' );
      gridLine.setAttribute( 'y1', y1 );
      gridLine.setAttribute( 'y2', y2 );
      gridLine.setAttribute( 'x1', x1 );
      gridLine.setAttribute( 'x2', x2 );

      gridLine.setAttribute( 'stroke', primary ? this.getColorPrimaryGrid() : this.getColorSecondaryGrid() );
      this.groupGrids.appendChild( gridLine );
    },

    getColorPrimaryGrid: function() {
      return '#c0c0c0';
    },

    getColorSecondaryGrid: function() {
      return '#f0f0f0';
    },

    setTickContent: function( dom, val, options ) {
      if ( !options ) options = {};

      if ( options.overwrite || !options.exponential )
        dom.textContent = options.overwrite || this.valueToText( val );
      else {
        var log = Math.round( Math.log( val ) / Math.log( 10 ) );
        var unit = Math.floor( val * Math.pow( 10, -log ) );

        dom.textContent = ( unit != 1 ) ? unit + "x10" : "10";
        var tspan = document.createElementNS( this.graph.ns, 'tspan' );
        tspan.textContent = log;
        tspan.setAttribute( 'font-size', '0.7em' );
        tspan.setAttribute( 'dy', -3 );
        dom.appendChild( tspan );
      }

      if ( options.fontSize ) {
        dom.setAttribute( 'font-size', options.fontSize );
      }
    },

    removeSerie: function( serie ) {
      this.series.splice( this.series.indexOf( serie ), 1 );
    },

    killSeries: function( noRedraw ) {
      for ( var i = 0; i < this.series.length; i++ ) {
        this.series[ i ].kill( noRedraw );
      }
      this.series = [];
    },

    removeSeries: function() {
      this.killSeries();
    },

    handleMouseOutLocal: function( x, y, e ) {
      for ( var i = 0, l = this.series.length; i < l; i++ )
        this.series[ i ].hideTrackingMarker();
    }
  }

  return GraphAxis;

} );