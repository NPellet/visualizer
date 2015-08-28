

(function( global, factory ) {

	if ( typeof module === "object" && typeof module.exports === "object" ) {

		module.exports = factory( global );

	} else {

		factory( global );

	}

// Pass this if window is not defined yet
}( ( typeof window !== "undefined" ? window : this ), function( window ) {

	"use strict";

	var factory = function( $, Graph ) {
		var defaults = {
			msIsContinuous: false,
			title: 'GC-MS',
			onlyOneMS: false
		}

		var gcms = function( domGC, domMS, options ) {

			this.options = $.extend( true, { }, defaults, options );

			// A GC can have more than 1 serie
			this.gcData = [];

			// Contains the ms Data
			this.msData = null;

			this.gcSeries = [];

			this.domGC = domGC;
			this.domMS = domMS;

			this.firstMsSerie = true;

			this.init();

			this.aucs = [];
			this.ingredients = [];
		}

		gcms.prototype = {

			init: function( ) {

				var self = this,
					optionsGc = {

						paddingTop: 25,
						paddingBottom: 0,
						paddingLeft: 20,
						paddingRight: 20,
						close: true,
						title: this.options.title,

						plugins: {
							'graph.plugin.zoom': { zoomMode: 'x' },
							'graph.plugin.shape': { type: 'areaundercurve', color: [ 0, 100, 100 ], fillColor: 'rgba(0,100,100,0.3)', strokeColor: 'rgba(0,100,100,1)', strokeWidth: 2 }
						},

						pluginAction: {
							'graph.plugin.zoom': { shift: false, ctrl: false },
							'graph.plugin.shape': { shift: true, ctrl: false }
						},

						wheel: {
							type: 'plugin',
							plugin: 'graph.plugin.zoom',
							options: {
								direction: 'y'
							}
						},

						dblclick: {
							type: 'plugin',
							plugin: 'graph.plugin.zoom',
							options: {
								mode: 'total'
							}
						},

/*

						onAnnotationMake: function( annot, shape ) {

							switch( annot.type ) {
								case 'areaundercurve':
									self.trigger( 'AUCCreated', [ annot ] );
								break;
							}

	//						self.onAnnotationMake( annot );
						},

						onAnnotationSelect: function( annot, shape ) {

							switch(annot.type) {
								case 'areaundercurve':
									self.doMsFromAUC( annot, shape );
									//self.AUCSelected( annot );
									self.trigger( 'AUCSelected', [ this ] );

								break;
							}
						},

						onAnnotationChange: function( annot, shape ) {

							self.doMsFromAUC( annot, this );

							switch( annot.type ) {
								case 'surfaceUnderCurve':
									self.trigger( 'AUCChanged', [ this ] );
								break;
							}
						},
*/

						onAnnotationRemove: function(annot) {

							switch( annot.type ) {
								case 'surfaceUnderCurve':
									self.trigger( 'AUCRemoved', [ this ] );
								break;
							}
						},

						onAnnotationUnselect: function(annot) {

							self.killMsFromAUC();

						},


						handleMouseLeave: function() {

//							if( self.msSerieMouseTrack ) {
//								self.msSerieMouseTrack.kill();
//								self.msSerieMouseTrack = false;
//							}
						},


						onMouseMoveData: function( e, val ) {

							if( self.lockTrackingLine ) {
								return;
							}

							for( var i in val ) { // Get the first value
								break;
							}

							if( val[ i ] == undefined || ! self.msData ) {
								return;
							}

							var x = val[ i ].xBeforeIndex;

							if( x ) {
								self.recalculateMSMove( x );
							}
						},
					},

					axisGc = {

						bottom: [
							{
								labelValue: 'Time',
								unitModification: 'time:min.sec',
								primaryGrid: false,
								nbTicksPrimary: 10,
								secondaryGrid: false,
								axisDataSpacing: { min: 0, max: 0.1 },

								onZoom: function(from, to) {

									// Zoom on GC has changed
									self.updateIngredientPeaks();



									self.trigger("onZoomGC", [ from, to ] );
								}
							}
						],


						top: [
							{
								labelValue: 'RI',
								primaryGrid: false,
								secondaryGrid: false,
							}
						],



						left: [
							{
								labelValue: 'Intensity (-)',
								ticklabelratio: 1,
								primaryGrid: true,
								secondaryGrid: false,
								nbTicksPrimary: 3,
								exponentialFactor: -7,
								forcedMin: 0,
								display: false
							}
						]
					},


					optionsMs = {

						paddingTop: 5,
						paddingBottom: 0,
						paddingLeft: 20,
						paddingRight: 20,

						shapeSelection: 'multiple',

						close: true,

						plugins: {
							'graph.plugin.zoom': { zoomMode: 'x' }
						},

						pluginAction: {
							'graph.plugin.zoom': { shift: false, ctrl: false }
						},

						wheel: {
							type: 'plugin',
							plugin: 'graph.plugin.zoom',
							options: {
								direction: 'y'
							}
						},

						dblclick: {
							type: 'plugin',
							plugin: 'graph.plugin.zoom',
							options: {
								mode: 'total'
							}
						},
	/*
						onAnnotationMake: function( annot ) {

							annot._msIon = new DataObject({
								name: annot.id,
								data: [],
								lineColor: annot.fillColor || annot.strokeColor,
								lineWidth: '2'
							});

							this.options.onAnnotationChange(annot);
							self.onAnnotationMake(annot);
						},

						onAnnotationChange: function( annot ) {

							var annot = new DataObject(annot, true);

							var val = annot.pos.x,
								index,
								index2,
								val,
								target = [];


							for(var i = 0, l = self.msData.length; i < l; i++) {

								index = self.searchBinaryIndexMs(i, val),
								index2 = index,
								valAdd = 0;

								while(self.msData[i][index2] > val - 0.3) {
									valAdd += self.msData[i][index2 + 1];
									index2 -= 2;
								}

								index2 = index + 2;

								while(self.msData[i][index2] < val + 0.7) {
									valAdd += self.msData[i][index2 + 1];
									index2 += 2;
								}

								target.push(self.gcData[i * 2]);
								target.push(valAdd);
							}

							annot._msIon.data = target;
							annot._msIon.triggerChange();


							//self.onAnnotationChange();
						}*/
					},


					axisMs = {

						bottom: [
							{
								labelValue: 'm/z',
								unitModification: false,

								primaryGrid: false,
								nbTicksPrimary: 10,
								nbTicksSecondary: 4,
								secondaryGrid: false,
								axisDataSpacing: { min: 0, max: 0.1 },

								onZoom: function(from, to) {
									if(self.onZoomMS) {
										self.onZoomMS(from, to);
									}
								}
							}
						],

						left: [
							{
								labelValue: 'Intensity (-)',
								ticklabelratio: 1,
								primaryGrid: true,
								nbTicksSecondary: 4,
								secondaryGrid: false,
								scientificTicks: true,
								nbTicksPrimary: 3,
								forcedMin: 0,
								display: false,
								axisDataSpacing: { min: 0, max: 0.2 },
							}
						],

						right: [
							{
								primaryGrid: false,
								secondaryGrid: false,
								nbTicksSecondary: 5,
								display: false,
								axisDataSpacing: { min: 0, max: 0.2 },
							}
						]
					};

				this.gcGraph = new Graph( this.domGC, optionsGc, axisGc);
				this.msGraph = new Graph( this.domMS, optionsMs, axisMs);

				this.msGraph.getBottomAxis().zoom( 0, 100 );
				this.msGraph.getLeftAxis().zoom( 0, 1 );

				this.gcGraph.redraw();
				this.msGraph.redraw();

				this.gcGraph.on('click', function( e ) {

					if( e.target.nodeName == 'path' || e.target.nodeName == 'text' ) {
						return;
					}

					self.lockTrackingLine = ! self.lockTrackingLine;
				});

				this.gcGraph.newShape({
					pos: {
						x: 100,
						y: 'min'
					},

					pos2: {
						x: 100,
						y: 'max'
					},

					type: 'line',
					strokeColor: 'rgba(0, 0, 0, 1)',
					strokeWidth: 2	}).then( function( shape ) {

						self.trackingLineGC = shape;
						shape.draw();
						shape.lock();
						shape.redraw();
					})

				this.msGraph.on("shapeSelect", function( shape ) {
					self.msShapesSelectChange();
				});

				this.msGraph.on("shapeUnselect", function( shape ) {
					self.msShapesSelectChange();
				});

				this.gcGraph.on("shapeSelect", function( shape ) {

					if( shape.data.ingredient ) {
						self.trigger("ingredientSelected", shape.data.ingredient );
					}


					if( shape.data.type == 'areaundercurve' ) {
						self.trigger('AUCSelected', shape.data );
					}
				});


				this.gcGraph.shapeHandlers.onCreated.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					shape.setSerie( self.gcGraph.getSerie( 0 ) );

					self.aucs.push( shape );
					self.trigger('AUCCreated', shape );
				} );

				this.gcGraph.shapeHandlers.onAfterMoved.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					self.doMsFromAUC( shape.data, shape );
					self.trigger('AUCChange', shape );
				} );

				this.gcGraph.shapeHandlers.onAfterResized.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					self.doMsFromAUC( shape.data, shape );
					self.trigger('AUCChange', shape );
				} );

				this.gcGraph.shapeHandlers.onSelected.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					self.trigger('AUCSelected', shape );
				} );

				this.gcGraph.shapeHandlers.onUnselected.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					self.trigger('AUCUnselected', shape );
				} );

				this.gcGraph.shapeHandlers.onRemoved.push( function( shape ) {

					if( ! ( shape.data.type == 'areaundercurve' ) ) {
						return;
					}

					self.trigger('AUCRemoved', shape );
				} );

				this.gcGraph.getXAxis().on("zoom", function( ) {
					self.gcGraph.getYAxis().scaleToFitAxis();
				})
