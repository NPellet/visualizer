
define( [ '../graph._serie'], function( GraphSerieNonInstanciable ) {

	"use strict";

	var GraphSerie = function() { }
	$.extend( GraphSerie.prototype, GraphSerieNonInstanciable.prototype, {

		defaults: {
			lineColor: 'black',
			lineStyle: 1,
			flip: false,
			label: "",

			markers: {
				show: false,
				type: 1,
				zoom: 1,
				strokeColor: false,
				strokeWidth: 1,
				fillColor: 'transparent'
			},
			
			trackMouse: false,
			trackMouseLabel: false,
			trackMouseLabelRouding: 1,
			lineToZero: false,

			lineWidth: 1,

			autoPeakPicking: false,
			autoPeakPickingNb: 4,
			autoPeakPickingMinDistance: 10
		},


		init: function( graph, name, options ) {

			var self = this;
			this.graph = graph;
			this.name = name;
			this.id = Math.random() + Date.now();

			this.shown = true;
			this.options = $.extend(true, {}, GraphSerie.prototype.defaults, options);


			this.data = [];
			this._isMinOrMax = { x: { min: false, max: false}, y: { min: false, max: false} };

			this.groupLines = document.createElementNS(this.graph.ns, 'g');
			this.domMarker = document.createElementNS(this.graph.ns, 'path');
			this.domMarker.style.cursor = 'pointer';

			this.groupMain = document.createElementNS(this.graph.ns, 'g');
			this.additionalData = {};

			this.domMarker.addEventListener('mouseover', function(e) {
				var closest = self._getMarkerIndexFromEvent(e);
				self.onMouseOverMarker(e, closest);
			});


			this.domMarker.addEventListener('mouseout', function(e) {
				var closest = self._getMarkerIndexFromEvent(e);
				self.onMouseOutMarker(e, closest);
			});


			this.domMarker.addEventListener('click', function(e) {
				var closest = self._getMarkerIndexFromEvent(e);
				self.onClickOnMarker(e, closest);
			});

			this.marker = document.createElementNS(this.graph.ns, 'circle');
			this.marker.setAttribute('fill', 'black');
			this.marker.setAttribute('r', 3);
			this.marker.setAttribute('display', 'none');

			this.markerLabel = document.createElementNS(this.graph.ns, 'text');
			this.markerLabelSquare = document.createElementNS(this.graph.ns, 'rect');
			this.markerLabelSquare.setAttribute('fill', 'white');
			this.domMarkerHover = {};
			this.domMarkerSelect = {};
			this.markerHovered = 0;
			this.groupMarkerSelected = document.createElementNS(this.graph.ns, 'g');

			this.groupLabels = document.createElementNS(this.graph.ns, 'g');
			//this.scale = 1;
			//this.shift = 0;

			this.minX = Number.MAX_VALUE;
			this.minY = Number.MAX_VALUE;
			this.maxX = Number.MIN_VALUE;
			this.maxY = Number.MIN_VALUE;

			this.lines = [];
			

			this.groupMain.appendChild(this.groupLines);
			this.groupMain.appendChild(this.groupLabels);
			this.groupMain.appendChild(this.marker);
			this.groupMain.appendChild(this.domMarker);
			this.groupMain.appendChild(this.groupMarkerSelected);
			this.groupMain.appendChild(this.markerLabelSquare);
			this.groupMain.appendChild(this.markerLabel);

			this.labels = [];

			this.currentAction = false;

			if(this.initExtended1)
				this.initExtended1();
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

			var z = 0,
				x,
				dx, 
				arg = arg || "2D", 
				type = type || 'float', 
				arr, 
				total = 0,
				continuous;

			if( ! data instanceof Array ) {
				return;
			}

			// Single object
			var datas = [];
			if( ! ( data instanceof Array ) && typeof data == 'object' ) {
				data = [ data ];
			} else if( data instanceof Array && ! ( data[ 0 ] instanceof Array ) ) {// [100, 103, 102, 2143, ...]
				data = [ data ];
				arg = "1D";
			}

			var _2d = ( arg == "2D" );

			// [[100, 0.145], [101, 0.152], [102, 0.153], [...]] ==> [[[100, 0.145], [101, 0.152], [102, 0.153], [...]]]
			if( data[ 0 ] instanceof Array && arg == "2D" && ! ( data[ 0 ][ 0 ] instanceof Array ) ) {
				data = [ data ];
			}


			if(data[ 0 ] instanceof Array) {
				for(var i = 0, k = data.length; i < k; i++) {

					arr = this._addData( type, _2d ? data[ i ].length * 2 : data[ i ].length );
					datas.push( arr );
					z = 0;
					
					for(var j = 0, l = data[ i ].length; j < l; j++) {

						if(_2d) {
							arr[z] = (data[i][j][0]);
							this._checkX(arr[z]);
							z++;
							arr[z] = (data[i][j][1]);
							this._checkY(arr[z]);
							z++;
							total++;
						} else { // 1D Array
							arr[z] = data[i][j];
							this[j % 2 == 0 ? '_checkX' : '_checkY'](arr[z]);
							z++;
							total += j % 2 ? 1 : 0;

						}
					}
				}

			} else if(typeof data[0] == 'object') {
				
				this.mode = 'x_equally_separated';

				var number = 0, numbers = [], datas = [], k = 0, o;
				for(var i = 0, l = data.length; i < l; i++) { // Several piece of data together
					number += data[i].y.length;
					continuous = (i != 0) && (!data[i + 1] || data[i].x + data[i].dx * (data[i].y.length) == data[i + 1].x);
					if( ! continuous ) {
						datas.push(this._addData(type, number));
						numbers.push(number);
						number = 0;
					}
				}

				this.xData = [];

				number = 0, k = 0, z = 0;

				for(var i = 0, l = data.length; i < l; i++) {
					x = data[i].x, dx = data[i].dx;

					this.xData.push( { x : x, dx : dx } );

					o = data[i].y.length;
					this._checkX( x );
					this._checkX( x + dx * o );

					for(var j = 0; j < o; j++) {
						/*datas[k][z] = (x + j * dx);
						this._checkX(datas[k][z]);
						z++;*/
						// 30 june 2014. To save memory I suggest that we do not add this stupid data.
			
						datas[k][z] = (data[i].y[j]);
						this._checkY(datas[k][z]);
						z++;
						total++;


					}
					number += data[i].y.length;
			
					if(numbers[k] == number) {
						k++;
						number = 0;
						z = 0;
					}
				}
			}

			// Determination of slots for low res spectrum
			var w = ( this.maxX - this.minX ) / this.graph.getDrawingWidth( ),
				ws = [];

			var min = this.graph.getDrawingWidth( ) * 4;
			var max = total / 4;

			var min = this.graph.getDrawingWidth( );
			var max = total;

			this.data = datas;
			
			if( min > 0 ) {

				while( min < max ) {
					ws.push( min );
					min *= 4;
				}

				this.slots = ws;
			
				if( this.options.useSlots ) {
					this.calculateSlots( );
				}
			}

			if( this.isFlipped() ) {

				var maxX = this.maxX;
				var maxY = this.maxY;
				var minX = this.minX;
				var minY = this.minY;

				this.maxX = maxY;
				this.maxY = maxX;

				this.minX = minY;
				this.minY = minX;
			}


			this.graph.updateAxes();


			return this;
		},


		_addData: function(type, howmany) {

			switch(type) {
				case 'int':
					var size = howmany * 4; // 4 byte per number (32 bits)
				break;
				case 'float':
					var size = howmany * 8; // 4 byte per number (64 bits)
				break;
			}

			var arr = new ArrayBuffer(size);

			switch(type) {
				case 'int':
					return new Int32Array(arr);
				break;

				default:
				case 'float':
					return new Float64Array(arr);
				break;
			}
		},

		setAdditionalData: function( data ) {
			this.additionalData = data;
			return this;
		},

		getAdditionalData: function( ) {
			return this.additionalData;
		},

		calculateSlots: function( ) {

			var self = this;
			this.slotsData = {};
			this.slotWorker = new Worker('./src/slotworker.js');

			this.slotWorker.onmessage = function( e ) {
				self.slotsData[ e.data.slot ].resolve( e.data.data );
			}

			for(var i = 0, l = this.slots.length; i < l ; i ++) {

				//this.slotsData[ i ] = $.Deferred();
				this.calculateSlot( this.slots[ i ], i );
//				this.slotsData[ this.slots[ i ] ].max = this.data[ j ][ m ];
			}
		},

		slotCalculator: function( slot, slotNumber ) {
			var def = $.Deferred();
			this.slotWorker.postMessage({ min: this.minX, max: this.maxX, data: this.data, slot: slot, slotNumber: slotNumber, flip: this.getFlip() });
			return def;
		},

		calculateSlot: function( slot, slotNumber ) {
			var self = this;
			this.slotsData[ slot ] = this.slotCalculator( slot, slotNumber );
			this.slotsData[ slot ].pipe( function( data ) {
				
				self.slotsData[ slot ] = data;
				return data;
			});
		},

		kill: function( noRedraw ) {

			this.graph.plotGroup.removeChild(this.groupMain);

			if (this.picks && this.picks.length) {
				for(var i = 0, l = this.picks.length; i < l; i++) {
					this.picks[i].kill();
				}
			}

			this.graph.series.splice(this.graph.series.indexOf(this), 1);

			if( ! noRedraw ) {
				this.graph.redraw();
			}
		},

		onMouseOverMarker: function(e, index) {
			var toggledOn = this.toggleMarker(index, true, true);
			if(this.options.onMouseOverMarker) {
				this.options.onMouseOverMarker(index, this.infos ? (this.infos[index[0]] || false) : false, [this.data[index[1]][index[0] * 2], this.data[index[1]][index[0] * 2 + 1]]);
			}
		},


		onMouseOutMarker: function(e, index) {
			this.markersOffHover();
			if(this.options.onMouseOutMarker && this.infos) {
				this.options.onMouseOutMarker(index, this.infos ? (this.infos[index[0]] || false) : false, [this.data[index[1]][index[0] * 2], this.data[index[1]][index[0] * 2 + 1]]);
			}
		},

		toggleMarker: function(index, force, hover) {
			var i = index[0],
				k = index[1] || 0;

			index = index.join();

			var _on = !hover ? !this.domMarkerSelect[index] : !this.domMarkerHover[index];
			var el = this['domMarker' + (hover ? 'Hover' : 'Select')];
			
			if(_on || (force === true && force !== false)) {

				if(!el[index]) {

					var dom = document.createElementNS(this.graph.ns, 'path');
					this.setMarkerStyleTo(dom, true);

					var x = this.getX(this.data[k][i * 2]);
					var y = this.getY(this.data[k][i * 2 + 1]);

					dom.setAttribute('d', "M " + x + " " + y + " " + this.getMarkerPath(this.options.markers.zoom + 1).join(" "));

					this['domMarker' + (hover ? 'Hover' : 'Select')][index] = dom;
					this.groupMarkerSelected.appendChild(dom);
					
					if(hover)
						this.markerHovered++;
				}

			} else if(force === false || !_on) {

				if((hover && this.domMarkerHover[index] && !this.domMarkerSelect[index]) || this.domMarkerSelect[index]) {
					
					if(!el[index])
						return;
					this.groupMarkerSelected.removeChild(el[index]);
					delete el[index];

					if(hover)
						this.markerHovered--;
				}

			}

			return _on;
		},

		markersOffHover: function() {

			for(var i in this.domMarkerHover) {
				this.toggleMarker(i.split(','), false, true);
			}
		},

		onClickOnMarker: function(e, index) {
			
			var toggledOn = this.toggleMarker(index);

			if(toggledOn && this.options.onSelectMarker)
				this.options.onSelectMarker(index, this.infos ? (this.infos[index[0]] || false) : false);

			if(!toggledOn && this.options.onUnselectMarker)
				this.options.onUnselectMarker(index, this.infos ? (this.infos[index[0]] || false) : false);

			if(this.options.onToggleMarker)
				this.options.onToggleMarker(index, this.infos ? (this.infos[index[0]] || false) : false, toggledOn);
		},


		_getMarkerIndexFromEvent: function(e) {
			var px = this.graph.getXY(e);
			return this.searchIndexByPxXY((px.x - this.graph.getPaddingLeft()), (px.y - this.graph.getPaddingTop()));

		},

		onMouseWheel: function() {},

		empty: function() {

			for(var i = 0, l = this.lines.length; i < l; i++) {
				this.groupLines.removeChild(this.lines[i]);
				
			}

			while(this.groupMarkers.firstChild) {
				this.groupMarkers.removeChild(this.groupMarkers.firstChild);
			}
		},

		select: function() {
			this.selected = true;

			for( var i = 0, l = this.lines.length ; i < l ; i ++ ) {

				this.applyLineStyle( this.lines[ i ] );
			}

			this.applyLineStyle( this.getSymbolForLegend() );
		},

		unselect: function() {

			this.selected = false;

			for( var i = 0, l = this.lines.length ; i < l ; i ++ ) {

				this.applyLineStyle( this.lines[ i ] );
			}

			this.applyLineStyle( this.getSymbolForLegend() );
		},


		draw: function() { // Serie redrawing


			var x, 
				y, 
				xpx, 
				ypx, 
				xpx2,
				ypx2,
				i = 0, 
				l = this.data.length, 
				j = 0, 
				k, 
				m,
				currentLine, 
				max,
				self = this;

			this.picks = this.picks || [];
			var shape;
			if(this.options.autoPeakPicking) {
				for(var n = 0, m = this.options.autoPeakPickingNb; n < m; n++) {
					shape = this.graph.makeShape({ type: 'label', label: {
						text: "",
						position: { x: 0 },
						anchor: 'middle'
					} } );
					shape.setSerie( this );
					this.picks.push( shape );
				}
			}


			this._drawn = true;			

			var next = this.groupLines.nextSibling;
			this.groupMain.removeChild(this.groupLines);
			this.groupMain.removeChild(this.domMarker);
			this.marker.setAttribute('display', 'none');

			
			this.markerPath = '';
			this._markerPath = this.getMarkerPath().join(' ');
			
			var incrXFlip = 0;
			var incrYFlip = 1;

			if( this.isFlipped( ) ) {
				incrXFlip = 1;
				incrYFlip = 0;
			}


			var totalLength = 0;
			for( ; i < l ; i ++ ) {
				totalLength += this.data[ i ].length / 2;
			}

			i = 0;
			var allY = [ ],
				slotToUse,
				y = 0,
				z;

			if( this.options.useSlots && this.slots ) {
				
				var slot = this.graph.getDrawingWidth( ) * ( this.maxX - this.minX ) / ( this.getXAxis().getActualMax() - this.getXAxis().getActualMin() );
				
				for( var y = 0, z = this.slots.length; y < z ; y ++ ) {

					if( slot < this.slots[ y ] ) {
						slotToUse = this.slotsData[ this.slots[ y ] ];
						break;
					}
				}
			}


			if( slotToUse ) {
				if( slotToUse.done ) {

					slotToUse.done( function( data ) {
						self.drawSlot( data, y );
					});

				} else {
					this.drawSlot( slotToUse, y );	
				}
				
			} else {
				
				if( this.mode == 'x_equally_separated' ) {

					for( ; i < l ; i ++ ) {
						
						currentLine = "M ";
						j = 0, k = 0, m = this.data[ i ].length;

						for( ; j < m ; j += 1 ) {

							if( ! this.isFlipped() ) {
							
								xpx = this.getX( this.xData[ i ].x + j * this.xData[ i ].dx );
								ypx = this.getY( this.data[ i ][ j ] );								
							} else {
								ypx = this.getX( this.xData[ i ].x + j * this.xData[ i ].dx );
								xpx = this.getY( this.data[ i ][ j ] );								
							}

							currentLine = this._addPoint( currentLine, xpx, ypx, k );
							k++;
						}
						
						this._createLine(currentLine, i, k);
					}

				} else {

					for(; i < l ; i++) {
						
						currentLine = "M ";
						j = 0, k = 0, m = this.data[ i ].length;

						for( ; j < m ; j += 2 ) {

							xpx2 = this.getX( this.data[ i ][ j + incrXFlip ] );
							ypx2 = this.getY( this.data[ i ][ j + incrYFlip ] );

							if( xpx2 == xpx && ypx2 == ypx ) {
								continue;
							}

							if(this.options.autoPeakPicking) {
								allY.push( [ ( this.data[ i ][ j + incrYFlip ] ), this.data[ i ][ j + incrXFlip ] ] );
							}
							
							currentLine = this._addPoint( currentLine, xpx2, ypx2, k );
							
							k++;

							xpx = xpx2;
							ypx = ypx2;
						}
						
						this._createLine(currentLine, i, k);
					}

				}
				
				
			}

			if( this.options.autoPeakPicking ) {
				this.makePeakPicking( allY );
			}

			i++;
			for( ; i < this.lines.length ; i++ ) {
				this.groupLines.removeChild( this.lines[ i ] );
				this.lines.splice(i, 1);
			}

			this.setMarkerStyleTo(this.domMarker);
			this.domMarker.setAttribute('d', this.markerPath || 'M 0 0');

			//this.groupMain.appendChild(this.groupLines);
			this.groupMain.appendChild(this.domMarker);
			this.groupMain.insertBefore(this.groupLines, next);
			var label;
			for( var i = 0, l = this.labels.length ; i < l ; i ++ ) {
				this.repositionLabel( this.labels[ i ] );
			}
		},

		drawSlot: function( slotToUse, y ) {

			var dataPerSlot = this.slots[ y ] / (this.maxX - this.minX);

			//console.log(slotToUse, y, this.slots[ y ]);
			
			var currentLine = "M ";
			k = 0;
			var i = 0, xpx, max;
			var j;

			var slotInit = Math.floor( ( this.getXAxis( ).getActualMin( ) - this.minX ) * dataPerSlot );
			var slotFinal = Math.ceil( ( this.getXAxis( ).getActualMax( ) - this.minX ) * dataPerSlot );

			for( j = slotInit ;  j <= slotFinal ; j ++ ) {

				if( ! slotToUse[ j ] ) {
					continue;
				}

				xpx = Math.floor( this.getX( slotToUse[ j ].x ) ),
				max = this.getY( slotToUse[ j ].max );
	
				if(this.options.autoPeakPicking) {
					allY.push( [ slotToUse[ j ].max, slotToUse[ j ].x ] );
				}
				
				currentLine = this._addPoint( currentLine, xpx, this.getY( slotToUse[ j ].start ) , k );
				currentLine = this._addPoint( currentLine, xpx, max , false, true );
				currentLine = this._addPoint( currentLine, xpx, this.getY( slotToUse[ j ].min ) );
				currentLine = this._addPoint( currentLine, xpx, this.getY( slotToUse[ j ].stop ), false, true );

				k++;
				
			}

			this._createLine(currentLine, i, k);
			i++;
			console.timeEnd('Slot');
		},

		setMarkerStyleTo: function(dom, noFill) {
			
			dom.setAttribute('fill', !noFill ? (this.options.markers.fillColor || 'transparent') : 'transparent');
			dom.setAttribute('stroke', this.options.markers.strokeColor || this.getLineColor());
			dom.setAttribute('stroke-width', this.options.markers.strokeWidth);
		},

		makePeakPicking: function(allY) {
			
			var x,
				px,
				passed = [],
				px,
				i = 0,
				l = allY.length,
				k, m, y;
			
			allY.sort(function(a, b) {
				return b[0] - a[0];
			});

			for( ; i < l ; i ++ ) {

				x = allY[i][1],
				px = this.getX(x),
				k = 0, m = passed.length,
				y = this.getY(allY[i][0]);

				if(px < this.getXAxis().getMinPx() || px > this.getXAxis().getMaxPx())
					continue;

				if(y > this.getYAxis().getMinPx() || y < this.getYAxis().getMaxPx())
					continue;

				for( ; k < m ; k++) {
					if(Math.abs(passed[k] - px) < this.options.autoPeakPickingMinDistance) {
						break;
					}
				}

				if(k < m) {
					continue;
				}

				this.picks[ m ].set('labelPosition', { 
														x: x,
				 										dy: "-10px"
				 									}
				 				);

				this.picks[ m ].data.label[ 0 ].text = String( Math.round( x * 1000 ) / 1000 );
				passed.push( px );

				if(passed.length == this.options.autoPeakPickingNb) {
					break;
				}
			}

			this.graph.redrawShapes();
		},

		hideTrackingMarker: function() {
			this.marker.setAttribute('display', 'none');
			this.markerLabel.setAttribute('display', 'none');
			this.markerLabelSquare.setAttribute('display', 'none');
		},

		
		_addPoint: function(currentLine, xpx, ypx, k, move) {
			var pos;
			
			if(k !== 0) {
				if(this.options.lineToZero || move)
					currentLine += 'M ';
				else
					currentLine += "L ";
			}

			currentLine += xpx;
			currentLine += " ";
			currentLine += ypx;	
			currentLine += " "; 
			
			if(this.options.lineToZero && (pos = this.getYAxis().getPos(0)) !== undefined) {
				currentLine += "L ";
				currentLine += xpx;
				currentLine += " ";
				currentLine += pos;
				currentLine += " ";
			}

			if(!this.options.markers.show)
				return currentLine;

			if(!(xpx > this.getXAxis().getMaxPx() || xpx < this.getXAxis().getMinPx())) {
				this._drawMarkerXY(xpx, ypx);
			}
			return currentLine;
		},

		// Returns the DOM
		_createLine: function(points, i, nbPoints) {
			

			if( this.lines[ i ] ) {
				var line = this.lines[i];
			} else {
				var line = document.createElementNS(this.graph.ns, 'path');

				this.applyLineStyle( line );
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
			
			return line;
		},

		applyLineStyle: function( line ) {
			line.setAttribute('stroke', this.getLineColor());
			line.setAttribute('stroke-width', this.getLineWidth() + ( this.isSelected() ? 2 : 0 ) );
			if(this.getLineDashArray())
				line.setAttribute('stroke-dasharray', this.getLineDashArray());
			line.setAttribute('fill', 'none');
		//	line.setAttribute('shape-rendering', 'optimizeSpeed');
		},

		getMarkerPath: function(zoom, add) {
			var z = zoom || this.options.markers.zoom,
				add = add || 0,
				el;

			switch(this.options.markers.type) {
				case 1:
					el = ['m', -2, -2, 'l', 4, 0, 'l', 0, 4, 'l', -4, 0, 'z'];
				break;

				case 2:
					el = ['m', -2, -2, 'l', 4, 4, 'l', -4, 0, 'l', 4, -4, 'z'];
				break;
			}


			if((z == 1 || !z) && !add)
				return el;

			var num = "number";
			for(var i = 0, l = el.length; i < l; i++) {
				if(typeof el[i] == num) {
					el[i] *= z;
				//	el[i] += ((!el[i] || !add) ? 0 : (Math.abs(el[i]) / el[i]) * add);
				}
			}


			return el;
		},

		_drawMarkerXY: function(x, y) {

			if(!this.options.markers.show)
				return;


			this.markerPath += 'M ' + x + ' ' + y + ' ';

			this.markerPath += this._markerPath + ' ';

			//shape.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + this.options.markers.zoom + ')');
			//shape.setAttribute('d', this._markerPath);
			
			//this.groupMarkers.appendChild(shape);*/
		},

	
		/* */
		handleLabelMove: function(x, y) {

			var label = this.labelDragging;

			if(!label)
				return;

			label.labelX += x - label.draggingIniX;
			label.draggingIniX = x;

			label.labelY += y - label.draggingIniY;
			label.draggingIniY = y;

			label.rect.setAttribute('x', label.labelX);
			label.rect.setAttribute('y', label.labelY  - this.graph.options.fontSize);
			label.labelDom.setAttribute('x', label.labelX);
			label.labelDom.setAttribute('y', label.labelY);

			label.labelLine.setAttribute('x1', label.labelX + label.labelDom.getComputedTextLength() / 2);
			label.labelLine.setAttribute('y1', label.labelY  - this.graph.options.fontSize / 2);

		},

		handleLabelMainMove: function(x, y) {
			
			if(this.options.labelMoveFollowCurve || 1 == 1) {
				var label = this.labelDragging;
				label.x = this.getXAxis().getVal(x - this.graph.options.paddingLeft);
				
				label.y = this.handleMouseMove(label.x, false).interpolatedY;
				this.repositionLabel(label, true);
			}
		},

		handleLabelUp: function() {
			
			this.labelDragging = false;
		},


		searchIndexByPxXY: function(x,y) {

			var oldDist = false,
				xyindex = false,
				dist;

			for(var i = 0, l = this.data.length; i < l; i++) {
				for(var k = 0, m = this.data[i].length; k < m; k+=2) {

					dist = Math.pow((this.getX(this.data[i][k]) - x), 2) + Math.pow((this.getY(this.data[i][k + 1]) - y), 2);
					//console.log(x, y, dist, this.data[i][k], this.data[i][k + 1]);
					if(!oldDist || dist < oldDist) {
						oldDist = dist;
						xyindex = [k / 2, i];
					}
				}
			}

			return xyindex;
		},


		searchClosestValue: function(valX) {

			var xMinIndex;

			for(var i = 0; i < this.data.length; i++) {

				if((valX <= this.data[i][this.data[i].length - 2] && valX > this.data[i][0])) {
					xMinIndex = this._searchBinary(valX, this.data[i], false);
				} else if((valX >= this.data[i][this.data[i].length - 2] && valX < this.data[i][0])) {
					xMinIndex = this._searchBinary(valX, this.data[i], true);
				} else 
					continue;
			

				return {
					dataIndex: i,
					xMin: this.data[i][xMinIndex],
					xMax: this.data[i][xMinIndex + 2],
					yMin: this.data[i][xMinIndex + 1],
					yMax: this.data[i][xMinIndex + 3],

					xBeforeIndex: xMinIndex / 2,
					xAfterIndex: xMinIndex / 2 + 2,
					xBeforeIndexArr: xMinIndex
				}	
			}
		},


		handleMouseMove: function(x, doMarker) {

			
			var valX = x || this.getXAxis().getMouseVal(),
				xMinIndex, 
				xMin, 
				yMin, 
				xMax, 
				yMax;
 			
 			var value = this.searchClosestValue(valX);
 			if(!value)
 				return;

			var ratio = (valX - value.xMin) / (value.xMax - value.xMin);
			var intY = ((1 - ratio) * value.yMin + ratio * value.yMax);

			if(doMarker && this.options.trackMouse) {
				if(!xMin)
					return false;
				else {
					
					var x = this.getX(this.getFlip() ? intY : valX);
					var y = this.getY(this.getFlip() ? valX : intY);

					this.marker.setAttribute('display', 'block');
					this.marker.setAttribute('cx', x);
					this.marker.setAttribute('cy', y);

					this.markerLabel.setAttribute('display', 'block');
					this.markerLabelSquare.setAttribute('display', 'block');
					switch(this.options.trackMouseLabel) {
						case false:
						break;

						default:
							this.markerLabel.textContent = this.options.trackMouseLabel
																.replace('<x>', valX.toFixed(this.options.trackMouseLabelRouding))
																.replace('<y>', intY.toFixed(this.options.trackMouseLabelRouding));
						break;
					}

					this.markerLabel.setAttribute('x', x + 5);
					this.markerLabel.setAttribute('y', y - 5);

					this.markerLabelSquare.setAttribute('x', x + 5);
					this.markerLabelSquare.setAttribute('y', y - 5 - this.graph.options.fontSize);
					this.markerLabelSquare.setAttribute('width', this.markerLabel.getComputedTextLength() + 2);
					this.markerLabelSquare.setAttribute('height', this.graph.options.fontSize + 2);
				}
			}

			return {
				xBefore: value.xMin,
				xAfter: value.xMax,
				yBefore: value.yMin,
				yAfter: value.yMax,
				trueX: valX,
				interpolatedY: intY,
				xBeforeIndex: value.xBeforeIndex
			};
		},

		_searchBinary: function(target, haystack, reverse) {
			var seedA = 0,
				length = haystack.length,
				seedB = (length - 2);

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
				seedInt -= seedInt % 2; // Always looks for an x.

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

		getMax: function(start, end) {

			var start2 = Math.min(start, end),
				end2 = Math.max(start, end),
				v1 = this.searchClosestValue(start2),
				v2 = this.searchClosestValue(end2),
				i, j, max = 0, initJ, maxJ;

			for(i = v1.dataIndex; i <= v2.dataIndex ; i++) {
				initJ = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
				maxJ = i == v2.dataIndex ? v2.xBeforeIndexArr : this.data[i].length;
				for(j = initJ; j <= maxJ; j+=2) {
					max = Math.max(max, this.data[i][j + 1]);
				}
			}

			return max;
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

				case false:
				case 1:
					return false;
				break;

				default:
					return this.options.lineStyle;
				break;
			}
		},

		/*  */




		setLineWidth: function(width) {
			this.options.lineWidth = width;
			return this;
		},

		getLineWidth: function() {
			return this.options.lineWidth;
		},


		/* LINE COLOR */

		setLineColor: function(color) {
			this.options.lineColor = color;
			return this;
		},

		getLineColor: function() {
			return this.options.lineColor;
		},

		/* */



		/* MARKERS */

		showMarkers: function(skipRedraw) {
			this.options.markers.show = true;

			if(!skipRedraw && this._drawn) {
				this.draw();
			}

			return this;
		},

		hideMarkers: function(skipRedraw) {
			this.options.markers.show = false;

			if( ! skipRedraw && this._drawn ) {
				this.draw();
			}

			return this;
		},

		markersShown: function() {
			return this.options.markers.show;	
		},

		setMarkerType: function(type, skipRedraw) {
			this.options.markers.type = type;
			
			if(!skipRedraw && this._drawn) {
				this.draw();
			}

			return this;
		},

		setMarkerZoom: function(zoom, skipRedraw) {
			this.options.markers.zoom = zoom;

			if(!skipRedraw && this._drawn) {
				this.draw();
			}

			return this;
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
		},

		addLabelX: function(x, label) {
			this.addLabelObj({
				x: x,
				label: label
			});
		},

		addLabel: function(x, y, label) {
			this.addLabelObj({
				x: x,
				y: y,
				label: label
			});
		},

		repositionLabel: function(label, recalculateLabel) {
			var x = !this.getFlip() ? this.getX(label.x) : this.getY(label.x),
				y = !this.getFlip() ? this.getY(label.y) : this.getX(label.y);
				
			var nan = (isNaN(x) || isNaN(y));
			label.group.setAttribute('display', nan ? 'none' : 'block');

			if(recalculateLabel) {
				label.labelDom.textContent = this.options.label
										.replace('<x>', label.x.toFixed(this.options.trackMouseLabelRouding) || '')
										.replace('<label>', label.label || '');

				label.rect.setAttribute('width', label.labelDom.getComputedTextLength() + 2);
			}
			if(nan)
				return;
			label.group.setAttribute('transform', 'translate(' + x + ' ' + y + ')');
		},

		addLabelObj: function(label) {
			var self = this, group, labelDom, rect, path;

			this.labels.push(label);
			if(label.x && !label.y) {
				label.y = this.handleMouseMove(label.x, false).interpolatedY;
			}


			
			group = document.createElementNS(this.graph.ns, 'g');
			this.groupLabels.appendChild(group);
			
			labelDom = document.createElementNS(this.graph.ns, 'text');
			labelDom.setAttribute('x', 5);
			labelDom.setAttribute('y', -5);
			

			var labelLine = document.createElementNS(this.graph.ns, 'line');
			labelLine.setAttribute('stroke', 'black');
			labelLine.setAttribute('x2', 0);
			labelLine.setAttribute('x1', 0);


			group.appendChild(labelLine);
			group.appendChild(labelDom);
			rect = document.createElementNS(this.graph.ns, 'rect');
			rect.setAttribute('x', 5);
			rect.setAttribute('y', -this.graph.options.fontSize - 5);
			rect.setAttribute('width', labelDom.getComputedTextLength() + 2);
			rect.setAttribute('height', this.graph.options.fontSize + 2);
			rect.setAttribute('fill', 'white');
			rect.style.cursor = 'move';
			labelDom.style.cursor = 'move';

			
			path = document.createElementNS(this.graph.ns, 'path');
			path.setAttribute('d', 'M 0 -4 l 0 8 m -4 -4 l 8 0');
			path.setAttribute('stroke-width', '1px');
			path.setAttribute('stroke', 'black');



			path.style.cursor = 'move';

			group.insertBefore(rect, labelDom);

			group.appendChild(path);

			label.labelLine = labelLine;
			label.group = group;
			label.rect = rect;
			label.labelDom = labelDom;
			label.path = path;

			label.labelY = -5;
			label.labelX = 5;

			this.bindLabelHandlers(label);
			this.repositionLabel(label, true);
		},

		bindLabelHandlers: function(label) {
			var self = this;

			function clickHandler(e) {

				if(self.graph.currentAction !== false) {
					return;
				}
				
				self.graph.currentAction = 'labelDragging';
				e.stopPropagation();
				label.dragging = true;

				var coords = self.graph.getXY(e);
				label.draggingIniX = coords.x;
				label.draggingIniY = coords.y;
				self.labelDragging = label;
			}

			function clickHandlerMain(e) {

				if(self.graph.currentAction !== false) {
					return;
				}
				e.stopPropagation();
				e.preventDefault();
				self.graph.currentAction = 'labelDraggingMain';
				self.labelDragging = label;
			}


			label.labelDom.addEventListener('mousedown', clickHandler);
			label.rect.addEventListener('mousedown', clickHandler);
			label.rect.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			label.labelDom.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});

			label.path.addEventListener('mousedown', clickHandlerMain);
			label.path.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
			});
		},

		getMarkerForLegend: function() {

			if( ! this.markersShown() ) {
				return;
			}

			if( ! this.markerForLegend ) {

				var marker = document.createElementNS( this.graph.ns, 'path');
				this.setMarkerStyleTo( marker , true);
				marker.setAttribute('d', "M 14 0 " + this.getMarkerPath( this.options.markers.zoom + 1 ).join(" ") );

				this.markerForLegend = marker;
			}

			return this.markerForLegend;

		}			
	} );

	return GraphSerie;
});