
define( function( ) {

	return [ function( domGraph ) {

		"use strict";
		var div1 = document.createElement('div');
		var div2 = document.createElement('div');

		var domGraph = document.getElementById( domGraph );


		// BEGIN IGNORE ON BUILD

		function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
		    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		function hexToRgb(hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? {
		        r: parseInt(result[1], 16),
		        g: parseInt(result[2], 16),
		        b: parseInt(result[3], 16)
		    } : null;
		}


		var script = document.createElement('script');
		script.onload = function() {
		  console.log( 'gcms loaded');
		};
		script.src = "../../../examples/science/_lib/gcms.js";
		document.getElementsByTagName('head')[0].appendChild(script);



		var script = document.createElement('script');
		script.onload = function() {
		  console.log( 'jcampconverter loaded');
		};
		script.src = "../../../examples/science/_lib/jcampconverter.js";
		document.getElementsByTagName('head')[0].appendChild(script);
		// END IGNORE ON BUILD

		$.get( '../../../examples/science/_lib/gcms.jdx', {}, function( data ) {

			JcampConverter( data ).then( function( gcmsData ) {

				domGraph.appendChild( div1 );
				domGraph.appendChild( div2 );

				div2.style.width = '100%';
				div2.style.height = '100px';

				div1.style.width = '100%';
				div1.style.height = '250px';
				
				var table = $("<table cellpadding='10' cellspacing='0' style='margin: auto'><thead><tr><th>From</th><th>To</th><th>Color</th><th>Display MS</th></tr></thead><tbody></tbody></table>");
						var tbody = table.find('tbody');

						var gcmsinstance = new GCMS( div1, div2, {

							
						


							
							AUCCreated: function( auc ) {

								var self = this;
								var pos = Math.round( auc.data.pos.x );
								var pos2 = Math.round( auc.data.pos2.x );
								var color = rgbToHex.apply( this, auc.data.color );

								var tr = $("<tr />")	
											.append( '<td>' + pos + '</td><td>' + pos2 + '</td><td><input class="color" type="color" value="' + color + '" /></td><td><input class="displayMS" type="checkbox" checked="checked" /></td>');


								tr.find('input.displayMS').bind('change', function( e ) {

									if( ! auc.msFromAucSerie ) {
										return;
									}

									if( ! $( this ).prop('checked') ) {
										auc.msFromAucSerie.hide();
									} else {
										auc.msFromAucSerie.show();
									}

									self.redrawMs();


								});

								tr.find('input.color').bind('change', function( e ) {
									var rgb = hexToRgb( $( this ).prop( 'value' ) );

									auc.data.color = [ rgb.r, rgb.g, rgb.b ];

									if( ! auc.isSelected() ) {

										auc.set('fillColor', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.3)');
										auc.set( 'strokeColor', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)');

										auc.setFillColor();
										auc.setStrokeColor();

										if( auc.msFromAucSerie ) {
											auc.msFromAucSerie.setLineColor( 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.3)' );
											auc.msFromAucSerie.applyLineStyles();
										}

									}

//									auc.redraw();
								})
								auc._tr = tr;
								table.append( tr );
							},

							AUCChange: function( auc ) {

								var pos = Math.round( auc.data.pos.x );
								var pos2 = Math.round( auc.data.pos2.x );

								if( auc._tr ) {
									auc._tr.children().eq( 0 ).html( pos );
									auc._tr.children().eq( 1 ).html( pos2 );
								}


								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
									auc.msFromAucSerie.applyLineStyles();

//									auc.msFromAucSerie.showPeakPicking();
								}


							},

							AUCSelected: function( auc ) {

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
									auc.msFromAucSerie.applyLineStyles();

									auc.msFromAucSerie.showPeakPicking( true );
								}

								if( auc._tr ) {
									auc._tr.css( { backgroundColor: 'rgba(200, 0, 0, 0.1)'})
									auc._tr.find('input.displayMS').prop('disabled', 'disabled').prop('checked','checked');
								}


							},

							AUCUnselected: function( auc ) {

								var rgb = auc.data.color;

								auc.set('fillColor', 'rgba(' + rgb[ 0 ] + ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 0.3)');
								auc.set( 'strokeColor', 'rgba(' + rgb[ 0 ]+ ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 1)');

								auc.setFillColor();
								auc.setStrokeColor();

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(' + rgb[ 0 ] + ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 0.3)' );
									auc.msFromAucSerie.applyLineStyles();
									auc.msFromAucSerie.hidePeakPicking( true );
								}

								if( auc._tr ) {
									auc._tr.css( { backgroundColor: 'transparent'} );
									auc._tr.find('input.displayMS').prop('disabled', '');
								}
							},

							AUCRemoved: function( auc ) {

								if( auc._tr ) {
									auc._tr.remove();
								}

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.kill();
								}

							}

						} );

						domGraph.appendChild( table.get( 0 ) );
				gcmsinstance.setGC( gcmsData.gcms.gc );
				gcmsinstance.setMS( gcmsData.gcms.ms );
			})

		} )
		

	}, "Advanced GC-MS", [ 

	'Advanced example of the GCMS showing how you can register callbacks onto shape modifications or act onto shapes programatically. The example relies on the GC-MS script (<a href="{{ site.baseurl }}/examples/science/_lib/gcms.js">download here</a>) that interfaces the basics of the GC-MS behaviour.',
	'<strong>Tip: </strong> Use backspace to remove a shape'

	] 



	];

});


