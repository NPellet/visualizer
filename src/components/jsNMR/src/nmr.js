
(function( global, factory ) {

    if ( typeof module === "object" && typeof module.exports === "object" ) {
        module.exports = factory( global );
    } else {
        factory( global );
    }

} ( window, function( window ) {

	var factory = function( Graph, Attribution, JcampConverter, Molecule ) {

		// Root here
		var defaults = {

			mode: '1d',
			molecule: false,
			urls: {

			}
		}

		function fetchUrls( nmr, urls, options ) {

			var fetching = [];

			for( var i in urls ) {
				fetching.push( $.get( urls[ i ] ).then( function( data ) { return JcampConverter.convert( data ) } ) );
			}

			if( ! nmr.divLoading ) {

				nmr.divLoading = $("<div />").css( {

					width: nmr.getDom().width(),
					height: nmr.getDom().height(),
					position: 'absolute',
					backgroundColor: 'rgba(200, 200, 200, 0.5)',
					textAlign: 'center',
					lineHeight: nmr.getDom().height() + "px",
					fontSize: '2em',
					border: "1px solid #c0c0c0"

				} ).html("Loading...");

				nmr.getDom().prepend( nmr.divLoading );
			}

			nmr.loading = nmr.loading || 0
			nmr.loading++;

			$.when.apply( $, fetching ).then( function() {

				var j = 0;
				for( i in urls ) {

					urls[ i ] = arguments[ j ];
					j++;
				}

				nmr.loading--;
				if( nmr.loading == 0 ) {
					nmr.divLoading.remove();
					nmr.divLoading = false;
				}

				nmr.series.push( urls );
				nmr.loaded( urls, options, "a" + Math.random() );
			} );
		}


		function integral_resizemove( nmr, mode, noLoop ) {

			var sumMax = 0;

			for( var i = 0, l = nmr.integrals[ mode ].length; i < l ; i ++ ) {
				sumMax = Math.max( sumMax, nmr.integrals[ mode ][ i ].lastSum );
			}


			for( var i = 0, l = nmr.integrals[ mode ].length; i < l ; i ++ ) {

				nmr.integrals[ mode ][ i ].ratio = Math.abs( sumMax == 0 ? 1 : nmr.integrals[ mode ][ i ].lastSum / sumMax );

				nmr.integrals[ mode ][ i ].setPosition();

				if( nmr.integralBasis ) {
					nmr.integrals[ mode ][ i ].data.label[ 0 ].text = Math.round( nmr.integrals[ mode ][ i ].lastSum / nmr.integralBasis * 100 ) / 100;	
				} else {
					nmr.integrals[ mode ][ i ].data.label[ 0 ].text = 1;	
				}
				
				nmr.integrals[ mode ][ i ].setLabelPosition( 0 );
				nmr.integrals[ mode ][ i ].setLabelText( 0 );
			}

			
			if( nmr.isSymmetric( ) && ! noLoop ) {
				integral_resizemove( nmr, getOtherMode( nmr, mode ), true );
			}
		}

		function setSyncPos( nmr, from, to ) {

			var pos1 = from.getFromData( 'pos' ),
				pos2 = from.getFromData( 'pos2' );

			var pos1t = to.getFromData( 'pos' ),
				pos2t = to.getFromData( 'pos2' );

			pos1t.x = pos1.y;
			pos1t.y = pos1.x;

			pos2t.x = pos2.y;
			pos2t.y = pos2.x;

		} 

		function integralCreated( nmr, mode, integral ) {

			if( nmr.graphs[ mode ].selectedSerie ) {
				integral.setSerie( nmr.graphs[ mode ].selectedSerie );	
			} else {
				integral.setSerie( nmr.graphs[ mode ].getSerie( 0 ) );	
			}
			

			makeNMRIntegral( nmr, mode, integral ).then( function( nmrint ) {

				nmrint.setSerie( integral.getSerie() );
				integral.integral = nmrint;
				nmrint.data.pos = integral.getFromData( 'pos' );
				nmrint.data.pos2 = integral.getFromData( 'pos2' );//integral.getFromData( 'pos2' );
				nmrint.originalShape = integral;

			} );

		//	 poses.push( integral.getFromData('pos') );

			if( nmr.isSymmetric( ) ) {

				var otherMode = getOtherMode( nmr, mode );

				makePeakPosition( nmr, otherMode ).then( function( shape ) {

					integral.syncTo = shape;
					shape.syncTo = integral;
					shape.setSerie( nmr.graphs[ otherMode ].selectedSerie );

					shape.data.pos = {};
					shape.data.pos2 = {};
					shape.draw();

					setSyncPos( nmr, integral, integral.syncTo );

					shape.redrawImpl();

					makeNMRIntegral( nmr, otherMode ).then( function( nmrint ) {

						shape.integral = nmrint;

						nmrint.setSerie( shape.getSerie( ) );
					

						nmrint.data.pos = shape.getFromData( 'pos' );
						nmrint.data.pos2 = shape.getFromData( 'pos2' );
						nmrint.originalShape = shape;
					});	
				});
			}
		}

		function integralResized( nmr, mode, peak ) {

			if( ! peak.integral ) {
				return;
			}

			peak.integral.setPosition();

			if( peak.syncTo ) {
				setSyncPos( nmr, peak, peak.syncTo );
				peak.syncTo.redrawImpl();

				if( peak.syncTo.integral ) {
					peak.syncTo.integral.setPosition();
				}
			}
		

			integral_resizemove( nmr, mode );
		}


		function integralMoved( nmr, mode, peak ) {

			if( ! peak.integral ) {
				return;
			}

			peak.integral.setPosition();

			if( peak.syncTo ) {
				setSyncPos( nmr, peak, peak.syncTo );
				peak.syncTo.redrawImpl();
				peak.syncTo.integral.setPosition();
			}

			integral_resizemove( nmr, mode );
		}

		function integralRemoved( nmr, mode, peak ) {

			if( peak.integral) {
				var i = peak.integral;
				peak.integral = false;
				i.originalShape = false;

				if( i._inDom ) {
					i.kill();
				}

				nmr.integrals[ mode ].splice( nmr.integrals[ mode ].indexOf( i ), 1 );
			}

			if( peak.syncTo ) {
				peak.syncTo.kill();
				nmr.integrals[ getOtherMode( mode ) ].splice( nmr.integrals[ getOtherMode( nmr, mode ) ].indexOf( peak.syncTo.integral ), 1 );
			}

			integral_resizemove( nmr, mode );
		}

		function getOtherMode( nmr, mode ) {
			return mode == 'x' ? 'y' : ( mode == 'y' ? 'x' : ( console.error( "Mode not recognized") ) );
		}

		function makePeakPosition( nmr, mode ) {

			var creator = nmr.graphs[ mode ].newShape( $.extend( true, {}, nmr.nmrSignal1dOptions[ mode ] ), {} );

			if( ! creator ) {
				creator = $.Deferred().reject();
			}

			return creator;
		}

		function makeNMRIntegral( nmr, mode, integral ) {

			var creator = nmr.graphs[ mode ].newShape( $.extend( true, {}, nmr.nmrIntegralOptions[ mode ] ), {} );

			if( ! creator ) {
				creator = $.Deferred().reject();
			} else {

				creator.then( function( nmrint ) {

					nmr.integrals[ mode ].push( nmrint );
					nmrint.draw();
					return nmrint;
				} );
			}

			return creator;
		}
		

		function getNmrSignal1dHandlers( nmr, mode ) {

			return { 

				shapeOptions: {

					onCreate: function() {
						integralCreated( nmr, mode, this );
					},

					onResize: function() {
						integralResized( nmr, mode, this );
					},

					onMove: function() {
						integralMoved( nmr, mode, this );
					}/*,

					onRemove: function() {
						integralRemoved( nmr, mode, this );
					}*/
				}
			}
		}

		function removeSerie( nmr, axis, name ) {

			var serie;
			if( ( serie = nmr.graphs[ axis ].getSerie( name ) ) ) {
				serie.kill();
			}

			nmr.graphs[ axis ].redraw();
			nmr.graphs[ axis ].drawSeries();

		}

			
		function doNMR( nmr ) { 

			switch( nmr.getMode() ) {

				case '1d':

				//console.time("Making the whole graph");
					nmr.options.dom.append('<div />');
					nmr.makeGraphs1D();
				//	console.timeEnd("Making the whole graph");

				break;

				case '2d':

					nmr.options.dom.append('<div class="nmr-table-wrapper"><div class="nmr-2d-map" style="width: 150px; height: 150px; position: absolute; right: 0; bottom: 0"></div><table cellpadding="0" cellspacing="0" class="nmr-wrapper"><tr><td></td><td class="nmr-1d nmr-1d-x nmr-main" style="width: 500px; height: 150px;"></td></tr><tr class="nmr-main"><td class="nmr-1d nmr-1d-y"style="height: 500px; width: 150px;"></td><td class="nmr-2d" style="height: 500px; width: 500px;"></td></tr></table></div>');
					nmr.makeGraphs2D();
				break;

			}
		}
	

		var NMR = function( options ) {

			this.options = $.extend( true, {}, defaults, options );
			this.series = [];

			this.minimapClip;
			// 1D
	
			this.nmrIntegralOptions = {
				 x: { 
					type: 'nmrintegral', 
					fillColor: 'transparent', 
					strokeColor: 'rgba(100, 0, 0, 0.5)', 
					strokeWidth: '1px',
					label: {
						position: { },
						text: 1,
						color: 'red',
						anchor: 'middle'
					},

					shapeOptions: {
						locked: true
					}
				 }
			}

			if( this.isSymmetric() ) {
				this.nmrIntegralOptions.y = $.extend(true, {}, this.nmrIntegralOptions.x );
				this.nmrIntegralOptions.y.shapeOptions.axis = 'y';
			}

			this.nmrSignal1dOptions = {

				x: { 
					url: 'src/shape.1dnmr',
					strokeColor: 'green',
					strokeWidth: 2,
					shapeOptions: {

						horizontal: true, 
						forcedCoords: { y: function( shape ) {  return ( 20 + shape.serie.getIndex() * 5 ) + "px"; } },
						bindable: true,
						axis: 'x'
					}
				}
			}


			if( this.isSymmetric() ) {
				this.nmrSignal1dOptions.y = $.extend(true, {}, this.nmrSignal1dOptions.x );
				this.nmrSignal1dOptions.y.shapeOptions.axis = 'y';
			}

			this.nmrSignal1dOptions.x = $.extend( true, {}, this.nmrSignal1dOptions.x, getNmrSignal1dHandlers( this, 'x' ) );
			this.nmrSignal1dOptions.y = $.extend( true, {}, this.nmrSignal1dOptions.x, getNmrSignal1dHandlers( this, 'y' ) );



			// 2D
			this.nmrSignal2dOptions = {

			
				url: 'src/shape.2dnmr',
				strokeColor: 'green',
				strokeWidth: 2,
				shapeOptions: {

					horizontal: true, 
					forcedCoords: { y: "20px" },
					bindable: true,
					axis: 'x'
				}
			}

			switch( this.options.mode ) {
				case '2d':
					this.graphs = { x: null, y: null, _2d: null };
					this.integrals = { x: [], y: [], _2d: [] };
				break;

				case '1d':
					this.graphs = { x: null };
					this.integrals = { x: [] };
				break;
			}

			doNMR( this );


			switch( this.options.mode ) {
				case '2d':
					
				break;

				case '1d':
					this.legend = this.graphs.x.makeLegend( { frame: true, frameWidth: 2, frameColor: 'grey', movable: true, backgroundColor: 'white' } );
					this.legend.setPosition( { x: "300px", y: "40px" }, 'right' );

				break;
			}
		}


		var loadDefaults = {
			urls: {}
		}

		NMR.prototype.load = function( load ) {

			var load = $.extend( true, {}, loadDefaults, load );
			var urls = {};
			switch( this.options.mode ) {

				case '2d':

					load.urls.twoD = load.urls.twoD || load.urls.url;
					load.urls.x = load.urls.x || load.urls.oneD;
					load.urls.y = ( load.urls.y || load.urls.oneD ) || ( load.symmetric ? load.urls.x : false );

					urls.twoD = load.urls.twoD; // Compulsory
					
					if( load.urls.x ) {
						urls.x = load.urls.x;
					}

					if( load.urls.y ) {
						urls.y = load.urls.y;
					} else if( this.isSymmetric() ) {
						urls.y = urls.x;
					}

				
				break;

				case '1d':
					
					load.urls.oneD = load.url || load.urls.oneD || load.urls.x;
					urls.x = load.urls.oneD;	


				break;
			}


			fetchUrls( this, urls, load );

			if( load.molecule ) {

				loadMolecule( load.molecule, this.options.dom );

				new Assignation( this.options.dom, this.graphs );
			}


		}


		NMR.prototype.isSymmetric = function() {
			return this.options.symmetric || false;
		}

		NMR.prototype.getMode = function() {
			return this.options.mode;
		}

		NMR.prototype.getDom = function() {
			return this.options.dom;
		}

		NMR.prototype.getGraph2D = function() {
			return this.graphs['_2d'];
		}

		NMR.prototype.getGraphX = function() {
			return this.graphs['x'];
		}

		NMR.prototype.getGraphY = function() {
			return this.graphs['y'];
		}

		NMR.prototype.resize1DTo = function( w, h ) {
			this.graphs[ 'x' ].resize( w, h );
			this.graphs[ 'x' ].drawSeries();
		}

		NMR.prototype.resize2DTo = function( w, h ) {

			this.options.dom.find('.nmr-1d-y').css( {
				height: h - 150,
				width: 150
			} );

			this.graphs.y.resize( 150, h - 150 );


			this.options.dom.find('.nmr-1d-x').css( {
				width: w - 150,
				height: 150
			} );

			this.graphs.x.resize( w - 150, 150 );


			this.options.dom.find('.nmr-2d').css( {
				width: w - 150,
				height: h - 150
			} );

			this.graphs['_2d'].resize( w - 150, h - 150 );

		}

		NMR.prototype.setSerie2DX = function( name, data, options ) {

			if( this.graphs[ 'x'].getSerie( name ) ) {
				return;
			}
			var serie_x = this.graphs['x'].newSerie(name, $.extend( { useSlots: true }, options ) )
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data );

			serie_x.getYAxis().setDisplay( false ).togglePrimaryGrid( false ).toggleSecondaryGrid( false );
			serie_x.getXAxis().flip(true).setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setTickPosition( 'outside' )

			serie_x.XIsMonotoneous();

			if( options.lineColor ) {
				serie_x.setLineColor( options.lineColor );
			}

			if( options.lineWidth ) {
				serie_x.setLineWidth( options.lineWidth );
			}

			if( options.setLineStyle ) {
				serie_x.setLineStyle( options.lineStyle );
			}
		}

		NMR.prototype.setSerie2DY = function( name, data, options ) {

	
			if( this.graphs[ 'y'].getSerie( name ) ) {
				return;
			}

			var serie_y = this.graphs['y']
				.newSerie(name, $.extend( { useSlots: true, flip: true }, options ) )
				.setLabel( "My serie" )
				.setXAxis( this.graphs['y'].getBottomAxis( ) )
				.setYAxis( this.graphs['y'].getRightAxis( ) )
				.setData( data );

			serie_y.getYAxis().setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).flip( true ).setTickPosition( 'outside' );
			serie_y.getXAxis().togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );

			serie_y.XIsMonotoneous();

			if( options.lineColor ) {
				serie_y.setLineColor( options.lineColor );
			}


			if( options.lineWidth ) {
				serie_y.setLineWidth( options.lineWidth );
			}

			if( options.setLineStyle ) {
				serie_y.setLineStyle( options.lineStyle );
			}


					
		}

		NMR.prototype.setSerie2D = function( name, data, options ) {

			if( this.graphs[ '_2d'].getSerie( name ) ) {
				return;
			}

			var serie_2d = this.graphs[ '_2d' ].newSerie(name, options, 'contour' )
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data )
/*
			serie_2d.getXAxis().forceMin( serie_x.getXAxis().getMinValue( ) );
			serie_2d.getXAxis().forceMax( serie_x.getXAxis().getMaxValue( ) );

			serie_2d.getYAxis().forceMin( serie_y.getYAxis().getMinValue( ) );
			serie_2d.getYAxis().forceMax( serie_y.getYAxis().getMaxValue( ) );

*/
			if( this.options.minimap && this.graphs[ '_2d-minimap' ] && 1 == 0) {

				
				var serie_2d_minimap = this.graphs[ '_2d-minimap' ].newSerie("serie2d", { label: options.label }, 'contour' )
					.autoAxis()
					.setData( series.twoD.contourLines )
/*
				serie_2d_minimap.getXAxis().forceMin( serie_x.getXAxis().getMinValue( ) );
				serie_2d_minimap.getXAxis().forceMax( serie_x.getXAxis().getMaxValue( ) );

				serie_2d_minimap.getYAxis().forceMin( serie_y.getYAxis().getMinValue( ) );
				serie_2d_minimap.getYAxis().forceMax( serie_y.getYAxis().getMaxValue( ) );
*/
				this.minimapClip.setSerie( serie_2d_minimap );

				this.graphs[ '_2d-minimap' ].redraw( );
				this.graphs[ '_2d-minimap' ].drawSeries();

			}

			if( options.lineColor ) {
				serie_2d.setLineColor( options.lineColor );
			}


			if( options.twoDColor ) {
				serie_2d.setDynamicColor( options.twoDColor );
			}

			if( options.twoDNegative ) {
				serie_2d.setNegative( true );
			}

			serie_2d.setShapeZoom( this.shapeZoom );
			this.shapeZoom.setSerie( serie_2d );
			this.shapeZoom.addSerie( serie_2d );

			if( options.lineWidth ) {
				serie_2d.setLineWidth( options.lineWidth );
			}

			if( options.setLineStyle ) {
				serie_2d.setLineStyle( options.lineStyle );
			}
		}


		NMR.prototype.removeSerie2DX = function( name ) {
			removeSerie( this, 'x', name );
		}

		NMR.prototype.removeSerie2DY = function( name ) {
			removeSerie( this, 'y', name );
		}

		NMR.prototype.removeSerie2D = function( name ) {
			removeSerie( this, '_2d', name );
		}

		NMR.prototype.removeSerieX = function( name ) {
			removeSerie( this, 'x', name );
		}

		NMR.prototype.redrawAll2D = function() {

			this.graphs[ 'y' ].updateAxes();
			this.graphs[ 'x' ].updateAxes();

			var yaxis = this.graphs[ 'y' ].getXAxis();
			var xaxis = this.graphs[ 'x' ].getYAxis();

			this.graphs[ '_2d' ].getXAxis().force( xaxis );
			this.graphs[ '_2d' ].getYAxis().force( yaxis );

			this.graphs['y'].redraw( );
			this.graphs['y'].drawSeries();	

			this.graphs['x'].redraw( );	
			this.graphs['x'].drawSeries();	

			this.graphs[ '_2d' ].redraw( );
			this.graphs[ '_2d' ].drawSeries();



			this.graphs[ '_2d' ].getXAxis().forceMin( this.graphs['x'].getXAxis().getMinValue() );
			this.graphs[ '_2d' ].getXAxis().forceMax( this.graphs['x'].getXAxis().getMaxValue() );
//console.log( this.graphs['y'].getYAxis().getMinValue() );
			this.graphs[ '_2d' ].getYAxis().forceMin( this.graphs['y'].getRightAxis().getMinValue() );
			this.graphs[ '_2d' ].getYAxis().forceMax( this.graphs['y'].getRightAxis().getMaxValue() );
		}


		NMR.prototype.setSerieX = function( name, data, options ) {

			if( this.graphs[ 'x' ].getSerie( name ) ) {

				this.graphs[ 'x' ].getSerie( name ).kill();
				this.graphs[ 'x' ].removeShapes();
				this.integralBasis = false;

			}

			var serie_x = this.graphs[ 'x' ].newSerie(name, $.extend( { useSlots: true }, options ) )
				.setLabel( "My serie" )
				.autoAxis()
				.setData( data )
				.XIsMonotoneous();

			if( options.lineColor ) {
				serie_x.setLineColor( options.lineColor );
			}


			if( options.lineWidth ) {
				serie_x.setLineWidth( options.lineWidth );
			}


			if( options.setLineStyle ) {
				serie_x.setLineStyle( options.lineStyle );
			}

			//serie_x.degrade( 1 ).kill()

			serie_x.XIsMonotoneous();

			serie_x.getYAxis().setDisplay( false ).togglePrimaryGrid( false ).toggleSecondaryGrid( false );
			serie_x.getXAxis().flip(true).setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setTickPosition( 'outside' )

			this.graphs.x.autoscaleAxes();
			this.graphs.x.drawSeries();
		}


		NMR.prototype.loaded = function( series, options, name ) {


			switch( this.getMode() ) {

				case '1d':

					this.setSerieX( name, spectra.x.spectra[ 0 ].data[ 0 ], { label: "SomeLabel" } );


				break;

				case '2d':


					/********************************************/
					/** LOAD SERIES *****************************/
					/********************************************/

					this.setSerie2DX( name, series.x.spectra[ 0 ].data[ 0 ], options );
					this.setSerie2DY( name, series.y.spectra[ 0 ].data[ 0 ], options );
					this.setSerie2D( name, series.twoD.contourLines, options );


					/********************************************/
					/** DRAW ALL ********************************/
					/********************************************/

					this.redrawAll2D();
					

				break;

			}


		}

		function loadMolecule( molUrl, nmrDom ) {

			var dom = document.createElement("div");
			dom.setAttribute('style', 'position: absolute;');
			// Create a new molecule
			var molecule = new Molecule( { maxBondLengthAverage: 40 } );

			// Adds the molecule somewhere in the DOM
			dom.appendChild( molecule.getDom() );

			// Set the size of the canvas
			molecule.resize( 150, 100 );

			// Fetches the JSON and uses it as the source data
			molecule.setDataFromJSONFile( molUrl ).then( function() {

				molecule.render();

			});

			nmrDom.prepend( dom );
	
		}


		/********************************************/
		/** LOAD GRAPHS *****************************/
		/********************************************/

		NMR.prototype.makeGraphs2D = function() {


			var self = this;
			

			/** LOAD 2D *********************************/
			
			this.graphs[ '_2d' ] = new Graph( this.getDom().find('.nmr-2d').get(0), {

				close: { left: false, top: false, right: false },

				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0,

				onAnnotationChange: function( data, shape ) {

					if( data.type == "rect" ) {
						var pos = data.pos;
						pos.x = ( pos.x + data.pos2.x ) / 2;
						pos.y = ( pos.y + data.pos2.y ) / 2;

						this.newShape( {

							type: 'cross',
							pos: pos,

							strokeColor: 'red',
							strokeWidth: 3,

							shapeOptions: {
								length: 20,
								locked: true
							}

						} ).then( function( shape2 ) {

							shape2.draw();
							shape2.redrawImpl();

						} );

						shape.kill();
					}
				},

				plugins: {

					'graph.plugin.zoom': { 

						zoomMode: 'xy',
						onZoomStart: function( graph, x, y, e, target ) {
							self.graphs['x']._pluginExecute( 'graph.plugin.zoom', 'onMouseDown', [ self.graphs['x'], x, y, e, true ] );
							self.graphs['y']._pluginExecute( 'graph.plugin.zoom', 'onMouseDown', [ self.graphs['y'], x, y, e, true ] );

						},

						onZoomMove: function( graph, x, y, e, target ) {
							self.graphs['x']._pluginExecute( 'graph.plugin.zoom', 'onMouseMove', [ self.graphs['x'], x, y, e, true ] );
							self.graphs['y']._pluginExecute( 'graph.plugin.zoom', 'onMouseMove', [ self.graphs['y'], x, y, e, true ] );
						},

						onZoomEnd: function( graph, x, y, e, target, x1, y1 ) {

 							// Remove shapes
							self.graphs[ 'x' ]._pluginExecute( 'graph.plugin.zoom', 'removeZone', [ ] );
							self.graphs[ 'y' ]._pluginExecute( 'graph.plugin.zoom', 'removeZone', [ ] );

							var x = graph.getBottomAxis().getVal( x1 );
							var x2 = graph.getBottomAxis().getVal( x );

							var y = graph.getLeftAxis().getVal( y1 );
							var y2 = graph.getLeftAxis().getVal( y );

							// Resize x
 							self.graphs['x']._applyToAxes( '_doZoomVal', [ x, x2 ], false, true );
 							self.graphs['x'].redraw();
 							self.graphs['x'].drawSeries();


							// Resize y
 							self.graphs['x']._applyToAxes( '_doZoomVal', [ y, y2 ], false, true );
 							self.graphs['x'].redraw();
 							self.graphs['x'].drawSeries();

							if( self.options.minimap ) {

								self.minimapClip.data.pos = { x: x, y: y };
								self.minimapClip.data.pos2 = { x: x2, y: y2 };
								self.minimapClip.redraw();
							}
						},

						onDblClick: function( x, y, prefs, e ) {
							
							self.graphs['y']._pluginExecute( 'graph.plugin.zoom', 'onDblClick', [ self.graphs['y'], x, y, { mode: 'total' }, e, true ] );
							self.graphs['x']._pluginExecute( 'graph.plugin.zoom', 'onDblClick', [ self.graphs['x'], x, y, { mode: 'total' }, e, true ] );
						}
					},

					'graph.plugin.shape': {
						type: 'rect',

						fillColor: 'rgba(100, 0, 0, 0.3)',

						shapeOptions: { 
							bindable: false,

						}
						
					},
				},

				dblclick: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'graph.plugin.zoom': { shift: false, ctrl: false },
					'graph.plugin.shape': { shift: true, ctrl: false }
				},

				wheel: {
					type: 'toSeries'
				}/*,

				onBeforeNewShape: function() {

					if( ! this.selectedSerie ) {
						return false;
					}
				}*/,

				onSelectSerie: function( serie ) {

					self.graphs[ 'x' ].selectSerie( self.graphs[ 'x' ].getSerie( serie.getName() ) );
					self.graphs[ 'y' ].selectSerie( self.graphs[ 'y' ].getSerie( serie.getName() ) );
				},

				onUnselectSerie: function( serie ) {

					self.graphs[ 'x' ].unselectSerie( self.graphs[ 'x' ].getSerie( serie.getName() ) );
					self.graphs[ 'y' ].unselectSerie( self.graphs[ 'y' ].getSerie( serie.getName() ) );
				}



			} );


		

			/** LOAD 2D *********************************/
			if( this.options.minimap ) {
				$(".nmr-2d-map").each( function() {

					self.graphs[ '_2d-minimap' ] = new Graph( this, {

					} );

					var whole;
				    $.when(

				        self.graphs[ '_2d-minimap' ].newShape({ pos: { x: 'min', y: 'min' }, pos2: { x: 'max', y: 'max' }, type: 'rect', fillColor: 'rgba( 100, 100, 100, 0.4 )' }).then( function( shape ) {

				        	whole = shape;
				        	shape.draw();
				        	shape.redraw();
				            shape.setSelectable( false );
				            shape.setMovable( false );

				        }),

				        self.graphs[ '_2d-minimap' ].newShape({ pos: { x: 'min', y: 'min' }, pos2: { x: 'max', y: 'max' }, type: 'rect', fillColor: 'transparent', shapeOptions: { masker: true } }).then( function( shape ) {

				            shape.staticHandles( true );

				            self.minimapClip = shape;

				            shape.draw();
				            shape.redraw();
				        })



				    ).then( function() {

				    	whole.maskWith( self.minimapClip );
				    });


					  self.graphs[ '_2d-minimap' ].shapeHandlers.onChange.push( function( shape ) {

			            if( shape == self.minimapClip ) {

			                var p = self.minimapClip.data.pos;
			                var p2 = self.minimapClip.data.pos2;


							p.x = self.graphs[ '_2d-minimap' ].getValPosition( p.x, shape.serie.getXAxis() );
							p.y = self.graphs[ '_2d-minimap' ].getValPosition( p.y, shape.serie.getYAxis() );
							p2.x = self.graphs[ '_2d-minimap' ].getValPosition( p2.x, shape.serie.getXAxis() );
							p2.y = self.graphs[ '_2d-minimap' ].getValPosition( p2.y, shape.serie.getYAxis() );


							if( isNaN( p.x ) || isNaN( p2.x ) || isNaN( p.y ) || isNaN( p2.y ) ) {
								return;
							}

			                self.graphs[ '_2d' ].getXAxis().zoom( p.x, p2.x );
			                self.graphs[ '_2d' ].getYAxis().zoom( p.y, p2.y );

			                self.graphs[ '_2d' ].redraw();
			                self.graphs[ '_2d' ].drawSeries();

			                self.graphs[ 'x' ].getXAxis().zoom( p.x, p2.x );
			                

			                self.graphs[ 'x' ].redraw();
			                self.graphs[ 'x' ].drawSeries();
			                
			                
			                self.graphs[ 'y' ].getYAxis().zoom( p.y, p2.y );

			                self.graphs[ 'y' ].redraw();
			                self.graphs[ 'y' ].drawSeries();
			                
			            }
			        } );


					self.graphs[ '_2d-minimap' ].getXAxis().setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );
					self.graphs[ '_2d-minimap' ].getYAxis().togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );

					self.graphs[ '_2d-minimap' ].getXAxis().setAxisDataSpacing( 0 );
					self.graphs[ '_2d-minimap' ].getYAxis().setAxisDataSpacing( 0 );



				});
			}
		
			self.graphs[ '_2d' ].getXAxis().setLabel('ppm').togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );
			self.graphs[ '_2d' ].getYAxis().togglePrimaryGrid( false ).toggleSecondaryGrid( false ).setDisplay( false ).flip( true );

			self.graphs[ '_2d' ].getXAxis().setAxisDataSpacing( 0 );
			self.graphs[ '_2d' ].getYAxis().setAxisDataSpacing( 0 );


	
			var legend = this.graphs[ '_2d' ].makeLegend( { frame: true, frameColor: 'grey', frameWidth: 1, movable: true } );
			legend.setPosition( { x: '20px', y: '20px' } );

			this.graphs[ '_2d' ].newShape( {

				type: 'zoom2d',
				pos: { x: 'min', dx: '-210px', y: 'max', dy: '-130px' }

			} ).then( function( shape ) {

				shape.draw();
				shape.redraw();
				self.shapeZoom = shape;

			} );

			/** LOAD X **********************************/	

			this.graphs['x'] = new Graph( this.getDom().find('.nmr-1d-x').get(0), {

				close: { left: false, top: false, right: false },
				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0,

				onAnnotationChange: function( data, shape ) {

					if( data.url.indexOf("shape.1dnmr") > -1 ) {

						if( ! self.integralBasis ) {
							self.integralBasis = shape.integral.lastSum;
						}


					} else if( data.type == "nmrintegral" ) {

						if( self.integralBasis ) {

							var fl = parseFloat( shape.data.label[ 0 ].text );
							
							if( fl != 0 ) {
								self.integralBasis = shape.lastSum / fl;
							}

						}
						
					}

					integral_resizemove( self, 'x' );

					
					if( self.isSymmetric() ) {
						integral_resizemove( self, 'y' );
					}
				},

				plugins: {
					'graph.plugin.zoom': { 
						zoomMode: 'x',

						onZoomStart: function( graph, x, y, e, target ) {

							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onMouseDown', [ self.graphs[ '_2d' ], x, undefined, e, true ] );

						},

						onZoomMove: function( graph, x, y, e, target ) {

							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onMouseMove', [ self.graphs[ '_2d' ], x, undefined, e, true ] );

						},

						onZoomEnd: function( graph, x, y, e, target ) {


							var xaxis = self.graphs['x'].getXAxis();
							var from = xaxis.getActualMin();
							var to = xaxis.getActualMax();

 							self.graphs['_2d']._applyToAxes( '_doZoomVal', [ from, to ], true, false );
 							self.graphs['_2d'].redraw();
 							self.graphs['_2d'].drawSeries();
							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'removeZone', [ ] );

						},

						onDblClick: function( x, y, prefs, e ) {
							
							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onDblClick', [ self.graphs[ '_2d' ], x, y, { mode: 'xtotal' }, e, true ] );
							
						}

					},

					'graph.plugin.shape': self.nmrSignal1dOptions[ 'x' ],
				},


				dblclick: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'graph.plugin.zoom': { shift: false, ctrl: false },
					'graph.plugin.shape': { shift: true, ctrl: false }
				},


				wheel: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						direction: 'y',
						baseline: 0
					}
				},


				onBeforeNewShape: function() {

					if( ! self.graphs['_2d'].selectedSerie ) {
						return false;
					}
				}

			} );


			  self.graphs[ 'x' ].shapeHandlers.onCreated.push( function( shape ) {

			  	if( shape.data.url.indexOf("src/shape.1dnmr") > -1) {

			  		shape.set('strokeColor', shape.serie.getLineColor() );
			  		shape.setStrokeColor();
			  	}

			} );

		//	self.graphs[ 'x' ].getXAxis().options.wheelBaseline = 0;



			/** LOAD Y **********************************/
			
			this.graphs['y'] = new Graph( this.getDom().find('.nmr-1d-y').get(0), { 

				close: { left: false, top: false, right: false },

				plugins: {
					'graph.plugin.zoom': { 
						zoomMode: 'y',
						onZoomStart: function( graph, x, y, e, target ) {

							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onMouseDown', [ self.graphs[ '_2d' ], undefined , y, e, true ] );

						},

						onZoomMove: function( graph, x, y, e, target ) {

							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onMouseMove', [ self.graphs[ '_2d' ], undefined , y, e, true ] );

						},

						onZoomEnd: function( graph, x, y, e, target ) {

							var yaxis = self.graphs['y'].getYAxis();
							var from = yaxis.getActualMin();
							var to = yaxis.getActualMax();

 							self.graphs['_2d']._applyToAxes( '_doZoomVal', [ from, to ], false, true );
 							self.graphs['_2d'].redraw();
 							self.graphs['_2d'].drawSeries();
							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'removeZone', [ ] );

/*

							var xaxis = self.graphs['y'].getYAxis();
							var from = xaxis.getCurrentMin();
							var to = xaxis.getCurrentMax();
console.log( from, to );
 							self.graphs['_2d']._applyToAxes( '_doZoomVal', [ from, to ], false, true );

 							*/

							//self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onMouseUp', [ self.graphs[ '_2d' ], undefined, y, e, true ] );

						},

						onDblClick: function( x, y, prefs, e ) {
							
							self.graphs[ '_2d' ]._pluginExecute( 'graph.plugin.zoom', 'onDblClick', [ self.graphs[ '_2d' ], x, y, { mode: 'ytotal' }, e, true ] );
							
						}
					},

					'graph.plugin.shape': self.nmrSignal1dOptions[ 'y' ]
				},


				dblclick: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},

				pluginAction: {
					'graph.plugin.zoom': { shift: false, ctrl: false },
					'graph.plugin.shape': { shift: true, ctrl: false }
				},

				wheel: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						direction: 'y',
						baseline: 0
					}
				},

				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 10,

				onBeforeNewShape: function() {

					if( ! self.graphs['_2d'].selectedSerie ) {
						return false;
					}
				}

			} );
			
		}


		NMR.prototype.makeGraphs1D = function() {

			var self = this;

			this.graphs['x'] = new Graph( this.getDom().children().get(0), {

				close: { left: false, top: false, right: false },
				paddingBottom: 0,
				paddingTop: 0,
				paddingLeft: 0,
				paddingRight: 0,


				onAnnotationChange: function( data, shape ) {


					if( data.url && data.url.indexOf("shape.1dnmr") > -1 ) {

						if( ! self.integralBasis ) {
							self.integralBasis = shape.integral.lastSum;
						}


					} else if( data.type == "nmrintegral" ) {


						if( self.integralBasis ) {

							var fl = parseFloat( shape.data.label[ 0 ].text );
							
							if( fl != 0 ) {
								self.integralBasis = shape.lastSum / fl;
							}

						}
						
					}

					integral_resizemove( self, 'x' );
				},

				plugins: {
					'graph.plugin.zoom': { 
						zoomMode: 'x'

					},

					'graph.plugin.shape': this.nmrSignal1dOptions[ 'x' ],
				},


				dblclick: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						mode: 'total'
					}
				},


				wheel: {
					type: 'plugin',
					plugin: 'graph.plugin.zoom',
					options: {
						direction: 'y',
						baseline: 0
					}
				},


				pluginAction: {
					'graph.plugin.zoom': { shift: false, ctrl: false },
					'graph.plugin.shape': { shift: true, ctrl: false }
				},

				onBeforeNewShape: function() {

					if( ! this.selectedSerie && this.series.length > 1 ) {
						return false;
					}
				}

			} );


			this.graphs[ 'x' ].setHeight(300);
	//		this.graphs[ 'x' ].getXAxis().options.wheelBaseline = 0;
			
			this.graphs[ 'x' ].shapeHandlers.onRemoved.push( function( shape ) {


				if( shape.integral ) {

					integralRemoved( self, 'x', shape );

				} else if( shape.originalShape ) {
					
					shape.originalShape.kill();
					
				}
		
			});

		
		
			/********************************************/
			/** DRAW ALL ********************************/
			/********************************************/


			this.graphs[ 'x' ].redraw( );	
			this.graphs[ 'x' ].drawSeries();	

		}

		return NMR;

	}; // End Factory



    if( typeof define === "function" && define.amd ) {
        
        define( [ 'graph', 'assignation', 'jcampconverter', 'lib/components/VisuMol/src/molecule' ], function( Graph, Assignation, JcampConverter, Molecule ) {
            return factory( Graph, Assignation, JcampConverter, Molecule );
        });

    } else if( window ) {
        
        if( window.Graph && window.Assignation && window.JcampConverter ) {

        	// Namespace NMRHandler
        	window.NMRHandler = factory( window.Graph, window.Assignation, window.JcampConverter, window.Molecule );	

        } else {
        	throw "Graph, Attribution or Jcamp is not defined"
        }
    }

}));

