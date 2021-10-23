'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'src/util/ui',
  'lib/loadingplot/loadingplot',
  'components/jquery-mousewheel/jquery.mousewheel.min'
], function (Default, Util, API, ui, LoadingPlot) {
  Util.loadCss('lib/loadingplot/svg.css');

  function View() {
  }

  $.extend(true, View.prototype, Default, {

    init: function () {
      this.dom = ui.getSafeElement('div');
      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },

    onResize: function (w, h) {
      this._w = w;
      this._h = h;
      if (this._w && this._h && this._svg) {
        this._svg.setSize(this._w, this._h);
      }
      this.refresh();
    },

    blank: {
      loading: function () {
        if (this.dom) {
          this.dom.empty();
        }
        API.killHighlight(this.module.getId());
      }
    },

    update: {

      preferences: function (moduleValue) {
        this._lastConf = moduleValue;
        if (!this._lastValue) {
          return;
        }
        for (var i in moduleValue) {
          for (var j = 0; j < this._lastValue.series.length; j++) {
            if (this._lastValue.series[j].category == i) {
              for (var k = 0; k < this._lastValue.series[j].data.length; k++) {
                this._instances[j][k].filter(moduleValue[i]);
              }
            }
          }
        }
      },

      center: function (val) {
        if (!val) {
          return;
        }
        this._svg.setCenter.apply(this._svg, val);
      },

      zoom: function (val) {
        if (!val) {
          return;
        }
        this._svg.setZoom(val);
      },

      viewport: function (viewport) {
        if (!viewport) {
          return;
        }
        this._svg.setViewBox.apply(this._svg, [false].concat(viewport));
      },

      loading: function (moduleValue) {
        var that = this;
        if (!moduleValue || !moduleValue.value) {
          return;
        }

        this._highlights = [];

        var svg = new LoadingPlot.SVG(null, null, null, null, this.module.getConfiguration('navigation')[0][0] || false);

        svg._svgEl.style.display = 'block';

        svg.onZoomChange(function (zoom01) {
          that.module.controller.onZoomChange(zoom01);
          that.module.controller.onChangeViewport(svg.getViewBox());
        });

        svg.onMove(function (cx, cy) {
          that.module.controller.onMove(cx, cy);
          that.module.controller.onChangeViewport(svg.getViewBox());
        });


        this._svg = svg;

        if (this._w && this._h) {
          svg.setSize(this._w, this._h);
        }

        var minX = moduleValue.value.minX || 0;
        var minY = moduleValue.value.minY || 0;

        var widthX = (moduleValue.value.maxX || 100) - minX;
        var widthY = (moduleValue.value.maxY || 100) - minY;

        svg.setViewBoxWidth(minX, minY, widthX, widthY, true);

        svg.create();

        svg.bindTo(this.dom);

        var Springs = new LoadingPlot.SpringLabels(svg);

        svg.initZoom();
        LoadingPlot.SVGElement.prototype.Springs = Springs;
        this._lastValue = moduleValue.value;
        this._instances = [];
        if (!moduleValue.value || !moduleValue.value.series) {
          return;
        }

        var layers = this.module.getConfiguration('layers');

        for (var i = 0; i < layers.length; i++) {
          var layer = layers[i].groups.group[0];
          var labels = layer.labels[0];
          var theLabels = {};
          var j;
          for (j = 0; j < labels.length; j++) {
            theLabels[labels[j]] = true;
          }
          var layerId = layer.el[0];
          var type = layer.type[0] || 'ellipse';

          for (j = 0; j < moduleValue.value.series.length; j++) {
            if (moduleValue.value.series[j].category === layerId) {
              var datas = moduleValue.value.series[j].data;
              var el;
              for (var k = 0, l = datas.length; k < l; k++) {
                if (type === 'pie')
                  el = new LoadingPlot.Pie(svg, datas[k].x, datas[k].y, datas[k]);
                else if (type === 'ellipse')
                  el = new LoadingPlot.Ellipse(svg, datas[k].x, datas[k].y, datas[k]);
                else if (type === 'img')
                  el = new LoadingPlot.Image(svg, datas[k].x, datas[k].y, datas[k]);
                el.allowLabelDisplay(theLabels.display_labels);
                if (layer.labelsize[0])
                  el.setLabelSize(layer.labelsize[0]);
                el.forceField(theLabels.forcefield);
                if (layer.labelzoomthreshold[0] !== '')
                  el.setLabelDisplayThreshold(layer.labelzoomthreshold[0]);

                var highlightMag = layer.highlightmag[0] ? (layer.highlightmag[0]) : 1;
                var highlightStroke = layer.highlighteffect[0][0] ? true : false;

                el.setHighlightMag(highlightMag);
                el.setHighlightEffect({
                  mag: highlightMag,
                  yStroke: highlightStroke
                });


                el.setLabelStroke(theLabels.blackstroke);
                el.setLabelScale(theLabels.scalelabel);

                var fnc = el.highlight.bind(el);
                API.listenHighlight(datas[k], fnc, false, this.module.getId());

                el.hoverCallback = function () {
                  that.module.controller.hover(this._data);
                };

                this._instances[j] = this._instances[j] || [];
                this._instances[j][k] = el;
                svg.add(el);
              }
              break;
            }
          }
        }

        svg.ready();
        Springs.resolve();

        if (this._lastConf) {
          this.update.preferences.call(this, this._lastConf);
        }
      }
    }

  });

  return View;
});
