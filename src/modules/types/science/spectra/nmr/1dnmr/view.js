define(['modules/default/defaultview', 'lib/plot/plot', 'src/util/datatraversing', 'src/util/jcampconverter'], function(Default, Graph, Traversing, JcampConverter) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="2drmn"></div>');
			
			this.integrals = [];

			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);

		},

		redrawIntegrals: function() {

			if( typeof this.currentMaxSumAnnot == "undefined" ) {
				return;
			}

			for(var i = 0, l = this.integrals.length ; i < l ; i ++ ) {
//console.log( 100 / ( this.currentMaxSumAnnot.lastSum ) / ( this.currentMaxSumAnnot.lastSum / this.integrals[ i ].lastSum )  );
				this.integrals[ i ].setScale( this._instance.getDrawingHeight() - 100, this.currentMaxSumAnnot.lastSum );

				//this.integrals[ i ].setPosition();
				this.integrals[ i ].redraw();

			}
		},

		inDom: function() {
			var self = this;
			this._instance = new Graph(this.dom.get(0), {

				plugins: ['zoom', 'nmrintegral'],
				zoomMode: 'x',

				keyCombinations: {
					zoom: { shift: false, ctrl: false },
					nmrintegral: { shift: true, ctrl: false }
				},

				onAnnotationMake: function( annot, shape ) {
						
					if( ! self.currentMaxSumAnnot ) {
						self.currentMaxSumAnnot = shape;
					}
					
					self.integrals.push( shape );
					self.redrawIntegrals();
				},

				onAnnotationChange: function( annot, shape ) {
					
					if( ! self.currentMaxSumAnnot || self.currentMaxSumAnnot == shape || ( self.currentMaxSumAnnot != shape && shape.lastSum > self.currentMaxSumAnnot.lastSum ) ) {

						self.currentMaxSumAnnot = shape;
						self.redrawIntegrals();
					} 
				}
			},
			{

				bottom: [{ 
					primaryGrid: false,
					secondaryGrid: false,
					flipped: true

				}],

				left: [{
					primaryGrid: false,
					secondaryGrid: false,
					display: false
				}]

			});

			this.series = {};
			
			this._instance.getLeftAxis(0, { flipped: true } ).setLabel( 'ppm' );
		},

		onResize: function() {
			this._instance.resize(this.width - 20, this.height - 20);


		},
		
		update: {
		
			
			'jcamp': function(moduleValue, varname) {

				var self = this;

				if( ! this._instance ) {
					return;
				}


				if( this.deferred ) {
					this.deferred.reject();
				}

				this.deferred = JcampConverter( moduleValue.get(), {lowRes: 1024}).done( function( spectra ) {

					self.series[ varname ] = [];
					spectra = spectra.spectra;

					for (var i = 0, l = spectra.length; i < l; i ++ ) {

						serie = self._instance.newSerie( varname , { trackMouse: true } );

						var data = spectra[ i ].data[ spectra[ i ].data.length - 1 ];

						//self.setSerieParameters(serie, varname);
						serie.setData( data );
						serie.autoAxis( );
						self.series[ varname ].push( serie );

						self.redraw();

						break;
					}
				
				});
			}
		},


		redraw: function() {
			this._instance.redraw();
			this._instance.drawSeries();
		}


	});

	return view;
});

 
