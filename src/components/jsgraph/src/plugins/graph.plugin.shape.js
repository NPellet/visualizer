define([], function() {

	"use strict";

	var plugin = function() { };

	plugin.prototype = {

		init: function( graph, options ) {
			
			this.options = options;
			this.shapeType = options.type;
			
		},

		setShape: function( shapeType ) {
			this.shapeInfo.shapeType = shapeType;
		},

		onMouseDown: function( graph, x, y, e, target ) {
				
			if( ! this.shapeType && ! this.options.url ) {
				return;
			}

			var self = this,
				selfPlugin = this;
				
			var xVal, yVal;

			this.count = this.count || 0;

			x -= graph.getPaddingLeft( ),
			y -= graph.getPaddingTop( ),

			xVal = graph.getXAxis().getVal( x );
			yVal = graph.getYAxis().getVal( y );

			var shapeInfo = {

				pos: {
					x: xVal, 
					y: yVal
				}, 

				pos2: {
					x: xVal,
					y: yVal
				},

				onChange: function(newData) {
					graph.triggerEvent('onAnnotationChange', newData);
				}
			};


			var shape = graph.makeShape( $.extend( shapeInfo, this.options ), {}, true ).then( function( shape ) {

				if( ! shape ) {
					return;
				}

				self.currentShape = shape;
				self.currentShapeEvent = e;
			
			} );

		},

		onMouseMove: function( graph, x, y, e ) {

			var self = this;

			if( self.currentShape ) {

				self.count ++;
				
				var shape = self.currentShape;
				self.currentShape = false;


				shape.handleCreateImpl( );

				if( shape.options && shape.options.onCreate ) {
					shape.options.onCreate.call( shape );
				}
				shape.draw( );
				shape.select();

				shape.handleMouseDown( self.currentShapeEvent, true );
				shape.handleMouseMove( e, true );
			}
		},

		onMouseUp: function( ) {
			var self = this;
			if( self.currentShape ) {
				self.currentShape.kill();
				self.currentShape = false;
			}
		}

	}

	return plugin;

});