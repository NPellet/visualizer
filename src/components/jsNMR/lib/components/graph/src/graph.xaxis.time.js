
define( [ './graph.axis' ], function( GraphAxis ) {

	"use strict";
	
	var GraphXAxis = function(graph, topbottom, options) {
		this.init(graph, options);
		this.top = topbottom == 'top';
	}

	$.extend( GraphXAxis.prototype, GraphAxis.prototype, {

		getAxisPosition: function() {
			var size = (this.options.tickPosition == 1 ? 15 : 25) + this.graph.options.fontSize * 2;	
			if(this.options.allowedPxSerie && this.series.length > 0)
				size += this.options.allowedPxSerie;
			return size;
		},

		getAxisWidthHeight: function() {
			return;
		},

		_setShift: function() {
			this.group.setAttribute('transform', 'translate(0 ' + (this.top ? this.shift : (this.graph.getDrawingHeight() - this.shift)) + ')')
		},

		getMaxSizeTick: function() {
			return (this.top ? -1 : 1) * ((this.options.tickPosition == 1) ? 15 : 25)
		},

		drawTick: function(value, label, scaling, options) {
			var group = this.groupTicks;
			var tick = document.createElementNS(this.graph.ns, 'line'),
				val = this.getPos(value);

			if(val == undefined)
				return;

			tick.setAttribute('shape-rendering', 'crispEdges');
			tick.setAttribute('x1', val);
			tick.setAttribute('x2', val);

			tick.setAttribute('y1', (this.top ? 1 : -1) * this.tickPx1 * scaling);
			tick.setAttribute('y2', (this.top ? 1 : -1) * this.tickPx2 * scaling);

			if(label && this.options.primaryGrid)
				this.doGridLine(true, val, val, 0, this.graph.getDrawingHeight());
			else if(!label && this.options.secondaryGrid)
				this.doGridLine(false, val, val, 0, this.graph.getDrawingHeight());
			
			tick.setAttribute('stroke', 'black');

			this.groupTicks.appendChild(tick);
			if(label) {
				var groupLabel = this.groupTickLabels;
				var tickLabel = document.createElementNS(this.graph.ns, 'text');
				tickLabel.setAttribute('x', val);
				tickLabel.setAttribute('y', (this.top ? -1 : 1) * ( ( this.options.tickPosition == 1 ? 8 : 25) + ( this.top ? 10 : 0 ) ) );
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
			this.label.setAttribute('x', Math.abs(this.getMaxPx() - this.getMinPx()) / 2 + this.getMinPx());
			this.label.setAttribute('y', (this.top ? -1 : 1) * ((this.options.tickPosition == 1 ? 10 : 15) + this.graph.options.fontSize));

			this.line.setAttribute('x1', this.getMinPx());
			this.line.setAttribute('x2', this.getMaxPx());
			this.line.setAttribute('y1', 0);
			this.line.setAttribute('y2', 0);

			this.labelTspan.style.dominantBaseline = 'hanging';
			this.expTspan.style.dominantBaseline = 'hanging';
			this.expTspanExp.style.dominantBaseline = 'hanging';	
		},

		drawSeries: function() {

			if(!this.shift) {
				return;
			}

			this.rectEvent.setAttribute('y', !this.top ? 0 : -this.shift);
			this.rectEvent.setAttribute('height', this.totalDimension);
			this.rectEvent.setAttribute('x', Math.min(this.getMinPx(), this.getMaxPx()));
			this.rectEvent.setAttribute('width', Math.abs(this.getMinPx() - this.getMaxPx()));
			//this.rectEvent.setAttribute('fill', 'rgba(0, 0, 0, 0.5)');
//console.log(this.clipRect);
			this.clipRect.setAttribute('y', !this.top ? 0 : -this.shift);
			this.clipRect.setAttribute('height', this.totalDimension);
			this.clipRect.setAttribute('x', Math.min(this.getMinPx(), this.getMaxPx()));
			this.clipRect.setAttribute('width', Math.abs(this.getMinPx() - this.getMaxPx()));


			for(var i = 0, l = this.series.length; i < l; i++) { // These are the series on the axis itself !!
				this.series[i].draw();	
			}
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



		addSerie: function(name, options) {
			var serie = new GraphSerieAxisX(name, options);
			serie.setAxis(this);
			serie.init(this.graph, name, options);
			serie.autoAxis();
			serie.setXAxis(this);
			this.series.push(serie);
			this.groupSeries.appendChild(serie.groupMain);
			this.groupSeries.setAttribute('clip-path', 'url(#_clip' + this.axisRand + ')');

			return serie;
		},

		handleMouseMoveLocal: function(x, y, e) {
			x -= this.graph.getPaddingLeft();
			this.mouseVal = this.getVal(x);
		},

		isXY: function() {
			return 'x';
		}

	});

	
	return GraphXAxis;
});