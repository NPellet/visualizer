'use strict';

/* global dhtmlXChart*/
define([
  'modules/default/defaultview',
  'src/util/util',
  'lib/dhtmlxchart/dhtmlxchart'
], function (Default, Util) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      // When we change configuration the method init is called again. Also the case when we change completely of view
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(
          `<div style="height: 100%;width: 100%" id="${this._id}"></div>`
        );
        this.module.getDomContent().html(this.dom);
      }

      this._data = []; // the data that will be represented

      this.resolveReady();
    },

    onResize: function () {
      this._redraw();
    },

    /* When a value change this method is called. It will be called for all
         possible received variable of this module.
         It will also be called at the beginning and in this case the value is null !
         */
    update: {
      chart: function (moduleValue) {
        this.value = moduleValue.get();
        this._redraw();
      }
    },

    blank: {
      chart: function () {
        if (this.dom) {
          this.dom.empty();
        }
      }
    },

    _redraw: function () {
      if (!this.value) {
        return;
      }

      if (this.dom) {
        this.dom.empty();
      }

      // Redrawing the chart requires 3 steps
      // 1. convert the data
      // 2. create an empty chart
      // 3. apply the data

      var data = this._convertChartToData(this.value);

      this.createChart(this.value);

      this._radar.parse(data, 'json');

      var that = this;
      this._radar.attachEvent('onMouseMove', function (id, ev, trg) {
        data.forEach(function (entry) {
          if (entry.id == id) {
            var obj = entry;
            if (
              ev.toElement.outerHTML[ev.toElement.outerHTML.length - 3] == 'd'
            ) {
              that.module.controller.elementHover(obj._highlight[0]);
            } else {
              that.module.controller.elementHover(
                obj._highlight[
                  ev.toElement.outerHTML[ev.toElement.outerHTML.length - 3]
                ]
              );
            }
          }
        });
        return true;
      });
      this._radar.attachEvent('onMouseOut', function (id, ev, trg) {
        that.module.controller.elementOut();
      });
    },

    _convertChartToData: function (value) {
      var data = [];
      if (value && Array.isArray(value.data)) {
        for (var j = 0; j < value.data[0].x.length; j++) {
          data[j] = {};
          data[j].xunit = value.data[0].x[j];
          data[j]._highlight = [];
          for (var i = 0; i < value.data.length; i++) {
            var index = `serie${i}`;
            data[j][index] = value.data[i].y[j];
            if (value.data[i]._highlight && value.data[i]._highlight[j]) {
              data[j]._highlight.push({
                name: index,
                _highlight: value.data[i]._highlight[j]
              });
            }
          }
        }
      }
      return data;
    },
    getRandomColor: function (nbColor, i) {
      var currentColor = (360 / nbColor) * i;
      var color = `hsla(${currentColor},100%,50%,0.3)`;

      return color;
    },

    createChart: function (chart, data) {
      var cfg = this.module.getConfiguration;
      switch (cfg('preference')) {
        case 'radar':
          if (!chart.data[0].color) {
            chart.data[0].color = this.getRandomColor(chart.data.length, 0);
          }

          var options = {
            view: 'radar',
            container: this._id,
            alpha: 0.2,
            value: '#serie0#',
            disableLines: cfg('line'),
            disableItems: cfg('point'),
            color: chart.data[0].color,
            fill: chart.data[0].color,
            line: {
              color: chart.data[0].color,
              width: 1
            },
            xAxis: {
              template: '#xunit#'
            },
            yAxis: {
              lineShape: cfg('lineshape'),
              start: cfg('start'),
              end: cfg('end'),
              step: cfg('step')
            }
          };
          this._radar = new dhtmlXChart(options);

          var val = [];

          for (var i = 0; i < chart.data.length; i++) {
            if (i != 0) {
              if (!chart.data[i].color) {
                chart.data[i].color = this.getRandomColor(chart.data.length, i);
              }
              this._radar.addSeries({
                value: `#serie${i}#`,
                fill: chart.data[i].color,
                disableLines: cfg('line'),
                line: {
                  color: chart.data[i].color,
                  width: 1
                }
              });
            }
            val.push({
              text: chart.data[i].serieLabel,
              color: chart.data[i].color
            });
          }

          break;

        case 'pie':
          var options = {
            view: cfg('pie'),
            container: this._id,
            radius: 220,
            value: '#serie0#',
            color: chart.data[0].color,
            pieInnerText: '<b>#xunit#</b>'
          };
          this._radar = new dhtmlXChart(options);

          break;
      }

      if (cfg('showlegend') == 'true') {
        switch (cfg('legendalign')) {
          case 'top-left':
            this._radar.define('legend', {
              width: 120,
              align: 'left',
              valign: 'top',
              marker: {
                type: cfg('legendmarker'),
                width: 15
              },
              values: val
            });
            break;
          case 'top-right':
            this._radar.define('legend', {
              width: 120,
              align: 'right',
              valign: 'top',
              marker: {
                type: cfg('legendmarker'),
                width: 15
              },
              values: val
            });
            break;
          case 'bottom-left':
            this._radar.define('legend', {
              width: 120,
              align: 'left',
              valign: 'bottom',
              marker: {
                type: cfg('legendmarker'),
                width: 15
              },
              values: val
            });
            break;
          case 'bottom-right':
            this._radar.define('legend', {
              width: 120,
              align: 'right',
              valign: 'bottom',
              marker: {
                type: cfg('legendmarker'),
                width: 15
              },
              values: val
            });
            break;
        }
      }
    }
  });

  return View;
});
