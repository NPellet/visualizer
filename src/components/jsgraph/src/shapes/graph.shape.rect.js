define( [ './graph.shape' ], function( GraphShape ) {

  var GraphRect = function( graph, options ) {

    this.options = options;
    this.init( graph );

    this.graph = graph;
    this.nbHandles = 4;

    this.options.handles = this.options.handles ||  {
      type: 'corners'
    };

    switch ( this.options.handles.type ) {

      case 'sides':

        this.options.handles.sides = this.options.handles.sides || {
          top: true,
          bottom: true,
          left: true,
          right: true
        };

        var j = 0;
        for ( var i in this.options.handles.sides ) {
          if ( this.options.handles.sides[ i ] ) {
            j++;
          }
        }

        this.createHandles( j, 'g' ).map( function( g ) {

          var r = document.createElementNS( graph.ns, 'rect' );
          r.setAttribute( 'x', '-3' );
          r.setAttribute( 'width', '6' );
          r.setAttribute( 'y', '-6' );
          r.setAttribute( 'height', '12' );
          r.setAttribute( 'stroke', 'black' );
          r.setAttribute( 'fill', 'white' );
          r.setAttribute( 'cursor', 'pointer' );

          g.appendChild( r );
        } );

        var j = 1;
        this.handles = {};
        this.sides = [];
        for ( var i in this.options.handles.sides ) {
          if ( this.options.handles.sides[ i ] ) {
            this.handles[ i ] = this[ 'handle' + j ];
            this.sides[ j ] = i;
            j++;
          }

        }

        break;

      default:
      case 'corners':
        this.createHandles( this.nbHandles, 'rect', {
          transform: "translate(-3 -3)",
          width: 6,
          height: 6,
          stroke: "black",
          fill: "white"
        } );

        this.handle2.setAttribute( 'cursor', 'nesw-resize' );
        this.handle4.setAttribute( 'cursor', 'nesw-resize' );

        this.handle1.setAttribute( 'cursor', 'nwse-resize' );
        this.handle3.setAttribute( 'cursor', 'nwse-resize' );

        break;

    }

  }

  $.extend( GraphRect.prototype, GraphShape.prototype, {

    createDom: function() {
      this._dom = document.createElementNS( this.graph.ns, 'rect' );
    },

    setWidthPx: function( px ) {
      this.set( 'width', px );
    },
    setHeightPx: function( px ) {
      this.set( 'height', px );
    },
    setFullWidth: function() {
      this.set( 'x', Math.min( this.getXAxis().getMinPx(), this.getXAxis().getMaxPx() ) );
      this.set( 'width', Math.abs( this.getXAxis().getMaxPx() - this.getXAxis().getMinPx() ) );
    },
    setFullHeight: function() {
      this.set( 'y', Math.min( this.getYAxis().getMinPx(), this.getYAxis().getMaxPx() ) );
      this.set( 'height', Math.abs( this.getYAxis().getMaxPx() - this.getYAxis().getMinPx() ) );
    },

    setPosition: function() {

      var width = this.getFromData( 'width' ),
        height = this.getFromData( 'height' );
      

      var pos = this._getPosition( this.getFromData( 'pos' ) ),
        x = pos.x,
        y = pos.y;

      if ( width == undefined || height == undefined ) {

        var position2 = this._getPosition( this.getFromData( 'pos2' ) );

        if ( !position2 ) {
          throw "Position 2 was undefined";
          return;
        }

        width = position2.x - pos.x;
        height = position2.y - pos.y;

      } else {
        width = this.graph.getPxRel( width, this.getXAxis() );
        height = this.graph.getPxRel( height, this.getYAxis() );
      }

      // At this stage, x and y are in px

      x = pos.x,
      y = pos.y;

      this.currentX = x;
      this.currentY = y;
      this.currentW = width;
      this.currentH = height;

      this.valX = this.getXAxis().getVal( x );
      this.valY = this.getYAxis().getVal( x );
      this.valWidth = this.getXAxis().getRelVal( width );
      this.valHeight = this.getYAxis().getRelVal( height );

      this.minX = this.valX;
      this.minY = this.valY;
      this.maxX = this.valX + this.valWidth;
      this.maxY = this.valY + this.valHeight;

      if ( width < 0 ) {
        x += width;
        width *= -1;
      }

      if ( height < 0 ) {
        y += height;
        height *= -1;
      }

      if ( !isNaN( x ) && !isNaN( y ) && x !== false && y !== false ) {

        this.setDom( 'width', width );
        this.setDom( 'height', height );
        this.setDom( 'x', x );
        this.setDom( 'y', y );

        this.setHandles();
        this.updateMask();

        return true;
      }

      return false;
    },

    getLinkingCoords: function() {

      return {
        x: this.currentX + this.currentW / 2,
        y: this.currentY + this.currentH / 2
      };
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

      var pos = this.getFromData( 'pos' );
      var pos2 = this.getFromData( 'pos2' );

      /*	if( pos2.y < pos.y ) {
				var y = pos.y;
				pos.y = pos2.y;
				pos2.y = y;
			}
		*/
      this.triggerChange();
    },

    handleMouseMoveImpl: function( e, deltaX, deltaY, deltaXPx, deltaYPx ) {

      if ( !this.moving && !this.handleSelected ) {
        return;
      }

      var w = this.getFromData( 'width' );
      var h = this.getFromData( 'height' );
      var pos = this.getFromData( 'pos' );
      var pos2 = this.getFromData( 'pos2' );

      if ( pos2.dx ) {

        pos2.x = this.graph.deltaPosition( pos2.x ||  pos.x, pos2.dx, this.getXAxis() );
        pos2.dx = false;
      }

      if ( pos2.dy ) {
        pos2.y = this.graph.deltaPosition( pos2.x ||  pos.x, pos2.dx, this.getXAxis() );
        pos2.dy = false;
      }

      if ( w !== undefined && h !== undefined ) {

        if ( this.moving ) {

          pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
          pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );

          this.setData( 'pos', pos );
          this.setPosition();
          return;
        }

        switch ( this.options.handles.type ) {

          /*
this.handle1.setAttribute('x', this.currentX);
					this.handle1.setAttribute('y', this.currentY + this.currentH / 2);

					this.handle2.setAttribute('x', this.currentX + this.currentW );
					this.handle2.setAttribute('y', this.currentY + this.currentH / 2);

					this.handle3.setAttribute('x', this.currentX + this.currentW / 2);
					this.handle3.setAttribute('y', this.currentY);

					this.handle4.setAttribute('x', this.currentX + this.currentH / 2);
					this.handle4.setAttribute('y', this.currentY + this.currentH);
					*/
          case 'sides':

            switch ( this.sides[ this.handleSelected ] ) {

              case 'left':
                pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
                w = this.graph.deltaPosition( w, -deltaX, this.getXAxis() );
                break;

              case 'right':
                w = this.graph.deltaPosition( w, deltaX, this.getXAxis() );
                break;

              case 'top':
                pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );
                h = this.graph.deltaPosition( h, -deltaX, this.getYAxis() );
                break;

              case 'bottom':
                h = this.graph.deltaPosition( h, deltaY, this.getYAxis() );
                break;

            }

            break;

          case 'corners':
          default:

            if ( this.handleSelected == 1 ) {

              pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
              pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );

              w = this.graph.deltaPosition( w, -deltaX, this.getXAxis() );
              h = this.graph.deltaPosition( h, -deltaY, this.getYAxis() );

            }

            if ( this.handleSelected == 2 ) {

              pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );

              w = this.graph.deltaPosition( w, deltaX, this.getXAxis() );
              h = this.graph.deltaPosition( h, -deltaY, this.getYAxis() );

            }

            if ( this.handleSelected == 3 ) {

              w = this.graph.deltaPosition( w, deltaX, this.getXAxis() );
              h = this.graph.deltaPosition( h, deltaY, this.getYAxis() );

            }

            if ( this.handleSelected == 4 ) {

              pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );

              w = this.graph.deltaPosition( w, -deltaX, this.getXAxis() );
              h = this.graph.deltaPosition( h, deltaY, this.getYAxis() );
            }
            break;
        }

        var wpx = this.graph.getPxRel( w, this.getXAxis() );
        var hpx = this.graph.getPxRel( h, this.getYAxis() );
        /*

				if( wpx < 0 ) {
					
					pos.x = this.graph.deltaPosition( pos.x, w );
					w = - w;	

					switch( this.options.handles.type ) {

						case 'corners':
							if( this.handleSelected == 1 ) this.handleSelected = 2;
							else if( this.handleSelected == 2 ) this.handleSelected = 1;
							else if( this.handleSelected == 3 ) this.handleSelected = 4;
							else if( this.handleSelected == 4 ) this.handleSelected = 3;	
						break;
					}
					
				}


				if( hpx < 0 ) {
					
					pos.y = this.graph.deltaPosition( pos.y, h );
					h = - h;
				


					switch( this.options.handles.type ) {


						case 'corners':
							if( this.handleSelected == 1 ) this.handleSelected = 4;
							else if( this.handleSelected == 2 ) this.handleSelected = 3;
							else if( this.handleSelected == 3 ) this.handleSelected = 2;
							else if( this.handleSelected == 4 ) this.handleSelected = 1;	
						break;
					}

					
				}*/

        this.setData( 'width', w );
        this.setData( 'height', h );

      } else {

        var invX = this.getXAxis().isFlipped(),
          invY = this.getYAxis().isFlipped(),
          posX = pos.x,
          posY = pos.y,
          pos2X = pos2.x,
          pos2Y = pos2.y

        if ( this.moving ) {

          pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
          pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );

          pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.getXAxis() );
          pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.getYAxis() );

          this.setData( 'pos', pos );
          this.setData( 'pos2', pos2 );
          this.setPosition();

          return;

        }

        switch ( this.options.handles.type ) {

          case 'sides':
            // Do nothing for now

            switch ( this.sides[ this.handleSelected ] ) {

              case 'left':
                pos.x = this.graph.deltaPosition( pos.x, deltaX, this.getXAxis() );
                break;

              case 'right':
                pos2.x = this.graph.deltaPosition( pos2.x, deltaX, this.getXAxis() );
                break;

              case 'top':
                pos.y = this.graph.deltaPosition( pos.y, deltaY, this.getYAxis() );
                break;

              case 'bottom':
                pos2.y = this.graph.deltaPosition( pos2.y, deltaY, this.getYAxis() );
                break;

            }

            break;

          case 'corners':
          default:

            if ( this.handleSelected == 1 ) {

              posX = this.graph.deltaPosition( posX, deltaX, this.getXAxis() );
              posY = this.graph.deltaPosition( posY, deltaY, this.getYAxis() );

            } else if ( this.handleSelected == 2 ) {

              pos2X = this.graph.deltaPosition( pos2X, deltaX, this.getXAxis() );
              posY = this.graph.deltaPosition( posY, deltaY, this.getYAxis() );

            } else if ( this.handleSelected == 3 ) {

              pos2Y = this.graph.deltaPosition( pos2Y, deltaY, this.getYAxis() );
              pos2X = this.graph.deltaPosition( pos2X, deltaX, this.getXAxis() );

            } else if ( this.handleSelected == 4 ) {

              posX = this.graph.deltaPosition( posX, deltaX, this.getXAxis() );
              pos2Y = this.graph.deltaPosition( pos2Y, deltaY, this.getYAxis() );

            }

            pos2.x = pos2X;
            pos2.y = pos2Y;

            pos.x = posX;
            pos.y = posY;

            
            break;

        }

        this.setData( 'pos2', pos2 );
      }

      this.setData( 'pos', pos );

      this.setPosition();

    },

    setHandles: function() {

      if ( !this.handlesInDom ) {
        return;
      }

      if ( this.currentX == undefined ) {
        return;
      }

      switch ( this.options.handles.type ) {

        case 'sides':

          if ( this.handles.left ) {
            this.handles.left.setAttribute( 'transform', 'translate(' + this.currentX + ' ' + ( this.currentY + this.currentH / 2 ) + ')' );
          }

          if ( this.handles.right ) {
            this.handles.right.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW ) + ' ' + ( this.currentY + this.currentH / 2 ) + ')' );
          }

          if ( this.handles.top ) {
            this.handles.top.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW / 2 ) + ' ' + this.currentY + ')' );
          }

          if ( this.handles.bottom ) {
            this.handles.bottom.setAttribute( 'transform', 'translate( ' + ( this.currentX + this.currentW / 2 ) + ' ' + ( this.currentY + this.currentH ) + ')' );
          }

          break;

        case 'corners':
        default:

          this.handle1.setAttribute( 'x', this.currentX );
          this.handle1.setAttribute( 'y', this.currentY );

          this.handle2.setAttribute( 'x', this.currentX + this.currentW );
          this.handle2.setAttribute( 'y', this.currentY );

          this.handle3.setAttribute( 'x', this.currentX + this.currentW );
          this.handle3.setAttribute( 'y', this.currentY + this.currentH );

          this.handle4.setAttribute( 'x', this.currentX );
          this.handle4.setAttribute( 'y', this.currentY + this.currentH );

          break;

      }

    },

    selectStyle: function() {
      this.setDom( 'stroke', 'red' );
      this.setDom( 'stroke-width', '2' );
      this.setDom( 'fill', 'rgba(255, 0, 0, 0.1)' );
    }

  } );

  return GraphRect;

} );