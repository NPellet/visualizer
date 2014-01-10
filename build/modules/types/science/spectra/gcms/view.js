define(['modules/default/defaultview', 'lib/plot/plot', 'src/util/datatraversing', './gcms', 'src/util/util', 'src/util/api'], function(Default, Graph, Traversing, gcms, Util, API) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="gcms"><div class="gc"></div><div class="ms"></div></div>');
			this.namedSeries = {};
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);
		},

		unload: function() {
			this.gcmsInstance.unload();
			this.dom.remove();
		},

		inDom: function() {

			var self = this;
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
				self.module.controller.setVarFromEvent('onGCIntegralSelect', new DataArray( ms ), 'MSTrace');
				// Sends out an MS Trace (integrated and averaged MS data over the integral)
			}

			_gcms.onIntegralSelect = function(annot) {
				self.module.controller.setVarFromEvent('onGCIntegralSelect', annot, 'GCIntegration');
			}

			_gcms.onZoomGC = function(from, to) {
				self.module.controller.sendAction('fromtoGC', new DataObject({type: 'fromTo', value: new DataObject ({ from: from, to: to })}), 'onZoomGCChange');
			}

			_gcms.onZoomMS = function(from, to) {
				self.module.controller.sendAction('fromtoMS', new DataObject({type: 'fromTo', value: new DataObject ({ from: from, to: to })}), 'onZoomMSChange');
			}

			_gcms.msIonAdded = function( el ) {
				
			};
				
			this.gcmsInstance = _gcms;
		},

		unload: function() {
			this.dom.remove();
			this.gcmsInstance = false;
		},

		onResize: function() {
			this.gcmsInstance.resize(this.width, this.height);
		},
		
		blank: {
			jcamp: function(varname) {
				this.gcmsInstance.blank();
			}
		},

		update: {
			'jcamp': function(moduleValue) {
				var self = this;

				if(!moduleValue) {
					return;
				}

				moduleValue = moduleValue.get();
				require(['src/util/jcampconverter'], function( tojcamp ) {

					var jcamp = tojcamp(moduleValue).done( function( jcamp ) {

						console.log(JSON.stringify(jcamp.profiling,true));

						if(jcamp.gcms) {
							self.gcmsInstance.setGC(jcamp.gcms.gc);
							self.gcmsInstance.setMS(jcamp.gcms.ms);

							self.resetAnnotationsGC();
						}
					});
					
				});
			},

			'annotationgc': function(value) {
				if(!value)
					return;
				this.annotations = value.get();
				this.resetAnnotationsGC();
			},

			'gcms': function(moduleValue) {
				this.gcmsInstance.setGC(moduleValue.gc);
				this.gcmsInstance.setMS(moduleValue.ms);
				this.resetAnnotationsGC();
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

				require(['src/util/jcampconverter'], function(tojcamp) {
					var jcamp = tojcamp(moduleValue.get()).done( function(jcamp) {

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

			if(!this.gcmsInstance || !this.annotations)
				return;

			if ( this.shapes ) {
				for( var i = 0, l = this.shapes.length; i < l; i++) {
					this.shapes[i].kill();
				}
			}

			this.shapes = [];
			for(var i = 0, l = this.annotations.length; i < l; i++) {
				this.shapes.push(this.doAnnotation(this.annotations[i]));
			}
		},


		onActionReceive: {
			fromtoGC: function(value, name) {
				this.gcmsInstance.getGC().getBottomAxis()._doZoomVal(value.value.from, value.value.to, true);
			},

			fromtoMS: function(value, name) {
				this.gcmsInstance.getMS().getBottomAxis()._doZoomVal(value.value.from, value.value.to, true);
			},

			zoomOnAnnotation: function(value, name) {
				if(!value.pos && !value.pos2) {
					return;
				}
				this.gcmsInstance.zoomOn(value.pos.x, value.pos2.x, value._max || false);
			},

			displayChemicalLabels: function() {
				var i = 0, 
					l = this.shapes.length;

				for ( ; i < l ; i++ ) {
					this.shapes[i].toggleLabel( 1 , true );
				}
			},

			hideChemicalLabels: function() {
				var i = 0, 
					l = this.shapes.length;

				for ( ; i < l ; i++ ) {
					this.shapes[i].toggleLabel( 1 , false );
				}

			}
		},

		doAnnotation: function(annotation) {
			var self = this;
			var shape = this.gcmsInstance.getGC().makeShape(annotation, {}, false);

			shape.setSelectable(true);

			annotation.onChange(function(value) {
				shape.draw();
				shape.redraw();
			}, self.module.getId());
			
			if( annotation._highlight ) {

				API.listenHighlight( annotation._highlight, function( onOff ) {

					if( onOff ) {
						shape.highlight();
					} else {
						shape.unHighlight();
					}
				});
			}

			shape.draw();
			shape.redraw();

			return shape;
		}
	});

	return view;
});
