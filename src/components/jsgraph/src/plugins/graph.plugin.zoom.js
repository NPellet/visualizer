
define([], function() {

	var plugin =  function() { };

	plugin.prototype = {

		init: function( graph, options ) {

			this._zoomingGroup = document.createElementNS( graph.ns, 'g' );
			this._zoomingSquare = document.createElementNS(graph.ns, 'rect');
			this._zoomingSquare.setAttribute('display', 'none');

			graph.setAttributeTo(this._zoomingSquare, {
				'display': 'none',
				'fill': 'rgba(171,12,12,0.2)',
				'stroke': 'rgba(171,12,12,1)',
				'shape-rendering': 'crispEdges',
				'x': 0,
				'y': 0,
				'height': 0,
				'width': 0
			});




			this.options = options;
			this.graph = graph;
			graph.dom.appendChild(this._zoomingGroup);
			this._zoomingGroup.appendChild(this._zoomingSquare);
		},

		onMouseDown: function( graph, x, y, e, mute ) {

			var zoomMode = this.options.zoomMode;

			if( ! zoomMode ) {
				return;
			}

			this._zoomingMode = zoomMode;


			if( x === undefined ) {
				this._backedUpZoomMode = this._zoomingMode;
				this._zoomingMode = 'y';	
				x = 0;
			}

			if( y === undefined ) {
				this._backedUpZoomMode = this._zoomingMode;
				this._zoomingMode = 'x';	
				y = 0;
			}

			this._zoomingXStart = x;
			this._zoomingYStart = y;
			this.x1 = x - graph.getPaddingLeft();
			this.y1 = y - graph.getPaddingTop();

			this._zoomingSquare.setAttribute('width', 0);
			this._zoomingSquare.setAttribute('height', 0);
			this._zoomingSquare.setAttribute('display', 'block');



			switch( this._zoomingMode ) {

				case 'x': 
					this._zoomingSquare.setAttribute('y', graph.options.paddingTop);
					this._zoomingSquare.setAttribute('height', graph.getDrawingHeight() - graph.shift[0]);
				break;

				case 'y':
					this._zoomingSquare.setAttribute('x', graph.options.paddingLeft/* + this.shift[1]*/);
					this._zoomingSquare.setAttribute('width', graph.getDrawingWidth()/* - this.shift[1] - this.shift[2]*/);
				break;

			}

			if( this.options.onZoomStart && ! mute ) {
				this.options.onZoomStart( graph, x, y, e, mute );
			}
		},

		onMouseMove: function(graph, x, y, e, mute) {
			
		//	this._zoomingSquare.setAttribute('display', 'none');

	//	this._zoomingSquare.setAttribute('transform', 'translate(' + Math.random() + ', ' + Math.random() + ') scale(10, 10)');

			switch(this._zoomingMode) {

				case 'xy':
					this._zoomingSquare.setAttribute('x', Math.min(this._zoomingXStart, x));
					this._zoomingSquare.setAttribute('y', Math.min(this._zoomingYStart, y));
					this._zoomingSquare.setAttribute('width', Math.abs(this._zoomingXStart - x));
					this._zoomingSquare.setAttribute('height', Math.abs(this._zoomingYStart - y));


				break;

				case 'x': 
					this._zoomingSquare.setAttribute('x', Math.min(this._zoomingXStart, x));
					this._zoomingSquare.setAttribute('width', Math.abs(this._zoomingXStart - x));


				break;

				case 'y':
					this._zoomingSquare.setAttribute('y', Math.min(this._zoomingYStart, y));
					this._zoomingSquare.setAttribute('height', Math.abs(this._zoomingYStart - y));
				break;
			}	


			if( this.options.onZoomMove && ! mute ) {

				this.options.onZoomMove( graph, x, y, e, mute );
			}
	//		this._zoomingSquare.setAttribute('display', 'block');

		},

		onMouseUp: function(graph, x, y, e, mute ) {

			this._zoomingSquare.setAttribute('display', 'none');
			var _x = x - graph.options.paddingLeft;
			var _y = y - graph.options.paddingTop;

			if((x - this._zoomingXStart == 0 && this._zoomingMode != 'y') || (y - this._zoomingYStart == 0 && this._zoomingMode != 'x')) {
				return;
			}

			switch(this._zoomingMode) {
				case 'x':
					graph.applyToAxes('_doZoom', [_x, this.x1], true, false);
				break;
				case 'y':
					graph.applyToAxes('_doZoom', [_y, this.y1], false, true);
				break;
				case 'xy':
					graph.applyToAxes('_doZoom', [_x, this.x1], true, false);
					graph.applyToAxes('_doZoom', [_y, this.y1], false, true);
				break;
			}
			
			graph.redraw(true);
			graph.drawSeries();

			if( this.options.onZoomEnd && ! mute ) {
				this.options.onZoomEnd( graph, x, y, e, mute );
			}

			if( this._backedUpZoomMode ) {
				this._zoomingMode = this._backedUpZoomMode;
			}
		},

		onMouseWheel: function( delta, e ) {

			var serie;
			if( ( serie = this.graph.getSelectedSerie() ) ) {

				serie.getYAxis().handleMouseWheel( delta, e );
				return;	
			} 

			this.graph.applyToAxes('handleMouseWheel', [ delta, e ], false, true);	
		},

		onDblClick: function( graph, x, y, pref, e, mute ) {

			var	xAxis = this.graph.getXAxis(),
				yAxis = this.graph.getYAxis();

			if( pref.mode == 'xtotal' ) {

				this.graph.applyToAxes( "setMinMaxToFitSeries", null, true, false );
				this.graph.drawSeries();
				
				
			}


			else if( pref.mode == 'ytotal' ) {

				this.graph.applyToAxes( "setMinMaxToFitSeries", null, false, true );
				this.graph.drawSeries();
				
				
			}


			else if( pref.mode == 'total' ) {

				this.graph.autoscaleAxes();
				this.graph.drawSeries();

				if( yAxis.options.onZoom ) {
					yAxis.options.onZoom( yAxis.getMinValue(), yAxis.getMaxValue() );
				}

				if( xAxis.options.onZoom ) {
					xAxis.options.onZoom( xAxis.getMinValue(), xAxis.getMaxValue() );
				}

				
			} else {

	 			x -= this.graph.options.paddingLeft;
	 			y -= this.graph.options.paddingTop;

				var
					xMin = xAxis.getActualMin(),
					xMax = xAxis.getActualMax(),
					xActual = xAxis.getVal(x),
					diffX = xMax - xMin,

					yMin = yAxis.getActualMin(),
					yMax = yAxis.getActualMax(),
					yActual = yAxis.getVal(y),
					diffY = yMax - yMin;

				if(pref.mode == 'gradualXY' || pref.mode == 'gradualX') {

					var ratio = (xActual - xMin) / (xMax - xMin);
					xMin = Math.max(xAxis.getMinValue(), xMin - diffX * ratio);
					xMax = Math.min(xAxis.getMaxValue(), xMax + diffX * (1 - ratio));
					xAxis.setCurrentMin(xMin);
					xAxis.setCurrentMax(xMax);

					if( xAxis.options.onZoom ) {
						xAxis.options.onZoom( xMin, xMax );
					}
				}

				if(pref.mode == 'gradualXY' || pref.mode == 'gradualY') {

					var ratio = (yActual - yMin) / (yMax - yMin);
					yMin = Math.max(yAxis.getMinValue(), yMin - diffY * ratio);
					yMax = Math.min(yAxis.getMaxValue(), yMax + diffY * (1 - ratio));
					yAxis.setCurrentMin(yMin);
					yAxis.setCurrentMax(yMax);


					if( yAxis.options.onZoom ) {
						yAxis.options.onZoom( yMin, yMax );
					}
				}

				this.graph.redraw( );
				this.graph.drawSeries( );
			}

			if( this.options.onDblClick && ! mute ) {

				this.options.onDblClick( x, y, pref, e );
			}
		}
	}

	return plugin;
});
