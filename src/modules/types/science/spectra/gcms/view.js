define( [

	'modules/default/defaultview', 
	'src/util/datatraversing', 
	'lib/gcms/gcms', 
	'src/util/util', 
	'src/util/api'

	], function(

		Default, 
		Traversing, 
		GCMS, 
		Util, 
		API

	) {
	
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			
			this.namedSeries = {};
			
			var div1 = document.createElement('div');
			var div2 = document.createElement('div');

			var domGraph = document.createElement("div");

			domGraph.appendChild( div1 );
			domGraph.appendChild( div2 );

			div2.style.width = '100%';
			div2.style.height = '100px';

			div1.style.width = '100%';
			div1.style.height = '250px';
			
			this.div1 = div1;
			this.div2 = div2;

			this.dom = domGraph;
			this.module.getDomContent().html( domGraph );
			this.resolveReady();
		},

		unload: function() {
			//this.gcmsInstance.unload();
			this.dom.remove();
		},

		inDom: function() {

			var self = this;

			var gcmsinstance = new GCMS( this.div1, this.div2, {

										
				AUCCreated: function( auc ) {

					var self = this;
					var pos = Math.round( auc.data.pos.x );
					var pos2 = Math.round( auc.data.pos2.x );
//					var color = rgbToHex.apply( this, auc.data.color );


				},

				AUCChange: function( auc ) {

					var pos = Math.round( auc.data.pos.x );
					var pos2 = Math.round( auc.data.pos2.x );

					if( auc.msFromAucSerie ) {
						auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
						auc.msFromAucSerie.applyLineStyles();

//									auc.msFromAucSerie.showPeakPicking();
					}

					if( auc.data._originalSource ) {

						auc.data._originalSource.set('from', pos );
						auc.data._originalSource.set('to', pos2 );

						auc.data._originalSource.triggerChange();
					}
				},

				AUCSelected: function( auc ) {

					if( auc.msFromAucSerie ) {
						auc.msFromAucSerie.setLineColor( 'rgba(255, 0, 0, 1)' );
						auc.msFromAucSerie.applyLineStyles();

						auc.msFromAucSerie.showPeakPicking( true );
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

				},

				AUCRemoved: function( auc ) {


					if( auc.msFromAucSerie ) {
						auc.msFromAucSerie.kill();
					}

				}

			} );


/*
			var _gcms = new gcms();
			_gcms.setMSContinuous( this.module.getConfiguration( 'continuous' ) );
			_gcms.inDom(this.dom.find('.gc').get(0), this.dom.find('.ms').get(0));
			_gcms.onAnnotationChange = function(annot) {

				switch(annot.type) {

					case 'verticalLine':
					break;

					case 'surfaceUnderCurve':
						self.module.controller.sendAction('GCIntegration', annot, 'onGCIntegralChange');
					break;

				}

				if(annot) {
					annot.triggerChange( self.module.getId( ) );
				}
			}

			_gcms.onAnnotationMake = function(annot) {

				switch( annot.type ) {

					case 'verticalLine':
						// We are on the MS
						if( annot._msIon ) {
							self.module.controller.sendAction('MSIon', annot._msIon, 'onMSTrackingAdded');	
						}

					break;

					// We are on the GC
					case 'surfaceUnderCurve':
						self.module.controller.sendAction('GCIntegration', annot, 'onGCIntegralAdd');
					break;
				}
			}

			_gcms.onAnnotationRemove = function(annot) {

				switch(annot.type) {
					case 'verticalLine':
						
					break;

					case 'surfaceUnderCurve':
						self.module.controller.sendAction('GCIntegration', annot, 'onGCIntegralRemove');
					break;
				}
			}

			_gcms.onMSSelect = function(ms, annot) {
				self.module.controller.createDataFromEvent('onGCIntegralSelect', 'MSTrace', new DataArray( ms ) );
				// Sends out an MS Trace (integrated and averaged MS data over the integral)
			}

			_gcms.onIntegralSelect = function(annot) {
				self.module.controller.createDataFromEvent('onGCIntegralSelect', 'GCIntegration', annot );
			}

			_gcms.onZoomGC = function(from, to) {
				self.module.controller.sendAction('fromtoGC', new DataObject({type: 'fromTo', value: new DataObject ({ from: from, to: to })}), 'onZoomGCChange');
			}

			_gcms.onZoomMS = function(from, to) {
				self.module.controller.sendAction('fromtoMS', new DataObject({type: 'fromTo', value: new DataObject ({ from: from, to: to })}), 'onZoomMSChange');
			}

			_gcms.msIonAdded = function( el ) {
				
			};*/
				
			this.gcmsInstance = gcmsinstance;
		},

		unload: function() {
			this.dom.remove();
			//this.gcmsInstance = false;
		},

		onResize: function() {
		//	this.gcmsInstance.resize(this.width, this.height);
		},
		
		blank: {
			jcamp: function(varname) {
			//	this.gcmsInstance.blank();
			}
		},

		update: {
			'jcamp': function(moduleValue) {
				var self = this;

				if(!moduleValue) {
					return;
				}

				moduleValue = moduleValue.get();
				require( [ 'components/jcampconverter/build/jcampconverter' ], function( tojcamp ) {

					var jcamp = tojcamp.convert( moduleValue, true ).then( function( jcamp ) {

//						console.log(JSON.stringify(jcamp.profiling,true));

						if( jcamp.gcms ) {

							self.gcmsInstance.setGC( jcamp.gcms.gc );
							self.gcmsInstance.setMS( jcamp.gcms.ms );

							self.module.controller.createDataFromEvent( "onJCampParsed", "msdata", jcamp.gcms.ms );
							self.module.controller.createDataFromEvent( "onJCampParsed", "gcdata", jcamp.gcms.gc );

							self.jcamp = jcamp;
						}
					});
					
				});
			},

			'annotationgc': function(value) {
				if( ! value ) {
					return;
				}
		
				this.resetAnnotationsGC( );
				this.addAnnotations( value );
			},

			'gcms': function(moduleValue) {
				this.gcmsInstance.setGC(moduleValue.gc);
				this.gcmsInstance.setMS(moduleValue.ms);
			},

			'gc': function(moduleValue) {
				var self = this;
				if(!this.gcmsInstance || !moduleValue)
					return;

				var jcamp = tojcamp(moduleValue.get()).done( function( jcamp ) {
					if(jcamp.spectra) {
						self.gcmsInstance.setExternalGC(jcamp.spectra[0].data[0]);
					}
				});
			},


			'ms': function(moduleValue, name, cont) {
				var self = this;
				if(!this.gcmsInstance || !moduleValue)
					return;

				require(['components/jcampconverter/build/jcampconverter'], function(tojcamp) {
					var jcamp = tojcamp.convert(moduleValue.get(), true).then( function(jcamp) {

						if( jcamp.spectra ) {
							self.gcmsInstance.setExternalMS( jcamp.spectra[ 0 ].data[ 0 ], cont );
						}
					});
					
				});
			},

			'mscont': function(moduleValue, name) {
				this.update.ms(moduleValue, name, true);
			}
		},

		getDom: function() {
			return this.dom;
		},

		resetAnnotationsGC: function() {


			if( ! this.gcmsInstance ) {
				return;
			}

			this.gcmsInstance.killAllAUC();
		},

		addAnnotations: function( a ) {

			var self = this;
			a.map( function( source ) {

				var shapeData = self.gcmsInstance.addAUC( source.from, source.to );
				shapeData._originalSource = source;
			});
		},


		onActionReceive: {
			fromtoGC: function(value, name) {
				value = value.get();
				this.gcmsInstance.getGC().getBottomAxis()._doZoomVal(value.from, value.to, true);
				this.gcmsInstance.getGC().redraw( true, true, false );
				this.gcmsInstance.getGC().drawSeries();
			},

			fromtoMS: function(value, name) {
				this.gcmsInstance.getMS().getBottomAxis()._doZoomVal(value.from, value.to, true);
			},

			zoomOnAnnotation: function(value, name) {
				if(!value.pos && !value.pos2) {
					return;
				}
				this.gcmsInstance.zoomOn(value.pos.x, value.pos2.x, value._max || false);
			},

			displayChemicalLabels: function() {
				return;
				var i = 0, 
					l = this.shapes.length;

				for ( ; i < l ; i++ ) {
					this.shapes[i].toggleLabel( 1 , true );
				}
			},

			hideChemicalLabels: function() {
				return;
				var i = 0, 
					l = this.shapes.length;

				for ( ; i < l ; i++ ) {
					this.shapes[i].toggleLabel( 1 , false );
				}

			}
		},

		doAnnotation: function(annotation) {

			return;



			var self = this;
			var shape = this.gcmsInstance.getGC().makeShape(annotation, {}, false);

			shape.setSelectable(true);

			annotation.onChange(function(value) {
				shape.draw();
				shape.redraw();
			}, self.module.getId());
			
			API.killHighlight(this.module.getId());
			API.listenHighlight( annotation, function( onOff ) {

				if( onOff ) {
					shape.highlight();
				} else {
					shape.unHighlight();
				}
			}, false, this.module.getId());


			shape.draw();
			shape.redraw();

			return shape;
		}
	});

	return view;
});
