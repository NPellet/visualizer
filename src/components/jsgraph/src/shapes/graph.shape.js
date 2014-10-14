define( [], function() {

  "use strict";

  function getColor( color ) {

    if ( Array.isArray( color ) ) {
      switch ( color.length ) {
        case 3:
          return 'rgb(' + color.join( ',' ) + ')';
          break;
        case 4:
          return 'rgba(' + color.join( ',' ) + ')';
          break;
      }
    } else if ( typeof( color ) == "object" ) {
      return "rgb(" + Math.round( color.r * 255 ) + ", " + Math.round( color.g * 255 ) + ", " + Math.round( color.b * 255 ) + ")";
    }

    return color;
  }

  var GraphShape = function() {};

  GraphShape.prototype = {

    init: function( graph, groupName ) {

      var self = this;

      this.graph = graph;
      this.properties = {};
      this.group = document.createElementNS( this.graph.ns, 'g' );

      this.options = this.options || {};

      if ( groupName ) {
        this.group.setAttribute( 'data-groupname', groupName );
      }

      this._selected = false;
      this.createDom();
      this.setEvents();

      this.classes = [];

      this.rectEvent = document.createElementNS( this.graph.ns, 'rect' );
      this.rectEvent.setAttribute( 'pointer-events', 'fill' );
      this.rectEvent.setAttribute( 'fill', 'transparent' );

      this._movable = true;
      this._selectable = true;

      if ( this.options.masker ) {

        var maskPath = document.createElementNS( this.graph.ns, 'mask' );
        this.maskingId = Math.random();
        maskPath.setAttribute( 'id', this.maskingId );

        this.maskDomWrapper = document.createElementNS( this.graph.ns, 'rect' );
        this.maskDomWrapper.setAttribute( 'fill', 'white' );
        maskPath.appendChild( this.maskDomWrapper );

        var maskDom = this._dom.cloneNode();
        maskPath.appendChild( maskDom );

        this.maskDom = maskDom;

        this.graph.defs.appendChild( maskPath );
      }

      if ( this._dom ) {

        this.group.appendChild( this._dom );

        this._dom.addEventListener( 'mouseover', function( e ) {

          self.handleMouseOver( e );
          //self.doHover( true, e );
          //	e.stopPropagation();

        } );

        this._dom.addEventListener( 'mouseout', function( e ) {

          self.handleMouseOut( e );

          //self.doHover( false, e );
          //e.stopPropagation();

        } );

        this._dom.addEventListener( 'mousedown', function( e ) {

          self.graph.focus();

          e.preventDefault();
          //		e.stopPropagation();

          self.handleSelected = false;
          self.moving = true;

          self.handleMouseDown( e );
        } );

        this._dom.addEventListener( 'dblclick', function( e ) {

          e.preventDefault();
          e.stopPropagation();

          self.handleDblClick( e );
        } );
      }

      //			this.group.appendChild(this.rectEvent);

      this.graph.shapeZone.appendChild( this.group );
      this.initImpl();
    },

    hide: function() {

      if ( this.hidden ) {
        return;
      }

      this.hidden = true;
      this.group.style.display = 'none';
    },

    show: function() {

      if ( !this.hidden ) {
        return;
      }

      this.hidden = false;
      this.group.style.display = 'block';
    },

    addClass: function( className ) {

      this.classes = this.classes || [];

      if ( this.classes.indexOf( className ) == -1 ) {
        this.classes.push( className );
      }

      this.makeClasses();
    },

    removeClass: function( className ) {

      this.classes.splice( this.classes.indexOf( className ), 1 );

      this.makeClasses();
    },

    makeClasses: function() {

      this._dom.setAttribute( 'class', this.classes.join( " " ) );
    },

    initImpl: function() {},

    setOriginalData: function( data, events ) {
      this.data = data;
      this.events = events;

    },

    triggerChange: function() {
      
      this.graph.triggerEvent( 'onAnnotationChange', this.data, this );
    },

    setEvents: function() {},

    setSelectableOnClick: function() {
      return;
      var self = this;
      this._dom.addEventListener( 'click', function() {
        if ( !self._selectable )
          return;
        self._selected = !self._selected;
        self[ self._selected ? 'select' : 'unselect' ]();
      } );
    },

    setBBox: function() {

      this.group.removeChild( this.rectEvent );
      var box = this.group.getBBox();
      this.rectEvent.setAttribute( 'x', box.x );
      this.rectEvent.setAttribute( 'y', box.y - 10 );
      this.rectEvent.setAttribute( 'width', box.width );
      this.rectEvent.setAttribute( 'height', box.height + 20 );

      this.group.appendChild( this.rectEvent );
    },

    setMouseOver: function( callback ) {
      this.rectEvent.addEventListener( 'mouseover', callback );
    },

    kill: function() {

      this.graph.shapeZone.removeChild( this.group );
      this.graph._removeShape( this );

      this.callHandler( "onRemoved", this );

    },

    /*	applyAll: function() {
			for(var i in this.properties)
				this._dom.setAttribute(i, this.properties[i]);
		},
*/
    draw: function() {

      if ( this.labelNumber == undefined ) {
        this.setLabelNumber( 1 );
      }

      this.setFillColor();
      this.setStrokeColor();
      this.setStrokeWidth();
      this.setDashArray();

      this.everyLabel( function( i ) {

        if ( this.get( 'labelPosition', i ) ) {

          this.setLabelText( i );
          this.setLabelSize( i );
          //this.setLabelAngle(i);
          this.setLabelColor( i );
          this.setLabelPosition( i );

        }

        if ( this.get( 'labelAnchor', i ) ) {

          this._forceLabelAnchor( i );

        }
      } );
    },

    redraw: function() {
      //	this.kill();
      var variable;
      this.position = this.setPosition();

      this.redrawImpl();

      if ( !this.position )
        return;

      this.everyLabel( function( i ) {

        if ( this.get( 'labelPosition', i ) ) {

          this.setLabelPosition( i );
          this.setLabelAngle( i );

        }

      } );

      if ( this.afterDone )
        this.afterDone();
      //	this.done();
    },

    redrawImpl: function() {},

    done: function() {
      //this.applyAll();
      //;

    },

    setSerie: function( serie ) {
      this.serie = serie;
    },

    getSerie: function() {
      return this.serie;
    },

    set: function( prop, val, index ) {

      this.properties[ prop ] = this.properties[ prop ] || [];
      this.properties[ prop ][ index || 0 ] = val;

      this.configuration = this.configuration || {
        sections: {
          shape_cfg: [ {
            groups: {
              shape_cfg: [ {}  ]
            }
          } ]
        }
      };
      this.configuration.sections.shape_cfg[ 0 ].groups.shape_cfg[ 0 ][ prop ] = [ val ];

    },

    get: function( prop, index ) {
      this.configuration = this.configuration || {
        sections: {
          shape_cfg: [ {
            groups: {
              shape_cfg: [ {}  ]
            }
          } ]
        }
      };
      return ( ( this.configuration.sections.shape_cfg[ 0 ].groups.shape_cfg[ 0 ] || [] )[ prop ] || [] )[ 0 ];
    },

    getFromData: function( prop ) {
      return this.data[ prop ];
    },
    setData: function( prop, val ) {
      return this.data[ prop ] = val;
    },
    setDom: function( prop, val ) {
      if ( this._dom ) this._dom.setAttribute( prop, val );
    },

    setPosition: function() {
      var position = this._getPosition( this.getFromData( 'pos' ) );
      this.setDom( 'x', position.x );
      this.setDom( 'y', position.y );
      return true;
    },

    setFillColor: function() {
      this.setDom( 'fill', getColor( this.get( 'fillColor' ) ) );
    },
    setStrokeColor: function() {
      this.setDom( 'stroke', getColor( this.get( 'strokeColor' ) ) );
    },
    setStrokeWidth: function() {
      this.setDom( 'stroke-width', this.get( 'strokeWidth' ) );
    },
    setDashArray: function() {
      if ( this.get( 'strokeDashArray' ) ) this.setDom( 'stroke-dasharray', this.get( 'strokeDashArray' ) );
    },

    setLabelText: function( index ) {
      if ( this.label ) this.label[ index ].textContent = this.data.label[ index ].text;
    },
    setLabelColor: function( index ) {
      if ( this.label ) this.label[ index ].setAttribute( 'fill', this.get( 'labelColor' ) );
    },
    setLabelSize: function( index ) {
      if ( this.label ) this.label[ index ].setAttribute( 'font-size', this.get( 'labelSize' ) );
    },
    setLabelPosition: function( index ) {
      if ( this.label ) this._setLabelPosition( index );
    },
    setLabelAngle: function( index ) {
      if ( this.label ) this._setLabelAngle( index );
    },

    _getPosition: function( value, relTo ) {
      
      var xAxis = this.getXAxis(),
          yAxis = this.getYAxis();
      return this.graph.getPosition( value, relTo, xAxis, yAxis, this.serie );
    },

    setLabelNumber: function( nb ) {
      this.labelNumber = nb;
      this._makeLabel();
    },

    everyLabel: function( callback ) {
      for ( var i = 0; i < this.labelNumber; i++ ) {
        callback.call( this, i );
      }
    },

    toggleLabel: function( labelId, visible ) {
      if ( this.labelNumber && this.label[ i ] ) {
        this.label[ i ].setAttribute( 'display', visible ? 'block' : 'none' );
      }
    },

    _makeLabel: function() {
      var self = this;
      this.label = this.label || [];

      this.everyLabel( function( i ) {

        this.label[ i ] = document.createElementNS( this.graph.ns, 'text' );

        this.label[ i ].addEventListener( 'mouseover', function( e ) {

          //self.doHover( true );
          e.stopPropagation();

        } );

        this.label[ i ].addEventListener( 'mouseout', function( e ) {

          //self.doHover( false );
          e.stopPropagation();

        } );

        this.label[ i ].addEventListener( 'dblclick', function( e ) {

          e.preventDefault();
          e.stopPropagation();

          $( '<input type="text" />' ).attr( 'value', e.target.textContent ).prependTo( self.graph._dom ).css( {

            position: 'absolute',
            'margin-top': ( parseInt( e.target.getAttribute( 'y' ).replace( 'px', '' ) ) - 10 ) + "px",
            'margin-left': ( parseInt( e.target.getAttribute( 'x' ).replace( 'px', '' ) ) - 50 ) + "px",
            textAlign: 'center',
            width: '100px'

          } ).bind( 'blur', function() {

            $( this ).remove();
            self.data.label[ i ].text = $( this ).prop( 'value' );
            self.label[ i ].textContent = $( this ).prop( 'value' );

            self.triggerChange();

          } ).bind( 'keyup', function( e ) {

            e.stopPropagation();
            e.preventDefault();

            if ( e.keyCode == 13 ) {
              $( this ).trigger( 'blur' );
            }

          } ).bind( 'keypress', function( e ) {

            e.stopPropagation();
          } ).bind( 'keydown', function( e ) {

            e.stopPropagation();

          } ).focus().get( 0 ).select();

        } );

        self.group.appendChild( this.label[ i ] );
      } );
    },

    _setLabelPosition: function( labelIndex, pos ) {

      var currPos = this.getFromData( 'pos' );

      if ( !currPos ) {
        pos = {
          x: -1000,
          y: -1000
        };
      } else {

        var parsedCurrPos = this._getPosition( currPos );

        if ( !pos ) {
          
          var pos = this._getPosition( this.get( 'labelPosition', labelIndex ), currPos );
        } else {
          pos = this._getPosition( pos );
        }
      }

      if ( pos.x != "NaNpx" && !isNaN( pos.x ) && pos.x !== "NaN" ) {

        this.label[ labelIndex ].setAttribute( 'x', pos.x );
        this.label[ labelIndex ].setAttribute( 'y', pos.y );
      }
      //this.label.setAttribute('text-anchor', pos.x < parsedCurrPos.x ? 'end' : (pos.x == parsedCurrPos.x ? 'middle' : 'start'));
      //this.label[labelIndex].setAttribute('dominant-baseline', pos.y < parsedCurrPos.y ? 'no-change' : (pos.y == parsedCurrPos.y ? 'middle' : 'hanging'));

    },

    _setLabelAngle: function( labelIndex, angle ) {
      var currAngle = this.get( 'labelAngle', labelIndex ) || 0;

      if ( currAngle == 0 )
        return;

      var x = this.label[ labelIndex ].getAttribute( 'x' );
      var y = this.label[ labelIndex ].getAttribute( 'y' );
      this.label[ labelIndex ].setAttribute( 'transform', 'rotate(' + currAngle + ' ' + x + ' ' + y + ')' );
    },

    _forceLabelAnchor: function( i ) {
      this.label[ i ].setAttribute( 'text-anchor', this._getLabelAnchor() );
    },

    _getLabelAnchor: function() {
      var anchor = this.get( 'labelAnchor' );
      switch ( anchor ) {
        case 'middle':
        case 'start':
        case 'end':
          return anchor;
          break;

        case 'right':
          return 'end';
          break;

        case 'left':
          return 'start';
          break;

        default:
          return 'start';
          break;
      }
    },

    setSelectable: function( bln ) {
      this._selectable = bln;
    },

    setMovable: function( bln ) {
      this._movable = bln;
    },

    select: function( mute ) {

      if ( !this._selectable ) {
        return;
      }

      this._selected = true;
      this.selectStyle();

      if ( !this._staticHandles ) {
        this.addHandles();
        this.setHandles();
      }

      this.callHandler( "onSelected", this );

      this.graph.triggerEvent( 'onAnnotationSelect', this.data, this );

      if ( !mute ) {
        this.graph.selectShape( this, true );
      }
    },

    unselect: function() {

      if ( !this._selectable ) {
        return;
      }

      this._selected = false;

      this.setStrokeWidth();
      this.setStrokeColor();
      this.setDashArray();
      this.setFillColor();

      if ( this.handlesInDom && !this._staticHandles ) {
        this.handlesInDom = false;
        this.removeHandles();
      }

      this.callHandler( "onUnselected", this );

    },

    isSelected: function() {
      return this._selected;
    },

    staticHandles: function( bool ) {
      this._staticHandles = bool;

      if ( bool ) {
        this.addHandles();
        this.setHandles();
      } else {
        this.removeHandles();
      }

    },

    createHandles: function( nb, type, attr ) {

      if ( this.isLocked() ) {
        return;
      }

      var self = this,
        handles = [];

      for ( var i = 1; i <= nb; i++ ) {

        ( function( j ) {

          self[ 'handle' + j ] = document.createElementNS( self.graph.ns, type );

          for ( var k in attr ) {
            self[ 'handle' + j ].setAttribute( k, attr[ k ] );
          }

          self[ 'handle' + j ].addEventListener( 'mousedown', function( e ) {

            e.preventDefault();
            e.stopPropagation();

            self.handleSelected = j;
            self.handleMouseDown( e );
          } );

          handles.push( self[ 'handle' + j ] );

        } )( i );

      }

      return this.handles = handles;
    },

    created: function() {

      this.callHandler( "onCreated", this );
      this.handleCreateImpl();
    },

    handleMouseDownImpl: function() {},
    handleMouseMoveImpl: function() {},
    handleMouseUpImpl: function() {},
    handleCreateImpl: function() {},

    handlers: {

      mouseUp: [

        function( e ) {

          if ( this.moving ) {
            this.callHandler( "onAfterMoved", this );
          }

          if ( this.handleSelected || this.resize ) {
            this.callHandler( "onAfterResized", this );
          }

          this.moving = false;
          this.resize = false;
          this.handleSelected = false;
          this.graph.elementMoving( false );

          return this.handleMouseUpImpl( e );
        }
      ],

      mouseMove: [

        function( e ) {

          var coords = this.graph._getXY( e );
          var
            deltaX = this.getXAxis().getRelVal( coords.x - this.mouseCoords.x ),
            deltaY = this.getYAxis().getRelVal( coords.y - this.mouseCoords.y );

          if ( deltaX != 0 ||  deltaY !== 0 ) {
            this.preventUnselect = true;
          }

          this.mouseCoords = coords;
          var ret = this.handleMouseMoveImpl( e, deltaX, deltaY, coords.x - this.mouseCoords.x, coords.y - this.mouseCoords.y );

          if ( this.options ) {

            if ( this.moving ) {

              if ( this.options.onMove ) {
                this.options.onMove.call( this );
              }

            } else {

              if ( this.options.onResize ) {
                this.options.onResize.call( this );
              }
            }

            this.callHandler('onChange', this );
          }

          return ret;
        }
      ],

      mouseDown: [

        function( e ) {

          var self = this;
          //	e.stopPropagation();
          e.preventDefault();

          this.graph.shapeZone.appendChild( this.group ); // Put the shape on top of the stack !

          //if( this._movable !== false ) {
          this.graph.elementMoving( this );
          //}

          if ( !this._selected ) {
            this.preventUnselect = true;
            this.timeoutSelect = window.setTimeout( function() { // Tweak needed to select the shape.

              self.select();
              self.timeoutSelect = false;
            }, 100 );
          }
          this.mouseCoords = this.graph._getXY( e );

          return this.handleMouseDownImpl( e, this.mouseCoords );
        }
      ],

      mouseOver: [

        function( e ) {
          var clbks;

          //this.highlight();
          this.addClass( 'hover' );

          if ( !( clbks = this._mouseOverCallbacks ) ) {
            return;
          }
          clbks.fireWith( this, [ this.data, this.parameters ] );
        }
      ],

      mouseOut: [

        function( e ) {
          var clbks;

          //    this.unHighlight();
          this.removeClass( 'hover' );

          if ( !( clbks = this._mouseOutCallbacks ) ) {
            return;
          }
          clbks.fireWith( this, [ this.data, this.parameters ] );
        }
      ]
    },

    handleMouseDown: function( e ) {

      return this.callHandler( 'mouseDown', e );
    },

    handleMouseMove: function( e ) {

      if ( this.isLocked() && this._movable !== false ) {

        this.graph.elementMoving( false );

        if ( this.isLocked() ) {
          this.handleSelected = false;
        }

        this.moving = true;
      }

      if ( !this._movable ) {
        this.moving = false;
      }

      if ( this.callHandler( 'beforeMouseMove', e ) === false ) {
        return;
      }

      this.callHandler( 'mouseMove', e );

    },

    handleMouseUp: function( e ) {
      this.callHandler( 'mouseUp', e );
      this.handleSelected = false;
      //			this.triggerChange();
    },

    handleMouseOver: function() {

      this.callHandler( 'mouseOver', this );
    },

    handleMouseOut: function() {
      this.callHandler( 'mouseOut', this );
    },

    removeHandles: function() {

      for ( var i = 1; i <= this.nbHandles; i++ ) {
        this.group.removeChild( this[ 'handle' + i ] );
      }
    },

    callHandler: function( handlerType ) {
      var handler = handlerType;
      var args = Array.prototype.shift.call( arguments );
      var resp;

      var handlers;

      if ( ( handlers = this.graph.shapeHandlers[ handler ] ) ) {
        for ( var i = 0, l = handlers.length; i < l; i++ ) {

          if ( ( resp = handlers[ i ].apply( this, arguments ) ) !== undefined ) {
            return resp;
          }
        }
      }

      if ( ( handlers = GraphShape.prototype.handlers[ handler ] ) ) {
        for ( var i = 0, l = handlers.length; i < l; i++ ) {
          if ( handlers[ i ].apply( this, arguments ) ) {
            //	return;
          }
        }
      }

    },

    addHandles: function() {

      if ( this.isLocked() ) {
        return;
      }

      if ( !this.handlesInDom ) {

        this.handlesInDom = true;

        for ( var i = 1; i <= this.nbHandles; i++ ) {
          if ( this[ 'handle' + i ] ) {
            this.group.appendChild( this[ 'handle' + i ] );
          }
        }
      }
    },

    handleDblClick: function() {

      this.configure();
    },

    configure: function() {

      var self = this;
      var div = $( '<div></div>' ).dialog( {
        modal: true,
        position: [ 'center', 50 ],
        width: '80%'
      } );
      div.prev().remove();
      div.parent().css( 'z-index', 1000 );

      require( [ 'require', 'lib/lib/forms/form' ], function( require, Form ) {

        var form = new Form( {} );
        form.init();

        var structure = {

          sections: {

            shape_cfg: {

              options: {
                title: 'Shape',
                icon: 'info_rhombus'
              },

              groups: {

                shape_cfg: {
                  options: {
                    type: 'list'
                  },

                  fields: self.getFieldsConfig()
                }
              }
            }
          }
        };

        form.setStructure( structure );

        form.onStructureLoaded().done( function() {
          form.fill( self.getConfiguration() );
        } );

        form.addButton( 'Cancel', {
          color: 'blue'
        }, function() {
          div.dialog( 'close' );
        } );

        form.addButton( 'Save', {
          color: 'green'
        }, function() {
          self.setConfiguration( form.getValue() );
          div.dialog( 'close' );

        } );

        form.onLoaded().done( function() {

          div.html( form.makeDom() );
          form.inDom();
        } );
      } );
    },

    getConfiguration: function() {
      return this.configuration = this.configuration ||  {};
    },

    setConfiguration: function( configuration ) {

      this.configuration = $.extend( true, this.configuration, configuration );
    },

    isLocked: function() {

      return this.options.locked ||  this.graph.shapesLocked;
    },

    lock: function() {
      this.options.locked = true;
    },

    unlock: function() {
      this.options.locked = false;
    },

    isBindable: function() {

      return this.options.bindable;
    },

    setBindableToDom: function() {

      if ( this.isBindable() ) {
        this.addClass( 'bindable' );
      }
    },

    highlight: function( params ) {

      this.savedHighlight = {};
      for ( var i in params ) {
        this.savedHighlight[ i ] = this._dom.getAttribute( i );
        this._dom.setAttribute( i, params[ i ] );
      }

      this.highlightImpl();
    },

    unHighlight: function() {

      for ( var i in this.savedHighlight ) {
        this._dom.setAttribute( i, this.savedHighlight[ i ] );
      }

    },

    highlightImpl: function() {},
    unHighlightImpl: function() {},

    getMaskingID: function() {
      return this.maskingId;
    },

    maskWith: function( otherShape ) {
      
      var maskingId;
      if ( maskingId = otherShape.getMaskingID() ) {
        this._dom.setAttribute( 'mask', 'url(#' + maskingId + ')' );
      } else {
        this._dom.removeAttribute( 'mask' );
      }
    },

    updateMask: function() {
      if ( this.maskDom ) {

        var position = {
          x: 'min',
          y: 'min'
        };
        var position2 = {
          x: 'max',
          y: 'max'
        };

        position = this._getPosition( position );
        position2 = this._getPosition( position2 );

        this.maskDomWrapper.setAttribute( 'x', Math.min( position.x, position2.x ) );
        this.maskDomWrapper.setAttribute( 'y', Math.min( position.y, position2.y ) );

        this.maskDomWrapper.setAttribute( 'width', Math.abs( position2.x - position.x ) );
        this.maskDomWrapper.setAttribute( 'height', Math.abs( position2.y - position.y ) );

        for ( var i = 0; i < this._dom.attributes.length; i++ ) {
          this.maskDom.setAttribute( this._dom.attributes[ i ].name, this._dom.attributes[ i ].value );
        }

        this.maskDom.setAttribute( 'fill', 'black' );

      }
    },


    setXAxis: function( axis ) {
      this.xAxis = axis;
    },

    setYAxis: function( axis ) {
      this.yAxis = axis;
    },

    autoAxes: function() {
      this.xAxis = this.graph.getXAxis();
      this.yAxis = this.graph.getYAxis();
    },

    getXAxis: function( ) {

      if( ! this.xAxis ) {
        this.autoAxes();
      }

      return this.xAxis;
    },


    getYAxis: function( ) {

      if( ! this.yAxis ) {
        this.autoAxes();
      }

      return this.yAxis;
    },

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
    }
  }

  return GraphShape;

} );