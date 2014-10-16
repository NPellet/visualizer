define( [ 'jquery', './graph.axis.x', './graph.axis.y',  './graph.axis.x.broken', './graph.axis.y.broken', './graph.xaxis.time', './graph.legend', './dynamicdepencies' ], function( $, GraphXAxis, GraphYAxis, GraphXAxisBroken, GraphYAxisBroken, GraphXAxisTime, GraphLegend, DynamicDepencies ) {

  "use strict";

  var _availableAxes = {

    def: {
      x: GraphXAxis,
      y: GraphYAxis
    },

    broken: {
      x: GraphXAxisBroken,
      y: GraphYAxisBroken
    },

    time: {
      x: GraphXAxisTime
    }
  };

  var graphDefaults = {

    title: '',

    paddingTop: 30,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,

    close: {
      left: true,
      right: true,
      top: true,
      bottom: true
    },

    fontSize: 12,
    fontFamily: 'Myriad Pro, Helvetica, Arial',

    plugins: [],
    pluginAction: {},
    wheel: {},
    dblclick: {},

    dynamicDependencies: {
      'plugin': './plugins/',
      'serie': './series/',
      'shapes': './shapes/'
    },

    series: [ 'line' ]
  };

  var Graph = function( dom, options, axis, callback ) {

    var self = this;
    this._creation = Date.now() + Math.random();

    if ( typeof dom == "string" ) {
      dom = document.getElementById( dom );
    }

    if ( !dom || !dom.appendChild ) {
      throw "The DOM has not been defined";
    }

    if ( typeof axis == "function" ) {
      callback = axis;
      axis = false;
    }

    if ( typeof options == "function" ) {
      callback = options;
      options = {};

    }

    this.options = $.extend( {}, graphDefaults, options );
    this.axis = {
      left: [],
      top: [],
      bottom: [],
      right: []
    };

    this.shapes = [];
    this.shapesLocked = false;

    this.ns = 'http://www.w3.org/2000/svg';
    this.nsxlink = "http://www.w3.org/1999/xlink";
    this.series = [];
    this._dom = dom;
    // DOM

    this._doDom();

    var w, h;
    if( dom.style.width && dom.style.width.indexOf("%") == -1 ) {
      w = parseInt( dom.style.width.replace('px', '') );
    } else {
       w = $( dom ).width();
    }


    if( dom.style.height && dom.style.height.indexOf("%") == -1 ) {
      h = parseInt( dom.style.height.replace('px', '') );
    } else {
      h = $( dom ).height();
    }
    


    this.setSize( w, h );
    this._resize();
    _registerEvents( this );

    this.dynamicLoader = new DynamicDepencies();
    this.dynamicLoader.configure( this.options.dynamicDependencies );

    this.trackingLines = {
      id: 0,
      current: false,
      dasharray: [ false, "5, 5", "5, 1", "1, 5" ],
      currentDasharray: [],
      vertical: [],
      horizontal: []
    };

    this.shapeHandlers = {
      mouseDown: [],
      mouseUp: [],
      mouseMove: [],
      mouseOver: [],
      mouseOut: [],
      beforeMouseMove: [],
      onChange: [],
      onCreated: [],
      onResizing: [],
      onMoving: [],
      onAfterResized: [],
      onAfterMoved: [],
      onSelected: [],
      onUnselected: [],
      onRemoved: []
    };

    this.pluginsReady = $.Deferred();
    this.seriesReady = $.Deferred();

    this.currentAction = false;

    if ( callback ) {
      $.when( this.pluginsReady, this.seriesReady ).then( function() {
        callback( self )
      } );
    }

    var funcName;
    if ( axis ) {
      for ( var i in axis ) {
        for ( var j = 0, l = axis[ i ].length; j < l; j++ ) {

          switch ( i ) {

            case 'top':
              this.getTopAxis( j, axis[ i ][ j ]);
              break;
            case 'bottom':
              this.getBottomAxis( j, axis[ i ][ j ]);
              break;
            case 'left':
              this.getLeftAxis( j, axis[ i ][ j ]);
              break;
            case 'right':
              this.getRightAxis( j, axis[ i ][ j ]);
              break;
          }
        }
      }
    }

    this._pluginsInit();
    this._seriesInit();
  }

  Graph.prototype = {

    setAttributeTo: function( to, params, ns ) {
      var i;

      if ( ns ) {
        for ( i in params ) {
          to.setAttributeNS( ns, i, params[ i ] );
        }
      } else {
        for ( i in params ) {
          to.setAttribute( i, params[ i ] );
        }
      }
    },

    _doDom: function() {

      // Create SVG element, set the NS
      this.dom = document.createElementNS( this.ns, 'svg' );
      this.dom.setAttributeNS( "http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink" );
      //this.dom.setAttributeNS(this.ns, 'xmlns:xlink', this.nsxml);	
      this.setAttributeTo( this.dom, {
        'xmlns': this.ns,
        'font-family': this.options.fontFamily,
        'font-size': this.options.fontSize
      } );

      this._dom.appendChild( this.dom );

      this._dom.setAttribute( 'tabindex', 1 );

      this._dom.style.outline = "none";

      this.defs = document.createElementNS( this.ns, 'defs' );
      this.dom.appendChild( this.defs );

      this.rectEvent = document.createElementNS( this.ns, 'rect' );
      this.setAttributeTo( this.rectEvent, {
        'pointer-events': 'fill',
        'fill': 'transparent'
      } );
      this.dom.appendChild( this.rectEvent );

      // Handling graph title
      this.domTitle = document.createElementNS( this.ns, 'text' );
      this.setTitle( this.options.title );
      this.setAttributeTo( this.domTitle, {
        'text-anchor': 'middle',
        'y': 20
      } );
      this.dom.appendChild( this.domTitle );
      //

      this.graphingZone = document.createElementNS( this.ns, 'g' );
      this.setAttributeTo( this.graphingZone, {
        'transform': 'translate(' + this.options.paddingLeft + ', ' + this.options.paddingTop + ')'
      } );
      this.dom.appendChild( this.graphingZone );

      /*	this.shapeZoneRect = document.createElementNS(this.ns, 'rect');
			//this.shapeZoneRect.setAttribute('pointer-events', 'fill');
			this.shapeZoneRect.setAttribute('fill', 'transparent');
			this.shapeZone.appendChild(this.shapeZoneRect);
		*/
      this.axisGroup = document.createElementNS( this.ns, 'g' );
      this.graphingZone.appendChild( this.axisGroup );

      this.plotGroup = document.createElementNS( this.ns, 'g' );
      this.graphingZone.appendChild( this.plotGroup );

      // 5 September 2014. I encountered a case here shapeZone must be above plotGroup
      this.shapeZone = document.createElementNS( this.ns, 'g' );
      this.graphingZone.appendChild( this.shapeZone );

      this._makeClosingLines();

      this.clip = document.createElementNS( this.ns, 'clipPath' );
      this.clip.setAttribute( 'id', '_clipplot' + this._creation )
      this.defs.appendChild( this.clip );

      this.clipRect = document.createElementNS( this.ns, 'rect' );
      this.clip.appendChild( this.clipRect );
      this.clip.setAttribute( 'clipPathUnits', 'userSpaceOnUse' );

      this.markerArrow = document.createElementNS( this.ns, 'marker' );
      this.markerArrow.setAttribute( 'viewBox', '0 0 10 10' );
      this.markerArrow.setAttribute( 'id', 'arrow' + this._creation );
      this.markerArrow.setAttribute( 'refX', '6' );
      this.markerArrow.setAttribute( 'refY', '5' );
      this.markerArrow.setAttribute( 'markerUnits', 'strokeWidth' );
      this.markerArrow.setAttribute( 'markerWidth', '8' );
      this.markerArrow.setAttribute( 'markerHeight', '6' );
      this.markerArrow.setAttribute( 'orient', 'auto' );
      //this.markerArrow.setAttribute('fill', 'context-stroke');
      //this.markerArrow.setAttribute('stroke', 'context-stroke');

      var pathArrow = document.createElementNS( this.ns, 'path' );
      pathArrow.setAttribute( 'd', 'M 0 0 L 10 5 L 0 10 z' );
      pathArrow.setAttribute( 'fill', 'context-stroke' );
      this.markerArrow.appendChild( pathArrow );

      this.defs.appendChild( this.markerArrow );

      this.vertLineArrow = document.createElementNS( this.ns, 'marker' );
      this.vertLineArrow.setAttribute( 'viewBox', '0 0 10 10' );
      this.vertLineArrow.setAttribute( 'id', 'verticalline' + this._creation );
      this.vertLineArrow.setAttribute( 'refX', '0' );
      this.vertLineArrow.setAttribute( 'refY', '5' );
      this.vertLineArrow.setAttribute( 'markerUnits', 'strokeWidth' );
      this.vertLineArrow.setAttribute( 'markerWidth', '20' );
      this.vertLineArrow.setAttribute( 'markerHeight', '10' );
      this.vertLineArrow.setAttribute( 'orient', 'auto' );
      //this.vertLineArrow.setAttribute('fill', 'context-stroke');
      //this.vertLineArrow.setAttribute('stroke', 'context-stroke');
      this.vertLineArrow.setAttribute( 'stroke-width', '1px' );

      var pathVertLine = document.createElementNS( this.ns, 'path' );
      pathVertLine.setAttribute( 'd', 'M 0 -10 L 0 10' );
      pathVertLine.setAttribute( 'stroke', 'black' );

      this.vertLineArrow.appendChild( pathVertLine );

      this.defs.appendChild( this.vertLineArrow );

      this.plotGroup.setAttribute( 'clip-path', 'url(#_clipplot' + this._creation + ')' );

      this.bypassHandleMouse = false;
    },

    setOption: function( name, val ) {
      this.options[ name ] = val;
    },

    kill: function() {
      this._dom.removeChild( this.dom );

    },

    _getXY: function( e ) {

      var x = e.clientX,
        y = e.clientY;

      if ( e.offsetX !== undefined && e.offsetY !== undefined ) {

        return {
          x: e.offsetX,
          y: e.offsetY
        };
      }

      y = e.clientY;

      var pos = this.offsetCached || $( this._dom ).offset();

      x -= pos.left - window.scrollX;
      y -= pos.top - window.scrollY;

      return {
        x: x,
        y: y
      };
    },

    cacheOffset: function() {
      this.offsetCached = $( this._dom ).offset();
    },

    uncacheOffset: function() {
      this.offsetCached = false;
    },

    focus: function()  {
      this._dom.focus();
    },

    isPluginAllowed: function( e, plugin ) {

      if ( this.forcedPlugin == plugin ) {
        return true;
      }

      var act = this.options.pluginAction[ plugin ] || plugin,
        shift = e.shiftKey,
        ctrl = e.ctrlKey;

      if ( act.shift === undefined ) {
        act.shift = false;
      }

      if ( act.ctrl === undefined ) {
        act.ctrl = false;
      }

      if ( shift !== act.shift ) {
        return false;
      }

      if ( ctrl !== act.ctrl ) {
        return false;
      }

      return true;
    },

    forcePlugin: function( plugin ) {
      this.forcedPlugin = plugin;
    },

    unforcePlugin: function() {
      this.forcedPlugin = false;
    },

    elementMoving: function( movingElement ) {
      this.bypassHandleMouse = movingElement;
    },

    _resetAxes: function() {

      while ( this.axisGroup.firstChild ) {
        this.axisGroup.removeChild( this.axisGroup.firstChild );
      }
      this.axis.left = [];
      this.axis.right = [];
      this.axis.bottom = [];
      this.axis.top = [];
    },

    _applyToAxis: {
      'string': function( type, func, params ) {
        //		params.splice(1, 0, type);

        for ( var i = 0; i < this.axis[ type ].length; i++ ) {
          this.axis[ type ][ i ][ func ].apply( this.axis[ type ][ i ], params );
        }
      },

      'function': function( type, func, params ) {
        for ( var i = 0; i < this.axis[ type ].length; i++ ) {
          func.call( this, this.axis[ type ][ i ], type );
        }
      }
    },

    _applyToAxes: function( func, params, tb, lr ) {
      var ax = [],
        i = 0,
        l;

      if ( tb || tb == undefined ) {
        ax.push( 'top' );
        ax.push( 'bottom' );
      }
      if ( lr || lr == undefined ) {
        ax.push( 'left' );
        ax.push( 'right' );
      }

      for ( l = ax.length; i < l; i++ ) {
        this._applyToAxis[ typeof func ].call( this, ax[ i ], func, params );
      }
    },

    setWidth: function( width, skipResize ) {
      this.width = width;

      if ( !skipResize )
        this._resize();
    },

    getWidth: function() {
      return this.width;
    },

    setHeight: function( height, skipResize ) {
      this.height = height;

      if ( !skipResize )
        this._resize();
    },

    getHeight: function() {
      return this.height;
    },

    resize: function( w, h ) {

      this.setSize( w, h );
      this._resize();
    },

    setSize: function( w, h ) {

      this.setWidth( w, true );
      this.setHeight( h, true );

      this.getDrawingHeight();
      this.getDrawingWidth();

    },

    getDom: function() {
      return this.dom;
    },

    getXAxis: function( num, options ) {
      if ( this.axis.top.length > 0 && this.axis.bottom.length == 0 ) {
        return this.getTopAxis( num, options );
      }

      return this.getBottomAxis( num, options );
    },

    getYAxis: function( num, options ) {

      if ( this.axis.right.length > 0 && this.axis.left.length == 0 ) {
        return this.getRightAxis( num, options );
      }

      return this.getLeftAxis( num, options );
    },

    getTopAxis: function( num, options ) {
      return _getAxis( this, num, options, 'top' );
    },

    getBottomAxis: function( num, options ) {
      return _getAxis( this, num, options, 'bottom' );
    },

    getLeftAxis: function( num, options ) {
      return _getAxis( this, num, options, 'left' );
    },

    getRightAxis: function( num, options ) {
      return _getAxis( this, num, options, 'right' );
    },

    setBottomAxisAsTime: function( num, options ) {
      throw "Method deprecated. Create your axis with { type: 'time' } as options instead";
      /*options = options || {};
      options.type = 'time';
      return _getAxis( this, num, options, 'bottom' );*/

    },

    setXAxis: function( axis, num ) {
      this.setBottomAxis( axis, num );
    },
    setYAxis: function( axis, num ) {
      this.setLeftAxis( axis, num );
    },

    setLeftAxis: function( axis, num ) {
      num = num || 0;
      this.axis.left[ num ] = axis;
    },
    setRightAxis: function( axis, num ) {
      num = num || 0;
      this.axis.right[ num ] = axis;
    },
    setTopAxis: function( axis, num ) {
      num = num || 0;
      this.axis.top[ num ] = axis;
    },
    setBottomAxis: function( axis, num ) {
      num = num || 0;
      this.axis.bottom[ num ] = axis;
    },

    getPaddingTop: function() {
      return this.options.paddingTop;
    },

    getPaddingLeft: function() {
      return this.options.paddingLeft;
    },

    getPaddingBottom: function() {
      return this.options.paddingTop;
    },

    getPaddingRight: function() {
      return this.options.paddingRight;
    },

    // Title
    setTitle: function( title ) {
      this.options.title = title;
      this.domTitle.textContent = title;
    },

    displayTitle: function() {
      this.domTitle.setAttribute( 'display', 'inline' );
    },

    hideTitle: function() {
      this.domTitle.setAttribute( 'display', 'none' );
    },

    getDrawingHeight: function( useCache ) {
      if ( useCache && this.innerHeight )
        return this.innerHeight;
      var height = this.height - this.options.paddingTop - this.options.paddingBottom;
      return ( this.innerHeight = height );
    },

    getDrawingWidth: function( useCache ) {
      if ( useCache && this.innerWidth )
        return this.innerWidth;
      var width = this.width - this.options.paddingLeft - this.options.paddingRight;
      return ( this.innerWidth = width );
    },

    getBoundaryAxis: function( axis, xy, minmax ) {

      var valSeries = this.getBoundaryAxisFromSeries( axis, xy, minmax );
    //  var valShapes = this.getBoundaryAxisFromShapes( axis, xy, minmax );
      return valSeries;
      //return Math[ minmax ]( valSeries, valShapes );

    },



    getBoundaryAxisFromShapes: function( axis, xy, minmax ) {

      var
        x = xy == 'x',
        i = 0,
         min = minmax == 'min',
        l = this.shapes.length,
        val = minmax == 'min' ? Infinity : - Infinity,
        func = x ? [ 'getMinX', 'getMaxX' ] : [ 'getMinY', 'getMaxY' ],
        func2use = func[ min ? 0 : 1 ],
        funcGetAxis = x ? 'getXAxis' : 'getYAxis'

      for( ; i < l ; i ++ ) {
        if( shape[ funcGetAxis ]() == axis && shape[ func2use ] ) {
          val = Math[ minmax ]( val, shape[ func2use ]( ) );  
        }
      }
      return val;

    },

    getBoundaryAxisFromSeries: function( axis, xy, minmax ) {
      var x = xy == 'x',
        min = minmax == 'min',
        val,
        func = x ? [ 'getMinX', 'getMaxX' ] : [ 'getMinY', 'getMaxY' ],
        func2use = func[ min ? 0 : 1 ],
        currentSerie,
        serie,
        series,
        serieValue,
        i,
        l;

      val = min ? Number.MAX_VALUE : Number.MIN_VALUE;
      series = this.getSeriesFromAxis( axis, true );

      for ( i = 0, l = series.length; i < l; i++ ) {

        serie = series[ i ];

        if ( !serie.isShown() ) {
          continue;
        }

        serieValue = serie[ func2use ]();

        val = Math[ minmax ]( val, serieValue );

        if ( val == serieValue && currentSerie ) {
          currentSerie.isMinOrMax( false, xy, minmax );
          currentSerie = serie;
          serie.isMinOrMax( true, xy, minmax );
        }
      }

      return val;
    },

    getSeriesFromAxis: function( axis, selfSeries ) {
      var series = [],
        i = this.series.length - 1;
      for ( ; i >= 0; i-- ) {
        if ( this.series[ i ].getXAxis() == axis || this.series[ i ].getYAxis() == axis ) {
          series.push( this.series[ i ] );
        }
      }

      if ( series ) {

        for ( i = 0; i < axis.series.length; i++ ) {
          series.push( axis.series[ i ] );
        }
      }

      return series;
    },

    _resize: function() {

      if ( !this.width || !this.height ) {
        return;
      }

      this.sizeSet = true;
      this.dom.setAttribute( 'width', this.width );
      this.dom.setAttribute( 'height', this.height );
      this.domTitle.setAttribute( 'x', this.width / 2 );

      refreshDrawingZone( this );
    },

    canRedraw: function() {
      return ( this.width && this.height );
    },

    redraw: function( noX, noY ) {

      if ( !this.canRedraw() ) {
        return;
      }

      if ( !this.sizeSet ) {

        this._resize();

      } else {

        refreshDrawingZone( this, noX, noY );
      }

      return true;
    },

    /*
     *	Updates the min and max value of the axis according to the data only
     *	Does not perform autoscale
     *	But we need to keep track of the data min/max in case of an autoAxis.
     */
    updateAxes: function() {
      this._updateAxes();
    },

    _updateAxes: function() {

      var axisvars = [ 'bottom', 'top', 'left', 'right' ],
        axis,
        j,
        l,
        i,
        xy;

      this.refreshMinOrMax();

      for ( j = 0, l = axisvars.length; j < l; j++ ) {

        for ( i = this.axis[ axisvars[ j ] ].length - 1; i >= 0; i-- ) {

          axis = this.axis[ axisvars[ j ] ][ i ];
          xy = j < 2 ? 'x' : 'y';

          if ( axis.disabled ) {
            continue;
          }

          //console.log( axisvars[ j ], this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'min'), this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'max') );
          axis.setMinValueData( this.getBoundaryAxis( this.axis[ axisvars[ j ] ][ i ], xy, 'min' ) );
          axis.setMaxValueData( this.getBoundaryAxis( this.axis[ axisvars[ j ] ][ i ], xy, 'max' ) );

        }
      }
    },

    // Repaints the axis and series

    autoscaleAxes: function() {
      this._applyToAxes( "setMinMaxToFitSeries", null, true, true );
      this.redraw();
    },

    refreshMinOrMax: function() {
      var i = this.series.length - 1;
      for ( ; i >= 0; i-- ) { // Let's remove the serie from the stack
        this.series[ i ].isMinOrMax( false );
      }
    },

    newSerie: function( name, options, type, callback ) {

      var self = this;

      if ( typeof type == "function" ) {
        type = "line";
        callback = type;
      }

      if ( !type ) {
        type = "line";
      }

      var serie = makeSerie( this, name, options, type, function( serie ) {

        self.series.push( serie );

        if ( self.legend ) {
          self.legend.update();
        }

        if ( callback ) {
          callback( serie );
        }

      } );

      return serie;
    },

    getSerie: function( name ) {
      if ( typeof name == 'number' ) {
        return this.series[ name ];
      }
      var i = 0,
        l = this.series.length;

      for ( ; i < l; i++ ) {

        if ( this.series[ i ].getName() == name ) {

          return this.series[ i ];

        }
      }
    },

    getSeries: function() {
      return this.series;
    },

    drawSerie: function( serie ) {

      if ( !serie.draw ) {
        throw "Serie has no method draw";
      }

      serie.draw();
    },

    resetSeries: function() {
      for ( var i = 0; i < this.series.length; i++ ) {
        this.series[ i ].kill( true );
      }
      this.series = [];
    },

    drawSeries: function() {

      if ( !this.width || !this.height ) {
        return;
      }

      var i = this.series.length - 1;
      for ( ; i >= 0; i-- ) {

        if ( this.series[  i ].isShown() ) {
          this.series[ i ].draw();
        }
      }
    },

    _removeSerie: function( serie ) {

      this.series.splice( this.series.indexOf( serie ), 1 );

    },

    selectSerie: function( serie ) {

      if ( this.selectedSerie == serie ) {
        return;
      }

      if ( this.selectedSerie ) {
        this.selectedSerie.unselect();
      }

      this.selectedSerie = serie;
      this.triggerEvent( 'onSelectSerie', serie );
      serie.select();
    },

    unselectSerie: function( serie ) {

      serie.unselect();
      this.selectedSerie = false;
      this.triggerEvent( 'onUnselectSerie', serie );

    },

    getSelectedSerie: function() {
      return this.selectedSerie;
    },

    /*
		checkMinOrMax: function(serie) {
			var xAxis = serie.getXAxis();
			var yAxis = serie.getYAxis();

			var minX = serie.getMinX(),
				maxX = serie.getMaxX(),
				minY = serie.getMinY(),
				maxY = serie.getMaxY(),
				isMinMax = false;

			if(minX <= xAxis.getMinValue()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'x', 'min');
			}

			if(maxX >= xAxis.getMaxValue()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'x', 'max');
			}

			if(minY <= yAxis.getMinValue()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'y', 'min');
			}

			if(maxX >= xAxis.getMaxValue()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'y', 'max');
			}

			return isMinMax;
		},
*/

    makeToolbar: function( toolbarData ) {

      var self = this,
        deferred = $.Deferred();

      this.dynamicLoader.load( 'util', './graph.toolbar', function( toolbar ) {

        self.toolbar = new toolbar( self, toolbarData );
        deferred.resolve( self.toolbar );
      } );

      return deferred;
    },

    newShape: function( shapeData, events, mute ) {

      var self = this,
        response,
        deferred = $.Deferred();

      shapeData.id = Math.random();

      if ( ! mute ) {

        if ( false === ( response = this.triggerEvent( 'onBeforeNewShape', shapeData ) ) ) {
          return false;
        }
      }



      if ( response ) {
        shapeData = response;
      }

      var callback = function( shapeConstructor ) {

        var shape = new shapeConstructor( self, shapeData.shapeOptions );

        //shape.setSerie( self.getSerie( 0 ) );

        if ( !shape ) {
          return;
        }

        shape.setOriginalData( shapeData, events );
        if ( shape.data ) {
          shape.data.id = self.id;
        }

        if ( shapeData.fillColor ) {
          shape.set( 'fillColor', shapeData.fillColor );
        }

        if ( shapeData.strokeColor ) {
          shape.set( 'strokeColor', shapeData.strokeColor );
        }

        if ( shapeData.strokeWidth ) {
          shape.set( 'strokeWidth', shapeData.strokeWidth || ( shapeData.strokeColor ? 1 : 0 ) );
        }

        if ( shapeData.label ) {

          if ( !( shapeData.label instanceof Array ) ) {
            shapeData.label = [ shapeData.label ];
          }

          for ( var i = 0, l = shapeData.label.length; i < l; i++ ) {

            shape.set( 'labelPosition', shapeData.label[ i ].position, i );
            shape.set( 'labelColor', shapeData.label[ i ].color || 'black', i );
            shape.set( 'labelSize', shapeData.label[ i ].size, i );
            shape.set( 'labelAngle', shapeData.label[ i ].angle || 0, i );

            if ( shapeData.label[ i ].anchor ) {
              shape.set( 'labelAnchor', shapeData.label[ i ].anchor, i );
            }
          }

          shape.setLabelNumber( l );
        }

        /*switch(shape.type) {
					case 'rect':
					case 'rectangle':
						shape.set('width', shape.width);
						shape.set('height', shape.height);
					break;
				}*/
        self.shapes.push( shape );

        self.triggerEvent( 'onShapeMake', shape, shapeData );

        deferred.resolve( shape );

        if ( !mute ) {
          self.triggerEvent( 'onNewShape', shapeData );
        }

      }

      if ( shapeData.url ) {
        this.dynamicLoader.load( 'external', shapeData.url, callback );
      } else {
        this.dynamicLoader.load( 'shapes', 'graph.shape.' + shapeData.type, callback );
      }

      return deferred;
    },

    redrawShapes: function() {

      //this.graphingZone.removeChild(this.shapeZone);
      for ( var i = 0, l = this.shapes.length; i < l; i++ ) {
        this.shapes[ i ].redraw();
      }
      //this.graphingZone.insertBefore(this.shapeZone, this.axisGroup);
    },

    removeShapes: function() {
      for ( var i = 0, l = this.shapes.length; i < l; i++ ) {
        this.shapes[ i ].kill();
      }
      this.shapes = [];
    },

    _removeShape: function( shape ) {
      this.shapes.splice( this.shapes.indexOf( shape ), 1 );
    },

    _makeClosingLines: function() {

      this.closingLines = {};
      var els = [ 'top', 'bottom', 'left', 'right' ],
        i = 0,
        l = 4,
        line;
      for ( ; i < l; i++ ) {
        var line = document.createElementNS( this.ns, 'line' );
        line.setAttribute( 'stroke', 'black' );
        line.setAttribute( 'shape-rendering', 'crispEdges' );
        line.setAttribute( 'stroke-linecap', 'square' );
        line.setAttribute( 'display', 'none' );
        this.closingLines[ els[ i ] ] = line;
        this.graphingZone.appendChild( line );
      }
    },

    _seriesInit: function() {

      var self = this,
        series = this.options.series,
        nb = series.length;

      if ( nb == 0 ) {
        return self._seriesReady();
      }

      series.map( function( serie ) {

        self.dynamicLoader.load( 'serie', 'graph.serie.' + serie, function() {

          if ( ( --nb ) == 0 ) {

            self._seriesReady();
          }
        } );
      } )
    },

    _seriesReady: function() {

      this.seriesReady.resolve();
    },

    _pluginsExecute: function( funcName, args ) {

      //			Array.prototype.splice.apply(args, [0, 0, this]);

      for ( var i in this._plugins ) {

        if ( this._plugins[ i ] && this._plugins[ i ][ funcName ] ) {

          this._plugins[ i ][ funcName ].apply( this._plugins[ i ], args );

        }
      }
    },

    _pluginExecute: function( which, func, args ) {

      //Array.prototype.splice.apply( args, [ 0, 0, this ] );

      if ( this._plugins[ which ] && this._plugins[ which ][ func ] ) {

        this._plugins[ which ][ func ].apply( this._plugins[ which ], args );
      }
    },

    _pluginsInit: function() {

      var self = this,
        pluginsToLoad,
        nb;

      this._plugins = this._plugins || {};

      if ( Array.isArray( this.options.plugins ) ) {
        pluginsToLoad = this.options.plugins
      } else {
        pluginsToLoad = [];

        for ( var i in this.options.plugins ) {
          pluginsToLoad.push( i );
        }
      }

      if ( ( nb = pluginsToLoad.length ) == 0 ) {
        return self._pluginsReady();
      }

      this.pluginsToLoad = pluginsToLoad.length;

      this.dynamicLoader.load( 'plugin', pluginsToLoad, function( plugin, smth, filename ) {

        self._plugins[ filename ] = new plugin();
        self._plugins[ filename ].init( self, self.options.plugins[ filename ] || {}, filename );

        if ( ( --nb ) == 0 ) {

          self._pluginsReady();

        }

      } );
      //this._pluginsExecute('init', arguments);
    },

    getPlugin: function( pluginName ) {
      var self = this;
      return this.pluginsReady.then( function() {

        return self._plugins[ pluginName ] || false;
      } );
    },

    _pluginsReady: function() {
      this.pluginsReady.resolve();
    },

    triggerEvent: function() {
      var func = arguments[ 0 ],
        args = Array.prototype.splice.apply( arguments, [ 0, 1 ] );

      if ( typeof this.options[ func ] == "function" ) {
        return this.options[ func ].apply( this, arguments );
      }

      return;
    },

    selectShape: function( shape, mute ) {

      // Already selected. Returns false
      if ( this.selectedShape == shape ) {
        return false;
      }

      if ( this.selectedShape )  { // Only one selected shape at the time

        //console.log('Unselect shape');
        this.selectedShape.unselect();
      }

      if ( !mute ) {
        shape.select( true );
      }

      this.selectedShape = shape;
      this.triggerEvent( 'onShapeSelect', shape.data );
    },

    unselectShape: function() {

      if ( !this.selectedShape ) {
        return;
      }

      this.selectedShape.unselect();

      this.triggerEvent( 'onShapeUnselect', this.selectedShape.data );
      this.selectedShape = false;
    },

    makeLegend: function( options ) {
      this.legend = new GraphLegend( this, options );
      this.graphingZone.appendChild( this.legend.getDom() );
      this.legend.update();

      return this.legend;
    },

    updateLegend: function() {

      if ( !this.legend ) {
        return;
      }

      this.legend.update();
    },

    getPosition: function( value, relTo, xAxis, yAxis, onSerie ) {

      var parsed,
        pos = {
          x: false,
          y: false
        };

      if ( !xAxis ) {
        xAxis = this.getXAxis();
      }

      if ( !yAxis ) {
        yAxis = this.getYAxis();
      }

      if ( !value ) {
        return;
      }

      for ( var i in pos ) {

        var axis = i == 'x' ? xAxis : yAxis;

        if ( value[ i ] === undefined && ( ( value[ 'd' + i ] !== undefined && relTo === undefined ) || relTo === undefined ) ) {

          if ( i == 'x' ) {

            if ( value[ 'd' + i ] === undefined ) {
              continue;
            }

            pos[ i ] = relTo ? relTo[ i ] : axis.getPos( 0 );

          } else if ( value.x && onSerie ) {

            var val;

            if ( _parsePx( value.x ) !== false ) {
              console.warn( "You have defined x in px and not y. Makes no sense. Returning 0 for y" );
              pos[ i ] = 0;
            } else {

              var closest = onSerie.searchClosestValue( value.x );

              if ( !closest ) {
                console.warn( "Could not find y position. Returning 0 for y." );
                pos[ i ] = 0;
              } else {
                pos[ i ] = onSerie.getY( closest.yMin );
              }
            }
          }

        } else if ( value[ i ] !== undefined ) {

          pos[ i ] = this.getPx( value[ i ], axis );
        }

        if ( value[ 'd' + i ] !== undefined ) {

          var def = ( value[ i ] !== undefined || relTo == undefined || relTo[ i ] == undefined ) ? pos[ i ] : ( this._getPositionPx( relTo[ i ], true, axis ) || 0 );

          if ( i == 'y' && relTo && relTo.x && ! relTo.y ) {

            if( ! onSerie ) {
              throw "Error. No serie exists. Cannot find y value";
              return;
            }

            var closest = onSerie.searchClosestValue( relTo.x );
            if ( closest ) {
              def = onSerie.getY( closest.yMin );
            }

            //console.log( relTo.x, closest, onSerie.getY( closest.yMin ), def );
          }

          if ( ( parsed = _parsePx( value[ 'd' + i ] ) ) !== false ) { // dx in px => val + 10px

            pos[ i ] = def + parsed; // return integer (will be interpreted as px)

          } else if ( parsed = this._parsePercent( value[ 'd' + i ] ) ) {

            pos[ i ] = def + this._getPositionPx( parsed, true, axis ); // returns xx%

          } else if ( axis ) {

            pos[ i ] = def + axis.getRelPx( value[ 'd' + i ] ); // px + unittopx

          }
        }
      }

      return pos;
    },

    _getPositionPx: function( value, x, axis ) {

      var parsed;

      if ( ( parsed = _parsePx( value ) ) !== false ) {
        return parsed; // return integer (will be interpreted as px)
      }

      if ( ( parsed = this._parsePercent( value ) ) !== false ) {

        return parsed / 100 * ( x ? this.graph.getDrawingWidth() : this.graph.getDrawingHeight() );

      } else if ( axis ) {

        return axis.getPos( value );
      }
    },

    _parsePercent: function( percent ) {
      if ( percent && percent.indexOf && percent.indexOf( '%' ) > -1 ) {
        return percent;
      }
      return false;
    },

    deltaPosition: function( ref, delta, axis ) {

      var refPx, deltaPx;

      if ( ( refPx = _parsePx( ref ) ) !== false ) {

        if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
          return ( refPx + deltaPx ) + "px";
        } else {
          return ( refPx + axis.getRelPx( delta ) ) + "px";
        }
      } else {

        ref = this.getValPosition( ref, axis );

        if ( ( deltaPx = _parsePx( delta ) ) !== false ) {
          return ( ref + axis.getRelVal( deltaPx ) );
        } else {
          return ( ref + delta );
        }
      }
    },

    getValPosition: function( rel, axis ) {

      if( rel == 'max' ) {
        return axis.getMaxValue();
      }

      if( rel == 'min' ) {
        return axis.getMinValue();
      }

      return rel;
    },

    getPx: function( value, axis, rel ) {

      var parsed;

      if ( ( parsed = _parsePx( value ) ) !== false ) {

        return parsed; // return integer (will be interpreted as px)

      } else if ( parsed = this._parsePercent( value ) ) {

        return parsed; // returns xx%

      } else if ( axis ) {

        if ( value == "min" ) {

          return axis.getMinPx();

        } else if ( value == "max" ) {

          return axis.getMaxPx();

        } else if ( rel ) {

          return axis.getRelPx( value );
        } else {

          return axis.getPos( value );
        }
      }
    },

    getPxRel: function( value, axis ) {

      return this.getPx( value, axis, true );
    },

    contextListen: function( target, menuElements, callback ) {

      var self = this;

      if ( this.options.onContextMenuListen ) {
        return this.options.onContextMenuListen( target, menuElements, callback );
      }

      if ( !this.context ) {

        this.dynamicLoader.load( 'util', './util/context', function( Context ) {

          var instContext = new Context();

          instContext.init( self._dom );
          instContext.listen( target, menuElements, callback );

          self.context = instContext;
        } );

      } else {
        this.context.listen( target, menuElements, callback );
      }

    },

    lockShapes: function() {
      this.shapesLocked = true;
    },

    unlockShapes: function() {
      //		console.log('unlock');
      this.shapesLocked = false;
    }
  }

  function makeSerie( graph, name, options, type, callback ) {

    return graph.dynamicLoader.load( 'serie', 'graph.serie.' + type, function( Serie ) {

      var serie = new Serie();
      serie.init( graph, name, options );
      graph.plotGroup.appendChild( serie.groupMain );
      callback( serie );
      return serie;

    } );
  };

  function _parsePx( px ) {
    if ( px && px.indexOf && px.indexOf( 'px' ) > -1 ) {
      return parseInt( px.replace( 'px', '' ) );
    }
    return false;
  };

  function refreshDrawingZone( graph, noX, noY ) {

    var i, j, l, xy, min, max;
    var axisvars = [ 'bottom', 'top', 'left', 'right' ],
      shift = [ 0, 0, 0, 0 ],
      axis;

    graph._painted = true;
    graph.refreshMinOrMax();

    // Apply to top and bottom
    graph._applyToAxes( function( axis ) {

      if ( axis.disabled ) {
        return;
      }

      var axisIndex = axisvars.indexOf( arguments[ 1 ] );
      axis.setShift( shift[ axisIndex ] + axis.getAxisPosition(), axis.getAxisPosition() );
      shift[ axisIndex ] += axis.getAxisPosition(); // Allow for the extra width/height of position shift

    }, false, true, false );

    // Applied to left and right
    graph._applyToAxes( function( axis ) {

      if ( axis.disabled ) {
        return;
      }

      axis.setMinPx( shift[ 1 ] );
      axis.setMaxPx( graph.getDrawingHeight( true ) - shift[ 0 ] );

      // First we need to draw it in order to determine the width to allocate
      // graph is done to accomodate 0 and 100000 without overlapping any element in the DOM (label, ...)

      var drawn = axis.draw() || 0,
        axisIndex = axisvars.indexOf( arguments[ 1 ] ),
        axisDim = axis.getAxisPosition();

      // Get axis position gives the extra shift that is common
      axis.setShift( shift[ axisIndex ] + axisDim + drawn, drawn + axisDim );
      shift[ axisIndex ] += drawn + axisDim;

      axis.drawSeries();

    }, false, false, true );

    // Apply to top and bottom
    graph._applyToAxes( function( axis ) {

      if ( axis.disabled ) {
        return;
      }

      axis.setMinPx( shift[ 2 ] );
      axis.setMaxPx( graph.getDrawingWidth( true ) - shift[ 3 ] );
      axis.draw();

      axis.drawSeries();

    }, false, true, false );

    // Apply to all axis
    /*		graph._applyToAxes(function(axis) {
			axis.drawSeries();
		}, false, true, true);
*/

    _closeLine( graph, 'right', graph.getDrawingWidth( true ), graph.getDrawingWidth( true ), shift[ 1 ], graph.getDrawingHeight( true ) - shift[ 0 ] );
    _closeLine( graph, 'left', 0, 0, shift[ 1 ], graph.getDrawingHeight( true ) - shift[ 0 ] );
    _closeLine( graph, 'top', shift[ 2 ], graph.getDrawingWidth( true ) - shift[ 3 ], 0, 0 );
    _closeLine( graph, 'bottom', shift[ 2 ], graph.getDrawingWidth( true ) - shift[ 3 ], graph.getDrawingHeight( true ) - shift[ 0 ], graph.getDrawingHeight( true ) - shift[ 0 ] );

    graph.clipRect.setAttribute( 'y', shift[ 1 ] );
    graph.clipRect.setAttribute( 'x', shift[ 2 ] );
    graph.clipRect.setAttribute( 'width', graph.getDrawingWidth() - shift[ 2 ] - shift[ 3 ] );
    graph.clipRect.setAttribute( 'height', graph.getDrawingHeight() - shift[ 1 ] - shift[ 0 ] );

    graph.rectEvent.setAttribute( 'x', shift[ 1 ] );
    graph.rectEvent.setAttribute( 'y', shift[ 2 ] );
    graph.rectEvent.setAttribute( 'width', graph.getDrawingWidth() - shift[ 2 ] - shift[ 3 ] );
    graph.rectEvent.setAttribute( 'height', graph.getDrawingHeight() - shift[ 1 ] - shift[ 0 ] );

    /*
		graph.shapeZoneRect.setAttribute('x', shift[1]);
		graph.shapeZoneRect.setAttribute('y', shift[2]);
		graph.shapeZoneRect.setAttribute('width', graph.getDrawingWidth() - shift[2] - shift[3]);
		graph.shapeZoneRect.setAttribute('height', graph.getDrawingHeight() - shift[1] - shift[0]);
*/
    graph.shift = shift;
    graph.redrawShapes(); // Not sure this should be automatic here. The user should be clever.
  }

  function _registerEvents( graph ) {
    var self = graph;

    graph._dom.addEventListener( 'keydown', function( e ) {

      e.preventDefault();
      e.stopPropagation();

      if ( e.keyCode == 8 && self.selectedShape ) {
        self.selectedShape.kill();
      }

    } );

    graph.dom.addEventListener( 'mousemove', function( e ) {
      e.preventDefault();
      var coords = self._getXY( e );
      _handleMouseMove( self, coords.x, coords.y, e );
    } );

    graph.dom.addEventListener( 'mouseleave', function( e ) {

      _handleMouseLeave( self );
    } );

    graph.dom.addEventListener( 'mousedown', function( e ) {

      self.focus();

      e.preventDefault();
      if ( e.which == 3 || e.ctrlKey ) {
        return;
      }

      var coords = self._getXY( e );
      _handleMouseDown( self, coords.x, coords.y, e );

    } );

    graph.dom.addEventListener( 'mouseup', function( e ) {

      e.preventDefault();
      var coords = self._getXY( e );
      _handleMouseUp( self, coords.x, coords.y, e );

    } );

    graph.dom.addEventListener( 'dblclick', function( e ) {
      e.preventDefault();

      if ( self.clickTimeout ) {
        window.clearTimeout( self.clickTimeout );
      }

      var coords = self._getXY( e );
      self.cancelClick = true;
      _handleDblClick( self, coords.x, coords.y, e );
    } );

    graph.dom.addEventListener( 'click', function( e ) {

      // Cancel right click or Command+Click
      if ( e.which == 3 || e.ctrlKey )
        return;
      e.preventDefault();
      var coords = self._getXY( e );
      if ( self.clickTimeout )
        window.clearTimeout( self.clickTimeout );

      // Only execute the action after 200ms
      self.clickTimeout = window.setTimeout( function() {
        _handleClick( self, coords.x, coords.y, e );
      }, 200 );
    } );

    graph.dom.addEventListener( 'mousewheel', function( e ) {
      e.preventDefault();
      e.stopPropagation();
      var deltaY = e.wheelDeltaY || e.wheelDelta || -e.deltaY;
      _handleMouseWheel( self, deltaY, e );

      return false;
    } );

    graph.rectEvent.addEventListener( 'wheel', function( e ) {
      e.stopPropagation();
      e.preventDefault();
      var deltaY = e.wheelDeltaY || e.wheelDelta || -e.deltaY;
      _handleMouseWheel( self, deltaY, e );

      return false;
    } );
  }

  function _handleMouseDown( graph, x, y, e ) {

    var self = graph,
      $target = $( e.target ),
      shift = e.shiftKey,
      ctrl = e.ctrlKey,
      keyComb = graph.options.pluginAction,
      i;

    graph.unselectShape();

    if ( graph.forcedPlugin ) {

      graph.activePlugin = graph.forcedPlugin;
      graph._pluginExecute( graph.activePlugin, 'onMouseDown', [ graph, x, y, e ] );
      return;
    }

    for ( i in keyComb ) {

      if ( graph.isPluginAllowed( e, keyComb[ i ] ) ) {

        graph.activePlugin = i; // Lease the mouse action to the current action
        graph._pluginExecute( i, 'onMouseDown', [ graph, x, y, e ] );
        break;
      }
    }
  }

  function _handleMouseMove( graph, x, y, e ) {

    if ( graph.bypassHandleMouse ) {
      graph.bypassHandleMouse.handleMouseMove( e );
      return;
    }

    if ( graph._pluginExecute( graph.activePlugin, 'onMouseMove', [ graph, x, y, e ] ) ) {
      return;
    };

    //			return;

    graph._applyToAxes( 'handleMouseMove', [ x - graph.options.paddingLeft, e ], true, false );
    graph._applyToAxes( 'handleMouseMove', [ y - graph.options.paddingTop, e ], false, true );

    if ( !graph.activePlugin ) {
      var results = {};

      if ( graph.options.onMouseMoveData ) {

        for ( var i = 0; i < graph.series.length; i++ ) {

          results[ graph.series[ i ].getName() ] = graph.series[ i ].handleMouseMove( false, true );
        }

        graph.options.onMouseMoveData.call( graph, e, results );
      }
      return;
    }
  }

  function _handleDblClick( graph, x, y, e ) {
    //	var _x = x - graph.options.paddingLeft;
    //	var _y = y - graph.options.paddingTop;
    var pref = graph.options.dblclick;

    if ( !pref ||  !pref.type ) {
      return;
    }

    switch ( pref.type ) {

      case 'plugin':

        var plugin;

        if ( ( plugin = graph._plugins[ pref.plugin ] ) ) {

          plugin.onDblClick( graph, x, y, pref.options, e );
        }

        break;
    }
  }

  function _handleMouseUp( graph, x, y, e ) {

    if ( graph.bypassHandleMouse ) {
      graph.bypassHandleMouse.handleMouseUp( e );
      graph.activePlugin = false;
      return;
    }

    graph._pluginExecute( graph.activePlugin, 'onMouseUp', [ graph, x, y, e ] );
    graph.activePlugin = false;

  }

  function _handleClick( graph, x, y, e ) {

    if ( !graph.options.addLabelOnClick ) {
      return;
    }

    if ( graph.currentAction !== false ) {
      return;
    }

    for ( var i = 0, l = graph.series.length; i < l; i++ ) {
      graph.series[ i ].addLabelX( graph.series[ i ].getXAxis().getVal( x - graph.getPaddingLeft() ) );
    }
  }

  function _getAxis( graph, num, options, pos ) {

    var options = options || {};
    var inst;

    switch( options.type ) {

      case 'time':
        var axisInstance = _availableAxes.time;
      break;

      case 'broken':
        var axisInstance = _availableAxes.broken;
      break;

      default:
        var axisInstance = _availableAxes.def;
      break;
    }

    switch( pos ) {

      case 'top':
      case 'bottom':
        inst = axisInstance.x;
      break;

      case 'left':
      case 'right':
        inst = axisInstance.y;
      break;
    }
    
    num = num || 0;

    if ( typeof num == "object" ) {
      options = num;
      num = 0;
    }

    return graph.axis[ pos ][ num ] = graph.axis[ pos ][ num ] || new inst( graph, pos, options );
  }

  function _closeLine( graph, mode, x1, x2, y1, y2 ) {

    if ( graph.options.close === false ) {
      return;
    }

    var l = 0;

    graph.axis[ mode ].map( function( g ) {

      if ( g.isDisplayed() ) {
        l++;
      }
    } );

    if ( ( graph.options.close === true || graph.options.close[ mode ] ) && l == 0 ) {

      graph.closingLines[ mode ].setAttribute( 'display', 'block' );
      graph.closingLines[ mode ].setAttribute( 'x1', x1 );
      graph.closingLines[ mode ].setAttribute( 'x2', x2 );
      graph.closingLines[ mode ].setAttribute( 'y1', y1 );
      graph.closingLines[ mode ].setAttribute( 'y2', y2 );

    } else {

      graph.closingLines[ mode ].setAttribute( 'display', 'none' );

    }
  }

  function _handleMouseWheel( graph, delta, e ) {

    e.preventDefault();
    e.stopPropagation();

    if ( !graph.options.wheel.type ) {
      return;
    }

    switch ( graph.options.wheel.type ) {

      case 'plugin':

        var plugin;

        if ( plugin = graph._plugins[ graph.options.wheel.plugin ] ) {

          plugin.onMouseWheel( delta, e );
        }

        break;

      case 'toSeries':

        for ( var i = 0, l = graph.series.length; i < l; i++ ) {
          graph.series[ i ].onMouseWheel( delta, e );
        }

        break;

    }

    // Redraw not obvious at all !!
/*
    graph.redraw();
    graph.drawSeries( true );

    */
  }

  function _handleMouseLeave( graph ) {

    if ( graph.options.handleMouseLeave ) {
      graph.options.handleMouseLeave.call( this );

    }

  }

  return Graph;
} );