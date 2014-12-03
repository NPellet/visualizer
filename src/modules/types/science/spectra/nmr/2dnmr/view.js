'use strict';

define([
    'modules/default/defaultview',

    'components/jsNMR/src/nmr',
    


    ], function (Default, NMR) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            this.dom = $('<div />');
            this.module.getDomContent().html(this.dom);
            this.resolveReady();
        },

        inDom: function () {

            var nmr = new NMR({
                dom: this.dom,
                mode: '2d',
                symmetric: true,
                minimap: false
            });

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

            this.nmr.resize2DTo( this.width, this.height );
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

        blank: {
            jcampx: function (varname) {
                this.nmr.removeSerie2DX(varname);
            },
            jcampy: function (varname) {
                this.nmr.removeSerie2DY(varname);
            },
            jcamp2d: function (varname) {
                this.nmr.removeSerie2D(varname);
            }
        },

        update: {

            jcampx: function (moduleValue) {
                
                this.addSerieJcampXOrY(moduleValue, true, false);
            },

            jcampy: function (moduleValue) {
                
                this.addSerieJcampXOrY(moduleValue, false, true);
            },

            jcampxy: function (moduleValue) {
             //   this.addSerieJcampXOrY(moduleValue, true, true);
            },

            jcamp2d: function (moduleValue, varName) {
                var self = this;
                


                function hue2rgb(p, q, t){
                      if(t < 0) t += 1;
                      if(t > 1) t -= 1;
                      if(t < 1/6) return p + (q - p) * 6 * t;
                      if(t < 1/2) return q;
                      if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                      return p;
                  }

                 function hslToRgb(h, s, l){
                      var r, g, b;

                      if(s == 0){
                          r = g = b = l; // achromatic
                      }else{
                       
                          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                          var p = 2 * l - q;
                          r = hue2rgb(p, q, h + 1/3);
                          g = hue2rgb(p, q, h);
                          b = hue2rgb(p, q, h - 1/3);
                      }

                      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                  }



                var opts = {
                    lineColor: 'rgb(' + hslToRgb( 100 / 360, 0.8, 0.4 ).join() + ')',
                    twoDColor: {
                        fromPositive: { h: 100, s: 0.3, l: 0.7 },
                        toPositive: { h: 100, s: 1, l: 0.5},
                        fromNegative: { h: 100, s: 0.3, l: 0.5  },
                        toNegative: { h: 100, s: 1, l: 0.3 }
                    }
                };


                JcampConverter.convert(String(moduleValue.get()), true).then(function (result) {
                    var data = result.contourLines;
                    self.nmr.setSerie2D( "SomeName", data, opts );
                    self.redraw();
                });
            },

            annotations: function (value) {
                /*
                 TODO annotations ?
                 */
                /* value = DataTraversing.getValueIfNeeded(value);

                 console.log(value);
                 if (!value)
                 return;

                 this.annotations = value;
                 this.resetAnnotations(true);*/
            }
        },


        addSerieJcampXOrY: function( value, x, y ) {
            var self = this;

            name = "SomeName";
            var options = {
                 label: 'Chemical 1'
            };

            JcampConverter.convert(String(value.get()), true).then(function (result) {
                var data = result.spectra[0].data[0];

                if (x) {
                    self.nmr.setSerie2DX( name, data, options );
                }

                if (y) {
                    self.nmr.setSerie2DY( name, data, options );
                }

                self.redraw();
            });
        },

        redraw: function () {
           this.nmr.redrawAll2D();
        },

        get2dSerie: function (name) {
            return;
            if (!this.series['_2d'][name]) {
                // Create 2D serie
                var serie = this.graphs['_2d'].newSerie('serie2d_' + 'name', {}, 'contour')
                    .autoAxis();
                serie.getXAxis()
                    .togglePrimaryGrid(false)
                    .toggleSecondaryGrid(false)
                    .setDisplay(false)
                    .flip(true);
                serie.getYAxis()
                    .togglePrimaryGrid(false)
                    .toggleSecondaryGrid(false)
                    .setDisplay(false)
                    .flip(true);
                this.series['_2d'][name] = serie;
            }
            return this.series['_2d'][name];
        },

        get2d: function (XY) {
            return;
            var min = Infinity,
                max = -Infinity,
                series = this.series['_2d'],
                minVal, maxVal;
            for (var i in series) {
                minVal = series[i]['getMin'+XY]();
                if(minVal < min) {
                    min = minVal;
                }
                maxVal = series[i]['getMax'+XY]();
                if(maxVal > max) {
                    max = maxVal;
                }
            }
            return {
                min: min,
                max: max
            };
        },

        force: function (axis, minMax, value) {
            return;
            var series = this.series['_2d'];
            for (var i in series) {
                series[i]['get'+axis+'Axis']()['force'+minMax](value);
            }
        }

    });

    return View;

});

 
