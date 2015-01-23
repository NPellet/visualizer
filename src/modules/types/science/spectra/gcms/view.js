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

				onMsFromAUCChange: function( ms ) {

					self.module.controller.sendAction('ms', ms, 'onMSChange');
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

				},

				MZChange: function( ms ) {

					self.module.controller.sendAction('mzList', ms, 'onMZSelectionChange');					
				},

				MSChangeIndex: function( msIndex, ms ) {
					self.module.controller.sendAction('msIndex', msIndex, 'onMSIndexChanged');
					self.module.controller.sendAction('msMouse', ms, 'onMSIndexChanged');
				},

				onZoomGC: function( from, to ) {

					self.module.controller.sendAction('fromtoGC', [ from, to ], 'onZoomGCChange');
					self.module.controller.sendAction('centerGC', (to + from) / 2, 'onZoomGCChange');
				},

				ingredientSelected: function( ingredient ) {

					self.module.controller.sendAction('selectedIngredient', ingredient, 'onIngredientSelected');	
				},

				onlyOneMS: true

			} );

			this.gcmsInstance = gcmsinstance;
		},

		unload: function() {
			this.dom.remove();
			//this.gcmsInstance = false;
		},

		onResize: function() {
			this.gcmsInstance.resize(this.width, this.height);
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

				this.gcmsInstance.setExternalMS( moduleValue, {} );
			},

			'mscont': function(moduleValue, name) {
				this.update.ms(moduleValue, name, true);
			},

			'ingredientList': function( value, varName ) {

				var self = this;

				if( ! value ) {
					return;
				}


				this.ingredientList = value;

				this.ingredientList.map( function( source ) {
					self.gcmsInstance.addIngredient( source );
				});
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

				var shapeData = self.gcmsInstance.addAUC( source.from, source.to, source );
				shapeData._originalSource = source;
			});
		},


		onActionReceive: {
			fromtoGC: function(value, name) {
				value = value.get();

				var from = value.from - Math.abs( value.to - value.from ) * 0.1;
				var to = value.to + Math.abs( value.to - value.from ) * 0.1;
				
				this.gcmsInstance.getGC().getBottomAxis()._doZoomVal( from, to, true);
				this.gcmsInstance.getGC().redraw( true, true, false );
				this.gcmsInstance.getGC().drawSeries();

				this.module.controller.sendAction('centerGC', (to + from) / 2, 'onZoomGCChange');

				this.gcmsInstance.updateIngredientPeaks();

			},

			fromtoMS: function(value, name) {
				this.gcmsInstance.getMS().getBottomAxis()._doZoomVal(value.from, value.to, true);
			},

			externalMS: function( value, name ) {

				var self = this;
				if( ! this.gcmsInstance || !value) {
					return;
				}

				this.gcmsInstance.setExternalMS( value, {} );

				self.module.controller.sendAction('ms', value, 'onMSChange');
			},

			zoomOnAnnotation: function(value, name) {
				if(!value.pos && !value.pos2) {
					return;
				}
				this.gcmsInstance.zoomOn(value.pos.x, value.pos2.x, value._max || false);
				this.module.controller.sendAction('centerGC', (value.pos.x + value.pos2.x) / 2, 'onZoomGCChange');
				this.gcmsInstance.updateIngredientPeaks();
				
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

			},

			centerGC: function( value ) {

				
				var a = this.gcmsInstance.getGC().getBottomAxis();

				var mi = a.getActualMin();
				var ma = a.getActualMax();

				var interval = Math.abs( ma - mi ) / 2;

				a._doZoomVal( value - interval, value + interval, true);
				this.gcmsInstance.getGC().redraw( true, true, false );
				this.gcmsInstance.getGC().drawSeries();
			},

			setMSIndexData: function( x ) {
				this.gcmsInstance.setMSIndexData( x );
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
