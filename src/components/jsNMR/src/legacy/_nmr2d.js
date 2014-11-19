
define( [ 

	'graphs/graph.maximal', 
	'src/assignation', 
	'../lib/components/jcampconverter/src/jcampconverter'

	], function( Graph, Attribution, JcampConverter ) {


	return function( _1d_x, _1d_y, _2d, mol, nmr ) {

		var graphs = { x: null, y: null, _2d: null };
		
		var symmetric = true;

		var integralBasis = undefined;
		var integrals = { x: [], y: [] };

		var ajaxes = [ $.get( _2d ), $.get( _1d_x ), $.get( _1d_y ) ];
		var deferreds = [];

		ajaxes.map( function( def, i ) {

			def.then( function( data ) {
				deferreds[ i ] = JcampConverter( data );
			} );

		} );
		
		$.when.apply( $, ajaxes ).then( function() {

			$.when.apply( $, deferreds ).then( function() {

				doNMR( arguments[ 0 ], arguments[ 1 ] );
			} );
		} );

		
		function doNMR( _2d, _1d ) { 

			// Create DOM
			nmr.append('<table cellpadding="0" cellspacing="0" class="nmr-wrapper"><tr><td></td><td class="nmr-1d nmr-1d-x nmr-main"></td></tr><tr class="nmr-main"><td class="nmr-1d nmr-1d-y"></td><td class="nmr-2d"></td></tr></table>');

			function integral_resizemove( mode, noLoop ) {

				var sumMax = 0;

				for( var i = 0, l = integrals[ mode ].length; i < l ; i ++ ) {
					sumMax = Math.max( sumMax, integrals[ mode ][ i ].lastSum );
				}

				for( var i = 0, l = integrals[ mode ].length; i < l ; i ++ ) {

					integrals[ mode ][ i ].ratio = integrals[ mode ][ i ].lastSum / sumMax;
					integrals[ mode ][ i ].setPosition();

					if( integralBasis ) {
						integrals[ mode ][ i ].data.label[ 0 ].text = Math.round( integrals[ mode ][ i ].lastSum / integralBasis * 100 ) / 100;	
					} else {
						integrals[ mode ][ i ].data.label[ 0 ].text = 1;	
					}
					
					integrals[ mode ][ i ].setLabelPosition( 0 );
					integrals[ mode ][ i ].setLabelText( 0 );
				}


				if( symmetric && ! noLoop ) {
					integral_resizemove( getOtherMode( mode ), true );
				}
			}

			function setSyncPos( from, to ) {

				var pos1 = from.getFromData( 'pos' ),
					pos2 = from.getFromData( 'pos2' );

				var pos1t = to.getFromData( 'pos' ),
					pos2t = to.getFromData( 'pos2' );

				pos1t.x = pos1.y;
				pos1t.y = pos1.x;

				pos2t.x = pos2.y;
				pos2t.y = pos2.x;

			} 

			function integralCreated( mode, integral ) {

				makeNMRIntegral( mode, integral ).then( function( nmrint ) {

					integral.integral = nmrint;
					nmrint.data.pos = integral.getFromData( 'pos' );
					nmrint.data.pos2 = integral.getFromData( 'pos2' );//integral.getFromData( 'pos2' );
				
				} );

			//	 poses.push( integral.getFromData('pos') );

				if( symmetric ) {

					var otherMode = getOtherMode( mode );

					makePeakPosition( otherMode ).then( function( shape ) {

						integral.syncTo = shape;
						shape.syncTo = integral;

						shape.data.pos = {};
						shape.data.pos2 = {};
						shape.draw();

						setSyncPos( integral, integral.syncTo );

						shape.redrawImpl();

						makeNMRIntegral( otherMode ).then( function( nmrint ) {

							shape.integral = nmrint;
							nmrint.data.pos = shape.getFromData( 'pos' );
							nmrint.data.pos2 = shape.getFromData( 'pos2' );

						});	
					});
				}
			}

			function integralResized( mode, peak ) {

				if( ! peak.integral ) {
					return;
				}

				peak.integral.setPosition();

				if( peak.syncTo ) {
					setSyncPos( peak, peak.syncTo );
					peak.syncTo.redrawImpl();

					if( peak.syncTo.integral ) {
						peak.syncTo.integral.setPosition();
					}
				}
			

				integral_resizemove( mode );
			}


			function integralMoved( mode, peak ) {

				if( ! peak.integral ) {
					return;
				}

				peak.integral.setPosition();

				if( peak.syncTo ) {
					setSyncPos( peak, peak.syncTo );
					peak.syncTo.redrawImpl();
					peak.syncTo.integral.setPosition();
				}

				integral_resizemove( mode );
			}

			function integralRemoved( mode, peak ) {

				if( peak.integral ) {
					peak.integral.kill();
					integrals[ mode ].splice( integrals[ mode ].indexOf( peak.integral ), 1 );
				}

				if( peak.syncTo ) {

					peak.syncTo.kill();
					integrals[ getOtherMode( mode ) ].splice( integrals[ getOtherMode( mode ) ].indexOf( peak.syncTo.integral ), 1 );
				}

				integral_resizemove( mode );

			}

			function getOtherMode( mode ) {
				return mode == 'x' ? 'y' : ( mode == 'y' ? 'x' : ( console.error( "Mode not recognized") ) );
			}

			var nmrIntegralOptions = {
				 x: { 
					type: 'nmrintegral', 
					fillColor: 'transparent', 
					strokeColor: 'rgba(100, 0, 0, 0.5)', 
					strokeWidth: '1px',
					label: {
						position: { x: "100px", y: "20px"},
						text: 1,
						color: 'red',
						anchor: 'middle'
					},

					shapeOptions: {
						locked: true
					}
				 }
			}

			nmrIntegralOptions.y = $.extend(true, {}, nmrIntegralOptions.x );
			nmrIntegralOptions.y.shapeOptions.axis = 'y';

			var peakIntervalOptions = {

				x: { 
					type: 'peakinterval2',
					strokeColor: 'black',
					strokeWidth: 2,
					shapeOptions: {

						horizontal: true, 
						forcedCoords: { y: "20px" },
						bindable: true,
						axis: 'x'
					}
				},

				y: { 

					type: 'peakinterval2',
					strokeColor: 'black',
					strokeWidth: 2,
					shapeOptions: {
						vertical: true, 
						forcedCoords: { x: "30px" },
						bindable: true
					}
				}
			}


			function getPeakIntervalHandlers( mode ) {

				return { 

					shapeOptions: {
						onCreate: function() {
							integralCreated( mode, this );
						},

						onResize: function() {
							integralResized( mode, this );
						},

						onMove: function() {
							integralMoved( mode, this );
						},

						onRemove: function() {
							integralRemoved( mode, this );
						}
					}
				}
			}

			peakIntervalOptions.x = $.extend( true, {}, peakIntervalOptions.x, getPeakIntervalHandlers( 'x' ) );
			$.extend( true, {}, peakIntervalOptions.y, getPeakIntervalHandlers( 'y' ) );


			function makePeakPosition( mode ) {

				return graphs[ mode ].makeShape( $.extend( true, {}, peakIntervalOptions[ mode ] ), {} );
			}

			function makeNMRIntegral( mode, integral ) {

				return graphs[ mode ].makeShape( $.extend( true, {}, nmrIntegralOptions[ mode ] ), {} ).then( function( nmrint ) {

					integrals[ mode ].push( nmrint );
					nmrint.draw();
					return nmrint;
				} );
			}
			




			/********************************************/
			/** LOAD GRAPHS *****************************/
			/********************************************/


			/** LOAD 2D *********************************/
			
			graphs[ '_2d' ] = new Graph( nmr.find('.nmr-2d').get(0), {

				close: { left: false, top: false, right: false },

				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0,

				plugins: {

					'./graph.plugin.zoom': { 

						zoomMode: 'xy',
						onZoomStart: function( graph, x, y, e, target ) {
							graphs['x']._pluginExecute( './graph.plugin.zoom', 'onMouseDown', [ graphs['x'], x, y, e, true ] );
							graphs['y']._pluginExecute( './graph.plugin.zoom', 'onMouseDown', [ graphs['y'], x, y, e, true ] );
						},

						onZoomMove: function( graph, x, y, e, target ) {
							graphs['x']._pluginExecute( './graph.plugin.zoom', 'onMouseMove', [ graphs['x'], x, y, e, true ] );
							graphs['y']._pluginExecute( './graph.plugin.zoom', 'onMouseMove', [ graphs['y'], x, y, e, true ] );
						},

						onZoomEnd: function( graph, x, y, e, target ) {
							graphs['x']._pluginExecute( './graph.plugin.zoom', 'onMouseUp', [ graphs['x'], x, y, e, true ] );
							graphs['y']._pluginExecute( './graph.plugin.zoom', 'onMouseUp', [ graphs['y'], x, y, e, true ] );
						},

						onDblClick: function( x, y, prefs, e ) {
							
							graphs['y']._pluginExecute( './graph.plugin.zoom', 'onDblClick', [ graphs['y'], x, y, { mode: 'total' }, e, true ] );
							graphs['x']._pluginExecute( './graph.plugin.zoom', 'onDblClick', [ graphs['x'], x, y, { mode: 'total' }, e, true ] );
						}
					},

					'./graph.plugin.shape': {
						type: 'peakintegration2d',
						shapeOptions: { 
							bindable: false
						}
						
					},
				},

				dblclick: {
					type: 'plugin',
					plugin: './graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'./graph.plugin.zoom': { shift: false, ctrl: false },
					'./graph.plugin.shape': { shift: true, ctrl: false }
				}

			} );



			/** LOAD X **********************************/	

			graphs['x'] = new Graph( nmr.find('.nmr-1d-x').get(0), {

				close: { left: false, top: false, right: false },
				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0,

				onAnnotationChange: function( data, shape ) {
					if( data.type == "peakinterval2" ) {

						if( ! integralBasis ) {
							integralBasis = shape.integral.lastSum;
						}

					} else if( data.type == "nmrintegral" ) {

						if( integralBasis ) {

							var fl = parseFloat( shape.data.label[ 0 ].text );
							
							if( fl != 0 ) {
								integralBasis = shape.lastSum / fl;
							}

						}
						
					}

					integral_resizemove('x');
					integral_resizemove('y');
				},

				plugins: {
					'./graph.plugin.zoom': { 
						zoomMode: 'x',

						onZoomStart: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseDown', [ graphs[ '_2d' ], x, undefined, e, true ] );

						},

						onZoomMove: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseMove', [ graphs[ '_2d' ], x, undefined, e, true ] );

						},

						onZoomEnd: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseUp', [ graphs[ '_2d' ], x, undefined, e, true ] );

						},

						onDblClick: function( x, y, prefs, e ) {
							
							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onDblClick', [ graphs[ '_2d' ], x, y, { mode: 'xtotal' }, e, true ] );
							
						}

					},

					'./graph.plugin.shape': peakIntervalOptions[ 'x' ],
				},


				dblclick: {
					type: 'plugin',
					plugin: './graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'./graph.plugin.zoom': { shift: false, ctrl: false },
					'./graph.plugin.shape': { shift: true, ctrl: false }
				}

			} );


			/** LOAD Y **********************************/
			
			graphs['y'] = new Graph( nmr.find('.nmr-1d-y').get(0), { 

				close: { left: false, top: false, right: false },

				plugins: {
					'./graph.plugin.zoom': { 
						zoomMode: 'y',
						onZoomStart: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseDown', [  graphs[ '_2d' ], undefined , y, e, true ] );

						},

						onZoomMove: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseMove', [ graphs[ '_2d' ], undefined , y, e, true ] );

						},

						onZoomEnd: function( graph, x, y, e, target ) {

							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onMouseUp', [ graphs[ '_2d' ], undefined, y, e, true ] );

						},

						onDblClick: function( x, y, prefs, e ) {
							
							graphs[ '_2d' ]._pluginExecute( './graph.plugin.zoom', 'onDblClick', [ graphs[ '_2d' ], x, y, { mode: 'ytotal' }, e, true ] );
							
						}
					},

					'./graph.plugin.shape': {  },
					'./graph.plugin.linking': { },
				},


				dblclick: {
					type: 'plugin',
					plugin: './graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'./graph.plugin.zoom': { shift: false, ctrl: false },
					'./graph.plugin.shape': { shift: true, ctrl: false }
				},



				wheel: {
					type: 'plugin',
					plugin: './graph.plugin.zoom',
					options: {
						direction: 'x'
					}
				},

				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0

			} );
			

			/********************************************/
			/** LOAD SERIES *****************************/
			/********************************************/

			var serie_x = graphs['x'].newSerie("seriex" )
				.setLabel( "My serie" )
				.autoAxis()
				.setData( _1d.spectra[ 0 ].data[ 0 ] );

			serie_x.getYAxis().setDisplay( false ).togglePrimaryGrid( false ).toggleSecondaryGrid( false );
			serie_x.getXAxis().flip(true).setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setTickPosition( 'outside' )

			var serie_y = graphs['y'].newSerie("seriey", { flip: true } )
				.setLabel( "My serie" )
				.setXAxis( graphs['y'].getBottomAxis( ) )
				.setYAxis( graphs['y'].getRightAxis( ) )
				.setData( _1d.spectra[ 0 ].data[ 0 ] );

			serie_y.getYAxis().setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).flip( true ).setTickPosition( 'outside' );
			serie_y.getXAxis().togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );


			var serie_2d = graphs[ '_2d' ].newSerie("serie2d", { }, 'contour' )
				.setLabel( "My serie" )
				.autoAxis()
				.setData( _2d.contourLines )

			serie_2d.getXAxis().forceMin( serie_x.getXAxis().getMinValue( ) );
			serie_2d.getXAxis().forceMax( serie_x.getXAxis().getMaxValue( ) );


			serie_2d.getYAxis().forceMin( serie_y.getYAxis().getMinValue( ) );
			serie_2d.getYAxis().forceMax( serie_y.getYAxis().getMaxValue( ) );


			serie_2d.getXAxis().setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );
			serie_2d.getYAxis().togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );


			/********************************************/
			/** DRAW ALL ********************************/
			/********************************************/

			graphs['y'].redraw( );
			graphs['y'].drawSeries();	

			graphs['x'].redraw( );	
			graphs['x'].drawSeries();	

			graphs[ '_2d' ].redraw( );
			graphs[ '_2d' ].drawSeries();		



			/********************************************/
			/** DRAW MOLECULE ***************************/
			/** INIT ASSIGN *****************************/
			/********************************************/

			Attribution( nmr, graphs );
			loadMolecule( mol );
		}


		
		function loadMolecule( molUrl ) {


			require( [ './lib/components/VisuMol/src/molecule' ], function( Molecule ) {


				var dom = document.createElement("div");
				dom.setAttribute('style', 'position: absolute;');
				// Create a new molecule
				var molecule = new Molecule( { maxBondLengthAverage: 40 } );

				// Adds the molecule somewhere in the DOM
				dom.appendChild( molecule.getDom() );

				// Set the size of the canvas
				molecule.resize( 300, 200 );

				// Fetches the JSON and uses it as the source data
				molecule.setDataFromJSONFile( molUrl ).then( function() {

					molecule.render();

				});

				nmr.prepend( dom );
			} );
		}
	}
});