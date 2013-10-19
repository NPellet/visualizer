define(['modules/defaultview', 'libs/plot/plot', 'util/jcampconverter', 'util/datatraversing', 'util/api', 'util/util'], function(Default, Graph, JcampConverter, DataTraversing, API, Util) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {

		init: function() {
			this.series = {};
			this.colorvars = [];
			this.dom = $('<div />');
			this.zones = {};
			this._currentHighlights = {};
			this.module.getDomContent().html(this.dom);
			this.seriesActions = [];

			this.colorId = 0;
			this.colors = ["red", "blue", "green", "black"];

			this.onReady = $.Deferred();
		},
		
		inDom: function() {

			var self = this,
				cfg = $.proxy(this.module.getConfiguration, this.module),
				graphurl = cfg( 'graphurl' ),
				graph,
				def = $.Deferred();

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
							if(!val[k])
								continue;
							for(var i in self.zones[k]) {
								min = Math.min(self.zones[k][i][0], self.zones[k][i][1]);
								max = Math.max(self.zones[k][i][0], self.zones[k][i][1]);
								x1 = val[k].trueX;
								if(min < x1 && max > x1) {
									//CI.RepoHighlight.set(i, 1);
									self._currentHighlights[i] = 1;
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
		//graph.getLeftAxis(0, {logScale: true})


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
			
				graph.getXAxis().setAxisDataSpacing( cfg( 'xLeftSpacing', 0 ), cfg( 'xRightSpacing', 0 ) );
				graph.getYAxis().setAxisDataSpacing( cfg( 'yBottomSpacing', 0 ), cfg( 'yTopSpacing', 0 ) );

				graph.setDefaultWheelAction( cfg('wheelAction', 'none') );

				graph.getXAxis().forceMin( cfg('minX', false) );
				graph.getLeftAxis().forceMin( cfg('minY', false) );
				graph.getXAxis().forceMax( cfg('maxX', false) );
				graph.getLeftAxis().forceMax( cfg('maxY', false) );

				def.resolve(graph);
			}

			$.when(def).then(function(graph) {

				if(!graph)
					return;
				graph.redraw();
				self.graph = graph;
				
				self.graph.getXAxis().flip( cfg('flipX', false) );
				self.graph.getYAxis().flip( cfg('flipY', false) );

				self.onResize(self.width || self.module.getWidthPx(), self.height || self.module.getHeightPx());		
				self.onReady.resolve();
			});
		},
		
		onResize: function(width, height) {
			this.width = width;
			this.height = height;

			if(this.graph) {
				this.graph.resize(width, height);
				this.graph.redraw();
				this.graph.drawSeries();
			}
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


		setSerieParameters: function(serie, varname) {
			var self = this,
				plotinfos = this.module.getConfiguration( 'plotinfos' );

			if( plotinfos ) {

				for ( var i = 0, l = plotinfos.length ; i < l ; i++ ) {

					if( varname == plotinfos[i].variable ) {

						serie.options.lineToZero = ! plotinfos[i].plotcontinuous;
						serie.setLineColor( Util.getColor( plotinfos[i].plotcolor ) );
						serie.setLineWidth( plotinfos[i].strokewidth || 1 );
						serie.options.autoPeakPicking = plotinfos[i].peakpicking;

						if( plotinfos[i].markers ) {

							serie.showMarkers();
							serie.setMarkerType(1);
							serie.setMarkerZoom(2);

							serie.setMarkerStrokeColor( Util.getColor( plotinfos[i].plotcolor ) );
							serie.setMarkerFillColor( Util.getColor( plotinfos[i].plotcolor ) );

						}
					}	
				}
			}

			serie.options.onMouseOverMarker = function(index, infos, xy) {
				self.module.controller.onMouseOverMarker(xy, infos);
			};
			serie.options.onMouseOutMarker = function(index, infos, xy) {
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

			xyArray: function(moduleValue, varname) {

				this.series[varname] = this.series[varname] || [];
				this.removeSerie( varname );
				
	 
				if(!moduleValue)
					return;

				var val = moduleValue.get(), valFinal;

				if(val.y) {
					for(var i = 0, l = val.y.length; i < l; i++) {
						valFinal.push(val.x ? val.x[i] : i);
						valFinal.push(val.y[i]);
					}
					val = valFinal;
				}
				
				var serie = this.graph.newSerie(varname, {trackMouse: true});
				this.setSerieParameters(serie, varname);

				this.normalize(val, varname);
				serie.setData(val);
				if(val.info) {
					serie.setInfos(val.info);
				}
				serie.autoAxis();
				this.series[varname].push(serie);
				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
			},

			xArray: function(moduleValue, varname) {
				var self = this,
					val, 
					val2;
				
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

				serie = this.graph.newSerie(varname, {trackMouse: true}); // lineToZero: !continuous}
				this.setSerieParameters(serie, varname);


				if(val.infos)
					serie.setInfos(infos);

				this.normalize(val2, varname);

				serie.setData(val2);
				serie.autoAxis();
				this.series[varname].push(serie);
				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());
			},

			'annotation': function(value) {

				value = DataTraversing.getValueIfNeeded(value);
				if(!value)
					return;

				this.annotations = value;
				this.resetAnnotations(true);
			},

			jcamp : function(moduleValue, varname) {

				if(!moduleValue)
					return;

				moduleValue = moduleValue.get(); // Get the true jcamp value

				var self = this, 
					serie, 
				
					spectra;


				API.killHighlight(this.module.id + varname);

				if(!this.graph)
					return;

				this.zones[varname] = moduleValue._zones;

				if(!moduleValue)
					return this.blank();

				spectra = JcampConverter(moduleValue, {lowRes: 1024});

				this.series[varname] = this.series[varname] || [];
				
				this.series[varname] = [];

				if(spectra.contourLines) {
					
					this.graph.setOption('zoomMode', 'xy');
					this.graph.setOption('defaultWheelAction', 'toSeries');
					this.graph.setOption('defaultMouseAction', 'drag');

					serie = this.graph.newSerie(varname, {trackMouse: true}, 'contour');
					serie.setData(spectra.contourLines);
					serie.autoAxis();
					this.series[varname].push(serie);

				} else {

					this.graph.setOption('zoomMode', this.module.getConfiguration( 'zoom', false ) );
					this.graph.setOption('defaultWheelAction', 'zoomY');
					this.graph.setOption('defaultMouseAction', 'zoom');

					spectra = spectra.spectra;
					for (var i=0, l = spectra.length; i<l; i++) {
						serie = this.graph.newSerie(varname, {trackMouse: true});

						var data=spectra[i].data[spectra[i].data.length - 1];

						this.normalize(data, varname);
						serie.setData(data);
						serie.autoAxis();
						this.series[varname].push(serie);
						break;
					}

					API.listenHighlight(moduleValue._highlight || [], function(value, commonKeys) {

						for(var i = 0; i < commonKeys.length; i++) {

							if( self.zones[ varname ][ commonKeys[ i ] ] ) {

								self.doZone( varname, self.zones[ varname ][ commonKeys [ i ] ], value, this.series[varname].options.lineColor );

							}

						}

					}, true, this.module.id + varname);

				}


				this.setSerieParameters(serie, varname);
				
				this.onResize(this.width || this.module.getWidthPx(), this.height || this.module.getHeightPx());

				this.resetAnnotations( true );
			}
		},

		resetAnnotations: function(force) {
			if(!this.annotations)
				return;

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
				return this.series[i][0];
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

		makeSerie: function(data, value) {

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
			serie.setLineColor( data.lineColor || this.colors[ this.colorId % this.colors.length ] );
			this.seriesActions.push( [ value, serie, data.name ] );
		},


		onActionReceive: {
			fromto: function(value, name) {
				this.graph.getBottomAxis()._doZoomVal(value.value.from, value.value.to, true);

				this.graph.redraw(true);
				this.graph.drawSeries(true);

			},

			addSerie: function(value) {

				this.colorId ++;
				value = value.get();

				if(value.name) {
					this.makeSerie(value, value);	
				} else {

					for( var i in value ) {
						this.makeSerie(value[i], value);
					}
				}
				this.graph.redraw();
				this.graph.drawSeries();
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
 

