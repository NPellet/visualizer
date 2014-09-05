
define( [ './graph.shape' ], function( GraphShape ) {


	var GraphLine = function( graph, options ) {

		this.init( graph );
		this.options = options || {};
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
	$.extend(GraphLine.prototype, GraphShape.prototype, {
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'line');
		},

		setPosition: function() {
			var position = this._getPosition( this.getFromData('pos') );

			if( ! position.x || ! position.y) {
				return;
			}

			this.setDom('x2', position.x);
			this.setDom('y2', position.y);


			this.currentPos1x = position.x;
			this.currentPos1y = position.y;

			return true;
		},

		setPosition2: function() {

			var position = this._getPosition( this.getFromData( 'pos2' ), this.getFromData( 'pos' ) );

			if( ! position.x || ! position.y ) {
				return;
			}

			this.setDom( 'y1', position.y );
			this.setDom( 'x1', position.x );
			
			this.currentPos2x = position.x;
			this.currentPos2y = position.y;
		},

		redrawImpl: function() {
			this.setPosition();
			this.setPosition2();
			this.setHandles();

		},

		getLinkingCoords: function() {

			return { x:  ( this.currentPos2x + this.currentPos1x ) / 2, y: ( this.currentPos2y + this.currentPos1y ) / 2 };
		},

		handleCreateImpl: function() {
			
			this.resize = true;
			this.handleSelected = 2;	
		
		},

		handleMouseDownImpl: function( e ) {

			return true;
		},

		handleMouseUpImpl: function() {

			this.triggerChange();
			return true;
		},

		handleMouseMoveImpl: function(e, deltaX, deltaY, deltaXPx, deltaYPx) {

			if( this.isLocked() ) {
				return;
			}


			var pos = this.getFromData('pos');
			var pos2 = this.getFromData('pos2');


			if( this.handleSelected == 1 ) {

				if( ! this.options.vertical ) {
					pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );
				}

				if( ! this.options.horizontal ) {
					pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );
				}

			}


			if( this.handleSelected == 2 ) {

				if( ! this.options.vertical ) {
					pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.serie.getXAxis( ) );
				}

				if( ! this.options.horizontal ) {
					pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.serie.getYAxis( ) );
				}
			}

			if( this.options.forcedCoords ) {

				var forced = this.options.forcedCoords;	

				if( forced.y !== undefined ) {
					pos2.y = forced.y;
					pos.y = forced.y;
				}

				if( forced.x !== undefined ) {
					pos2.x = forced.x;
					pos.x = forced.x;
				}
			}

			if( this.moving ) {

				pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );
				pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );
				pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.serie.getXAxis( ) );
				pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.serie.getYAxis( ) );

			}

			
			this.redrawImpl();
			
			return true;

		},

		setHandles: function() {

			if( this.isLocked() ) {
				return;
			}
			

			if( ! this._selected || this.currentPos1x == undefined ) {
				return;
			}

			this.addHandles();
			

			this.handle1.setAttribute('x', this.currentPos1x);
			this.handle1.setAttribute('y', this.currentPos1y);

			this.handle2.setAttribute('x', this.currentPos2x);
			this.handle2.setAttribute('y', this.currentPos2y);
		},

		selectStyle: function() {
			this.setDom('stroke', 'red');
			this.setDom('stroke-width', '2');
		}



	});

	return GraphLine;

});