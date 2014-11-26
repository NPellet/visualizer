'use strict';

define([
    'modules/default/defaultview',
    'components/jsNMR/src/nmr',
    'components/jcampconverter/build/jcampconverter'

    ], function (Default, NMR, JcampConverter) {

    function View() {
    }

	
	function view() {};
	view.prototype = $.extend(true, {}, Default, {
		
		 init: function () {
            this.dom = $('<div />');
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
        },

        inDom: function () {

            var nmr = new NMR({
                dom: this.dom,
                mode: '1d',
                symmetric: false
            });

            this.series = {};
            this.nmr = nmr;

        /*    nmr.load( {

                urls: {
                    twoD: 'components/jsNMR/test/cosy/84-74-2_cosygpppqf.jdx',
                    x: 'components/jsNMR/test/cosy/84-74-2_zg.jdx'
                },

                lineColor: 'rgb(' + hslToRgb( 100 / 360, 0.8, 0.4 ).join() + ')',
                twoDColor: {

                    fromPositive: { h: 100, s: 0.3, l: 0.7 },
                    toPositive: { h: 100, s: 1, l: 0.5},

                    fromNegative: { h: 100, s: 0.3, l: 0.5  },
                    toNegative: { h: 100, s: 1, l: 0.3 }
                },
                label: 'Chemical 1'
            });
*/

        },

        onResize: function () {

            this.nmr.resize1DTo( this.width, this.height );
/*
            if (this.nmr.graphs['_2d']) {
                this.nmr.graphs['_2d'].resize(this.width - 160, this.height - 160);
            }
            if (this.nmr.graphs['x']) {
                this.nmr.graphs['x'].resize(this.width - 160, 150);
            }
            if (this.nmr.graphs['y']) {
                this.nmr.graphs['y'].resize(150, this.height - 160);
            }
            this.redraw();*/
        },

		
		update: {
		
			
			'jcamp': function(moduleValue, varname) {

				var self = this;

				JcampConverter.convert( moduleValue.get().toString(), {lowRes: 1024}, true).then( function( spectra ) {

//					self.series[ varname ] = [];
					//if( spectra && spectra[ 0 ] && spectra.spectra[ 0 ].data[ 0 ] )
					self.nmr.setSerieX("someName", spectra.spectra[ 0 ].data[ 0 ], { label: 'SomeMol'} );


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

 
