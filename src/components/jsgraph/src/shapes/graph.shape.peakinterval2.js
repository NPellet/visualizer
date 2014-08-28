
define( [ './graph.shape.line' ], function( GraphLine ) {

	"use strict";
	var lineHeight = 5;

	var GraphPeakInterval2 = function( graph, options ) {

		this.options = options || {};
		this.init( graph );
		this.nbHandles = 2;
		this.createHandles( this.nbHandles, 'rect', { 
									transform: "translate(-3 -3)", 
									width: 6, 
									height: 6, 
									stroke: "black", 
									fill: "white",
									cursor: 'nwse-resize'
								} );

	}
	$.extend(GraphPeakInterval2.prototype, GraphLine.prototype, {
		
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'line');
			this.line1 = document.createElementNS( this.graph.ns, 'line');
			this.line2 = document.createElementNS( this.graph.ns, 'line');

			this.group.appendChild( this.line1 );
			this.group.appendChild( this.line2 );

			this.line1.setAttribute('stroke', 'black');
			this.line2.setAttribute('stroke', 'black');

			this._dom.element = this;
		},


		redrawImpl: function() {

			this.setPosition();
			this.setPosition2();
			this.setHandles();

			this.redrawLines( lineHeight );
			

			this.setBindableToDom( this._dom );
		},

		redrawLines: function( height ) {


			var xs = this.findxs();

			var x1 = this._getPosition( { x: xs[ 0 ] } );
			var x2 = this._getPosition( { x: xs[ 1 ] } );

			if( x1.x && x2.x && this.currentPos2y && this.currentPos1y ) {
				this.line1.setAttribute('x1', x1.x );
				this.line1.setAttribute('x2', x1.x );

				this.line2.setAttribute('x1', x2.x );
				this.line2.setAttribute('x2', x2.x );

				this.setLinesY( height );
			}


		},

		setLinesY: function( height ) {

			this.line1.setAttribute('y1', this.currentPos2y - height );
			this.line1.setAttribute('y2', this.currentPos2y + height );

			this.line2.setAttribute('y1', this.currentPos1y - height );
			this.line2.setAttribute('y2', this.currentPos1y + height );

		},


		findxs: function() {

			
			var posXY = this._getPosition( this.getFromData( 'pos' ) ),
				posXY2 = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) ),
				w = Math.abs(posXY.x - posXY2.x),
				x = Math.min(posXY.x, posXY2.x);

			this.reversed = x == posXY2.x;
			
			if( w < 2 || x + w < 0 || x > this.graph.getDrawingWidth( ) ) {
				return false;
			}

			var v1 = this.serie.searchClosestValue( this.getFromData( 'pos' ).x ),
				v2 = this.serie.searchClosestValue( this.getFromData( 'pos2' ).x ),
				v3,
				i, 
				j, 
				init, 
				max, 
				k, 
				x, 
				y, 
				firstX, 
				firstY, 
				currentLine = "",
				maxY = 0,
				minY = Number.MAX_VALUE;

			if(! v1 || ! v2) {
				return false;
			}

			if( v1.xBeforeIndex > v2.xBeforeIndex ) {
				v3 = v1;
				v1 = v2;
				v2 = v3;
			}

			var firstX, firstY, lastX, lastY, sum = 0, diff;
			var ratio = this.scaling;
			var points = [];
			var sums = [],
				xs = [];

			for(i = v1.dataIndex; i <= v2.dataIndex ; i++) {

				init = i == v1.dataIndex ? v1.xBeforeIndexArr : 0;
				max = i == v2.dataIndex ? v2.xBeforeIndexArr : this.serie.data[i].length;
				k = 0;
				
				for(j = init; j <= max; j+=2) {

					x = this.serie.data[ i ][ j + 0 ],
					y = this.serie.data[ i ][ j + 1 ];


					if( ! firstX ) {
						firstX = x;
						firstY = y;
					}

					
					if( lastX == undefined ) {
						lastX = x;
						lastY = y;
					}

					sum += Math.abs( ( x - lastX ) * ( y - lastY ) * 0.5 );
					sums.push( sum );
					xs.push( x );

					lastX = x;
					lastY = y;

					k++;
				}

				this.lastX = x;
				this.lastY = y;
				
				if(! firstX || ! firstY || ! this.lastX || ! this.lastY) {
					return false;
				}								
			}

			if( sum == 0 ) {
				return [ firstX, lastX ];
			}

			var limInf = 0.05 * sum,
				limSup = 0.95 * sum,
				xinf = false,
				xsup = false;


			for( var i = 0, l = sums.length ; i < l ; i ++ ) {

				if( sums[ i ] > limInf ) {
					xinf = i;
					break;
				}
			}

			for( var i = sums.length; i > 0 ; i -- ) {

				if( sums[ i ] < limSup ) {
					xsup = i;
					break;
				}
			}

			return [ xs[ xinf ], xs[ xsup ] ];
		},

		highlight: function() {

			if( this.isBindable() ) {
				this._dom.setAttribute('stroke-width', '5');
				this.setLinesY( lineHeight + 2 );
			}
		},


		unhighlight: function() {

			if( this.isBindable() ) {
				this.setStrokeWidth();
				this.setLinesY( lineHeight );
			}
		}
	});

	return GraphPeakInterval2;
});