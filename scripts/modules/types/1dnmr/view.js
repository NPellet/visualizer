define(['modules/defaultview', 'libs/plot/plot', 'util/datatraversing', 'util/jcampconverter'], function(Default, Graph, Traversing, JcampConverter) {
	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		init: function() {

			var html = [];
			html.push('<div class="2drmn"></div>');
			this.namedSeries = {};
			this.dom = $(html.join(''));
			this.module.getDomContent().html(this.dom);
		},

		
		inDom: function() {
			var self = this;
			this._instance = new Graph(this.dom.get(0), {

				plugins: ['zoom', 'nmrintegral'],
				zoomMode: 'x',

				keyCombinations: {
					zoom: { shift: false, ctrl: false },
					nmrintegral: { shift: true, ctrl: false }
				}
			});

			this.series = {};
			this._instance.getBottomAxis(0, { flipped: true }).setLabel('Blahppm');
			this._instance.getLeftAxis(0, { flipped: true }).setLabel('ppm');
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

console.log(spectra);
					self.series[ varname ] = [];
					spectra = spectra.spectra;

					for (var i = 0, l = spectra.length; i < l; i ++ ) {

						serie = self._instance.newSerie( varname , { trackMouse: true } );

						var data = spectra[ i ].data[ spectra[ i ].data.length - 1 ];

						//self.setSerieParameters(serie, varname);
						serie.setData( data );
						serie.autoAxis( );
						self.series[ varname ].push( serie );
console.log(data);
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

 
