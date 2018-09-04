'use strict';

define([
  'modules/default/defaultview',
  'components/jsNMR/src/nmr',
  'jcampconverter'
], function (Default, NMR, JcampConverter) {
  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.dom = $('<div />');
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },

    inDom: function () {
      this.nmr = new NMR({
        dom: this.dom,
        mode: '2d',
        symmetric: true,
        minimap: false
      });
    },

    onResize: function () {
      this.nmr.resize2DTo(this.width, this.height);
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
      },
      jcampxy: function (varname) {
        this.nmr.removeSerie2DX(varname);
        this.nmr.removeSerie2DY(varname);
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
        this.addSerieJcampXOrY(moduleValue, true, true);
      },

      jcamp2d: function (moduleValue, varName) {
        var that = this;


        function hue2rgb(p, q, t) {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        }

        function hslToRgb(h, s, l) {
          var r, g, b;

          if (s == 0) {
            r = g = b = l; // achromatic
          } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
          }

          return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
        }


        var opts = {
          lineColor: `rgb(${hslToRgb(100 / 360, 0.8, 0.4).join()})`,
          twoDColor: {
            fromPositive: { h: 100, s: 0.3, l: 0.7 },
            toPositive: { h: 100, s: 1, l: 0.5 },
            fromNegative: { h: 100, s: 0.3, l: 0.5 },
            toNegative: { h: 100, s: 1, l: 0.3 }
          }
        };


        JcampConverter.convert(String(moduleValue.get()), true).then(function (result) {
          var data = result.contourLines;
          that.nmr.setSerie2D('SomeName', data, opts);
          that.redraw();
        });
      },

      annotations: function (value) {
        /*
                 TODO annotations ?
                 */
        /* value = DataTraversing.getValueIfNeeded(value);

                 if (!value)
                 return;

                 this.annotations = value;
                 this.resetAnnotations(true);*/
      }
    },


    addSerieJcampXOrY: function (value, x, y) {
      var that = this;

      var name = 'SomeName';
      var options = {
        label: 'Chemical 1'
      };

      JcampConverter.convert(String(value.get()), true).then(function (result) {
        var data = result.spectra[0].data[0];

        if (x) {
          that.nmr.setSerie2DX(name, data, options);
        }

        if (y) {
          that.nmr.setSerie2DY(name, data, options);
        }

        that.redraw();
      });
    },

    redraw: function () {
      this.nmr.redrawAll2D();
    }

  });

  return View;
});
