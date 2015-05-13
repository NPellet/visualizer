'use strict';

define([
    'modules/default/defaultview',
    'components/jsNMR/src/nmr',
    'components/jcampconverter/dist/jcampconverter.min',
    'src/util/util'
], function (Default, NMR, JcampConverter, Util) {

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
                mode: '1d',
                symmetric: false
            });

            this.series = {};
            this.nmr = nmr;
        },

        onResize: function () {
            this.nmr.resize1DTo(this.width, this.height);
        },

        blank: {
            jcamp: function (varname) {
                this.nmr.removeSerieX(varname);
            }
        },

        update: {
            jcamp: function (moduleValue, varname) {
                var self = this;

                JcampConverter.convert(String(moduleValue.get()), true).then(function (spectra) {

                    self.nmr.setSerieX(varname, spectra.spectra[0].data[0], self.getOptions(varname));

                });
            }
        },

        getOptions: function (varname) {
            var result = {
                label: varname
            };

            var config = this.module.getConfiguration('lines');
            if (config) {
                for (var i = 0; i < config.length; i++) {
                    if (config[i].varname === varname) {
                        result.lineColor = Util.getColor(config[i].color);
                        result.lineWidth = config[i].width;
                    }
                }
            }

            return result;
        }

    });

    return View;

});