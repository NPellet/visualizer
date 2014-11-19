
define( [ './graph.shape' ], function( GraphShape ) {


	var GraphRect = function( graph, options ) {

		this.options = options;
		this.init(graph);

		this.graph = graph;
		this.nbHandles = 4;
		

		this.createHandles( this.nbHandles, 'rect', { 
										transform: "translate(-3 -3)", 
										width: 6, 
										height: 6, 
										stroke: "black", 
										fill: "white"
									} );

		this.handle2.setAttribute('cursor', 'nesw-resize');
		this.handle4.setAttribute('cursor', 'nesw-resize');

		this.handle1.setAttribute('cursor', 'nwse-resize');
		this.handle3.setAttribute('cursor', 'nwse-resize');

	}

	$.extend(GraphRect.prototype, GraphShape.prototype, {
		
	
		createDom: function() {
			this._dom = document.createElementNS(this.graph.ns, 'rect');
		},

		setWidthPx: function(px) {		this.set('width', px);	},
		setHeightPx: function(px) {		this.set('height', px);	},
		setFullWidth: function() {
			this.set('x', Math.min(this.serie.getXAxis().getMinPx(), this.serie.getXAxis().getMaxPx()));
			this.set('width', Math.abs(this.serie.getXAxis().getMaxPx() - this.serie.getXAxis().getMinPx()));
		},
		setFullHeight: function() {
			this.set('y', Math.min(this.serie.getYAxis().getMinPx(), this.serie.getYAxis().getMaxPx()));
			this.set('height', Math.abs(this.serie.getYAxis().getMaxPx() - this.serie.getYAxis().getMinPx()));
		},


		setPosition: function() {

			var width = this.getFromData('width'),
				height = this.getFromData('height');

			var pos = this._getPosition( this.getFromData('pos') ),
				x = pos.x,
				y = pos.y;

			if(width == undefined || height == undefined) {
				var position2 = this._getPosition(this.getFromData('pos2'));
				width = position2.x - pos.x;
				height = position2.y - pos.y;
			} else {
				width = this.graph.getPxRel( width, this.serie.getXAxis( ) );
				height = this.graph.getPxRel( height, this.serie.getYAxis( ) );
			}

			// At this stage, x and y are in px

			x = pos.x,
			y = pos.y;

			if( width < 0 ) {		
				x += width;
				width *= -1;
			}

			if( height < 0 ) {		
				y += height;
				height *= -1;
			}


			if( x !== NaN && x !== false && y !== NaN && y !== false) {
				this.setDom('width', width);
				this.setDom('height', height);
				this.setDom('x', x);
				this.setDom('y', y);


				this.currentX = x;
				this.currentY = y;
				this.currentW = width;
				this.currentH = height;

				this.setHandles();
				

				return true;
			}

			return false;
		},

		getLinkingCoords: function() {

			return { x: this.currentX + this.currentW / 2, y: this.currentY + this.currentH / 2 };
		},

		redrawImpl: function() {

		},

		handleCreateImpl: function() {
			this.resize = true;
			this.handleSelected = 3;	
		},

		handleMouseDownImpl: function( e ) {

		},

		handleMouseUpImpl: function() {
			this.triggerChange();
		},

		handleMouseMoveImpl: function(e, deltaX, deltaY, deltaXPx, deltaYPx) {

			if( ! this.moving && ! this.handleSelected ) {
				return;
			}
			
			var w = this.getFromData('width') || 0;
			var h = this.getFromData('height') || 0;
			var pos = this.getFromData('pos');
			var pos2 = this.getFromData('pos2');

			if( ! pos2 ) {
				
				if( this.moving ) {

					pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );
					pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );

					this.setData('pos', pos);
					this.setPosition();
					return;
				}


				if( this.handleSelected == 1 ) {

					pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );
					pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );

					w = this.graph.deltaPosition( w, - deltaX, this.serie.getXAxis( ) );
					h = this.graph.deltaPosition( h, - deltaY, this.serie.getYAxis( ) );
				
				}


				if( this.handleSelected == 2 ) {

					pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );

					w = this.graph.deltaPosition( w, deltaX, this.serie.getXAxis() );
					h = this.graph.deltaPosition( h, - deltaY, this.serie.getYAxis() );	
					
					
				}


				if( this.handleSelected == 3 ) {

					w = this.graph.deltaPosition( w, deltaX, this.serie.getXAxis() );
					h = this.graph.deltaPosition( h, deltaY, this.serie.getYAxis() );	
					
				}


				if( this.handleSelected == 4 ) {

					pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );

					w = this.graph.deltaPosition( w, - deltaX, this.serie.getXAxis() );
					h = this.graph.deltaPosition( h, deltaY, this.serie.getYAxis() );
				}

				var wpx = this.graph.getPxRel( w, this.serie.getXAxis( ) );
				var hpx = this.graph.getPxRel( h, this.serie.getYAxis( ) );


				if( wpx < 0 ) {
					
					pos.x = this.graph.deltaPosition( pos.x, w );
					w = - w;	

					if( this.handleSelected == 1 ) this.handleSelected = 2;
					else if( this.handleSelected == 2 ) this.handleSelected = 1;
					else if( this.handleSelected == 3 ) this.handleSelected = 4;
					else if( this.handleSelected == 4 ) this.handleSelected = 3;	
				}


				if( hpx < 0 ) {
					
					pos.y = this.graph.deltaPosition( pos.y, h );
					h = - h;
			
					if( this.handleSelected == 1 ) this.handleSelected = 4;
					else if( this.handleSelected == 2 ) this.handleSelected = 3;
					else if( this.handleSelected == 3 ) this.handleSelected = 2;
					else if( this.handleSelected == 4 ) this.handleSelected = 1;	
				}

				this.setData('width', w);
				this.setData('height', h);

			} else {

				var invX = this.serie.getXAxis().isFlipped(),
					invY = this.serie.getYAxis().isFlipped(),
					posX = pos.x,
					posY = pos.y,
					pos2X = pos2.x,
					pos2Y = pos2.y


	
				if( this.moving ) {

					pos.x = this.graph.deltaPosition( pos.x, deltaX, this.serie.getXAxis( ) );
					pos.y = this.graph.deltaPosition( pos.y, deltaY, this.serie.getYAxis( ) );

					pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.serie.getXAxis( ) );
					pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.serie.getYAxis( ) );

					this.setData('pos', pos);
					this.setData('pos2', pos2);
					this.setPosition();
					return;
				}


				if( this.handleSelected == 1 || this.handleSelected == 4 ) {
					var inv = ! invX;
				} else {
					var inv = invX;
				}

				if( ( posX < pos2X && inv ) || ( ( posX >= pos2X && ! inv ) ) ) {
					posX = this.graph.deltaPosition( posX, deltaX, this.serie.getXAxis( ) );	
				} else {
					pos2X = this.graph.deltaPosition( pos2X, deltaX, this.serie.getXAxis( ) );	
				}


				if( this.handleSelected == 1 || this.handleSelected == 2 ) {
					var inv = ! invY;
				} else {
					var inv = invY;
				}

				if( ( posY < pos2Y && inv ) || ( ( posY >= pos2Y && ! inv ) ) ) {
					posY = this.graph.deltaPosition( posY, deltaY, this.serie.getYAxis( ) );	
				} else {
					pos2Y = this.graph.deltaPosition( pos2Y, deltaY, this.serie.getYAxis( ) );	
				}

				if( ( pos2Y > posY && pos2.y < pos.y ) || ( pos2Y < posY && pos2.y > pos.y) ) {
					
					if( this.handleSelected == 1 ) this.handleSelected = 4;
					else if( this.handleSelected == 2 ) this.handleSelected = 3;
					else if( this.handleSelected == 3 ) this.handleSelected = 2;
					else if( this.handleSelected == 4 ) this.handleSelected = 1;	
				}

				if( ( pos2X > posX && pos2.x < pos.x ) || ( pos2X < posX && pos2.x > pos.x) ) {

					if( this.handleSelected == 1 ) this.handleSelected = 2;
					else if( this.handleSelected == 2 ) this.handleSelected = 1;
					else if( this.handleSelected == 3 ) this.handleSelected = 4;
					else if( this.handleSelected == 4 ) this.handleSelected = 3;		
				}

				pos2.x = pos2X;
				pos2.y = pos2Y;
				
				pos.x = posX;
				pos.y = posY;

				this.setData( 'pos2', pos2 );
			}

			this.setData('pos', pos);

			this.setPosition();



		},

		setHandles: function() {

			if( ! this._selected || this.currentX == undefined ) {
				return;
			}

			this.addHandles();

			this.handle1.setAttribute('x', this.currentX);
			this.handle1.setAttribute('y', this.currentY);

			this.handle2.setAttribute('x', this.currentX + this.currentW);
			this.handle2.setAttribute('y', this.currentY);

			this.handle3.setAttribute('x', this.currentX + this.currentW);
			this.handle3.setAttribute('y', this.currentY + this.currentH);

			this.handle4.setAttribute('x', this.currentX);
			this.handle4.setAttribute('y', this.currentY + this.currentH);

		},

		selectStyle: function() {
			this.setDom('stroke', 'red');
			this.setDom('stroke-width', '2');
			this.setDom('fill', 'rgba(255, 0, 0, 0.1)');
		}




















	});

	return GraphRect;

});