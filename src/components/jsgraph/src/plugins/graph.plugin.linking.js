
define( [  ], function( ) {

	var plugin =  function() { };

	plugin.prototype = {

		init: function( graph, options, plugin ) {

			this.options = options;
			var self = this;
			this.graph = graph;
			this.plugin = plugin;

			var funcs = {

				/* Linking shapes */

				linkA: function( shapeA, line ) {
					this.linking.current.a = shapeA;
					this.linking.current.line = line;
				},

				linkB: function( shapeB ) {
					this.linking.current.b = shapeB;
				},

				getLinkingA: function() {
					return this.linking.current.a;
				},

				getLinkingB: function() {
					return this.linking.current.b;
				},

				isLinking: function( set ) {
					return ! ! this.linking.current.a;
				},

				newLinkingLine: function() {
					var line = document.createElementNS( this.ns, 'line');
					line.setAttribute('class', 'graph-linkingline');
					this.shapeZone.insertBefore( line, this.shapeZone.firstChild );
					return line;
				},

				getLinkingLine: function( add ) {
					return this.linking.current.line;
				},

				endLinking: function() {

					if( ( this.linking.current.a == this.linking.current.b && this.linking.current.a ) || ( ! this.linking.current.b && this.linking.current.a )  ) {

						this.shapeZone.removeChild( this.linking.current.line );
						this.linking.current = {};

						return;
					}

					if( this.linking.current.line ) {

						this.linking.current.line.style.display = "none";
						this.linking.links.push( this.linking.current );
						this.linking.current = {};
					}

					return this.linking.links[ this.linking.links.length - 1 ];
				},

				linkingReveal: function() {

					for( var i = 0, l = this.linking.links.length ; i < l ; i ++ ) {

						this.linking.links[ i ].line.style.display = "block";
					}
				},

				linkingHide: function() {

					for( var i = 0, l = this.linking.links.length ; i < l ; i ++ ) {

						this.linking.links[ i ].line.style.display = "none";
					}
				}

			};

			for( var i in funcs ) {
				graph[ i ] = funcs[ i ];
			}

			function linkingStart( shape, e, clicked ) {

				self.islinking = true;
				var linking = shape.graph.isLinking();

				if( linking ) {
					return;
				}

				var line = shape.graph.newLinkingLine( );
				var coords = shape.getLinkingCoords();

				line.setAttribute('x1', coords.x );
				line.setAttribute('y1', coords.y );
				line.setAttribute('x2', coords.x );
				line.setAttribute('y2', coords.y );

				shape.graph.linkA( shape, line );
			}

			function linkingMove( shape, e ) {

				var linking = shape.graph.isLinking();

				if( ! linking ) {
					return;
				}

				if( shape.graph.getLinkingB( ) ) { // Hover something else
					return;
				}

				var line = shape.graph.getLinkingLine();
				var coords = shape.graph.getXY( e );

				line.setAttribute('x2', coords.x - shape.graph.getPaddingLeft( ) );
				line.setAttribute('y2', coords.y - shape.graph.getPaddingTop( ) );
			}


			function linkingOn( shape, e ) {

				var linking = shape.graph.isLinking();
				if( ! linking ) {
					return;
				}

				var linkingA = shape.graph.getLinkingA( );

				if( linkingA == this ) {
					return;
				}

				shape.graph.linkB( shape ); // Update B element

		
				var coords = shape.getLinkingCoords();

				var line = shape.graph.getLinkingLine();
				line.setAttribute('x2', coords.x );
				line.setAttribute('y2', coords.y );
			}

			function linkingOut( shape, e ) {

				var linking = shape.graph.isLinking();
				if( ! linking ) {
					return;
				}
				shape.graph.linkB( undefined ); // Remove B element
			}

			function linkingFinalize( shape ) {
				
				return shape.graph.endLinking();
			}
			

	
			graph.linking = {
				current: {},
				links: []
			};
/*
			graph._dom.addEventListener('keydown', function( e ) {

				e.preventDefault();
				e.stopPropagation();

				if( ( e.keyCode == 16 && e.ctrlKey ) || ( e.keyCode == 17 && e.shiftKey )) {
					graph.linkingReveal();
				}
			});*/


/*			graph._dom.addEventListener( 'keyup', function( e ) {

				e.preventDefault();
				e.stopPropagation();
				graph.linkingHide();
			});
*/
			graph.shapeHandlers.mouseDown.push( function( e ) {
			
				if( self.graph.allowPlugin( e, self.plugin ) ) {

					this.moving = false;
					this.handleSelected = false;
				
					linkingStart( this, e, true );
				}
			});


			graph.shapeHandlers.mouseUp.push( function( e ) {
				
				var link;
				if( ( link = linkingFinalize( this ) ) ) {

					link.a.linking = link.a.linking || 0;
					link.a.linking++;
					
					link.b.linking = link.b.linking || 0;
					link.b.linking++;

					link.a.addClass('linking');
					link.b.addClass('linking');

					link.a.addClass('linking' + link.a.linking );
					link.a.removeClass('linking' + ( link.a.linking - 1 ) );

					link.b.addClass('linking' + link.a.linking );
					link.b.removeClass('linking' + ( link.a.linking - 1 ) );

					if( self.options.onLinkCreate ) {
						self.options.onLinkCreate( link.a, link.b );
					}
				}
			});


			graph.shapeHandlers.mouseMove.push( function( e ) {
				
				linkingMove( this, e, true );
			});


			graph.shapeHandlers.mouseOver.push( function( e ) {
				
				linkingOn( this, e, true );
			});


			graph.shapeHandlers.mouseOut.push( function( e ) {
				
				linkingOut( this, e, true );
			});
		}
	};

	return plugin;
});