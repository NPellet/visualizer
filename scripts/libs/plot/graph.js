
var Graph = (function() {

	var Graph = function(dom, options) {
		
		this._creation = Date.now() + Math.random();

		this.options = $.extend({}, Graph.prototype.defaults, options);
		this.xaxis = [];
		this.leftyaxis = [];
		this.rightyaxis = [];
		this.title = false;

		this.width = 0;
		this.height = 0;

		this.ns = 'http://www.w3.org/2000/svg';
		this.series = [];
		this._dom = dom;
		// DOM
		this.doDom();
		this.registerEvents();

	}

	Graph.prototype = {
		
		defaults: {
			paddingTop: 30,
			paddingBottom: 0,
			paddingLeft: 20,
			paddingRight: 20,

			closeLeft: true,
			closeRight: true,
			closeTop: true,

			title: '',
			zoomMode: false,

			lineToZero: false,

			fontSize: 12,
			fontFamily: 'Myriad Pro, Helvetica, Arial'
		},


		doDom: function() {

			this.dom = document.createElementNS(this.ns, 'svg');
			this.dom.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			this._dom.appendChild(this.dom);

			this.dom.setAttribute('font-size', this.options.fontSize);
			this.dom.setAttribute('font-family', this.options.fontFamily);

			this.defs = document.createElementNS(this.ns, 'defs');
			this.dom.appendChild(this.defs);


			this.domTitle = document.createElementNS(this.ns, 'text');
			this.domTitle.setAttribute('text-anchor', 'middle');
			this.domTitle.setAttribute('y', 20); // 20px from the top ?

			this.setTitle(this.options.title);
			this.dom.appendChild(this.domTitle);

			this.graphingZone = document.createElementNS(this.ns, 'g');
			this.graphingZone.setAttribute('transform', 'translate(' + this.options.paddingLeft + ', ' + this.options.paddingTop + ')')
			this.dom.appendChild(this.graphingZone);

			this.axisGroup = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.axisGroup);

			this.plotGroup = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.plotGroup);
			
			this.topLine = document.createElementNS(this.ns, 'line');
			this.topLine.setAttribute('stroke', 'black');
			this.topLine.setAttribute('shape-rendering', 'crispEdges');
			this.topLine.setAttribute('stroke-linecap', 'square');
			this.topLine.setAttribute('display', 'none');
			this.graphingZone.appendChild(this.topLine);

			this.leftLine = document.createElementNS(this.ns, 'line');
			this.leftLine.setAttribute('stroke', 'black');
			this.leftLine.setAttribute('shape-rendering', 'crispEdges');
			this.leftLine.setAttribute('stroke-linecap', 'square');
			this.leftLine.setAttribute('display', 'none');
			this.graphingZone.appendChild(this.leftLine);

			this.rightLine = document.createElementNS(this.ns, 'line');
			this.rightLine.setAttribute('stroke-linecap', 'square');
			this.rightLine.setAttribute('shape-rendering', 'crispEdges');
			this.rightLine.setAttribute('stroke', 'black');
			this.rightLine.setAttribute('display', 'none');
			this.graphingZone.appendChild(this.rightLine);

			
			this.clip = document.createElementNS(this.ns, 'clipPath');
			this.clip.setAttribute('id', '_clipplot' + this._creation)
			this.defs.appendChild(this.clip);

			this.clipRect = document.createElementNS(this.ns, 'rect');
			this.clip.appendChild(this.clipRect);
			this.clip.setAttribute('clipPathUnits', 'userSpaceOnUse');


			this._zoomingSquare = document.createElementNS(this.ns, 'rect');
			this._zoomingSquare.setAttribute('display', 'none');
			this._zoomingSquare.setAttribute('fill', 'rgba(171, 12, 12, 0.2)');
			this._zoomingSquare.setAttribute('stroke', 'rgba(171, 12, 12, 1)');
			this._zoomingSquare.setAttribute('shape-rendering', 'crispEdges');
			this._zoomingSquare.setAttribute('x', 0);
			this._zoomingSquare.setAttribute('y', 0);
			this._zoomingSquare.setAttribute('width', 0);
			this._zoomingSquare.setAttribute('height', 0);
			this.dom.appendChild(this._zoomingSquare);


			this.shapeZone = document.createElementNS(this.ns, 'g');
			this.graphingZone.appendChild(this.shapeZone);

			this.rectEvent = document.createElementNS(this.ns, 'rect');
			this.rectEvent.setAttribute('pointer-events', 'fill');
			this.rectEvent.setAttribute('fill', 'transparent');
			this.dom.appendChild(this.rectEvent);
			this.plotGroup.setAttribute('clip-path', 'url(#_clipplot' + this._creation + ')');



		},

		kill: function() {
			this._dom.removeChild(this.dom);
		},

		registerEvents: function() {
			var self = this;
			this.rectEvent.addEventListener('mousemove', function(e) {
				e.preventDefault();
				var x = e.offsetX || e.layerX;
				var y = e.offsetY || e.layerY;
				self.handleMouseMove(x,y,e);
			});

			this.rectEvent.addEventListener('mousedown', function(e) {
				e.preventDefault();
				var x = e.offsetX || e.layerX;
				var y = e.offsetY || e.layerY;
				self.handleMouseDown(x,y,e);
			});

			this.rectEvent.addEventListener('mouseup', function(e) {
				e.preventDefault();
				var x = e.offsetX || e.layerX;
				var y = e.offsetY || e.layerY;
				self.handleMouseUp(x,y,e);
			});

			this.rectEvent.addEventListener('dblclick', function(e) {
				e.preventDefault();
				var x = e.offsetX || e.layerX;
				var y = e.offsetY || e.layerY;
				self.handleDblClick(x,y,e);
			});

			this.rectEvent.addEventListener('mousewheel', function(e) {
				var deltaY = e.wheelDeltaY || e.wheelDelta || - e.deltaY;
				self.handleMouseWheel(deltaY,e);	
				e.preventDefault();
				return false;
			});

			this.rectEvent.addEventListener('wheel', function(e) {
				var deltaY = e.wheelDeltaY || e.wheelDelta || - e.deltaY;
				self.handleMouseWheel(deltaY,e);	
				e.preventDefault();
				return false;
			});
		},

		handleMouseMove: function(x, y, e) {

			var _x = x - this.options.paddingLeft;
			var _y = y - this.options.paddingTop;

			for(var i = 0; i < this.xaxis.length; i++)
				this.xaxis[i].handleMouseMove(_x, e);
		
			for(var i = 0; i < this.leftyaxis.length; i++)
				this.leftyaxis[i].handleMouseMove(_y, e);
			
			for(var i = 0; i < this.rightyaxis.length; i++)
				this.rightyaxis[i].handleMouseMove(_y, e);	
				
			if(!this._zooming) {

				var results = {};
				for(var i = 0; i < this.series.length; i++)
					results[this.series[i].getName()] = this.series[i].handleMouseMove(_x, _y, e);
				
				if(this.options.onMouseMoveData)
					this.options.onMouseMoveData(e, results);

			} else {

				switch(this.getZoomMode()) {

					case 'xy':
						
						this._zoomingSquare.setAttribute('x', Math.min(this._zoomingXStart, x));
						this._zoomingSquare.setAttribute('y', Math.min(this._zoomingYStart, y));
						this._zoomingSquare.setAttribute('width', Math.abs(this._zoomingXStart - x));
						this._zoomingSquare.setAttribute('height', Math.abs(this._zoomingYStart - y));
					break;

					case 'x': 
						this._zoomingSquare.setAttribute('x', Math.min(this._zoomingXStart, x));
						this._zoomingSquare.setAttribute('y', this.options.paddingTop);
						this._zoomingSquare.setAttribute('width', Math.abs(this._zoomingXStart - x));
						this._zoomingSquare.setAttribute('height', this.getDrawingHeight() - this.shift[0]);
					break;

					case 'y':
						this._zoomingSquare.setAttribute('x', this.options.paddingLeft + this.shift[1]);
						this._zoomingSquare.setAttribute('y', Math.min(this._zoomingYStart, y));
						this._zoomingSquare.setAttribute('width', this.getDrawingWidth() - this.shift[1] - this.shift[2]);
						this._zoomingSquare.setAttribute('height', Math.abs(this._zoomingYStart - y));
					break;
				}
				
			}


			return results;
		},

		isZooming: function() {
			return this._zooming;
		},

		handleMouseWheel: function(delta, e) {

			for(var i = 0; i < this.leftyaxis.length; i++)
				this.leftyaxis[i].handleMouseWheel(delta, e);		
			for(var i = 0; i < this.rightyaxis.length; i++)
				this.rightyaxis[i].handleMouseWheel(delta, e);	
			this.redraw(true);
			this.drawSeries(true);
		},

		handleMouseDown: function(x,y,e) {

			var zoomMode = this.getZoomMode();

			if(zoomMode) {
				this._zooming = true;
				this._zoomingXStart = x;
				this._zoomingYStart = y;
				this._zoomingXStartRel = x - this.getPaddingLeft();
				this._zoomingYStartRel = y - this.getPaddingTop();
				this._zoomingSquare.setAttribute('width', 0);
				this._zoomingSquare.setAttribute('height', 0);
				this._zoomingSquare.setAttribute('display', 'block');


			} else {
				this.handleMouseUp(x, y, e);
			}
		},

		handleDblClick: function(x,y,e) {
			var _x = x - this.options.paddingLeft;
			var _y = y - this.options.paddingTop;
			this.redraw();
			this.drawSeries();
		},

		handleMouseUp: function(x, y, e) {

			
			this._zoomingSquare.setAttribute('display', 'none');
			var _x = x - this.options.paddingLeft;
			var _y = y - this.options.paddingTop;

			if((x - this._zoomingXStart == 0 && this.getZoomMode() != 'y') || (y - this._zoomingYStart == 0 && this.getZoomMode() != 'x')) {
				this._zooming = false;
				return;
			}

			for(var i = 0; i < this.xaxis.length; i++)
				this.xaxis[i].handleMouseUp(_x, e);
		
			for(var i = 0; i < this.leftyaxis.length; i++)
				this.leftyaxis[i].handleMouseUp(_y, e);
			
			for(var i = 0; i < this.rightyaxis.length; i++)
				this.rightyaxis[i].handleMouseUp(_y, e);	

			if(this._zooming) {
				this._zooming = false;
				this.drawSeries(true);
			}

			
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
			this.setWidth(w, true);
			this.setHeight(h, true);

			this._resize();
		},

		getDom: function() { 
			return this.dom;
		},

		applyStyleText: function(dom) {
//			dom.setAttribute('font-family', '"Myriad Pro", Arial, Serif');
//			dom.setAttribute('font-size', '12px');
		},

		getXAxis: function(num, options) {
			num = num || 0;
			if(typeof num == "object") {
				options = num;
				num = 0;
			}

			return this.xaxis[num] = this.xaxis[num] || new GraphXAxis(this, options);
		},

		getLeftAxis: function(num, options) {
			num = num || 0;
			if(typeof num == "object") {
				options = num;
				num = 0;
			}

			return this.leftyaxis[num] = this.leftyaxis[num] || new GraphYAxis(this, 'left', options);
		},

		getRightAxis: function(num, options) {
			num = num || 0;
			if(typeof num == "object") {
				options = num;
				num = 0;
			}

			return this.rightyaxis[num] = this.rightyaxis[num] || new GraphYAxis(this, 'right', options);
		},

		getPaddingTop: function() {
			return this.options.paddingTop;
		},

		getPaddingLeft: function() {
			return this.options.paddingLeft;
		},

		getPaddingTop: function() {
			return this.options.paddingTop;
		},

		getPaddingBottom: function() {
			return this.options.paddingBottom;
		},

		// Title
		setTitle: function(title) {
			this.title = title;
			this.domTitle.textContent = title;
		},

		displayTitle: function() {
			this.domTitle.setAttribute('display', 'inline');
		},

		hideTitle: function() {
			this.domTitle.setAttribute('display', 'none');
		},

		drawSerie: function(serie) {

			/*var xaxis = serie.getXAxis(),
				yaxis = serie.getYAxis(),
				xmin, xmax, ymin, ymax, polylines;
	*/
			//xmin = xaxis.getMin();
			//	xmin = this.getBoundaryAxisFromSeries(xaxis, 'x', 'min');

			//xmax = xaxis.getMax();
				//xmax = this.getBoundaryAxisFromSeries(xaxis, 'x', 'max');

			//ymin = yaxis.getMin();
			//	ymin = this.getBoundaryAxisFromSeries(yaxis, 'y', 'min');

			//ymax = yaxis.getMax();
			//	ymax = this.getBoundaryAxisFromSeries(yaxis, 'y', 'max');

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
			series = this.getSeriesFromAxis(axis);
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

		getSeriesFromAxis: function(axis) {
			var series = [],
				i = this.series.length - 1;
			for(; i >= 0; i--)
				if(this.series[i].getXAxis() == axis || this.series[i].getYAxis() == axis)
					series.push(this.series[i]);
			return series;
		},

		_resize: function() {

			if(!this.width || !this.height)
				return;

			this.dom.setAttribute('width', this.width);
			this.dom.setAttribute('height', this.height);
			this.domTitle.setAttribute('x', this.width / 2);

			this.rectEvent.setAttribute('x', 0/*this.getPaddingLeft()*/);
			this.rectEvent.setAttribute('y', 0/*this.getPaddingTop()*/);
			this.rectEvent.setAttribute('width', this.getWidth());
			this.rectEvent.setAttribute('height', this.getHeight());
			
			this.refreshDrawingZone();
		},

		redraw: function(doNotRecalculateMinMax) {

			if(!this.width || !this.height)
				return;

			this.refreshDrawingZone(doNotRecalculateMinMax);
			return true;
		},

		// Repaints the axis and series
		refreshDrawingZone: function(doNotRecalculateMinMax) {

			var i, j, l, xy, min, max;
			var axisvars = ['xaxis', 'leftyaxis', 'rightyaxis'], shift = [0, 0, 0];

			this._painted = true;
			this.refreshMinOrMax();

			for(j = 0, l = axisvars.length; j < l; j++) {
				xy = j == 0 ? 'x' : 'y';
				
				for(i = this[axisvars[j]].length - 1; i >= 0; i--) {
					if(this[axisvars[j]][i].disabled)
						continue;

					this[axisvars[j]][i].setRealMin(this.getBoundaryAxisFromSeries(this[axisvars[j]][i], xy, 'min'));
					this[axisvars[j]][i].setRealMax(this.getBoundaryAxisFromSeries(this[axisvars[j]][i], xy, 'max'));
					this[axisvars[j]][i]._serieShift = 0;
					this[axisvars[j]][i]._serieScale = 1;

					if(i == 0) // LAST ONE
						shift[j] += this[axisvars[j]][i].getAxisPosition();
					else
						shift[j] += this[axisvars[j]][i].getAxisWidthHeight()

					this[axisvars[j]][i].setShift(shift[j]);
				}
			}

			min = shift[0];
			shift[1] = 0;
			shift[2] = 0;
			for(i = this.leftyaxis.length - 1; i >= 0; i--) {
				if(this.leftyaxis[i].disabled)
					continue;
				this.leftyaxis[i].setMinPx(0);
				this.leftyaxis[i].setMaxPx(this.getDrawingHeight(true) - shift[0]);
				shift[1] += this.leftyaxis[i].draw(doNotRecalculateMinMax);

				this.leftyaxis[i].setShift(shift[1]);
			}

			for(i = this.rightyaxis.length - 1; i >= 0; i--) {
				if(this.rightyaxis[i].disabled)
					continue;
				this.rightyaxis[i].setMinPx(0);

				this.rightyaxis[i].setMaxPx(this.getDrawingHeight(true) - shift[0]);
				shift[2] += this.rightyaxis[i].draw(doNotRecalculateMinMax);
			}



			min = shift[1],
			max = this.getDrawingWidth(true) - shift[2];
			for(i = this.xaxis.length - 1; i >= 0; i--) {
				if(this.xaxis[i].disabled)
					continue;

				this.xaxis[i].setMinPx(min);
				this.xaxis[i].setMaxPx(max);
				this.xaxis[i].draw(doNotRecalculateMinMax);
			}


			// We must close the plot on the right
			if(this.options.closeRight && this.rightyaxis.length == 0) {
				this.rightLine.setAttribute('display', 'block');
				this.rightLine.setAttribute('x1', this.getDrawingWidth(true));
				this.rightLine.setAttribute('x2', this.getDrawingWidth(true));
				this.rightLine.setAttribute('y1', 0);
				this.rightLine.setAttribute('y2', this.getDrawingHeight(true) - shift[0]);
			} else {
				this.rightLine.setAttribute('display', 'none');
			}


			// We must close the plot on the left
			if(this.options.closeLeft && this.leftyaxis.length == 0) {
				this.leftLine.setAttribute('display', 'block');
				this.leftLine.setAttribute('x1', shift[1]);
				this.leftLine.setAttribute('x2', shift[1]);
				this.leftLine.setAttribute('y1', 0);
				this.leftLine.setAttribute('y2', this.getHeight(true) - shift[0]);
			} else {
				this.leftLine.setAttribute('display', 'none');
			}


			// We must close the plot on the right
			if(this.options.closeTop) {
				this.topLine.setAttribute('display', 'block');
				this.topLine.setAttribute('x1', shift[1]);
				this.topLine.setAttribute('x2', this.getDrawingWidth(true) - shift[2]);
				this.topLine.setAttribute('y1', 0);
				this.topLine.setAttribute('y2', 0);
			} else {
				this.topLine.setAttribute('display', 'none');
			}


			this.clipRect.setAttribute('y', 0);
			this.clipRect.setAttribute('x', shift[1]);
			this.clipRect.setAttribute('width', this.getDrawingWidth() - shift[2] - shift[1]);
			this.clipRect.setAttribute('height', this.getDrawingHeight() - shift[0]);

			this.shift = shift;
		},

		refreshMinOrMax: function() {
			var i = this.series.length - 1;
			for(;i >= 0; i--) { // Let's remove the serie from the stack
				this.series[i].isMinOrMax(false);
			}
		},

		newSerie: function(name, options, type) {
			var serie = new GraphSerie(this, name, options);
			this.series.push(serie);
			return serie;
		},

		drawSeries: function(doNotRedrawZone) {

			if(!this.width || !this.height)
				return;

			if(!this._painted)
				return;

			var i = this.series.length - 1;
			for(;i >= 0; i--)
				this.series[i].draw(doNotRedrawZone);
/*
			for(var i = 0; i < this.xaxis.length; i++)
				this.xaxis[i].hasChanged = false;
		
			for(var i = 0; i < this.leftyaxis.length; i++)
				this.leftyaxis[i].hasChanged = false;
			
			for(var i = 0; i < this.rightyaxis.length; i++)
				this.rightyaxis[i].hasChanged = false;	
			*/
		},

		checkMinOrMax: function(serie) {
			var xAxis = serie.getXAxis();
			var yAxis = serie.getYAxis();

			var minX = serie.getMinX(),
				maxX = serie.getMaxX(),
				minY = serie.getMinY(),
				maxY = serie.getMaxY(),
				isMinMax = false;

			if(minX <= xAxis.getMin()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'x', 'min');
			}

			if(maxX >= xAxis.getMax()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'x', 'max');
			}

			if(minY <= yAxis.getMin()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'y', 'min');
			}

			if(maxX >= xAxis.getMax()) {
				isMinMax = true;
				serie.isMinOrMax(true, 'y', 'max');
			}

			return isMinMax;
		},

		removeSerie: function(serie) {
			var i = this.series.length - 1;
			for(;i >= 0; i--) { // Let's remove the serie from the stack
				if(this.series[i] == serie)
					this.series.slice(i, 1);
			}

			serie.removeDom();

			if(serie.isMinOrMax())
				this.refreshDrawingZone();
		},


		setZoomMode: function(zoomMode) {
			if(zoomMode == 'x' || zoomMode == 'y' || zoomMode == 'xy' || !zoomMode)
				this.options.zoomMode = zoomMode;
		},

		getZoomMode: function() {
			return this.options.zoomMode;
		},

		makeShape: function(shapeType) {

			switch(shapeType) {
				case 'rect':
					return new GraphRect(this);
				break;

			}
			 
		}

	}


	var GraphAxis = function() {


	}

	GraphAxis.prototype = {

		defaults: {
			lineAt0: false,
			display: true,
			flipped: false,
			axisDataSpacing: {min: 0.1, max: 0.1},
			primaryGrids: true,
			secondaryGrids: false,
			secondaryTicks: 5,
			tickPosition: 1,
			nbTicksPrimary: 3,
			nbTicksSecondary: 5,

			exponentialFactor: 0,
			exponentialLabelFactor: 0,

			wheelBaseline: 0,

			logScale: false
		},


		init: function(graph, options) {
			this.graph = graph;
			this.options = $.extend(true, {}, GraphAxis.prototype.defaults, options);

			this.group = document.createElementNS(this.graph.ns, 'g');

			this.hasChanged = true;

			this.groupGrids = document.createElementNS(this.graph.ns, 'g');
			this.graph.axisGroup.appendChild(this.groupGrids);

			this.graph.axisGroup.appendChild(this.group); // Adds to the main axiszone

			this.line = document.createElementNS(this.graph.ns, 'line');
			this.line.setAttribute('stroke', 'black');
			this.line.setAttribute('shape-rendering', 'crispEdges');
			this.line.setAttribute('stroke-linecap', 'square');
			this.groupTicks = document.createElementNS(this.graph.ns, 'g');
			this.groupTickLabels = document.createElementNS(this.graph.ns, 'g');

			
			this.group.appendChild(this.groupTicks);
			this.group.appendChild(this.groupTickLabels);
			this.group.appendChild(this.line);

			this.labelValue;

			this.label = document.createElementNS(this.graph.ns, 'text');
			this.labelTspan = document.createElementNS(this.graph.ns, 'tspan');
			this.label.appendChild(this.labelTspan);

			this.expTspan = document.createElementNS(this.graph.ns, 'tspan');
			this.label.appendChild(this.expTspan);
			this.expTspanExp = document.createElementNS(this.graph.ns, 'tspan');
			this.label.appendChild(this.expTspanExp);

			this.label.setAttribute('text-anchor', 'middle');

			this.groupGrids.setAttribute('clip-path', 'url(#_clipplot' + this._creation + ')');

			this.graph.applyStyleText(this.label);
			this.group.appendChild(this.label);

			this.ticks = [];

			this._serieShift = 0;
			this._serieScale = 1;

			this.totalDelta = 0;
		},

		setDisplay: function(bool) {
			this.options.display = !!bool;
		},
		
		setLineAt0: function(bool) {
			this.options.lineAt0 = !!bool;
		},

		setAxisDataSpacing: function(val1, val2) {
			this.options.axisDataSpacing.min = val1;
			this.options.axisDataSpacing.max = val2 || val1;
		},

		setAxisDataSpacingMin: function(val) {
			this.options.axisDataSpacing.min = val;
		},

		setAxisDataSpacingMax: function(val) {
			this.options.axisDataSpacing.max = val;
		},

		setMinPx: function(px) {
			this.minPx = px;
		},

		getMinPx: function() {
			return this.flipped ? this.maxPx : this.minPx;
		},

		setMaxPx: function(px) {
			this.maxPx = px;
		},

		getMaxPx: function(px) {
			return this.flipped ? this.minPx : this.maxPx;
			
		},

		getMin: function() {
			return this.forcedMin || this.realMin;
		},

		getMax: function() {
			return this.forcedMax || this.realMax;
		},

		setRealMin: function(min) {
			this.realMin = min;
		},

		setRealMax: function(max) {
			this.realMax = max;
		},

		forceMin: function(val) {
			this.forcedMin = val || false;
		},

		forceMax: function(val) {
			this.forcedMax = val || false;
		},

		getNbTicksPrimary: function() {
			return this.options.nbTicksPrimary;
		},

		getNbTicksSecondary: function() {
			return this.options.nbTicksSecondary;
		},

		handleMouseMove: function(px,e) {
			this.mouseVal = this.getVal(px);
		},

		handleMouseWheel: function(delta, e) {
			
			delta = Math.min(0.2, Math.max(-0.2, delta));


			this._doZoomVal(
				((this.getActualMax() - this.options.wheelBaseline) * (1 + delta)) + this.options.wheelBaseline,
				((this.getActualMin() - this.options.wheelBaseline) * (1 + delta)) + this.options.wheelBaseline
			);
		},

		handleMouseUp: function(px, e) {

			if(!this.graph.isZooming()) 
				return;
			var mode = this.graph.getZoomMode();
			this._handleZoom(px);
		},

		_doZoomVal: function(val1, val2) {
			return this._doZoom(this.getPx(val1), this.getPx(val2), val1, val2);
		},

		_doZoom: function(px1, px2, val1, val2) {

			if(this.options.display || 1 == 1) {
				
				var val1 = val1 || this.getVal(px1);
				var val2 = val2 || this.getVal(px2);
				this._setRealMin(Math.min(val1, val2));
				this._setRealMax(Math.max(val1, val2));
				this.draw(true);
				this._hasChanged = true;

		//		this._serieShift = 0;
		//		this._serieScale = 0;

			} else {

				var min = this.getPos(this.getActualMin());
				var max = this.getPos(this.getActualMax());

				//this._serieScale = Math.abs(max - min) / Math.abs(px1 - px2);
				//this._serieShift = Math.min(px1, px2);
			}
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
			return this.flipped;
		},

		getUnitPerTick: function(px, nbTick, valrange) {

			var pxPerTick = px / nbTicks; // 1000 / 100 = 10 px per tick

			if(!nbTick)
				nbTick = px / 10;
			else
				nbTick = Math.min(nbTick, px / 10);

			// So now the question is, how many units per ticks ?
			// Say, we have 0.0004 unit per tick
			var unitPerTick = valrange / nbTick;

			// We take the log
			var decimals = Math.floor(Math.log(unitPerTick) / Math.log(10));
			/*
				Example:
					13'453 => Math.log10() = 4.12 => 4
					0.0000341 => Math.log10() = -4.46 => -5
			*/

			var numberToNatural = unitPerTick * Math.pow(10, - decimals);
			/*
				Example:
					13'453 (4) => 1.345
					0.0000341 (-5) => 3.41
			*/

			this.decimals = - decimals;

			var possibleTicks = [1,2,5,10];
			var closest = false;
			for(var i = possibleTicks.length - 1; i >= 0; i--)
				if(!closest || Math.abs(possibleTicks[i] - numberToNatural) < closest)
					closest = possibleTicks[i];
			
			// Ok now closest is the number of unit per tick in the natural number
			/*
				Example:
					13'453 (4) (1.345) => 1
					0.0000341 (-5) (3.41) => 5 
			*/

			// Let's scale it back
			var unitPerTickCorrect = closest * Math.pow(10, decimals);
			/*
				Example:
					13'453 (4) (1.345) (1) => 10'000
					0.0000341 (-5) (3.41) (5) => 0.00005
			*/
			var nbTicks = valrange / unitPerTickCorrect;
			var pxPerTick = px / nbTick;

			return [unitPerTickCorrect, nbTicks, pxPerTick];
		},

		_recalculateDataInterval: function() {

			var interval = this.getMax() - this.getMin();
			this._realMin = this.getMin() - (this.options.axisDataSpacing.min * interval);
			this._realMax = this.getMax() + (this.options.axisDataSpacing.max * interval);

			if(this.options.logScale) {
				this._realMin = Math.max(1e-50, this._realMin);
				this._realMax = Math.max(1e-50, this._realMax);

			}

		},

		_getActualInterval: function() {
			return this.getActualMax() - this.getActualMin();
		},

		getActualMin: function() {

			return this._realMin == this._realMax ? this._realMin - 1 : this._realMin;
		},

		getActualMax: function() {
			return this._realMax == this._realMin ? this._realMax + 1 : this._realMax;
		},

		_setRealMin: function(val) {
			this._realMin = val;
			if(this.options.logScale)
				this._realMin = Math.max(1e-50, val);
		},

		_setRealMax: function(val) {
			this._realMax = val;

			if(this.options.logScale)
				this._realMax = Math.max(1e-50, val);
		},

		flip: function(bool) {
			this.flipped = bool;
		},

		draw: function(doNotRecalculateMinMax) {
			var visible;
			switch(this.options.tickPosition) {
				case 1:
					this.tickPx1 = 2;
					this.tickPx2 = 0;
				break;

				case 2:
					this.tickPx1 = 1;
					this.tickPx2 = 1;
				break;

				case 3:
					this.tickPx1 = 0;
					this.tickPx2 = 2;
				break;
			}

			// Remove all ticks
			while(this.groupTicks.firstChild)
				this.groupTicks.removeChild(this.groupTicks.firstChild);


			// Remove all ticks
			while(this.groupTickLabels.firstChild)
				this.groupTickLabels.removeChild(this.groupTickLabels.firstChild);

			// Remove all grids
			while(this.groupGrids.firstChild)
				this.groupGrids.removeChild(this.groupGrids.firstChild);

			if(!doNotRecalculateMinMax)
				this._recalculateDataInterval();

			var widthPx = this.maxPx - this.minPx;
			var valrange = this._getActualInterval();

			/* Number of px per unit */
			/* Example: width: 1000px
			/* 			10 - 100 => 11.11
			/*			0 - 2 => 500
			/*			0 - 0.00005 => 20'000'000
														*/
			
			if(!this.options.display) {
				this.line.setAttribute('display', 'none');
				return 0;
			}

			this.line.setAttribute('display', 'block');

			if(!this.options.logScale) {
				// So the setting is: How many ticks in total ? Then we have to separate it
				var nbTicks1 = this.getNbTicksPrimary();
				var primaryTicks = this.getUnitPerTick(widthPx, nbTicks1, valrange);
				var nbSecondaryTicks = this.secondaryTicks();
				if(nbSecondaryTicks)
					nbSecondaryTicks = Math.min(nbSecondaryTicks, primaryTicks[2] / 5);
				var widthHeight = this.drawTicks(primaryTicks, nbSecondaryTicks);
			} else {
				var widthHeight = this.drawLogTicks();
			}

			/************************************/
			/*** DRAWING LABEL ******************/
			/************************************/

			var label;

			if(label = this.getLabel()) {
				this.labelTspan.textContent = label;
				if(this.getExponentialLabelFactor()) {
					this.expTspan.nodeValue = 'x10';
					this.expTspanExp.nodeValue = this.getExponentialLabelFactor();
					visible = true;
				} else
					visible = false;

				this.expTspan.setAttribute('display', visible ? 'block' : 'none');
				this.expTspanExp.setAttribute('display', visible ? 'block' : 'none');
			}

			/************************************/
			/*** DRAW CHILDREN IMPL SPECIFIC ****/
			/************************************/

			this.drawSpecifics();
			
			
			if(this.options.lineAt0 && this.getActualMin() < 0 && this.getActualMax() > 0)
				this._draw0Line(this.getPx(0));

			return widthHeight + (label ? 20 : 0);

		},

		drawTicks: function(primary, secondary) {

			

			var unitPerTick = primary[0],
				min = this.getActualMin(),
				max = this.getActualMax(),
				widthHeight = 0,
				secondaryIncr,
				incrTick,
				subIncrTick;

			if(secondary) 
				secondaryIncr = unitPerTick / secondary;
			
			var loop = 0;

			incrTick = Math.floor(min / unitPerTick) * unitPerTick;

			
			while(incrTick < max) {
				loop++;
				if(loop > 200)
					break;
				if(secondary) {
					subIncrTick = incrTick + secondaryIncr;
					//widthHeight = Math.max(widthHeight, this.drawTick(subIncrTick, 1));
					var loop2 = 0;
					while(subIncrTick < incrTick + unitPerTick) {
						loop2++;
						if(loop2 > 100)
							break;


						if(subIncrTick < min || subIncrTick > max) {
							subIncrTick += secondaryIncr;
							continue;
						}

						this.drawTick(subIncrTick, false, (subIncrTick - incrTick == unitPerTick / 2) ? 3:2);
						subIncrTick += secondaryIncr;

					}
				}


				if(incrTick < min || incrTick > max) {
					incrTick += primary[0];
					continue;
				}
				
				widthHeight = Math.max(widthHeight, this.drawTick(incrTick, true, 4));
				
				incrTick += primary[0];
			}

			this.widthHeightTick = widthHeight;
			return widthHeight;
		},

		secondaryTicks: function() {
			return 5;
		},

		drawLogTicks: function() {
			var min = this.getActualMin(), max = this.getActualMax();
			var incr = Math.min(min, max);
			var max = Math.max(min, max);

			var optsMain = {
				fontSize: '1.0em',
				exponential: true,
				overwrite: false
			}


			if(incr < 0)
				incr = 0;

			var pow = incr == 0 ? 0 : Math.floor(Math.log(incr) / Math.log(10));
			var incr = 1, k = 0, val;

			while((val = incr * Math.pow(10, pow)) < max) {
				if(incr == 1) { // Superior power
					if(val > min)
						this.drawTick(val, true, 5, optsMain);
				}
				if(incr == 10) {
					incr = 1;
					pow++;
				} else {
					if(incr != 1 && val > min)
						this.drawTick(val, true, 2, {overwrite: incr, fontSize: '0.6em' });	
					incr++;
				}
			}
			return 5;
		},

		getPx: function(value) {
			return this.getPos(value);
		},

		getPos: function(value) {
			// Ex 50 / (100) * (1000 - 700) + 700
				if(!this.options.logScale)
					return (value - this.getActualMin()) / (this._getActualInterval()) * (this.getMaxPx() - this.getMinPx()) + this.getMinPx();
				else {
					// 0 if value = min
					// 1 if value = max
					if(value < 0)
						return;

					var value = ((Math.log(value) - Math.log(this.getActualMin())) / (Math.log(this.getActualMax()) - Math.log(this.getActualMin()))) * (this.getMaxPx() - this.getMinPx()) + this.getMinPx();
					
					return value;
				}
		},



		getVal: function(px) {
			// Ex 50 / (100) * (1000 - 700) + 700
			return (px - this.getMinPx()) / (this.getMaxPx() - this.getMinPx()) * this._getActualInterval() + this.getActualMin();
		},

		valueToText: function(value) {
			value = value * Math.pow(10, this.getExponentialFactor()) * Math.pow(10, this.getExponentialLabelFactor());

			var dec = this.decimals - this.getExponentialFactor() - this.getExponentialLabelFactor();
			if(dec > 0)
				return value.toFixed(dec);

			return value.toFixed(0);
		},

		getExponentialFactor: function() {
			return this.options.exponentialFactor;
		},

		setExponentialFactor: function(value) {
			this.options.exponentialFactor = value;
		},

		setExponentialLabelFactor: function(value) {
			this.options.exponentialLabelFactor = value;
		},

		getExponentialLabelFactor: function() {
			return this.options.exponentialLabelFactor;
		},

		setLabel: function(value) {
			this.options.labelValue = value;
		},

		getLabel: function() {
			return this.options.labelValue;
		},

		setShift: function(shift) {
			this.shift = shift;
			this._setShift();
		},

		getShift: function() {
			return this.shift;
		},

		setTickPosition: function(pos) {
			switch(pos) {
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
		},

		togglePrimaryGrid: function(bool) {
			this.options.primaryGrid = bool;
		},

		toggleSecondaryGrid: function(bool) {
			this.options.secondaryGrid = bool;
		},

		doGridLine: function(primary, x1, x2, y1, y2) {
			var gridLine = document.createElementNS(this.graph.ns, 'line');
			gridLine.setAttribute('shape-rendering', 'crispEdges');	
			gridLine.setAttribute('y1', y1);
			gridLine.setAttribute('y2', y2);
			gridLine.setAttribute('x1', x1);
			gridLine.setAttribute('x2', x2);

			gridLine.setAttribute('stroke', primary ? this.getColorPrimaryGrid() : this.getColorSecondaryGrid());
			this.groupGrids.appendChild(gridLine);
		},

		getColorPrimaryGrid: function() {
			return '#c0c0c0';
		},

		getColorSecondaryGrid: function() {
			return '#f0f0f0';
		},

		setTickContent: function(dom, val, options) {
			if(!options) options = {};

			if(options.overwrite || !options.exponential)
				dom.textContent = options.overwrite || this.valueToText(val);
			else {
				var log = Math.round(Math.log(val) / Math.log(10));
				var unit = Math.floor(val * Math.pow(10, -log));

				dom.textContent = (unit != 1) ? unit + "x10" : "10";
				var tspan = document.createElementNS(this.graph.ns, 'tspan');
				tspan.textContent = log;
				tspan.setAttribute('font-size', '0.7em');
				tspan.setAttribute('dy', -3);
				dom.appendChild(tspan);
			}

			if(options.fontSize)
				dom.setAttribute('font-size', options.fontSize);
		}
	}






	/*******************************************/
	/** GRAPH X AXIS ***************************/
	/*******************************************/


	GraphXAxis = function(graph, options) {
		this.init(graph, options);
		
	}

	$.extend(GraphXAxis.prototype, GraphAxis.prototype, {

		getAxisPosition: function() {
			return (this.options.tickPosition == 1 ? 15 : 25) + this.graph.options.fontSize * 2;
		},

		getAxisWidthHeight: function() {
			return 200;
		},

		_setShift: function() {
			this.group.setAttribute('transform', 'translate(0 ' + (this.graph.getDrawingHeight() - this.shift) + ')')
		},

		drawTick: function(value, label, scaling, options) {
			var group = this.groupTicks;
			var tick = document.createElementNS(this.graph.ns, 'line'),
				val = this.getPos(value);

			tick.setAttribute('shape-rendering', 'crispEdges');
			tick.setAttribute('x1', val);
			tick.setAttribute('x2', val);

			tick.setAttribute('y1', - this.tickPx1 * scaling);
			tick.setAttribute('y2', - this.tickPx2 * scaling);

			if(label && this.options.primaryGrid)
				this.doGridLine(true, val, val, 0, this.getMaxPx());
			else if(!label && this.options.secondaryGrid)
				this.doGridLine(false, val, val, 0, this.getMaxPx());
			
			tick.setAttribute('stroke', 'black');

			this.groupTicks.appendChild(tick);
			if(label) {
				var groupLabel = this.groupTickLabels;
				var tickLabel = document.createElementNS(this.graph.ns, 'text');
				tickLabel.setAttribute('x', val);
				tickLabel.setAttribute('y', (this.options.tickPosition == 1) ? 8 : 25);
				tickLabel.setAttribute('text-anchor', 'middle');
				tickLabel.style.dominantBaseline = 'hanging';

				this.setTickContent(tickLabel, value, options);
				this.graph.applyStyleText(tickLabel);
				this.groupTickLabels.appendChild(tickLabel);
			}
			this.ticks.push(tick);
		},

		drawSpecifics: function() {

			// Adjusts group shift
			//this.group.setAttribute('transform', 'translate(0 ' + this.getShift() + ')');

			// Place label correctly
			this.label.setAttribute('text-anchor', 'middle');
			this.label.setAttribute('x', Math.abs(this.getMaxPx() - this.getMinPx()) / 2);
			
			this.label.setAttribute('y', (this.options.tickPosition == 1 ? 10 : 25) + this.graph.options.fontSize);

			this.line.setAttribute('x1', this.getMinPx());
			this.line.setAttribute('x2', this.getMaxPx());
			this.line.setAttribute('y1', 0);
			this.line.setAttribute('y2', 0);

			this.labelTspan.style.dominantBaseline = 'hanging';
			this.expTspan.style.dominantBaseline = 'hanging';
			this.expTspanExp.style.dominantBaseline = 'hanging';	
		},

		_draw0Line: function(px) {
			this._0line = document.createElementNS(this.graph.ns, 'line');
			this._0line.setAttribute('x1', px);
			this._0line.setAttribute('x2', px);

			this._0line.setAttribute('y1', 0);
			this._0line.setAttribute('y2', this.getMaxPx());
		
			this._0line.setAttribute('stroke', 'black');
			this.groupGrids.appendChild(this._0line);
		},

		_handleZoom: function(px2) {
			var mode = this.graph.getZoomMode(), px1;
			if(!(mode == 'xy' || mode == 'x'))
				return;
			px1 = this.graph._zoomingXStartRel;

			this._doZoom(px1, px2);
		}
	});






	/*******************************************/
	/** GRAPH Y AXIS ***************************/
	/*******************************************/

	GraphYAxis = function(graph, leftright, options) {
		this.init(graph, options);
		this.leftright = leftright;
		this.left = leftright == 'left';
		this.flipped = true;
	}

	$.extend(GraphYAxis.prototype, GraphAxis.prototype, {

		getAxisPosition: function() {
			return 0;
		},

		getAxisWidthHeight: function() {
			return 100;
		},

		drawTick: function(value, label, scaling, options) {
			var group = this.groupTicks,
				tickLabel,
				labelWidth = 0,
				pos = this.getPos(value);

			var tick = document.createElementNS(this.graph.ns, 'line');

			tick.setAttribute('shape-rendering', 'crispEdges');	
			tick.setAttribute('y1', pos);
			tick.setAttribute('y2', pos);
			tick.setAttribute('x1', this.tickPx1 * scaling);
			tick.setAttribute('x2', this.tickPx2 * scaling);
			tick.setAttribute('stroke', 'black');
		
			if(label && this.options.primaryGrid)
				this.doGridLine(true, 0, this.graph.getDrawingWidth() - this.getShift(), pos, pos);
			else if(!label && this.options.secondaryGrid)
				this.doGridLine(false, 0, this.graph.getDrawingWidth() - this.getShift(), pos, pos);
			
			this.groupTicks.appendChild(tick);

			if(label) {
				var groupLabel = this.groupTickLabels;
				tickLabel = document.createElementNS(this.graph.ns, 'text');
				tickLabel.setAttribute('y', pos);
				tickLabel.setAttribute('x', -10);

				
				tickLabel.setAttribute('text-anchor', 'end');
				tickLabel.style.dominantBaseline = 'central';
				this.graph.applyStyleText(tickLabel);
				this.setTickContent(tickLabel, value, options);

				this.groupTickLabels.appendChild(tickLabel);
				labelWidth = tickLabel.getComputedTextLength();
			}

			this.ticks.push(tick);

			return labelWidth;
		},

		drawSpecifics: function() {

			// Place label correctly
			//this.label.setAttribute('x', (this.getMaxPx() - this.getMinPx()) / 2);
			this.label.setAttribute('transform', 'translate(' + (-this.widthHeightTick - 10 - 5) + ', ' + (Math.abs(this.getMaxPx() - this.getMinPx()) / 2) +') rotate(-90)');

			this.line.setAttribute('y1', this.getMinPx());
			this.line.setAttribute('y2', this.getMaxPx());
			this.line.setAttribute('x1', 0);
			this.line.setAttribute('x2', 0);	
		},

		_setShift: function() {
			var xshift = this.isLeft() ? this.getShift() : this.graph.getWidth() - this.graph.getPaddingRight() - this.getShift();
			this.group.setAttribute('transform', 'translate(' + xshift + ' 0)');
		},

		isLeft: function() {
			return this.left;
		},

		isRight: function() {
			return !this.left;
		},

		flip: function(bool) {
			this.flipped = !bool;
		},

		_draw0Line: function(px) {
			this._0line = document.createElementNS(this.graph.ns, 'line');
			this._0line.setAttribute('y1', px);
			this._0line.setAttribute('y2', px);

			this._0line.setAttribute('x1', 0);
			this._0line.setAttribute('x2', this.graph.getDrawingWidth());
		
			this._0line.setAttribute('stroke', 'black');
			this.groupGrids.appendChild(this._0line);
		},


		_handleZoom: function(px2) {
			var mode = this.graph.getZoomMode(), px1;
			if(!(mode == 'xy' || mode == 'y'))
				return;
			px1 = this.graph._zoomingYStartRel;
			this._doZoom(px1, px2);
		}

	});



	var GraphSerie = function(graph, name, options) {

		this.graph = graph;
		this.name = name;
		this.options = $.extend(true, {}, GraphSerie.prototype.defaults, options);
		this.data = [];
		this._isMinOrMax = { x: { min: false, max: false}, y: { min: false, max: false} };

		this.groupLines = document.createElementNS(this.graph.ns, 'g');
		this.domMarker = document.createElementNS(this.graph.ns, 'path');

		this.groupMain = document.createElementNS(this.graph.ns, 'g');
		this.groupMain.appendChild(this.groupLines);
		this.groupMain.appendChild(this.domMarker);

		this.graph.plotGroup.appendChild(this.groupMain);

		this.marker = document.createElementNS(this.graph.ns, 'circle');
		this.marker.setAttribute('fill', 'black');
		this.marker.setAttribute('r', 3);
		this.marker.setAttribute('display', 'none');
		this.groupMain.appendChild(this.marker);

		this.scale = 1;
		this.shift = 0;

		this.minX = Number.MAX_VALUE;
		this.minY = Number.MAX_VALUE;
		this.maxX = Number.MIN_VALUE;
		this.maxY = Number.MIN_VALUE;

		this.lines = [];	
	}


	GraphSerie.prototype = {

		defaults: {
			lineColor: 'black',
			lineStyle: 1,

			markers: {
				show: false,
				type: 1,
				zoom: 1,
				strokeColor: false,
				strokeWidth: 1,
				fillColor: 'transparent'
			},
			
			trackMouse: false
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
		setData: function(data, arg, type) {

			var z = 0;
			var x, dx, arg = arg || "2D", type = type || 'float', arr;
			if(!data instanceof Array)
				return;

			// Single object
			var datas = [];
			if(!data instanceof Array && typeof data == 'object') {
				data = [data];
			} else if(data instanceof Array && !(data[0] instanceof Array)) {// [100, 103, 102, 2143, ...]
				data = [data];
				arg = "1D";
			}

			var _2d = (arg == "2D");

			// [[100, 0.145], [101, 0.152], [102, 0.153], [...]] ==> [[[100, 0.145], [101, 0.152], [102, 0.153], [...]]]
			if(data[0] instanceof Array && arg == "2D" && !(data[0][0] instanceof Array))
				data = [data];

			if(data[0] instanceof Array) {
				for(var i = 0, k = data.length; i < k; i++) {
					arr = this._addData(type, _2d ? data[i].length * 2 : data[i].length);
					datas.push(arr);
					z = 0;
					for(var j = 0, l = data[i].length; j < l; j++) {

						if(_2d) {
							arr[z] = (data[i][j][0]);
							this._checkX(arr[z]);
							z++;
							arr[z] = (data[i][j][1]);
							this._checkY(arr[z]);
							z++;
						} else { // 1D Array
							arr[z] = data[i][j];
							this[j % 2 == 0 ? '_checkX' : '_checkY'](arr[z]);
							z++;

						}
					}

					this.data.push(arr);
				}
			} else if(typeof data[0] == 'object') {
				
				var number = 0, numbers = [], datas = [], k = 0;
				for(var i = 0, l = data.length; i < l; i++) {
					number += data[i].y.length;
					continuous = (i != 0) && (!data[i + 1] || data[i].x + data[i].dx * (data[i].y.length) == data[i + 1].x);
					if(!continous) {
						datas.push(this._addData(type, number));
						numbers.push(number);
						number = 0;
					}
				}

				number = 0, k = 0, z = 0;
				for(var i = 0, l = data.length; i < l; i++) {
					x = data[i].x, dx = data[i].dx;
					for(var j = 0, k = data[i].y.length; j < k; j++) {
						datas[k][z] = (x + j * dx);
						this._checkX(datas[k][z]);
						z++;
						datas[k][z] = (data[i].y[j]);
						this._checkY(datas[k][z]);
						z++;
					}
					number += data[i].y.length;
					if(numbers[k] == number) {
						k++;
						number = 0;
						z = 0;
					}
				}
			}

			this.data = datas;
		},

		kill: function() {

			this.graph.plotGroup.removeChild(this.groupMain);

			/*if(this.marker)
				this.groupMain.removeChild(this.marker);
	*/
			this.graph.redraw();

			// Remove serie
			this.graph.series.splice(this.graph.series.indexOf(this), 1);
		},

		getName: function() {
			return this.name;
		},

		_checkX: function(val) {
			this.minX = Math.min(this.minX, val);
			this.maxX = Math.max(this.maxX, val);
		},


		_checkY: function(val) {
			this.minY = Math.min(this.minY, val);
			this.maxY = Math.max(this.maxY, val);
		},

		_addData: function(type, howmany) {

			switch(type) {
				case 'int':
					var size = howmany * 4; // 4 byte per number (32 bits)
				break;
				case 'float':
					var size = howmany * 4; // 4 byte per number (32 bits)
				break;
			}

			var arr = new ArrayBuffer(size);

			switch(type) {
				case 'int':
					return new Int32Array(arr);
				break;

				default:
				case 'float':
					return new Float32Array(arr);
				break;
			}
		},

		empty: function() {

			for(var i = 0, l = this.lines.length; i < l; i++)
				this.groupLines.removeChild(this.lines[i]);

			while(this.groupMarkers.firstChild)
				this.groupMarkers.removeChild(this.groupMarkers.firstChild);
		},


		isMinOrMax: function(bool, xy, minmax) {
			if(bool == undefined)
				return this._isMinOrMax.x.min || this._isMinOrMax.x.max || this._isMinOrMax.y.min || this._isMinOrMax.y.max;

			if(minmax == undefined && xy != undefined) {
				this._isMinOrMax[xy].min = bool;
				this._isMinOrMax[xy].max = bool;
				return;
			}

			if(xy != undefined && minmax != undefined)
				this._isMinOrMax[xy][minmax] = bool;
		},


		draw: function(doNotRedrawZone) {

			var x, y, xpx, ypx, i = 0, l = this.data.length, j = 0, k, currentLine, doAndContinue, _higher;

			this._drawn = true;			

			this.groupMain.removeChild(this.groupLines);
			this.groupMain.removeChild(this.domMarker);
			this.marker.setAttribute('display', 'none');

//			while(this.groupLines.firstChild)
//				this.groupLines.removeChild(this.groupLines.firstChild);

			this.markerPath = '';
			this._markerPath = this.getMarkerPath();
			
			for(; i < l ; i++) {
				
				currentLine = "M ";
				doAndContinue = 0;
				_higher = false;
				var _last = false, _in = false;
				j = 0, k = 0;
				for(; j < this.data[i].length; j+=2) {

					xpx = Math.round(this.getXAxis().getPx(this.data[i][j]) * 1000) / 1000;
				//	if(xpx < this.getXAxis().getMinPx() || xpx > this.getXAxis().getMaxPx())
				//		continue;
					ypx = Math.round(this.getYAxis().getPx(this.data[i][j + 1]) * 1000) / 1000;

				/*	if((!this.getYAxis().isFlipped() && (ypx > this.getYAxis().getMaxPx() || ypx < this.getYAxis().getMinPx())) || (this.getYAxis().isFlipped() && (ypx < this.getYAxis().getMaxPx() || ypx > this.getYAxis().getMinPx()))) {

						if(_higher != (_higher = ypx > this.getYAxis().getMaxPx())) {
							if(_last) {

								currentLine = this._addPoint(currentLine, _last[0], _last[1], k);
								k++;
								_last = false;
								doAndContinue = false;
								_in = true;
							}
						}

						if(doAndContinue || k == 0) {
							_last = [xpx, ypx];
							continue;
						}
						if(_in)
							doAndContinue = 1;
						else
							_last = [xpx, ypx];
						_in = false;
					} else {
						_in = true;
						doAndContinue = false;
					}

					if(_in && _last && !doAndContinue) {
						currentLine = this._addPoint(currentLine, _last[0], _last[1], k);
						k++;
						_last = false;
					}*/
					
					currentLine = this._addPoint(currentLine, xpx, ypx, k);
					k++;
				}
				this._createLine(currentLine, i, k);
			}

			i++;
			for(; i < this.lines.length; i++) {
				this.groupLines.removeChild(this.lines[i]);
				this.lines.splice(i, 1);
			}

			

			this.domMarker.setAttribute('fill', this.options.markers.fillColor || 'transparent');
			this.domMarker.setAttribute('stroke', this.options.markers.strokeColor || this.getLineColor());
			this.domMarker.setAttribute('stroke-width', this.options.markers.strokeWidth);
			this.domMarker.setAttribute('d', this.markerPath || 'M 0 0');
			this.groupMain.appendChild(this.groupLines);
			this.groupMain.appendChild(this.domMarker);


		},

		_addPoint: function(currentLine, xpx, ypx, k) {

			if(k != 0) {
				if(this.options.lineToZero)
					currentLine += 'M ';
				else
					currentLine += "L ";
			}

			currentLine += xpx;
			currentLine += " ";
			currentLine += ypx;
			currentLine += " "; 
			
			if(this.options.lineToZero) {
				currentLine += "L ";
				currentLine += xpx;
				currentLine += " ";
				currentLine += this.getYAxis().getPos(0);
				currentLine += " ";
			}

			if(!this.options.markers.show)
				return currentLine;
			this._drawMarkerXY(xpx, ypx);
			return currentLine;
		},

		_createLine: function(points, i, nbPoints) {
			

			if(this.lines[i]) {
				var line = this.lines[i];
			} else {
				var line = document.createElementNS(this.graph.ns, 'path');
				line.setAttribute('stroke', this.getLineColor());
			//	line.setAttribute('shape-rendering', 'crispEdges');
				if(this.getLineDashArray())
					line.setAttribute('stroke-dasharray', this.getLineDashArray());

				line.setAttribute('fill', 'none');
			}

			if(nbPoints == 0) {
				line.setAttribute('d', 'M 0 0');
			} else {
				
				line.setAttribute('d', points);
			}

			if(!this.lines[i]) {			
				this.groupLines.appendChild(line);
				this.lines[i] = line;
			}
		},

		getMarkerPath: function() {

			switch(this.options.markers.type) {
				case 1:
					return 'm -2 -2 l 4 0 l 0 4 l -4 0 z';
				break;

				case 2:
					return 'm -2 -2 l 4 4 m -4 0 l 4 -4 z';
				break;
			}
		},

		_drawMarkerXY: function(x, y) {

			if(!this.options.markers.show)
				return;

			this.markerPath += 'M ' + x + ' ' + y + ' ';
			this.markerPath += this._markerPath;

			/*var shape = document.createElementNS(this.graph.ns, 'path');
			shape.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + this.options.markers.zoom + ')');
			shape.setAttribute('d', this._markerPath);
			
			this.groupMarkers.appendChild(shape);*/
		},

		autoAxis: function() {
			this.setXAxis(this.graph.getXAxis());
			this.setYAxis(this.graph.getLeftAxis());
		},


		/* AXIS */

		setXAxis: function(axis) {
			if(typeof axis == "Number")
				this.xaxis = this.graph.getXAxis(axis);
			else
				this.xaxis = axis;
		},

		setYAxis: function(axis) {
			if(typeof axis == "Number")
				this.yaxis = this.graph.getYAxis(axis);
			else
				this.yaxis = axis;
		},

		getXAxis: function() {
			return this.xaxis;
		},

		getYAxis: function() {
			return this.yaxis;
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

		/* */


		handleMouseMove: function(x, y, e) {

			if(!this.options.trackMouse)
				return;

			var valX = this.getXAxis().getMouseVal(),
				valY = this.getYAxis().getMouseVal(),
				xMinIndex, 
				xMin, 
				yMin, 
				xMax, 
				yMax;

			for(var i = 0; i < this.data.length; i++) {
				if((valX <= this.data[i][this.data[i].length - 2] && valX > this.data[i][0])) {
					xMinIndex = this._searchBinary(valX, this.data[i], false);
				} else if((valX >= this.data[i][this.data[i].length - 2] && valX < this.data[i][0])) {
					xMinIndex = this._searchBinary(valX, this.data[i], true);
				} else 
					continue;
				
				xMin = this.data[i][xMinIndex];
				xMax = this.data[i][xMinIndex + 2];
				yMin = this.data[i][xMinIndex + 1];
				yMax = this.data[i][xMinIndex + 3];
			}
			var ratio = (valX - xMin) / (xMax - xMin);

			if(!xMin)
				return false;
			else {

				var intY = ((1 - ratio) * yMin + ratio * yMax);
				this.marker.setAttribute('display', 'block');
				this.marker.setAttribute('cx', x);
				this.marker.setAttribute('cy', this.getYAxis().getPos(intY));
			}
			return {
				xBefore: xMin,
				xAfter: xMax,
				yBefore: yMin,
				yAfter: yMax,
				trueX: valX,
				interpolatedY: intY
			};
		},

		_searchBinary: function(target, haystack, reverse) {
			var seedA = 0,
				length = haystack.length;
			var seedB = (length - 2);

			if(haystack[seedA] == target)
				return seedA;

			if(haystack[seedB] == target)
				return seedB;

			var seedInt;
			var i = 0;
			
			while(true) {
				i++;
				if(i > 100)
					throw "Error loop";

				seedInt = (seedA + seedB) / 2;
				seedInt -= seedInt % 2;

				if(seedInt == seedA || haystack[seedInt] == target)
					return seedInt;

		//		console.log(seedA, seedB, seedInt, haystack[seedInt]);
				if(haystack[seedInt] <= target) {
					if(reverse)
						seedB = seedInt;
					else
						seedA = seedInt;
				} else if(haystack[seedInt] > target) {
					if(reverse)
						seedA = seedInt;
					else
						seedB = seedInt;
				}
			}
		},

		/* LINE STYLE */

		setLineStyle: function(number) {
			this.options.lineStyle = number;
		},

		getLineStyle: function() {
			return this.options.lineStyle;
		},

		getLineDashArray: function() {
			switch(this.options.lineStyle) {
				
				case 2: 
					return "5, 5";
				break;

				default:
				case 1:
					return false;
				break;

			}
		},

		/*  */



		/* LINE COLOR */

		setLineColor: function(color) {
			this.options.lineColor = color;
		},

		getLineColor: function() {
			return this.options.lineColor;
		},

		/* */



		/* MARKERS */

		showMarkers: function(skipRedraw) {
			this.options.markers.show = true;

			if(!skipRedraw && this._drawn)
				this.draw();
		},

		hideMarkes: function(skipRedraw) {
			this.options.markers.hide = true;

			if(!skipRedraw && this._drawn)
				this.draw();
		},

		setMarkerType: function(type, skipRedraw) {
			this.options.markers.type = type;
			
			if(!skipRedraw && this._drawn)
				this.draw();
		},

		setMarkerZoom: function(zoom, skipRedraw) {
			this.options.markers.zoom = zoom;

			if(!skipRedraw && this._drawn)
				this.draw();
		},

		setMarkerStrokeColor: function(color, skipRedraw) {
			this.options.markers.strokeColor = color;

			if(!skipRedraw && this._drawn)
				this.draw();
		},

		setMarkerStrokeWidth: function(width, skipRedraw) {
			this.options.markers.strokeWidth = width;

			if(!skipRedraw && this._drawn)
				this.draw();
		},

		setMarkerFillColor: function(color, skipRedraw) {
			this.options.markers.fillColor = color;

			if(!skipRedraw && this._drawn)
				this.draw();
		}
	}


	var GraphShape = function() {

	}

	GraphShape.prototype = {

		init: function(graph) {
			this.graph = graph;
			this.properties = {};
			this.createDom();
		},

		kill: function() {
			console.log('Kill');
			this.graph.shapeZone.removeChild(this._dom);
		},

		applyAll: function() {
			for(var i in this.properties)
				this._dom.setAttribute(i, this.properties[i]);
		},

		done: function() {
			this.applyAll();


			if(this._inDom)
				this.graph.shapeZone.removeChild(this._dom);
			else {
				this.graph.shapeZone.appendChild(this._dom);
				this._inDom = true;
			}
		},


		setXAxis: function(axis) {
			this.xaxis = axis;
		},

		setYAxis: function(axis) {
			this.yaxis = axis;
		},

		setSerie: function(serie) {
			this.serie = serie;
			this.setXAxis(serie.getXAxis());
			this.setYAxis(serie.getYAxis());
		},

		// Typically for x, y, x1, y2
		setByVal: function(prop, val, axis) {
			this.properties[prop] = axis == 'x' ? this.xaxis.getPx(val) : this.yaxis.getPx(val);
		},

		set: function(prop, val) {
			this.properties[prop] = val;
		}
	}

	GraphRect = function(graph) {
		this.init(graph);
	}

	$.extend(GraphRect.prototype, GraphShape.prototype, {
		
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'rect');
		},

		setWidthByVal: function(val) {
			if(this.properties.x) {
				var width = this.xaxis.getPx(val) - this.properties.x;
				if(width > 0)
					this.set('width', width);
				else {
					this.set('x', this.xaxis.getPx(val));
					this.set('width', - width);
				}
			}
		},

		setHeightByVal: function(val) {
			if(this.properties.y) {
				var height = this.yaxis.getPx(val) - this.properties.y;
				if(height > 0)
					this.set('height', height);
				else {
					this.set('y', this.yaxis.getPx(val));
					this.set('height', - height);
				}
			}
		},

		setFullWidth: function() {
			this.set('x', Math.min(this.xaxis.getMinPx(), this.xaxis.getMaxPx()));
			this.set('width', Math.abs(this.xaxis.getMaxPx() - this.xaxis.getMinPx()));
		},

		setFullHeight: function() {
			this.set('y', Math.min(this.yaxis.getMinPx(), this.yaxis.getMaxPx()));
			this.set('height', Math.abs(this.yaxis.getMaxPx() - this.yaxis.getMinPx()));
		}

	});

	return Graph;

}) ();