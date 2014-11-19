
/*!
 * jsGraphs JavaScript Graphing Library v@VERSION
 * http://github.com/NPellet/jsGraphs
 *
 * Copyright 2014 Norman Pellet
 * Released under the MIT license
 *
 * Date: @DATE
 */

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {
		
		module.exports = factory( global );
			
	} else {

		factory( global );

	}

// Pass this if window is not defined yet
}( ( typeof window !== "undefined" ? window : this ), function( window ) {

	"use strict";

	var Assignation = function( $ ) {

		return function( domGlobal, graphs ) {

			var binding = false,
			bindingA = false,
			bindingB = false,
			bindingLine,
			bindingPairs = [],

			mousedown = function( el, event ) {

				if( event.shiftKey ) {

					for( var i in graphs ) { // We need to lock all graphs to prevent actions on the shapes.
						graphs[ i ].lockShapes();	
					}
					
					binding = true;
					bindingA = el;

					event.preventDefault();
					event.stopPropagation();
				}

				// Try to be smart and determine where to put the line ?
				var pos = $( el ).position(),
				
					w = parseFloat( el.getAttribute('width') || 0 ),
					h = parseFloat( el.getAttribute('height') || 0 ),

					x2 = parseFloat( el.getAttribute('x2') || 0 ),
					y2 = parseFloat( el.getAttribute('y2') || 0 ),

					x1 = parseFloat( el.getAttribute('x1') || 0 ),
					y1 = parseFloat( el.getAttribute('y1') || 0 ),


					x = pos.left + ( w / 2 ) + ( Math.abs( x2 - x1 ) / 2 ),
					y = pos.top  + ( h / 2 ) + ( Math.abs( y2 - y1 ) / 2 );

				bindingLine.setAttribute('display', 'block');

				bindingLine.setAttribute('x1', x );
				bindingLine.setAttribute('x2', x );

				bindingLine.setAttribute('y1', y );
				bindingLine.setAttribute('y2', y );
			},

			mouseup = function( el, event ) {

				if( ! binding ) {
					return;
				}

				var target = event.target;
				bindingLine.setAttribute('display', 'none');

				if( ! target.classList.contains( 'bindable' ) ) {

					binding = false;

				} else {

					bindingB = event.target;
					binding = false;
					bindSave();
				}

				for( var i in graphs ) { // We can now unlock everything
					graphs[ i ].unlockShapes();	
				}			
			},

			mousemove = function( e ) {

				if( ! binding ) {
					return;
				}

				bindingLine.setAttribute('x2', e.clientX );
				bindingLine.setAttribute('y2', e.clientY );
			},

			highlight = function( element ) {
				all( 'highlight', element );
			},

			unhighlight = function( element ) {
				all( 'unhighlight', element );
			},

			all = function( fct, element ) {

				for( var i = 0, l = bindingPairs.length ; i < l ; i ++ ) {

					if( bindingPairs[ i ][ 0 ] == element || bindingPairs[ i ][ 1 ] == element ) {

						if( bindingPairs[ i ][ 0 ].element ) {
							bindingPairs[ i ][ 0 ].element[ fct ]();
						} else {
							console.log( "Manual" );
						}

						if( bindingPairs[ i ][ 1 ].element ) {
							bindingPairs[ i ][ 1 ].element[ fct ]();
						} else {
							console.log( "Manual" );
						}
					}
				}
			},

			bindSave = function() {

				bindingPairs.push( [ bindingA, bindingB ] );
				bindingA = null;
				bindingB = null;

			},

			setEvents = function( ) {

				domGlobal.on('mousedown', '.bindable', function( e ) {
					mousedown( this, e );
				});


				domGlobal.on('mouseover', '.bindable', function( e ) {
					highlight( this );
				});


				domGlobal.on('mouseout', '.bindable', function( e ) {
					unhighlight( this );
				});


				domGlobal.on('mouseup', function( e ) {
					mouseup( this, e );
				});

				domGlobal.on('mousemove', function( e ) {
					mousemove( e );
				})
			};


			var ns = 'http://www.w3.org/2000/svg',

			topSVG = document.createElementNS( ns, 'svg' );
			topSVG.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
			topSVG.setAttribute('xmlns', ns );
		
			topSVG.setAttribute('style', 'position: absolute');
			topSVG.setAttribute('width', domGlobal.width( ) )
			topSVG.setAttribute('height', domGlobal.height( ) )
			topSVG.setAttribute('pointer-events', 'none');

			bindingLine = document.createElementNS( ns, 'line');
			bindingLine.setAttribute('stroke', 'black');

			topSVG.appendChild( bindingLine );

			domGlobal.prepend( topSVG );
			setEvents( );	
		}
	};

	if( typeof define === "function" && define.amd ) {
		define( [ 'jquery' ], function( $ ) {
			return Assignation( $ );
		});
	} else if( window ) {

		if( ! window.jQuery ) {
			throw "jQuery has not been loaded. Abort assignation initialization."
			return;
		}

		window.Assignation = Assignation( window.jQuery );
	}
}));
