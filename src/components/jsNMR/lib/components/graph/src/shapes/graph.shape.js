
define( [ ], function( ) {

	"use strict";
	function getColor( color ) {

		if (Array.isArray(color)) {
			switch (color.length) {
				case 3:
					return 'rgb(' + color.join(',') + ')';
					break;
				case 4:
					return 'rgba(' + color.join(',') + ')';
					break;
			}
		} else if( typeof(color) == "object") {
			return "rgb(" + Math.round( color.r * 255 ) + ", " + Math.round( color.g * 255 ) + ", " + Math.round( color.b * 255 ) + ")";
		}

		return color;
	}


	var GraphShape = function() { };

	GraphShape.prototype = {

		init: function( graph, groupName ) {

			var self = this;

			this.graph = graph;
			this.properties = {};
			this.group = document.createElementNS(this.graph.ns, 'g');

			this.options = this.options || {};

			if( groupName ) {
				this.group.setAttribute( 'data-groupname', groupName );
			}

			this._selected = false;
			this.createDom();
			this.setEvents();
			
			this.classes = [];

			this.rectEvent = document.createElementNS( this.graph.ns, 'rect' );
			this.rectEvent.setAttribute('pointer-events', 'fill');
			this.rectEvent.setAttribute('fill', 'transparent');

			if( this._dom ) {

				this.group.appendChild(this._dom);

				this._dom.addEventListener('mouseover', function (e) {

					self.handleMouseOver( e );
					//self.doHover( true, e );
				//	e.stopPropagation();

				});

				this._dom.addEventListener( 'mouseout', function (e) {

					self.handleMouseOut( e );

					//self.doHover( false, e );
					//e.stopPropagation();

				});

				this._dom.addEventListener( 'mousedown', function(e) {
					
					self.graph.focus();

					e.preventDefault();
			//		e.stopPropagation();

					self.handleSelected = false;
					self.moving = true;

					self.handleMouseDown(e);
				} );

				this._dom.addEventListener( 'dblclick', function(e) {
			
					e.preventDefault();
					e.stopPropagation();
					
					self.handleDblClick(e);
				} );
			}

//			this.group.appendChild(this.rectEvent);
			
			this.graph.shapeZone.appendChild(this.group);
			this.initImpl();
		},

		addClass: function( className ) {

			this.classes = this.classes || [];

			if( this.classes.indexOf( className ) == -1 ) {
				this.classes.push( className );
			}

			this.makeClasses();
		},

		removeClass: function( className ) {

			this.classes.splice( this.classes.indexOf( className ), 1 );

			this.makeClasses();
		},

		makeClasses: function() {

			this._dom.setAttribute( 'class', this.classes.join(" ") );
		},

		initImpl: function() {},

		setOriginalData: function(data, events) {
			this.data = data;
			this.events = events;

		},

		triggerChange: function() {
			this.graph.triggerEvent('onAnnotationChange', this.data, this);
		},

		setEvents: function() {},

		setSelectableOnClick: function() {
			return;
			var self = this;
			this._dom.addEventListener('click', function() {
				if(!self._selectable)
					return;
				self._selected = !self._selected;
				self[self._selected ? 'select' : 'unselect']();
			});
		},

		setBBox: function() {

			this.group.removeChild(this.rectEvent);
			var box = this.group.getBBox();
			this.rectEvent.setAttribute('x', box.x);
			this.rectEvent.setAttribute('y', box.y - 10);
			this.rectEvent.setAttribute('width', box.width);
			this.rectEvent.setAttribute('height', box.height + 20);

			this.group.appendChild(this.rectEvent);
		},

		setMouseOver: function(callback) {
			this.rectEvent.addEventListener('mouseover', callback);
		},

		kill: function() {

			this.graph.shapeZone.removeChild(this.group);
			this.graph.removeShape( this );

			if( this.options.onRemove ) {
				this.options.onRemove.call( this );
			}
		},

	/*	applyAll: function() {
			for(var i in this.properties)
				this._dom.setAttribute(i, this.properties[i]);
		},
*/
		draw: function() {

			if( this.labelNumber == undefined ) {
				this.setLabelNumber( 1 );
			}

			this.setFillColor( );
			this.setStrokeColor( );
			this.setStrokeWidth( );
			this.setDashArray( );

			this.everyLabel(function(i) {

				if(this.get('labelPosition', i)) {

					this.setLabelText(i);
					this.setLabelSize(i);
					//this.setLabelAngle(i);
					this.setLabelColor(i);
					this.setLabelPosition(i);

				}

				if(this.get('labelAnchor', i)) {

					this._forceLabelAnchor(i);

				}
			});
		},

		redraw: function() {
		//	this.kill();
			var variable;
			this.position = this.setPosition();
			
			this.redrawImpl();

			if(!this.position)
				return;

			this.everyLabel(function(i) {

				if(this.get('labelPosition', i)) {

					this.setLabelPosition(i);
					this.setLabelAngle(i);

				}

			});
		
		
			if(this.afterDone)
				this.afterDone();
		//	this.done();
		},

		redrawImpl: function() {},

		done: function() {
			//this.applyAll();
			//;
			
			
		},

		setSerie: function(serie) {			this.serie = serie;								},
		set: function(prop, val, index) {

			this.properties[prop] = this.properties[prop] || [];
			this.properties[prop][index || 0] = val;

			this.configuration = this.configuration || { sections: { shape_cfg: [ { groups: { shape_cfg: [ {} ] }} ]}};
			this.configuration.sections.shape_cfg[ 0 ].groups.shape_cfg[ 0 ][ prop ] = [ val ];


		},

		get: function(prop, index) {
			this.configuration = this.configuration || { sections: { shape_cfg: [ { groups: { shape_cfg: [ {} ] }} ]}};
			return ( ( this.configuration.sections.shape_cfg[ 0 ].groups.shape_cfg[ 0 ] || [] )[ prop ] || [])[ 0 ];
		},


		getFromData: function(prop)			{ return this.data[prop]; 						},
		setData: function(prop, val)			{ return this.data[prop] = val; 						},
		setDom: function(prop, val) {		if(this._dom) this._dom.setAttribute(prop, val);				},

		setPosition: function() {
			var position = this._getPosition(this.getFromData('pos'));
			this.setDom('x', position.x);
			this.setDom('y', position.y);
			return true;
		},

		setFillColor: function() {			this.setDom('fill', getColor( this.get('fillColor')) );					},
		setStrokeColor: function() {		this.setDom('stroke', getColor( this.get('strokeColor')) );				},
		setStrokeWidth: function() {		this.setDom('stroke-width', this.get('strokeWidth'));		},
		setDashArray: function() {			if(this.get('strokeDashArray')) this.setDom('stroke-dasharray', this.get('strokeDashArray'));				},

		setLabelText: function(index) {		if(this.label) this.label[index].textContent = this.data.label[index].text;					},
		setLabelColor: function(index) {	if(this.label) this.label[index].setAttribute('fill', this.get('labelColor'));				},
		setLabelSize: function(index) {		if(this.label) this.label[index].setAttribute('font-size', this.get('labelSize'));		},
		setLabelPosition: function(index) { if(this.label) this._setLabelPosition(index);											},
		setLabelAngle: function(index) {	if(this.label) this._setLabelAngle(index);												},
		
		_getPosition: function(value, relTo) {
			var yAxis;
			var xAxis = yAxis = false;

			if( this.serie ) {
				xAxis = this.serie.getXAxis();
				yAxis = this.serie.getYAxis();
			}

			return this.graph.getPosition( value, relTo, xAxis, yAxis, this.serie );
		},

		setLabelNumber: function(nb) {
			this.labelNumber = nb;
			this._makeLabel();
		},

		everyLabel: function(callback) {
			for(var i = 0; i < this.labelNumber; i++) {
				callback.call(this, i);
			}
		},

		toggleLabel: function(labelId, visible) {
			if(this.labelNumber && this.label[i]) {
				this.label[i].setAttribute('display', visible ? 'block' : 'none');
			}
		},

		_makeLabel: function() {
			var self = this;
			this.label = this.label || [];

			this.everyLabel(function(i) {

				this.label[i] = document.createElementNS(this.graph.ns, 'text');


				this.label[i].addEventListener( 'mouseover', function ( e ) {


					//self.doHover( true );
					e.stopPropagation();
					
				});


				this.label[i].addEventListener( 'mouseout', function ( e ) {

					//self.doHover( false );
					e.stopPropagation();

				});


				this.label[i].addEventListener( 'dblclick', function( e ) {

					e.preventDefault();
					e.stopPropagation();

					$('<input type="text" />').attr('value', e.target.textContent ).prependTo( self.graph._dom ).css( {

						position: 'absolute',
						'margin-top': (parseInt(e.target.getAttribute('y').replace('px', '')) - 10) + "px",
						'margin-left': (parseInt(e.target.getAttribute('x').replace('px', '')) - 50) + "px",
						textAlign: 'center',
						width: '100px'

					} ).bind( 'blur', function() {

						$( this ).remove();
						self.data.label[ i ].text = $ ( this ).prop( 'value' );
						self.label[ i ].textContent = $ ( this ).prop( 'value' );

						self.triggerChange();

					} ).bind( 'keyup', function(e) {

						e.stopPropagation();
						e.preventDefault();

						if ( e.keyCode == 13 ) {
							$( this ).trigger( 'blur' );
						}
						
					} ).bind('keypress', function(e) {
					
						e.stopPropagation();
					}).bind('keydown', function(e) {
					
						e.stopPropagation();

					}).focus( ).get(0).select();

				});

				self.group.appendChild(this.label[i]);
			});
		},

		_setLabelPosition: function( labelIndex, pos ) {

			var currPos = this.getFromData('pos');

			if( ! currPos ) {
				pos = { x: -1000, y: -1000 };
			} else {

				var parsedCurrPos = this._getPosition(currPos);

				if( !pos ) {
					var pos = this._getPosition( this.get( 'labelPosition', labelIndex ), currPos );
				}
			}

			/*if( pos.x || isNaN( pos.y ) ) {
				pos.x = -10000;
				pos.y = -10000;
			}*/

			if( pos.x != "NaNpx") {
				this.label[labelIndex].setAttribute('x', pos.x);
				this.label[labelIndex].setAttribute('y', pos.y);	
			}
			//this.label.setAttribute('text-anchor', pos.x < parsedCurrPos.x ? 'end' : (pos.x == parsedCurrPos.x ? 'middle' : 'start'));
			//this.label[labelIndex].setAttribute('dominant-baseline', pos.y < parsedCurrPos.y ? 'no-change' : (pos.y == parsedCurrPos.y ? 'middle' : 'hanging'));

		},

		_setLabelAngle: function(labelIndex, angle) {
			var currAngle = this.get('labelAngle', labelIndex) || 0;

			if(currAngle == 0)
				return;

			var x = this.label[labelIndex].getAttribute('x');
			var y = this.label[labelIndex].getAttribute('y');
			this.label[labelIndex].setAttribute('transform', 'rotate(' + currAngle + ' ' + x + ' ' + y + ')');
		},

		_forceLabelAnchor: function(i) {
			this.label[i].setAttribute('text-anchor', this._getLabelAnchor());
		},

		_getLabelAnchor: function() {
			var anchor = this.get('labelAnchor');
			switch(anchor) {
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

		setSelectable: function(bln) {
			this._selectable = bln;
		},


		select: function() {

			this._selected = true;
			this.selectStyle();
			this.setHandles();
			this.graph.selectShape(this);
		},

		unselect: function() {

			this._selected = false;

			this.setStrokeWidth();
			this.setStrokeColor();
			this.setDashArray();
			this.setFillColor();

			if( this.handlesInDom ) {
				this.handlesInDom = false;
				this.removeHandles();
			}
			
		},

		createHandles: function( nb, type, attr ) {

			if( this.isLocked() ) {
				return;
			}

			var self = this;

			for( var i = 1; i <= nb; i ++ ) {

				( function( j ) {

					self['handle' + j ] = document.createElementNS(self.graph.ns, type);

					for( var k in attr ) {
						self['handle' + j ].setAttribute( k, attr[ k ] );
					}

					self[ 'handle' + j ].addEventListener( 'mousedown', function(e) {

						e.preventDefault();
						e.stopPropagation();
						
						self.handleSelected = j;
						self.handleMouseDown( e );
					} );

				} ) ( i );

			}
		},
	
		handleMouseDownImpl: function() {},
		handleMouseMoveImpl: function() {},
		handleMouseUpImpl: function() {},
		handleCreateImpl: function() {},

		handlers: {

			mouseUp: [ 
				function( e ) {
					this.moving = false;
					this.resize = false;
					this.graph.shapeMoving(false);

					return this.handleMouseUpImpl( e );
				}  
			],

			mouseMove: [
				function( e ) {

					var coords = this.graph.getXY( e );
					
					var
						deltaX = this.serie.getXAxis( ).getRelVal( coords.x - this.mouseCoords.x ),
						deltaY = this.serie.getYAxis( ).getRelVal( coords.y - this.mouseCoords.y );

					if( deltaX != 0 || deltaY !== 0) {
						this.preventUnselect = true;
					}		

					this.mouseCoords = coords;	
					var ret = this.handleMouseMoveImpl( e, deltaX, deltaY, coords.x - this.mouseCoords.x, coords.y - this.mouseCoords.y );

					if( this.options ) {
						
						if( this.moving ) {

							if( this.options.onMove ) {
								this.options.onMove.call( this );
							}

						} else  {

							if( this.options.onResize ) {
								this.options.onResize.call( this );	
							}
						}
					}

					return ret;
				}
			],

			mouseDown: [
				function ( e ) {

					var self = this;
				//	e.stopPropagation();
					e.preventDefault();

					this.graph.shapeZone.appendChild( this.group ); // Put the shape on top of the stack !
					this.graph.shapeMoving( this );

					if( ! this._selected ) {
						this.preventUnselect = true;
						this.timeoutSelect = window.setTimeout(function() { // Tweak needed to select the shape.
							self.select();
							self.timeoutSelect = false;
						}, 100);
					}
					this.mouseCoords = this.graph.getXY( e );	

					return this.handleMouseDownImpl( e, this.mouseCoords );
				}
			],


			mouseOver: [
				function( e ) {
					var clbks;


					this.highlight();
					this.addClass('hover');

					if( ! ( clbks = this._mouseOverCallbacks ) ) {
						return;
					}
					clbks.fireWith( this, [ this.data, this.parameters ] );
				}
			],

			mouseOut: [
				function( e ) {
					var clbks;

					this.unhighlight();
					this.removeClass('hover');
					
					if( ! ( clbks = this._mouseOutCallbacks ) ) {
						return;
					}
					clbks.fireWith( this, [ this.data, this.parameters ] );
				}
			]
		},

		handleMouseDown: function( e ) {
			this.callHandler( 'mouseDown', e );
		},

		handleMouseMove: function( e ) {

			if( this.isLocked() ) {
				
				this.graph.shapeMoving( false );
				this.handleSelected = false;
				this.moving = true;
				return;

			}
			this.callHandler( 'mouseMove', e );
		},

		handleMouseUp: function( e ) {
			this.callHandler( 'mouseUp', e );
		
//			this.triggerChange();
		},

		handleMouseOver: function() {

			this.callHandler( 'mouseOver' );
		},

		handleMouseOut: function() {
			this.callHandler( 'mouseOut' );
		},

		removeHandles: function() {

			for( var i = 1 ; i <= this.nbHandles ; i ++ ) {
				this.group.removeChild( this['handle' + i ] );
			}
		},

		callHandler: function( handlerType ) {
			var handler = handlerType;
			var args = Array.prototype.shift.call( arguments );

			var handlers;
			if( ( handlers = GraphShape.prototype.handlers[ handler ] ) ) {
				for( var i = 0, l = handlers.length ; i < l ; i ++ ) {
					if( handlers[ i ].apply( this, arguments ) ) {
					//	return;
					}
				}
			}

			
			if( ( handlers = this.graph.shapeHandlers[ handler ] ) ) {
				for( var i = 0, l = handlers.length ; i < l ; i ++ ) {
					
					if( handlers[ i ].apply( this, arguments ) ) {
					//	return;
					}
				}
			}

		},

		addHandles: function() {

			if( this.isLocked() ) {
				return;
			}

			if( ! this.handlesInDom ) {

				this.handlesInDom = true;

				for( var i = 1 ; i <= this.nbHandles ; i ++ ) {
					if( this[ 'handle' + i ] ) {
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
			var div = $('<div></div>').dialog({ modal: true, position: ['center', 50], width: '80%' } );
			div.prev().remove();
			div.parent().css('z-index', 1000);

			require( [ 'require', 'lib/lib/forms/form' ], function( require,Form ) {

					
				var form = new Form({ });
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

				form.onStructureLoaded().done(function() {
					form.fill( self.getConfiguration() );
				});

				form.addButton('Cancel', { color: 'blue' }, function() {
					div.dialog( 'close' );
				});

				form.addButton('Save', { color: 'green' }, function() {
					self.setConfiguration( form.getValue( ) );
					div.dialog('close');

				});

				form.onLoaded().done(function() {

					div.html(form.makeDom());
					form.inDom();
				});
			});
		},

		getConfiguration: function() {
			return this.configuration = this.configuration || {};
		},

		setConfiguration: function( configuration ) {

			this.configuration = $.extend( true, this.configuration, configuration );
		},

		isLocked: function() {

			return this.options.locked || this.graph.shapesLocked;
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

			if( this.isBindable() ) {
				this.addClass('bindable');
			}	
		},

		highlight: function() {},
		unhighlight: function() {}

	}

	return GraphShape;

});