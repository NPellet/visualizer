define(['modules/default/defaultview', 'lib/plot/plot', 'src/util/datatraversing', 'src/util/api', 'src/util/util'], function(Default, Graph, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			this.series = {};
			this.colorvars = [];
			this.dom = $('<div />');
			this.zones = {};
			this._currentHighlights = { };
			this.module.getDomContent( ).html( this.dom );
			this.seriesActions = [ ];

			this.colorId = 0;
			this.colors = [ "red", "blue", "green", "black" ];

			this.deferreds = { };

			this.onReady = $.Deferred( );
		},
		
		inDom: function() {

			var self = this,
				cfg = $.proxy( this.module.getConfiguration, this.module ),
				graphurl = cfg( 'graphurl' ),
				graph,
				def = $.Deferred( );

			if(graphurl) {
					
				$.getJSON(graphurl, {}, function(data) {

					data.options.onMouseMoveData = function(e, val) {
						self.module.controller.sendAction('mousetrack', val);
					}

				 	def.resolve( new Graph(self.dom.get(0), data.options, data.axis) );
				});

			} else {

				var graph = new Graph(this.dom.get(0), {

					close: {
						left: true,
						right: true,
						top: true,
						bottom: true
					},

					onAnnotationMake: function(annot) {
						self.module.controller.sendAction('annotation', annot, 'onAnnotationAdd');
					},

					onAnnotationChange: function(annot) {
						self.module.controller.sendAction('annotation', annot, 'onAnnotationChange');
						DataTraversing.triggerDataChange(annot);
					},

					onMouseMoveData: function(e, val) {
						var min, max, x1;
						for(var k in self.zones) {

							if( ! val[ k ] ) {
								continue;
							}

							for( var i in self.zones[ k ] ) {

								min = Math.min( self.zones[ k ][ i ][ 0 ], self.zones[ k ][ i ][ 1 ] );
								max = Math.max( self.zones[ k ][ i ][ 0 ], self.zones[ k ][ i ][ 1 ] );

								x1 = val[ k ].trueX;

								if(min < x1 && max > x1) {
									//CI.RepoHighlight.set(i, 1);
									self._currentHighlights[ i ] = 1;

								} else if(self._currentHighlights[i]) {
									//CI.RepoHighlight.set(i, 0);
									self._currentHighlights[i] = 0;
								}
							}
						}

					}
				});

				graph.getBottomAxis().options.onZoom = function(from, to) {
					self.module.controller.sendAction('fromto', new DataObject({type: 'fromTo', value: new DataObject({ from: from, to: to })}), 'onZoomChange');
				}

				if( cfg( 'shiftxtozero' ) ) {

					graph.getXAxis( ).options.shiftToZero = true;
				}


				graph.getLeftAxis().setDisplay( cfg('displayYAxis', false) );
				graph.getLeftAxis().setLabel( cfg('yLabel', '') );

				graph.getXAxis().setDisplay(cfg('displayXAxis', true));
				graph.getXAxis().setLabel( cfg('xLabel', '') );

				graph.getXAxis().togglePrimaryGrid( cfg( 'vertGridMain', false ) );
				graph.getXAxis().toggleSecondaryGrid( cfg( 'vertGridSec', false ) );
			
				if( cfg( 'xastime' ) ) {
					graph.getXAxis().options.unitModification = 'time';
				}

				graph.getYAxis().togglePrimaryGrid( cfg( 'horGridMain', false ) );
				graph.getYAxis().toggleSecondaryGrid( cfg( 'horGridSec', false ) );
			
				graph.getXAxis().setAxisDataSpacing( cfg( 'xLeftSpacing' ), cfg( 'xRightSpacing' ) );
				graph.getYAxis().setAxisDataSpacing( cfg( 'yBottomSpacing' ), cfg( 'yTopSpacing' ) );

				graph.setDefaultWheelAction( cfg('wheelAction', 'none') );

				graph.getXAxis().forceMin( cfg('minX', false) );
				graph.getLeftAxis().forceMin( cfg('minY', false) );
				graph.getXAxis().forceMax( cfg('maxX', false) );
				graph.getLeftAxis().forceMax( cfg('maxY', false) );

				graph.setOption('zoomMode', cfg( 'zoom' ) );

				def.resolve(graph);
			}

			$.when(def).then(function(graph) {

				if(!graph) {
					return;
				}

				graph.redraw(true);
				self.graph = graph;
				
				self.graph.getXAxis().flip( cfg('flipX', false) );
				self.graph.getYAxis().flip( cfg('flipY', false) );

				self.redraw( );
				self.onReady.resolve();
			});
		},
		
		onResize: function() {
			if(this.graph) {
				this.graph.resize( this.width, this.height );
				this.redraw(true);
			}
		},

		redraw: function(forceReacalculateAxis) {
			
			var cfg = $.proxy(this.module.getConfiguration, this.module);
			if (forceReacalculateAxis) {
				this.graph.redraw();
			} else  if (cfg('fullOut')=="none") {
				this.graph.redraw(false, true, true);
			} else if (cfg('fullOut')=="xAxis") {
				this.graph.redraw(false, false, true);
			} else if (cfg('fullOut')=="yAxis") {
				this.graph.redraw(false, true, false);
			} else {
				this.graph.redraw();
			}
			this.graph.drawSeries();

		},
		
		doZone: function(varname, zone, value, color) {

			if(value && !zone[2]) {

				var serie = this.series[varname][0];
				var rect = this.graph.makeShape({ 
					type: 'rect',
					pos: {
						x: zone[0]
					},

					pos2: {
						x: zone[1]
					},

					fillColor: color,
					opacity: '0.5'
				});
				
				rect.setFullHeight();

				zone.push(rect);

			} else if(zone[2] && !value) {

				zone[2].kill();
				zone.splice(2, 1);

			}
		},


		setSerieParameters: function(serie, varname, highlight) {
			var self = this,
				plotinfos = this.module.getConfiguration( 'plotinfos' );

			highlight=highlight||[];

			if( plotinfos ) {

				for ( var i = 0, l = plotinfos.length ; i < l ; i++ ) {
					if( varname == plotinfos[i].variable ) {

						serie.options.lineToZero = ! plotinfos[i].plotcontinuous[0];
						serie.options.useSlots =  (plotinfos[i].optimizeSlots ? !!plotinfos[i].optimizeSlots[0] : false);

						
						serie.setLineColor( Util.getColor( plotinfos[i].plotcolor ) );
						serie.setLineWidth( plotinfos[i].strokewidth || 1 );
						serie.options.autoPeakPicking = plotinfos[i].peakpicking[0];

						if( plotinfos[i].markers[0] ) {

							serie.showMarkers();
							serie.setMarkerType(1);
							serie.setMarkerZoom(2);

							serie.setMarkerStrokeColor( Util.getColor( plotinfos[i].plotcolor ) );
							serie.setMarkerFillColor( Util.getColor( plotinfos[i].plotcolor ) );
						}
					}	
				}
			}

			API.listenHighlight(highlight, function(value, commonKeys) {
				
				serie.toggleMarker([ highlight.indexOf(commonKeys[0]), 0 ], value, true);
			});

			serie.options.onMouseOverMarker = function(index, infos, xy) {
				API.highlight(highlight[index[0]], 1);
				self.module.controller.onMouseOverMarker(xy, infos);
			};
			serie.options.onMouseOutMarker = function(index, infos, xy) {
				API.highlight(highlight[index[0]], 0);
				self.module.controller.onMouseOutMarker(xy, infos);
			};
		},


		blank: {

			xyArray: function ( varName ) {

				this.removeSerie(varName);
			},

			xArray: function ( varName ) {

				this.removeSerie( varName );
			},

			jcamp: function ( varName ) {

				this.removeSerie( varName );
			}
		},
		

		update: { 

			'fromTo': function(moduleValue) {
				var view = this;

				if(!moduleValue || !moduleValue.value)
					return;

				if(view.dom.data('spectra')) {
					view.dom.data('spectra').setBoundaries(moduleValue.value.from, moduleValue.value.to);
				}

				return;
			},

			chart: function(moduleValue, varname) {

				this.series[varname] = this.series[varname] || [];
				this.removeSerie( varname );

				if(!moduleValue)
					return;

				var newSeries=moduleValue.series || moduleValue;
				if (!(newSeries instanceof Array)) {
					newSeries=[newSeries];
				}

				for (var i=0; i<newSeries.length; i++) {
					var newSerie = newSeries[i];
					var valFinal=[];
					if(newSerie.y) {
						for(var j = 0, l = newSerie.y.length; j < l; j++) {
							valFinal.push(newSerie.x ? newSerie.x[j] : j);
							valFinal.push(newSerie.y[j]);
						}
					}
					
					var serie = this.graph.newSerie(varname, {trackMouse: true});

					this.setSerieParameters(serie, varname, newSerie._highlight);

					this.normalize( valFinal, varname );
					serie.setData( valFinal );

					if( newSerie.infos ) {
						serie.setInfos( newSerie.infos );
					}
					serie.autoAxis();
					this.series[varname].push(serie);
				}

				this.redraw();
			},

			xyArray: function(moduleValue, varname) {
				
				this.series[varname] = this.series[varname] || [];
				this.removeSerie( varname );

				if( ! moduleValue ) {
					return;
				}

				var val = moduleValue.get();
				
				var serie = this.graph.newSerie(varname, {trackMouse: true});
				this.setSerieParameters(serie, varname);

				this.normalize(val, varname);
				serie.setData(val);
				serie.autoAxis();
				this.series[varname].push(serie);
				this.redraw();
			},

			xArray: function(moduleValue, varname) {
				var self = this,
					val, 
					val2;


	//			self.graph.setOption('zoomMode', self.module.getConfiguration( 'zoom' ) );

				this.series[varname] = this.series[varname] || [];
				this.removeSerie(varname);
	
				if(!moduleValue)
					return;
				
				val = DataTraversing.getValueIfNeeded(moduleValue),
				val2 = [];

				for(var i = 0, l = val.length; i < l; i++) {
					val2.push(i);
					val2.push(val[i]);
				}

				var serie = this.graph.newSerie(varname, {trackMouse: true}); // lineToZero: !continuous}
				this.setSerieParameters(serie, varname);
				this.normalize(val2, varname);

				serie.setData(val2);
				serie.autoAxis();
				this.series[ varname ].push( serie );
				this.redraw();
			},

			'annotation': function(value) {

				value = DataTraversing.getValueIfNeeded(value);
				if(!value)
					return;

				this.annotations = value;
				this.resetAnnotations(true);
			},

			jcamp : function(moduleValue, varname) {

				if(!moduleValue) {
					return;
				}

				moduleValue = moduleValue.get(); // Get the true jcamp value

				var self = this, 
					serie, 
					spectra;

				API.killHighlight(this.module.id + varname);

				if(!this.graph) {
					return;
				}

				this.zones[varname] = moduleValue._zones;

				
				
				if( self.deferreds[ varname ] ) {
					self.deferreds[ varname ].reject();
				}
				
				require( [ 'src/util/jcampconverter' ], function( JcampConverter ) {

					self.deferreds[ varname ] = JcampConverter( moduleValue, { lowRes: 1024 } ).done( function( spectra ) {

					//	console.log(JSON.stringify(spectra.profiling,true));

	//					self.blank.jcamp( varname );
						self.series[ varname ] = self.series[ varname ] || [];
						self.series[ varname ] = [];

						if(spectra.contourLines) {
							
	//						self.graph.setOption('zoomMode', 'xy');
						/*	self.graph.setOption('defaultWheelAction', 'toSeries');
							self.graph.setOption('defaultMouseAction', 'drag');
	*/
							serie = self.graph.newSerie( varname, { trackMouse: true }, 'contour' );
							self.setSerieParameters(serie, varname);
							serie.setData( spectra.contourLines );
							serie.autoAxis( );
							self.series[ varname ].push( serie );

						} else {

				//			self.graph.setOption('zoomMode', self.module.getConfiguration( 'zoom' ) );
							/*self.graph.setOption('defaultWheelAction', 'zoomY');
							self.graph.setOption('defaultMouseAction', 'zoom');
	*/
							spectra = spectra.spectra;
							for (var i=0, l = spectra.length; i<l; i++) {
								serie = self.graph.newSerie(varname, {trackMouse: true});

								var data=spectra[i].data[spectra[i].data.length - 1];

								self.setSerieParameters(serie, varname);
								self.normalize(data, varname);
								serie.setData(data);
								serie.autoAxis();
								self.series[varname].push(serie);
								break;
							}

							API.listenHighlight(moduleValue._highlight || [], function(value, commonKeys) {

								for(var i = 0; i < commonKeys.length; i++) {

									if( self.zones[ varname ][ commonKeys[ i ] ] ) {

										self.doZone( varname, self.zones[ varname ][ commonKeys [ i ] ], value, self.series[varname].options.lineColor );
									}
								}
							}, true, self.module.id + varname);
						}
						
						self.redraw( );
						self.resetAnnotations( true );
					});
				});
			}
		},

		resetAnnotations: function(force) {

			if(!this.annotations) {
				return;
			}

			if(this.annotationsDone && !force)
				return this.graph.redrawShapes();

			this.annotationsDone = true;
			this.graph.removeAnnotations();
			var i = 0, l = this.annotations.length
			for ( ; i < l ; i++ ) {
				this.doAnnotation(this.annotations[i]);
			}
		},

		getFirstSerie: function() {
			for(var i in this.series) {
				if( this.series[i][0] ) {
					return this.series[i][0];
				}
			}
		},

		doAnnotation: function(annotation) {
			if ( !this.graph ) {
				return;
			}

			var self = this,
				shape = this.graph.makeShape( annotation, {}, false );

			shape.setSelectable( true );
			shape.setSerie( this.getFirstSerie() );

			annotation.onChange( annotation, function( value ) {

				shape.draw();
				shape.redraw();

			}, self.module.getId() );

			shape.onMouseOver( function ( data ) {

				API.highlight( data._highlight , 1 );

			});

			shape.onMouseOut( function ( data ) {

				API.highlight( data._highlight , 0 );

			});



			if( annotation._highlight ) {

				API.listenHighlight( annotation._highlight, function(onOff) {

					if(onOff) {
						shape.highlight( );
					} else {
						shape.unHighlight( );
					}
				} );
			}

			shape.draw();
			shape.redraw();
		},



		removeSerie: function(serieName) {
			if(this.series[serieName]) {
				for(var i = 0; i < this.series[serieName].length; i++) {
					this.series[serieName][i].kill();
				}
			}

			this.series[serieName] = [];
		},

		makeSerie: function(data, value, name) {

			var self = this,
				serie = this.graph.newSerie( data.name );

			data.onChange(function() {

				serie.setData(data.data);
				self.graph.redraw();
				self.graph.drawSeries();
			});

			this.onActionReceive.removeSerieByName.call( this, data.name || {} );
			serie.autoAxis();
			serie.setData( data.data );
			
			this.seriesActions.push( [ value, serie, data.name ] );
			this.setSerieParameters( serie, name );
			
			if( data.lineColor ) {
				serie.setLineColor( data.lineColor );
			}

			if( data.lineWidth ) {
				serie.setLineWidth( data.lineWidth );
			}

			this.redraw( );
		},


		onActionReceive: {
			fromto: function(value, name) {
				this.graph.getBottomAxis()._doZoomVal(value.value.from, value.value.to, true);

				this.graph.redraw(true);
				this.graph.drawSeries();

			},

			addSerie: function(value) {

				this.colorId ++;
				value = value.get();

				if(value.name) {
					this.makeSerie(value, value, value.name);
				} else {

					for( var i in value ) {
						this.makeSerie(value[i], value);
					}
				}
			},

			removeSerie: function(value) {	

				value = value.get();

				for( var i = 0, l = this.seriesActions.length ; i < l ; i++ ) {

					if( this.seriesActions[ i ][ 0 ] == value ) {
						this.seriesActions[ i ][ 1 ].kill();
						this.seriesActions.splice( i, 1 );
					}
				}
			},

			removeSerieByName: function(value) {	
				for(var i = 0; i < this.seriesActions.length; i++) {
					if(this.seriesActions[i][2] == value) {
						this.seriesActions[i][1].kill();
						this.seriesActions.splice(i, 1);
						i--;
					}
				}
			}
		},

		getDom: function() {
			return this.dom;
		},
		
		typeToScreen: {
			
		},


		normalize: function(array, varname) {

			var plotinfos = this.module.getConfiguration('plotinfos');

			if (! plotinfos) return;
			var normalize="";
			for ( var i = 0, l = plotinfos.length ; i < l ; i++ ) {
				if( varname == plotinfos[i].variable ) {
					normalize=plotinfos[i].normalize
				}
			}
			if (! normalize) return;
			if (normalize=="max1") {
				var maxValue=Number.MIN_VALUE;
				for (var i=1; i<array.length; i=i+2) {
					if (array[i]>maxValue) maxValue=array[i];
				}
				for (var i=1; i<array.length; i=i+2) {
					array[i]/=maxValue;
				}
			} else if (normalize=="sum1") {
				var total=0;
				for (var i=1; i<array.length; i=i+2) {
					total+=array[i];
				}
				for (var i=1; i<array.length; i=i+2) {
					array[i]/=total;
				}
			} else if (normalize=="max1min0") {
				var maxValue=Number.MIN_VALUE;
				var minValue=Number.MAX_VALUE;
				for (var i=1; i<array.length; i=i+2) {
					if (array[i]>maxValue) maxValue=array[i];
					if (array[i]<minValue) minValue=array[i];
				}
				var ratio=1/(maxValue-minValue);
				for (var i=1; i<array.length; i=i+2) {
					array[i]=(array[i]-minValue)*ratio;
				}
			}
		}
	});
	return view;
});
 

