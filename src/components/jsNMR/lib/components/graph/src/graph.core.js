define([ 'jquery', './graph.axis.x','./graph.axis.y','./graph.legend', './dynamicdepencies'], function($,GraphXAxis,GraphYAxis,GraphLegend, DynamicDepencies) {

	"use strict";

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

		
		lineToZero: false,
		fontSize: 12,
		fontFamily: 'Myriad Pro, Helvetica, Arial',
		addLabelOnClick: false,
		onVerticalTracking: false,
		onHorizontalTracking: false,
		rangeLimitX: 10,
		rangeLimitY: 0,		

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

		if( typeof dom == "string" ) {
			dom = document.getElementById( dom );
		}

		if( ! dom || ! dom.appendChild ) {
			throw "The DOM has not been defined";
		}


		if( typeof axis == "function" ) {
			callback = axis;
			axis = false;
		}

		if( typeof options == "function" ) {
			callback = options;
			options = {};
			
		}

		
		this.options = $.extend({}, graphDefaults, options);
		this.axis = {left: [], top: [], bottom: [], right: []};

		this.shapes = [];
		this.shapesLocked = false;

		this.ns = 'http://www.w3.org/2000/svg';
		this.nsxlink = "http://www.w3.org/1999/xlink";
		this.series = [];
		this._dom = dom;
		// DOM
		this.doDom();

		this.setSize( $(dom).width(), $(dom).height() );
		this._resize();

		this.registerEvents();
		
		this.dynamicLoader = new DynamicDepencies();
		this.dynamicLoader.configure( this.options.dynamicDependencies );

		this.trackingLines = {
			id: 0,
			current: false,
			dasharray: [false, "5, 5", "5, 1", "1, 5"],
			currentDasharray: [],
			vertical: [],
			horizontal: []
		};


		this.shapeHandlers = {
			mouseDown: [],
			mouseUp: [],
			mouseMove: [],
			mouseOver: [],
			mouseOut: []
		};

		this.pluginsReady = $.Deferred();
		this.seriesReady = $.Deferred();

		this.currentAction = false;


		if( callback ) {
			$.when( this.pluginsReady, this.seriesReady ).then( function( ) { callback( self ) } );
		}

		var funcName;
		if( axis ) {
			for(var i in axis) {
				for(var j = 0, l = axis[i].length; j < l; j++) {
					switch(i) {
						case 'top': funcName = 'setTopAxis'; var axisInstance = new GraphXAxis(this, 'top', axis[i][j]); break;
						case 'bottom': funcName = 'setBottomAxis';  var axisInstance = new GraphXAxis(this, 'bottom', axis[i][j]); break;
						case 'left': funcName = 'setLeftAxis';  var axisInstance = new GraphYAxis(this, 'left', axis[i][j]);break;
						case 'right': funcName = 'setRightAxis';  var axisInstance = new GraphYAxis(this, 'right', axis[i][j]); break;
					}
					this[funcName](axisInstance, j);
				}
			}
		}

		this._pluginsInit();
		this._seriesInit();
	}

	Graph.prototype = {

		setAttributeTo: function(to, params, ns) {
			var i;

			if(ns) {
				for(i in params) {
					to.setAttributeNS(ns, i, params[i]);
				}
			} else {
				for(i in params) {
					to.setAttribute(i, params[i]);
				}
			}
		},

		doDom: function() {

			// Create SVG element, set the NS
			this.dom = document.createElementNS(this.ns, 'svg');
			this.dom.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			//this.dom.setAttributeNS(this.ns, 'xmlns:xlink', this.nsxml);	
			this.setAttributeTo(this.dom, {
				'xmlns': this.ns,
				'font-family': this.options.fontFamily,
				'font-size': this.options.fontSize 
			});
			
			this._dom.appendChild(this.dom);
			
			this._dom.setAttribute('tabindex', 1);

			this._dom.style.outline = "none";

			this.defs = document.createElementNS(this.ns, 'defs');
			this.dom.appendChild(this.defs);

			this.rectEvent = document.createElementNS(this.ns, 'rect');
			this.setAttributeTo(this.rectEvent, {
				'pointer-events': 'fill',
				'fill': 'transparent'
			});
			this.dom.appendChild(this.rectEvent);


			// Handling graph title
			this.domTitle = document.createElementNS(this.ns, 'text');
			this.setTitle(this.options.title);
			this.setAttributeTo(this.domTitle, {
				'text-anchor': 'middle',
				'y': 20
			});
			this.dom.appendChild(this.domTitle);
			//


			this.graphingZone = document.createElementNS(this.ns, 'g');
			this.setAttributeTo(this.graphingZone, {
				'transform': 'translate(' + this.options.paddingLeft + ', ' + this.options.paddingTop + ')'
			});
			this.dom.appendChild(this.graphingZone);

	
		/*	this.shapeZoneRect = document.createElementNS(this.ns, 'rect');
			//this.shapeZoneRect.setAttribute('pointer-events', 'fill');
			this.shapeZoneRect.setAttribute('fill', 'transparent');
			this.shapeZone.appendChild(this.shapeZoneRect);
		*/
			this.axisGroup = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.axisGroup);

			this.shapeZone = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.shapeZone);


			this.plotGroup = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.plotGroup);
			
			this._makeClosingLines();

			this.clip = document.createElementNS(this.ns, 'clipPath');
			this.clip.setAttribute('id', '_clipplot' + this._creation)
			this.defs.appendChild(this.clip);

			this.clipRect = document.createElementNS(this.ns, 'rect');
			this.clip.appendChild(this.clipRect);
			this.clip.setAttribute('clipPathUnits', 'userSpaceOnUse');


			this.markerArrow = document.createElementNS(this.ns, 'marker');
			this.markerArrow.setAttribute('viewBox', '0 0 10 10');
			this.markerArrow.setAttribute('id', 'arrow' + this._creation);
			this.markerArrow.setAttribute('refX', '0');
			this.markerArrow.setAttribute('refY', '5');
			this.markerArrow.setAttribute('markerUnits', 'strokeWidth');
			this.markerArrow.setAttribute('markerWidth', '4');
			this.markerArrow.setAttribute('markerHeight', '3');
			this.markerArrow.setAttribute('orient', 'auto');
			//this.markerArrow.setAttribute('fill', 'context-stroke');
			//this.markerArrow.setAttribute('stroke', 'context-stroke');

			var pathArrow = document.createElementNS(this.ns, 'path');
			pathArrow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
			pathArrow.setAttribute('fill', 'context-stroke');
			this.markerArrow.appendChild(pathArrow);

			this.defs.appendChild(this.markerArrow);

			this.vertLineArrow = document.createElementNS(this.ns, 'marker');
			this.vertLineArrow.setAttribute('viewBox', '0 0 10 10');
			this.vertLineArrow.setAttribute('id', 'verticalline' + this._creation);
			this.vertLineArrow.setAttribute('refX', '0');
			this.vertLineArrow.setAttribute('refY', '5');
			this.vertLineArrow.setAttribute('markerUnits', 'strokeWidth');
			this.vertLineArrow.setAttribute('markerWidth', '20');
			this.vertLineArrow.setAttribute('markerHeight', '10');
			this.vertLineArrow.setAttribute('orient', 'auto');
			//this.vertLineArrow.setAttribute('fill', 'context-stroke');
			//this.vertLineArrow.setAttribute('stroke', 'context-stroke');
			this.vertLineArrow.setAttribute('stroke-width', '1px');

			var pathVertLine = document.createElementNS(this.ns, 'path');
			pathVertLine.setAttribute('d', 'M 0 -10 L 0 10');
			pathVertLine.setAttribute('stroke', 'black');
			
			this.vertLineArrow.appendChild(pathVertLine);

			this.defs.appendChild(this.vertLineArrow);


			this.plotGroup.setAttribute('clip-path', 'url(#_clipplot' + this._creation + ')');

			this.bypassHandleMouse = false;
		},

		setOption: function(name, val) {
			this.options[name] = val;
		},

		kill: function() {
			this._dom.removeChild(this.dom);

		},

		getXY: function(e) {
			
			var x = e.clientX;
			var y = e.clientY;
			var pos = $(this._dom).offset();

			x -= pos.left - window.scrollX;
			y -= pos.top - window.scrollY;

			return {x: x, y: y};
		},

		registerEvents: function() {
			var self = this;

			this._dom.addEventListener( 'keydown', function( e ) {
		
				e.preventDefault();
				e.stopPropagation();
				
				if( e.keyCode == 8 && self.selectedShape ) {
					self.selectedShape.kill();
				}
/*
				if( e.keyCode == 16 && e.ctrlKey ) {
					self.linkingReveal();
				}
*/

			});

/*
			this._dom.addEventListener( 'keyup', function( e ) {

				e.preventDefault();
				e.stopPropagation();
				self.linkingHide();
			});*/



			this.dom.addEventListener('mousemove', function(e) {
				e.preventDefault();
				var coords = self.getXY(e);
				self.handleMouseMove(coords.x,coords.y,e);
			});

			this.dom.addEventListener('mousedown', function(e) {
				
				self.focus();

				e.preventDefault( );
				if( e.which == 3 || e.ctrlKey ) {
					return;
				}

				var coords = self.getXY( e );
				self.handleMouseDown( coords.x, coords.y, e );

			});

			this.dom.addEventListener('mouseup', function(e) {

				e.preventDefault( );
				var coords = self.getXY( e );
				self.handleMouseUp( coords.x, coords.y, e );

			});

			this.dom.addEventListener('dblclick', function(e) {
				e.preventDefault();
				
				if( self.clickTimeout ) {
					window.clearTimeout( self.clickTimeout );
				}

				var coords = self.getXY(e);
				self.cancelClick = true;
				self.handleDblClick(coords.x,coords.y,e);
			});

			this.dom.addEventListener('click', function(e) {

				// Cancel right click or Command+Click
				if(e.which == 3 || e.ctrlKey)
					return;
				e.preventDefault();
				var coords = self.getXY(e);
				if(self.clickTimeout)
					window.clearTimeout(self.clickTimeout);

				// Only execute the action after 200ms
				self.clickTimeout = window.setTimeout(function() {
					self.handleClick(coords.x,coords.y,e);
				}, 200);
			});

/*
			this._dom.setAttribute('tabindex', 2);
			console.log(this._dom);
			this._dom.addEventListener('click', function() {
				$(this._dom).focus();
			});
*/

/*
			this._dom.addEventListener('keydown', function(e) {
				
				var code = e.keyCode;
				if(code < 37 || code > 40)
					return;

				self.applyToAxes(function(axis, position) {
					var min = axis.getActualMin(),
						max = axis.getActualMax(),
						shift = (max - min) * 0.05 * (axis.isFlipped() ? -1 : 1) * ((code == 39 || code == 40) ? -1 : 1);
					axis.setCurrentMin(min + shift);
					axis.setCurrentMax(max + shift);
				}, code, (code == 39 || code == 37), (code == 40 || code == 38));
				self.refreshDrawingZone(true);
				self.drawSeries(true);
				// Left : 39
				// Down: 40
				// Right: 37
				// Top: 38

			});
*/
			this.rectEvent.addEventListener('mousewheel', function(e) {
				e.preventDefault();
				e.stopPropagation();
				var deltaY = e.wheelDeltaY || e.wheelDelta || - e.deltaY;
				self.handleMouseWheel(deltaY,e);	

				return false;
			});

			this.rectEvent.addEventListener('wheel', function(e) {
				e.stopPropagation();
				e.preventDefault();
				var deltaY = e.wheelDeltaY || e.wheelDelta || - e.deltaY;
				self.handleMouseWheel( deltaY, e );	
				
				return false;
			});
		},

		focus: function() {
			this._dom.focus();
		},

		allowPlugin: function( e, plugin ) {

			if( this.forcedPlugin == plugin ) {
				return true;
			}

			var act = this.options.pluginAction[ plugin ] || {},
				shift = e.shiftKey, 
				ctrl = e.ctrlKey;

			if(shift !== act.shift) {
				return false;
			}

			if(ctrl !== act.ctrl) {
				return false;
			}

			return true;
		},

		handleMouseDown: function( x, y, e ) {

			var self = this,
				$target = $(e.target), 
				shift = e.shiftKey, 
				ctrl = e.ctrlKey, 
				keyComb = this.options.pluginAction,
				i;

			this.unselectShape();

			if( this.forcedPlugin ) {

				this.activePlugin = this.forcedPlugin;
				this._pluginExecute( this.activePlugin, 'onMouseDown', [ this, x, y, e]);
				return;
			}


			for( i in keyComb ) {
				if( ! keyComb[i]._forced ) {

					if(shift !== keyComb[i].shift) {
						continue;
					}

					if(ctrl !== keyComb[i].ctrl) {
						continue;
					}
				}

				this.activePlugin = i; // Lease the mouse action to the current action

				this._pluginExecute(i, 'onMouseDown', [ this, x, y, e]);

				break;
			}
		},


		handleMouseMove: function( x, y, e ) {

			if( this.bypassHandleMouse ) {
				this.bypassHandleMouse.handleMouseMove(e);
				return;
			}
			
			if( this._pluginExecute(this.activePlugin, 'onMouseMove', [ this, x, y, e ]) ) {
				return;
			};

			return;

			this.applyToAxes('handleMouseMove', [x - this.options.paddingLeft, e], true, false);
			this.applyToAxes('handleMouseMove', [y - this.options.paddingTop, e], false, true);

			if(!this.activePlugin) {
				var results = {};
				
				if(this.options.onMouseMoveData) {

					for(var i = 0; i < this.series.length; i++) {
						results[this.series[i].getName()] = this.series[i].handleMouseMove(false, true);
					}

					this.options.onMouseMoveData(e, results);
				}
				return;
			}
		},

		forcePlugin: function( plugin ) {
			
			this.forcedPlugin = plugin;
		},

		unforcePlugin: function( ) {
			this.forcedPlugin = false;
		},

		handleMouseUp: function(x, y, e) {

			if(this.bypassHandleMouse) {
				this.bypassHandleMouse.handleMouseUp(e);
				this.activePlugin = false;
				return;
			}

			this._pluginExecute(this.activePlugin, 'onMouseUp', [ this, x, y, e ]);
			this.activePlugin = false;

		},

		handleMouseWheel: function(delta, e) {


			e.preventDefault();
			e.stopPropagation();

			if( ! this.options.wheel.type ) {
				return;
			}

			switch( this.options.wheel.type ) {

				case 'plugin':

					var plugin;

					if( plugin = this._plugins[ this.options.wheel.plugin ] ) {
						plugin.onMouseWheel( delta, e );
					}

				break;


				case 'toSeries':

					for(var i = 0, l = this.series.length; i < l; i++) {
						this.series[ i ].onMouseWheel(delta, e);
					}

				break;

			}

			this.redraw( );
			this.drawSeries( true );
		},

		handleClick: function(x, y, e) {
			
			if( ! this.options.addLabelOnClick ) {
				return;
			}

			if(this.currentAction !== false) {
				return;
			}

			for(var i = 0, l = this.series.length; i < l; i++) {
				this.series[i].addLabelX(this.series[i].getXAxis().getVal(x - this.getPaddingLeft()));
			}
		},

		shapeMoving: function( movingElement ) {
		
			this.bypassHandleMouse = movingElement;
		},

		shapeStopMoving: function() {
			this.bypassHandleMouse = false;
		},

		handleDblClick: function( x, y, e ) {
		//	var _x = x - this.options.paddingLeft;
		//	var _y = y - this.options.paddingTop;
			var pref = this.options.dblclick;

			if( ! pref || ! pref.type ) {
				return;
			}

			switch( pref.type ) {

				case 'plugin':

					var plugin;

					if( ( plugin = this._plugins[ pref.plugin ] ) ) {

						plugin.onDblClick( this, x, y, pref.options, e );
					}

				break;
			}
		},

		resetAxis: function() {

			while(this.axisGroup.firstChild) {
				this.axisGroup.removeChild(this.axisGroup.firstChild);
			}
			this.axis.left = [];
			this.axis.right = [];
			this.axis.bottom = [];
			this.axis.top = [];
		},

		resetSeries: function() {
			for(var i = 0; i < this.series.length; i++) {
				this.series[i].kill(true);	
			}
			this.series = [];
		},

		applyToAxis: {
			'string': function(type, func, params) {
		//		params.splice(1, 0, type);

				for(var i = 0; i < this.axis[type].length; i++) {
					this.axis[type][i][func].apply(this.axis[type][i], params);	
				}
			},

			'function': function(type, func, params) {
				for(var i = 0; i < this.axis[type].length; i++) {
					func.call(this, this.axis[type][i], type);
				}
			}
		},
		
		applyToAxes: function(func, params, tb, lr) {
			var ax = [], i = 0, l;

			if(tb || tb == undefined) {
				ax.push('top');
				ax.push('bottom');
			}
			if(lr || lr == undefined) {
				ax.push('left');
				ax.push('right');
			}

			for(l = ax.length; i < l; i++)
				this.applyToAxis[typeof func].call(this, ax[i], func, params);
		},


		setWidth: function(width, skipResize) {
			this.width = width;

			if(!skipResize)
				this._resize();
		},

		getWidth: function() {
			return this.width;
		},

		setHeight: function(height, skipResize) {
			this.height = height;

			if(!skipResize)
				this._resize();
		},

		getHeight: function() {
			return this.height;
		},

		resize: function(w, h) {

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

		applyStyleText: function(dom) {
//			dom.setAttribute('font-family', '"Myriad Pro", Arial, Serif');
//			dom.setAttribute('font-size', '12px');
		},

		getXAxis: function(num, options) {
			if(this.axis.top.length > 0 && this.axis.bottom.length == 0) {
				return this.getTopAxis(num, options);
			}

			return this.getBottomAxis(num, options);
		},

		getYAxis: function(num, options) {

			if(this.axis.right.length > 0 && this.axis.left.length == 0) {
				return this.getRightAxis(num, options);
			}

			return this.getLeftAxis(num, options);
		},

		_getAxis: function(num, options, inst, pos) {
			num = num || 0;
			if(typeof num == "object") {
				options = num;
				num = 0;
			}

			
			return this.axis[pos][num] = this.axis[pos][num] || new inst(this, pos, options);
		},

		getTopAxis: function(num, options) {
			return this._getAxis(num, options, GraphXAxis, 'top');
		},

		getBottomAxis: function(num, options) {
			return this._getAxis(num, options, GraphXAxis, 'bottom');
		},

		getLeftAxis: function(num, options) {
			return this._getAxis(num, options, GraphYAxis, 'left');
		},

		getRightAxis: function(num, options) {
			return this._getAxis(num, options, GraphYAxis, 'right');
		},

		setXAxis: function(axis, num) {
			this.setBottomAxis(axis, num);
		},
		setYAxis: function(axis, num) {
			this.setLeftAxis(axis, num);
		},

		setLeftAxis: function(axis, num) {
			num = num || 0;
			this.axis.left[num] = axis;
		},
		setRightAxis: function(axis, num) {
			num = num || 0;
			this.axis.right[num] = axis;
		},
		setTopAxis: function(axis, num) {
			num = num || 0;
			this.axis.top[num] = axis;
		},
		setBottomAxis: function(axis, num) {
			num = num || 0;
			this.axis.bottom[num] = axis;
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
		setTitle: function(title) {
			this.options.title = title;
			this.domTitle.textContent = title;
		},

		displayTitle: function() {
			this.domTitle.setAttribute('display', 'inline');
		},

		hideTitle: function() {
			this.domTitle.setAttribute('display', 'none');
		},

		drawSerie: function(serie) {
			serie.draw(this.getDrawingGroup());
		},


		getDrawingHeight: function(useCache) {
			if(useCache && this.innerHeight)
				return this.innerHeight;
			var height = this.height - this.options.paddingTop - this.options.paddingBottom;
			return (this.innerHeight = height);
		},

		getDrawingWidth: function(useCache) {
			if(useCache && this.innerWidth)
				return this.innerWidth;
			var width = this.width - this.options.paddingLeft - this.options.paddingRight;
			return (this.innerWidth = width);
		},

		getBoundaryAxisFromSeries: function(axis, xy, minmax) {
			var x = xy == 'x',
				min = minmax == 'min',
				val,
				func = x ? ['getMinX', 'getMaxX'] : ['getMinY', 'getMaxY'],
				func2use = func[min ? 0 : 1],
				currentSerie,
				serie,
				series,
				serieValue,
				i,
				l;

			val = min ? Number.MAX_VALUE : Number.MIN_VALUE;
			series = this.getSeriesFromAxis(axis, true);
			
			for(i = 0, l = series.length; i < l; i++) {

				serie = series[i];
				serieValue = serie[func2use]();

				val = Math[minmax](val, serieValue);

				if(val == serieValue && currentSerie) {
					currentSerie.isMinOrMax(false, xy, minmax);
					currentSerie = serie;
					serie.isMinOrMax(true, xy, minmax);
				}
			}
		
			return val;
		},

		getSeriesFromAxis: function(axis, selfSeries) {
			var series = [],
				i = this.series.length - 1;
			for(; i >= 0; i--)
				if(this.series[i].getXAxis() == axis || this.series[i].getYAxis() == axis)
					series.push(this.series[i]);

			if(selfSeries) {
				for(i = 0; i < axis.series.length; i++)
					series.push(axis.series[i])
			}

			return series;
		},

		_resize: function() {

			if( ! this.width || ! this.height) {
				return;
			}

			this.sizeSet = true;
			this.dom.setAttribute('width', this.width);
			this.dom.setAttribute('height', this.height);
			this.domTitle.setAttribute('x', this.width / 2);

			this.refreshDrawingZone();
		},

		canRedraw: function() {
			return (this.width && this.height);
		},

		redraw: function( noX, noY ) {

			if( ! this.canRedraw( ) ) {
				return;
			}

			if( ! this.sizeSet ) {

				this._resize( );

			} else {

				this.refreshDrawingZone( noX, noY );
			}

			return true;
		},

		updateAxes: function() {

			var axisvars = ['bottom', 'top', 'left', 'right'],
				axis,
				j,
				l,
				i,
				xy;

			this.refreshMinOrMax();

			for( j = 0, l = axisvars.length; j < l; j++) {

				for(i = this.axis[axisvars[j]].length - 1; i >= 0; i--) {

					axis = this.axis[ axisvars[ j ] ][ i ];
					xy = j < 2 ? 'x' : 'y';

					if( axis.disabled ) {
						continue;
					}
//console.log( axisvars[ j ], this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'min'), this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'max') );
					axis.setMinValueData( this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'min') );
					axis.setMaxValueData( this.getBoundaryAxisFromSeries( this.axis[ axisvars[ j ] ][ i ], xy, 'max') );

				}
			}
		},

		// Repaints the axis and series
		refreshDrawingZone: function( noX, noY ) {

			var i, j, l, xy, min, max;
			var axisvars = ['bottom', 'top', 'left', 'right'], shift = [0, 0, 0, 0], axis;

			this._painted = true;
			this.refreshMinOrMax();

			// Apply to top and bottom
			this.applyToAxes( function( axis ) {

				if( axis.disabled ) {
					return;
				}

				var axisIndex = axisvars.indexOf( arguments[ 1 ] );
				axis.setShift( shift[ axisIndex ] + axis.getAxisPosition(), axis.getAxisPosition( ) ); 
				shift[ axisIndex ] += axis.getAxisPosition(); // Allow for the extra width/height of position shift

			}, false, true, false );
	
	
			// Applied to left and right
			this.applyToAxes(function(axis) {

				if( axis.disabled ) {
					return;
				}

				axis.setMinPx( shift[ 1 ] );
				axis.setMaxPx( this.getDrawingHeight( true ) - shift[ 0 ] );

				// First we need to draw it in order to determine the width to allocate
				// This is done to accomodate 0 and 100000 without overlapping any element in the DOM (label, ...)

				var drawn = axis.draw( ) || 0,
					axisIndex = axisvars.indexOf( arguments[ 1 ] ),
					axisDim = axis.getAxisPosition( );

				// Get axis position gives the extra shift that is common
				axis.setShift(shift[axisIndex] + axisDim + drawn, drawn + axisDim);
				shift[ axisIndex ] += drawn + axisDim;

				axis.drawSeries();

			}, false, false, true);

		
			// Apply to top and bottom
			this.applyToAxes(function(axis) {
				
				if( axis.disabled ) {
					return;
				}

				axis.setMinPx( shift[ 2 ] );
				axis.setMaxPx( this.getDrawingWidth(true) - shift[ 3 ] );
				axis.draw( );



				axis.drawSeries();

			}, false, true, false);

			// Apply to all axis
	/*		this.applyToAxes(function(axis) {
				axis.drawSeries();
			}, false, true, true);
	*/		

	
			this.closeLine('right', this.getDrawingWidth(true), this.getDrawingWidth(true), shift[ 1 ], this.getDrawingHeight(true) - shift[0]);
			this.closeLine('left', 0, 0, shift[ 1 ], this.getDrawingHeight(true) - shift[0]);
			this.closeLine('top', shift[2], this.getDrawingWidth(true) - shift[3], 0, 0);
			this.closeLine('bottom', shift[2], this.getDrawingWidth(true) - shift[3], this.getDrawingHeight(true) - shift[0], this.getDrawingHeight(true) - shift[0]);

			this.clipRect.setAttribute('y', shift[1]);
			this.clipRect.setAttribute('x', shift[2]);
			this.clipRect.setAttribute('width', this.getDrawingWidth() - shift[2] - shift[3]);
			this.clipRect.setAttribute('height', this.getDrawingHeight() - shift[1] - shift[0]);


			this.rectEvent.setAttribute('x', shift[1]);
			this.rectEvent.setAttribute('y', shift[2]);
			this.rectEvent.setAttribute('width', this.getDrawingWidth() - shift[2] - shift[3]);
			this.rectEvent.setAttribute('height', this.getDrawingHeight() - shift[1] - shift[0]);

/*
			this.shapeZoneRect.setAttribute('x', shift[1]);
			this.shapeZoneRect.setAttribute('y', shift[2]);
			this.shapeZoneRect.setAttribute('width', this.getDrawingWidth() - shift[2] - shift[3]);
			this.shapeZoneRect.setAttribute('height', this.getDrawingHeight() - shift[1] - shift[0]);
*/
			this.shift = shift;
			this.redrawShapes();
		},


		autoscaleAxes: function() {

			this.applyToAxes( "setMinMaxToFitSeries", null, true, true );
			this.redraw();
			
		},

		closeLine: function(mode, x1, x2, y1, y2) {	
			
			if( this.options.close[ mode ] && this.axis[ mode ].length == 0 ) {

				this.closingLines[ mode ].setAttribute('display', 'block');
				this.closingLines[ mode ].setAttribute('x1', x1);
				this.closingLines[ mode ].setAttribute('x2', x2);
				this.closingLines[ mode ].setAttribute('y1', y1);
				this.closingLines[ mode ].setAttribute('y2', y2);

			} else {

				this.closingLines[ mode ].setAttribute('display', 'none');

			}
		},

		refreshMinOrMax: function() {
			var i = this.series.length - 1;
			for(;i >= 0; i--) { // Let's remove the serie from the stack
				this.series[i].isMinOrMax(false);
			}
		},

		newSerie: function( name, options, type, callback ) {


			var self = this;

			if( typeof type == "function" ) {
				type = "line";
				callback = type;
			}

			if( ! type ) {
				type = "line";
			}

			var serie = makeSerie( this, name, options, type, function( serie ) {

				self.series.push(serie);

				if( self.legend ) {
					self.legend.update();
				}

				if( callback ) {
					callback( serie );
				}
			} );

			return serie;
		},

		getSerie: function(name) {
			if(typeof name == 'number') {
				return this.series[name];
			}
			var i = 0, l = this.series.length;
			for(; i < l; i++) {
				if( this.series[i].getName() == name ) {
					return this.series[i];
				}
			}
		},

		getSeries: function() {
			return this.series;
		},

		drawSeries: function( ) {

			if( ! this.width || ! this.height ) {
				return;
			}

			var i = this.series.length - 1;
			for( ; i >= 0; i-- ) {
				this.series[i].draw( );
			}
		},

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

		removeSerie: function(serie) {

			var i = this.series.length - 1;
			for(;i >= 0; i--) { // Let's remove the serie from the stack. // Not using indexOf because of Safari
				if(this.series[i] == serie)
					this.series.slice(i, 1);
			}
			serie.removeDom();
			if( serie.isMinOrMax( ) ) {
				this.refreshDrawingZone( );
			}

			if( this.legend ) {
				this.legend.update( );
			}
			
		},

		setZoomMode: function(zoomMode) {
			if(zoomMode == 'x' || zoomMode == 'y' || zoomMode == 'xy' || !zoomMode)
				this.options.zoomMode = zoomMode;
		},

		setDefaultWheelAction: function(wheelAction) {
			if(wheelAction != 'zoomY' && wheelAction != 'zoomX' && wheelAction != 'none')
				return;
			this.options.defaultWheelAction = wheelAction;
		},

		getZoomMode: function() {
			return this.options.zoomMode;
		},

		makeToolbar: function( toolbarData ) {

			var self = this,
				deferred = $.Deferred();

			this.dynamicLoader.load( 'util', './graph.toolbar', function( toolbar ) {

				self.toolbar = new toolbar( self, toolbarData );
				deferred.resolve( self.toolbar );
			});

			return deferred;
		},

		makeShape: function( shapeData, events, notify) {

			var self = this,
				response,
				deferred = $.Deferred();
			

			
			shapeData.id = Math.random();

			if( notify ) {

				if( false === ( response = this.triggerEvent('onShapeBeforeMake', shapeData ) ) ) {
					return;
				}
			}

			if( response ) {
				shapeData = response;
			}

			var callback = function( shapeConstructor ) {

				var shape = new shapeConstructor( self, shapeData.shapeOptions );

				shape.setSerie( self.getSerie( 0 ) );

				if(!shape) {
					return;
				}

				shape.setOriginalData( shapeData, events );
				if( shape.data ) {
					shape.data.id = self.id;
				}

				
				if( shapeData.fillColor ) {
					shape.set( 'fillColor', shapeData.fillColor );
				}	

				if( shapeData.strokeColor ) {
					shape.set( 'strokeColor', shapeData.strokeColor );
				}

				if( shapeData.strokeWidth ) {
					shape.set( 'strokeWidth', shapeData.strokeWidth || (shapeData.strokeColor ? 1 : 0));
				}	

				if( shapeData.label ) {

					if ( ! ( shapeData.label instanceof Array ) ) {
						shapeData.label = [ shapeData.label ];
					}

					for ( var i = 0, l = shapeData.label.length ; i < l ; i++) {

						shape.set('labelPosition', shapeData.label[i].position, i);
						shape.set('labelColor', shapeData.label[i].color || 'black', i);
						shape.set('labelSize', shapeData.label[i].size, i);
						shape.set('labelAngle', shapeData.label[i].angle || 0, i);


						if(shapeData.label[i].anchor) {
							shape.set('labelAnchor', shapeData.label[i].anchor, i);
						}
					}

					shape.setLabelNumber(l);
				}

				/*switch(shape.type) {
					case 'rect':
					case 'rectangle':
						shape.set('width', shape.width);
						shape.set('height', shape.height);
					break;
				}*/
				self.shapes.push(shape);

				self.triggerEvent('onShapeMake', shape, shapeData);

				deferred.resolve( shape );

			}

			if( shapeData.url ) {
				this.dynamicLoader.load( 'external', shapeData.url, callback );
			} else {
				this.dynamicLoader.load( 'shapes', 'graph.shape.' + shapeData.type, callback );
			}

			return deferred;
		},

		redrawShapes: function() {


			//this.graphingZone.removeChild(this.shapeZone);
			for(var i = 0, l = this.shapes.length; i < l; i++) {
				this.shapes[i].redraw();
			}
			//this.graphingZone.insertBefore(this.shapeZone, this.axisGroup);
		},

		removeShapes: function() {
			for(var i = 0, l = this.shapes.length; i < l; i++) {
				this.shapes[i].kill();
			}
			this.shapes = [];
		},

		removeShape: function( shape ) {
			this.shapes.splice( this.shapes.indexOf( shape ), 1 );
		},

		_makeClosingLines: function() {

			this.closingLines = {};
			var els = ['top', 'bottom', 'left', 'right'], i = 0, l = 4, line;
			for(; i < l; i++) {	
				var line = document.createElementNS(this.ns, 'line');
				line.setAttribute('stroke', 'black');
				line.setAttribute('shape-rendering', 'crispEdges');
				line.setAttribute('stroke-linecap', 'square');
				line.setAttribute('display', 'none');
				this.closingLines[els[i]] = line;
				this.graphingZone.appendChild(line);
			}
		},

		_seriesInit: function( ) {

			var self = this,
				series = this.options.series,
				nb = series.length;

			if( nb == 0 ) {
				return self._seriesReady();
			}

			series.map( function( serie ) {
				
				self.dynamicLoader.load( 'serie', 'graph.serie.' + serie, function() {

					if( ( -- nb ) == 0 ) {

						self._seriesReady();
					}
				} );
			} )
		},

		_seriesReady: function() {

			this.seriesReady.resolve();
		},

		_pluginsExecute: function(funcName, args) {

//			Array.prototype.splice.apply(args, [0, 0, this]);

			for(var i in this._plugins) {

				if( this._plugins[ i ] && this._plugins[ i ][ funcName ] ) {

					this._plugins[ i ][ funcName ].apply( this._plugins[ i ], args );

				}
			}
		},

		_pluginExecute: function(which, func, args) {
			
			//Array.prototype.splice.apply( args, [ 0, 0, this ] );

			if( this._plugins[ which ] && this._plugins[ which ][ func ] ) {

				this._plugins[ which ][ func ].apply( this._plugins[ which ], args );
			}
		},

		_pluginsInit: function() {

			var self = this,
				pluginsToLoad,
				nb;

			this._plugins = this._plugins || {};
			

			if( Array.isArray( this.options.plugins ) ) {
				pluginsToLoad = this.options.plugins
			} else {
				pluginsToLoad = [];

				for( var i in this.options.plugins ) {
					pluginsToLoad.push( i );
				}
			}

			if( ( nb = pluginsToLoad.length ) == 0 ) {
				return self._pluginsReady();
			}

			this.pluginsToLoad = pluginsToLoad.length;

			this.dynamicLoader.load( 'plugin', pluginsToLoad, function( plugin, smth, filename ) {

				self._plugins[ filename ] = new plugin();
				self._plugins[ filename ].init( self, self.options.plugins[ filename ] || { }, filename );
			
		
				if( ( -- nb ) == 0 ) {

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
			var func = arguments[0], 
				args = Array.prototype.splice.apply(arguments, [0, 1]);
				
			if(typeof this.options[func] == "function") {
				return this.options[func].apply(this, arguments);
			}

			return;
		},

		selectShape: function(annot) {
			if(this.selectedShape == annot)
				return;

			if( this.selectedShape ) { // Only one selected shape at the time

				//console.log('Unselect shape');
				this.selectedShape.unselect( );
			}

			this.selectedShape = annot;
			this.triggerEvent('onShapeSelect', annot.data);
		},

		unselectShape: function( ) {

			if( ! this.selectedShape ) {
				return;
			}

			this.selectedShape.unselect();
			
			
			this.triggerEvent('onShapeUnselect', this.selectedShape.data);
			this.selectedShape = false;
		},


		selectSerie: function( serie ) {

			if( this.selectedSerie == serie ) {
				return;
			}

			if( this.selectedSerie ) {

				this.selectedSerie.unselect();
			}

			this.selectedSerie = serie;
			serie.select();
		},

		unselectSerie: function( serie ) {

			serie.unselect();
			this.selectedSerie = false;
		},

		getSelectedSerie: function() {
			return this.selectedSerie;
		},

		makeLegend: function( options ) {
			this.legend = new GraphLegend( this, options );
			this.graphingZone.appendChild( this.legend.getDom() );
			this.legend.update();

			return this.legend;
		},

		updateLegend: function() {

			if( ! this.legend ) {
				return;
			}

			this.legend.update();
		},


		getPosition: function( value, relTo, xAxis, yAxis, onSerie ) {

			var parsed,
				pos = { x: false, y: false };

			if( ! xAxis ) {
				xAxis = this.getXAxis();
			}

			if( ! yAxis ) {
				yAxis = this.getYAxis();
			}

			if( ! value ) {
				return;
			}

			for(var i in pos) {

				var axis = i == 'x' ? xAxis : yAxis;

				if( value[ i ] === undefined && ((value['d' + i] !== undefined && relTo === undefined) || relTo === undefined)) {
					
					if(i == 'x') {

						if( value['d' + i] === undefined ) {
							continue;
						}

						pos[i] = relTo ? relTo[i] : axis.getPos(0);

					} else if( value.x && onSerie) {

						var closest = onSerie.searchClosestValue( value.x );

						if( ! closest ) {
							return;
						}

						pos[ i ] = onSerie.getY( closest.yMin );

					}

				} else if( value[ i ] !== undefined ) {

					pos[ i ] = this.getPx( value[ i ], axis );
				}

				if(value['d' + i] !== undefined) {

					var def = (value[ i ] !== undefined || relTo == undefined || relTo[i] == undefined) ? pos[i] : (this._getPositionPx(relTo[i], true, axis) || 0);

					if((parsed = _parsePx(value['d' + i])) !== false) { // dx in px => val + 10px

						pos[i] = def + parsed;  // return integer (will be interpreted as px)

					} else if(parsed = this._parsePercent(value['d' + i])) {

						pos[i] = def + this._getPositionPx(parsed, true, axis); // returns xx%

					} else if( axis ) {

						pos[i] = def + axis.getRelPx(value['d' + i]); // px + unittopx

					}
				}
			}

			return pos;
		},

		_getPositionPx: function(value, x, axis) {

			if(parsed = _parsePx(value)) {

				return parsed; // return integer (will be interpreted as px)

			}

			if( parsed = this._parsePercent( value ) ) {

				return parsed / 100 * ( x ? this.graph.getDrawingWidth( ) : this.graph.getDrawingHeight( ) );

			} else if( axis ) {

				return axis.getPos(value);

			}
		},


		

		_parsePercent: function(percent) {
			if(percent && percent.indexOf && percent.indexOf('%') > -1) {
				return percent;
			}
			return false;	
		},

		deltaPosition: function( ref, delta, axis ) {
			
			var refPx, deltaPx;

			if( refPx = _parsePx( ref ) ) {

				if( deltaPx = _parsePx( delta ) ) {
					return ( refPx + deltaPx ) + "px";	
				} else {
					return ( refPx + axis.getRelPx( delta ) ) + "px";
				}
			} else {

				if( deltaPx = _parsePx( delta ) ) {
					return ( ref + axis.getRelVal( deltaPx ) );
				} else {
					return ( ref + delta );
				}
			}
		},

		getPx: function( value, axis, rel ) {


			var parsed;

			if( ( parsed = _parsePx( value ) ) !== false ) {

				return parsed; // return integer (will be interpreted as px)

			} else if( parsed = this._parsePercent( value ) ) {

				return parsed; // returns xx%

			} else if( axis ) {

				if( value == "min" ) {

					return axis.getMinPx();

				} else if( value == "max" ) {

					return axis.getMaxPx();
				
				} else if( rel ) {

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

			if( this.options.onContextMenuListen ) {
				return this.options.onContextMenuListen( target, menuElements, callback );
			}

			if( ! this.context ) {

				this.dynamicLoader.load( 'util', './util/context', function( Context ) {

					var instContext = new Context();

					instContext.init( self._dom );
					instContext.listen( target, menuElements, callback );

					self.context = instContext;
				});	

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



	Graph.prototype.plugins = {};


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
		if( px && px.indexOf && px.indexOf('px') > -1) {
			return parseInt(px.replace('px', ''));
		}
		return false;
	};


	return Graph;
});