// BEGIN INGORE ON BUILD

/*
define( ['require'], function( require ) {

	return [ function( domGraph ) {

		var div1 = document.createElement('div');
		var div2 = document.createElement('div');

		var domGraph = document.getElementById( domGraph );


		function componentToHex(c) {
		    var hex = c.toString(16);
		    return hex.length == 1 ? "0" + hex : hex;
		}

		function rgbToHex(r, g, b) {
		    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
		}

		function hexToRgb(hex) {
		    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		    return result ? {
		        r: parseInt(result[1], 16),
		        g: parseInt(result[2], 16),
		        b: parseInt(result[3], 16)
		    } : null;
		}



		require( [ './_lib/gcms' ], function( GCMSConstructor ) {

			require( [ './_lib/jcampconverter' ], function( JcampConverter ) {

				$.get( require.toUrl( './_lib/gcms.jdx' ), {}, function( data ) {

					JcampConverter( data ).then( function( gcmsData ) {

						domGraph.appendChild( div1 );
						domGraph.appendChild( div2 );

						div2.style.width = '100%';
						div2.style.height = '100px';

						div1.style.width = '100%';
						div1.style.height = '250px';
		

						var table = $("<table cellpadding='10' cellspacing='0' style='margin: auto'><thead><tr><th>From</th><th>To</th><th>Color</th><th>Display MS</th></tr></thead><tbody></tbody></table>");
						var tbody = table.find('tbody');

						var gcms = new GCMSConstructor( div1, div2, {

							
							AUCCreated: function( auc ) {

								var self = this;
								var pos = Math.round( auc.data.pos.x );
								var pos2 = Math.round( auc.data.pos2.x );
								var color = rgbToHex.apply( this, auc.data.color );

								var tr = $("<tr />")	
											.append( '<td>' + pos + '</td><td>' + pos2 + '</td><td><input class="color" type="color" value="' + color + '" /></td><td><input class="displayMS" type="checkbox" checked="checked" /></td>');


								tr.find('input.displayMS').bind('change', function( e ) {

									if( ! auc.msFromAucSerie ) {
										return;
									}

									if( ! $( this ).prop('checked') ) {
										auc.msFromAucSerie.hide();
									} else {
										auc.msFromAucSerie.show();
									}

									self.redrawMs();


								});

								tr.find('input.color').bind('change', function( e ) {
									var rgb = hexToRgb( $( this ).prop( 'value' ) );

									auc.data.color = [ rgb.r, rgb.g, rgb.b ];

									if( ! auc.isSelected() ) {

										auc.set('fillColor', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.3)');
										auc.set( 'strokeColor', 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 1)');

										auc.setFillColor();
										auc.setStrokeColor();

										if( auc.msFromAucSerie ) {
											auc.msFromAucSerie.setLineColor( 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', 0.3)' );
											auc.msFromAucSerie.applyLineStyles();
										}

									}

//									auc.redraw();
								})
								auc._tr = tr;
								table.append( tr );
							},

							AUCChange: function( auc ) {

								var pos = Math.round( auc.data.pos.x );
								var pos2 = Math.round( auc.data.pos2.x );

								if( auc._tr ) {
									auc._tr.children().eq( 0 ).html( pos );
									auc._tr.children().eq( 1 ).html( pos2 );
								}


								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
									auc.msFromAucSerie.applyLineStyles();

//									auc.msFromAucSerie.showPeakPicking();
								}


							},

							AUCSelected: function( auc ) {

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
									auc.msFromAucSerie.applyLineStyles();

									auc.msFromAucSerie.showPeakPicking( true );
								}

								if( auc._tr ) {
									auc._tr.css( { backgroundColor: 'rgba(200, 0, 0, 0.1)'})
									auc._tr.find('input.displayMS').prop('disabled', 'disabled').prop('checked','checked');
								}


							},

							AUCUnselected: function( auc ) {

								var rgb = auc.data.color;

								auc.set('fillColor', 'rgba(' + rgb[ 0 ] + ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 0.3)');
								auc.set( 'strokeColor', 'rgba(' + rgb[ 0 ]+ ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 1)');

								auc.setFillColor();
								auc.setStrokeColor();

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.setLineColor( 'rgba(' + rgb[ 0 ] + ', ' + rgb[ 1 ] + ', ' + rgb[ 2 ] + ', 0.3)' );
									auc.msFromAucSerie.applyLineStyles();
									auc.msFromAucSerie.hidePeakPicking( true );
								}

								if( auc._tr ) {
									auc._tr.css( { backgroundColor: 'transparent'} );
									auc._tr.find('input.displayMS').prop('disabled', '');
								}
							},

							AUCRemoved: function( auc ) {

								if( auc._tr ) {
									auc._tr.remove();
								}

								if( auc.msFromAucSerie ) {
									auc.msFromAucSerie.kill();
								}

							}

						} );

						domGraph.appendChild( table.get( 0 ) );
						gcms.setGC( gcmsData.gcms.gc );
						gcms.setMS( gcmsData.gcms.ms );



					})

				} )
				

			} );

			

		} );


	}, "GC-MS", [ 

	"",
	] 



	];

});

*/