/*
				this.gcGraph.shapeHandlers.onSelected.push( function( shape ) {
					self.doMsFromAUC( shape.data, shape );
				} );
*/

				this.lockTrackingLine = false;

			},

			msShapesSelectChange: function() {

				var shapes = this.msGraph.selectedShapes;

				this.trigger("MZChange", [ shapes.map( function( shape ) { return shape.data.mz; } ) ] );
			},


			resize: function( w, h ) {

				var h1 = h * 0.7;
				var h2 = h * 0.3;

				this.gcGraph.resize( w, h1 );
				this.msGraph.resize( w, h2 );

				this.gcGraph.drawSeries();
				this.msGraph.drawSeries();

				this.gcGraph._dom.style.height = h1 + "px";
				this.msGraph._dom.style.height = h2 + "px";
			},


			setRIComponents: function( components ) {


				this.gcGraph.getTopAxis().linkToAxis( this.gcGraph.getBottomAxis(), function( val ) {

					var result = 0;
					var i;
					for( i = 0; i < components.length; i ++ ) {
						result += components[ i ] * Math.pow( val, components.length - i - 1 );
					}
					return result;

				}, 1 );

				this.gcGraph.redraw();
				this.gcGraph.drawSeries();
			},

			doMsFromAUC: function( annot, shape ) { // Creating an averaged MS on the fly

				var self = this,
					xStart = annot.pos.x,
					xEnd = annot.pos2.x,

					indexStart = self.gcSeries[0].searchClosestValue(xStart).xBeforeIndex,
					indexEnd = self.gcSeries[0].searchClosestValue(xEnd).xBeforeIndex,
					indexMin = Math.min(indexStart, indexEnd),
					indexMax = Math.max(indexStart, indexEnd),
					obj = [],
					allMs = [],
					i,
					j,
					l,
					floor,
					finalMs = [];

				if(indexMax == indexMin) {
					return;
				}
			//	console.log( self.msData, indexMin, indexMax );

				for(i = indexMin; i <= indexMax; i++) {

					for(j = 0, l = self.msData[i].length; j < l; j+=2) {

						floor = Math.floor( self.msData[i][j] + 0.3 );

						if(obj[ floor ]) {

							obj[ floor ] += self.msData[i][j+1];

						} else {

							obj[ floor ] = self.msData[i][j+1];
							allMs.push( floor );
						}
					}
				}

				allMs.sort( function(a, b) { return a - b; } );

				for( var i = 0; i < allMs.length; i ++ ) {
					finalMs.push( allMs[ i ] );
					finalMs.push( Math.round( obj[ allMs[ i ] ] / Math.abs( indexMax - indexMin ) ) );
				}

				if( this.options.onlyOneMS ) {
					var buffer = this;

					if( this.extMS ) {
						this.extMS.kill( true );
						this.extMS = false;
					}

				} else {
					var buffer = shape;
				}

				if( ! buffer.msFromAucSerie ) {

					buffer.msFromAucSerie = this
						.msGraph
						.newSerie('fromAUC', { autoPeakPicking: true, lineToZero: ! this.options.msIsContinuous, autoPeakPickingNb: 10 })
						.autoAxis()
						.setYAxis( self.msGraph.getRightAxis( ) )
						.setLineWidth( 3 );
				}

				buffer.msFromAucSerie.setData( finalMs );
				buffer.msFromAucSerie.setLineColor( annot.strokeColor || annot.fillColor || 'red' );

				self.msGraph._updateAxes();
				//self.msGraph.getRightAxis().setMaxValue(self.msGraph.getBoundaryAxisFromSeries(self.msGraph.getRightAxis(), 'y', 'max'));

				//self.msGraph.getRightAxis().setMinMaxToFitSeries();


				if( this.firstMsSerie ) {
					self.msGraph.getBottomAxis().setMinMaxToFitSeries();
					this.firstMsSerie = false;
				}

				self.msGraph.getRightAxis().scaleToFitAxis( self.msGraph.getBottomAxis()/*, buffer.msFromAucSerie */);
				//self.msGraph.getLeftAxis().setMinMaxToFitSeries();

				self.msGraph.redraw();
				self.msGraph.drawSeries();


				self.trigger('onMsFromAUCChange', [ finalMs, annot, buffer.msFromAucSerie ] );
			},


			addAUC: function( from, to, options ) {

				var self = this,
					obj = {
					pos: {
						x: from
					},

					pos2: {
						x: to
					},

					type: 'areaundercurve',
					color: [ 0, 100, 100 ],
					fillColor: 'rgba(0,100,100,0.3)',
					strokeColor: 'rgba(0,100,100,1)',
					strokeWidth: 2,
					selectable: true
				};

				if( options.color ) {
					obj.fillColor = options.color;
				}


				if( options.linecolor ) {
					obj.strokeColor = options.linecolor;
				}


				this.gcGraph.newShape( obj ).then( function( shape ) {

					shape.setSerie( self.gcGraph.getSerie( 0 ) );

					shape.draw();
					shape.redraw();

					self.aucs.push( shape );
				} );

				return obj;
			},

			killAllAUC: function() {

				var self = this;
				this.aucs.map( function( auc ) {
					auc.kill();

					if( self.options.onlyOneMS ) {

						if( self.msFromAucSerie ) {
							self.msFromAucSerie.kill();
						}

					} else {

						if( auc.msFromAucSerie ) {
							auc.msFromAucSerie.kill();
						}
					}
				});

				this.aucs = [];
			},

			killMsFromAUC: function() {
				return;
				if( ! this.msFromAucSerie ) {
					return;
				}

				this.msFromAucSerie.kill( true );
				this.msFromAucSerie = false;
			},

			kill: function() {
				this.gcGraph.kill();
				this.msGraph.kill();
			},

			zoomOnGC: function(start, end, y) {

				this.gcGraph.getBottomAxis().zoom( start - (end - start) * 0.4, end + (end - start) * 0.4 );
				this.gcGraph.getLeftAxis().scaleToFitAxis( this.gcGraph.getBottomAxis(), start, end );

				this.gcGraph.redraw();
				this.gcGraph.drawSeries();

				this.updateIngredientPeaks();
			},

			setMSContinuous: function(cont) {
				this.options.msIsContinuous = cont;
			},

			/*resize: function(width, height) {
				this.gcGraph.resize(width - 10, height / 2 - 10);
				this.msGraph.resize(width - 10, height / 2 - 10);

				this.gcGraph.drawSeries();
				this.msGraph.drawSeries();
			},*/

			getGC: function() {
				return this.gcGraph;
			},

			getMS: function() {
				return this.msGraph;
			},

			blank: function() {
/*
				var i = 0,
					l = this.gcData.length;
*/

				if( this.gcData && this.gcData.kill ) {
					this.gcData.kill();
				}

/*
				for( ; i < l ; i++ ) {
					this.gcData[i].kill();
				}
				this.gcData = [];
*/
				if( this.msSerieMouseTrack ) {
					this.msSerieMouseTrack.kill( true );
					this.msSerieMouseTrack = false;
				}
			},

			setGC: function( gc ) {
				var serie,
					self = this;

				if( ! this.gcGraph ) {
					return;
				}

				this.blank();
				this.gcData = [];

				for( var i in gc ) {

					serie = this.gcGraph.newSerie( i, {
						useSlots: false
					} ).autoAxis().setData( gc[ i ] ).XIsMonotoneous();

					this.gcData.push( serie );

					serie.autoAxis( );
					this.gcGraph.redraw( );
					this.gcGraph.drawSeries( );


					var axis = this.gcGraph.getBottomAxis();
					var from = axis.getCurrentMin();
					var to = axis.getCurrentMax();

					this.trigger("onZoomGC", [ from, to ] );



					this.gcData = gc[ i ];
					this.gcSeries.push( serie );

					break;
				}

				this.aucs.map( function( auc ) {

					if( ! auc.getSerie() ) {
						auc.setSerie( self.gcGraph.getSerie( 0 ) );
					}

					auc.redraw();
					auc.setPosition();
				});

				this.updateIngredientPeaks();
			},

			setMS: function(ms) {
				this.msData = ms;
			},

			setExternalGC: function( gc ) {

				if( this.extGC ) {
					this.extGC.kill( true );
				}

				this.extGC = this.gcGraph.newSerie( 'external', { useSlots: true, lineWidth: 2, lineColor: 'red' } );
				this.extGC.setXAxis(this.gcGraph.getXAxis());
				this.extGC.setYAxis(this.gcGraph.getRightAxis(0, {primaryGrid: false, secondaryGrid: false, axisDataSpacing: { min: 0, max: 0}, display: false }));
				this.extGC.setData(gc);

				this.gcGraph.redraw();
				this.gcGraph.drawSeries();
			},


			setExternalMS: function(ms, options ) {

				if( this.msFromAucSerie ) {
					this.msFromAucSerie.kill( true );
					this.msFromAucSerie = false;
				}

				if(this.extMS) {
					this.extMS.kill( true );
				}

				this.extMS = this.msGraph
						.newSerie('ext', { autoPeakPicking: true, lineToZero: ! options.continuous, autoPeakPickingNb: 10 })
						.autoAxis()
						.setYAxis( this.msGraph.getRightAxis( ) )
						.setLineWidth( 3 );


				this.extMS.setData( ms );
				this.extMS.setLineColor( options.strokeColor || options.fillColor || 'green' );


				if( this.firstMsSerie ) {
					this.msGraph.getBottomAxis().setMinMaxToFitSeries();
					this.firstMsSerie = false;
				}

				this.msGraph._updateAxes();

				this.msGraph.getRightAxis().scaleToFitAxis( this.msGraph.getBottomAxis() );


				this.msGraph.redraw(true, true, false);
				this.msGraph.drawSeries();
			},

			removeExternalMS: function() {

				if(this.extMS) {
					this.extMS.kill(true);
				}
			},

			trigger: function( func, params ) {

				if( ! Array.isArray( params ) ) {
					params = [ params ];
				}

				if( this.options[ func ] ) {
					this.options[ func ].apply( this, params );
				}
			},

			redrawMs: function() {

				this.msGraph._updateAxes();
				this.msGraph.getRightAxis().scaleToFitAxis( this.msGraph.getBottomAxis() );

				this.msGraph.redraw();
				this.msGraph.drawSeries();
			},

			addIngredient: function( ingredient ) {
				ingredient.color = ingredient.color || [100, 100, 100];


				var self = this,
					obj = {
					pos: {
						x: ingredient.rt_x,
						y: ingredient.rt_y,
						dy: "-10px"

					},
					pos2: {
						dx: 0,
						dy: "-30px"
					},

					ingredient: ingredient,

					locked: true,
					selectable: true,
					moveable: false,
					resizeable: false,

					type: 'line',
					strokeColor: "rgb(" + ingredient.color.join() + ")",
					strokeWidth: 2,
					label: {
						position: {
							dx: 0,
							dy: "-40px"
						},
						baseline: 'middle',
						angle: -90,
						color:  "rgb(" + ingredient.color.join() + ")",
						size: 12,
						text: ingredient.name
					}
				};


				this.gcGraph.newShape( obj ).then( function( shape ) {

					self.ingredients.push( [ ingredient, shape ] );

					shape.draw();
					shape.redraw();
				});

				this.updateIngredientPeaks();
			},


			setMSIndexData: function( x ) {

				this.recalculateMSMove( x );
			},

			recalculateMSMove: function( x ) {
				var self = this;
				var ms = self.msData[x];

				self.trigger('MSChangeIndex', [ x, ms ] );

				if( ! self.msSerieMouseTrack ) {

					self.msSerieMouseTrack = self
					.msGraph
					.newSerie("",
						{
							lineToZero: ! self.options.msIsContinuous,
							lineColor: 'rgba( 100, 100, 100, 0.5 )'
						}
					)
					.autoAxis();
				}



				var xVal = self.gcData[ x * 2 ];

				self.trackingLineGC.data.pos.x = xVal;
				self.trackingLineGC.data.pos2.x = xVal;

				self.trackingLineGC.redraw();

				if( ! ms ) {
					return;
				}


				self.msSerieMouseTrack.setData( ms );


				if( self.firstMsSerie ) {
					self.msGraph.getBottomAxis().setMinMaxToFitSeries();
					self.firstMsSerie = false;
				}

				self.msGraph._updateAxes();


				if( !isNaN( self.msGraph.getBottomAxis().getMin() ) ) {

					self.msGraph.getLeftAxis().scaleToFitAxis( self.msGraph.getBottomAxis(), self.msSerieMouseTrack );
//								self.msGraph.getLeftAxis().setMinMaxToFitSeries();

				} else {

					self.msGraph.autoscaleAxes();
				}
				// Autoscale y ?

				self.msGraph.redraw();
				self.msSerieMouseTrack.draw();
			},

			updateIngredientPeaks: function() {

				var self = this;
				var min = this.gcGraph.getXAxis().getMin();
				var max = this.gcGraph.getXAxis().getMax();

				this.ingredients = this.ingredients.sort( function( a, b ) {

					if ( a[ 0 ].rt_x < min || a[ 0 ].rt_x > max ) {

						return 1;
					}

					if ( b[ 0 ].rt_x < min || b[ 0 ].rt_x > max ) {

						return - 1;
					}

					return - ( a[ 0 ].rt_y - b[ 0 ].rt_y );
				});


				var i = 0;
				var limit = 20,
					xs = [];

				for( var i = 0; i < this.ingredients.length; i ++ ) {

					var cont = false;
					var valX = self.gcGraph.getXAxis().getPx( this.ingredients[ i ][ 0 ].rt_x );

					for( var j = 0; j < xs.length; j ++ ) {

						var x = xs[ j ];

						if( Math.abs( x - valX ) < 15 ) {
							this.ingredients[ i ][ 1 ].toggleLabel( 0, false );
							limit++;
							cont = true;
							break;
						}
					};

					if( cont ) {

						continue;
					} else {
						xs.push( valX );
					}


					if( i < limit ) {
						this.ingredients[ i ][ 1 ].toggleLabel( 0, true );
					} else {
						this.ingredients[ i ][ 1 ].toggleLabel( 0, false );
					}
				}
			}
		};

		return gcms;
	}



    if( typeof define === "function" && define.amd ) {

        define( [ 'jquery', 'graph' ], function( $, Graph ) {

            return factory( $, Graph );
        });

    } else if( window ) {

        if( window.Graph && window.$ ) {

        	// Namespace NMRHandler
        	window.GCMS = factory( window.$, window.Graph );

        } else {
        	throw "Graph or jQuery not defined"
        }
    }


}));
