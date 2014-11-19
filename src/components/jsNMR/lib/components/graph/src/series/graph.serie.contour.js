
define( [ './graph.serie.line' ], function( GraphSerie ) {

	var GraphSerieContour = function() {
		this.accumulatedDelta = 0;
		this.threshold = 0;
	};

	$.extend( GraphSerieContour.prototype, GraphSerie.prototype, {

		setData: function(data, arg, type) {

			var z = 0;
			var x, dx, arg = arg || "2D", type = type || 'float', i, l = data.length, arr, datas = [];
		
			if( ! data instanceof Array ) {
				return;
			}

			for(var i = 0; i < l; i++) {
				k =  k = data[i].lines.length;
				arr = this._addData(type, k);

				for( var j = 0; j < k; j+=2 ) {

					arr[ j ] = data[i].lines[ j ];
					this._checkX( arr[ j ] );
					arr[ j + 1 ] = data[ i ].lines[ j + 1 ];
					this._checkY( arr[ j + 1 ] );
				}

				datas.push({lines: arr, zValue: data[i].zValue});
			}
			this.data = datas;

			return this;
		},


		draw: function(doNotRedrawZone) {


			var x, y, xpx, ypx, xpx2, ypx2, i = 0, l = this.data.length, j = 0, k, m, currentLine, domLine, arr;
			this.minZ = -Number.MAX_VALUE;
			this.maxZ = Number.MAX_VALUE;

			var next = this.groupLines.nextSibling;
			this.groupMain.removeChild(this.groupLines);
			this.zValues = {};

			var incrXFlip = 0;
			var incrYFlip = 1;
			if(this.getFlip()) {
				incrXFlip = 0;
				incrYFlip = 1;
			}


			for(; i < l ; i++) {

				j = 0, k = 0, currentLine = "";

				for( arr = this.data[i].lines, m = arr.length; j < m; j += 4 ) {
				
					var lastxpx, lastypx;

					xpx2 = this.getX(arr[j + incrXFlip]);
					ypx2 = this.getY(arr[j + incrYFlip]);
				
					xpx = this.getX(arr[j + 2 + incrXFlip]);
					ypx = this.getY(arr[j + 2 + incrYFlip]);
					
					if( xpx == xpx2 && ypx == ypx2 ) {
						continue;
					}

					if( j > 0 && ( lastxpx !== undefined && lastypx !== undefined && Math.abs( xpx2 - lastxpx ) <= 30 && Math.abs( ypx2 - lastypx ) <= 30 ) ) {
						currentLine += "L";
					} else {
						currentLine += "M";	
					}

					currentLine += xpx2;
					currentLine += " ";
					currentLine += ypx2;

					currentLine += "L";
					currentLine += xpx;
					currentLine += " ";
					currentLine += ypx;

					lastxpx = xpx;
					lastypx = ypx;

					k++;
				}
				
				domLine = this._createLine(currentLine + " z", i, k);
				domLine.setAttribute('data-zvalue', this.data[i].zValue);
				
				if( this.zoneColors && this.zoneColors[ i ] ) {

					domLine.setAttribute( 'fill', this.zoneColors[ i ] );
				}

				this.zValues[ this.data[ i ].zValue ] = { dom: domLine };

				this.minZ = Math.max( this.minZ, this.data[ i ].zValue );
				this.maxZ = Math.min( this.maxZ, this.data[ i ].zValue );
			}

			i++;

			for(; i < this.lines.length; i++) {

				this.groupLines.removeChild(this.lines[i]);
				this.lines.splice(i, 1);

			}

			this.groupMain.insertBefore(this.groupLines, next);
		},

		onMouseWheel: function( delta, e ) {

			this.accumulatedDelta = Math.min( 1, Math.max( -1, this.accumulatedDelta + Math.min( 0.1, Math.max( -0.1, delta ) ) ) );
			this.threshold = Math.max(-this.minZ, this.maxZ) * (Math.pow(this.accumulatedDelta, 3));

			for(var i in this.zValues) {
				this.zValues[i].dom.setAttribute('display', Math.abs(i) < this.threshold ? 'none' : 'block');
			}
		},


		setColors: function( colors ) {
			this.zoneColors = colors;
		}
	});

	return GraphSerieContour;

});