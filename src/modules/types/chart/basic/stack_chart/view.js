'use strict';

define([
  'modules/default/defaultview',
  'src/util/datatraversing',
  'src/util/api',
  'src/util/util',
  'lib/flot/jquery.flot'
], function (Default, Traversing, API, Util) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      if (this.dom) {
        // in the dom exists and the preferences has been changed we need to clean the canvas
        this.dom.empty();
      }
      // When we change configuration the method init is called again. Also the case when we change completely of view
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(
          `<p id="choices${
            this._id
          }" style="float:right; width:15%;"><br></p><div style="height: 100%;width: 80%" id="${
            this._id
          }"></div>`
        );
        this.module.getDomContent().html(this.dom);
      }
      // if the dom existed there was probably a graph or when changing of view
      if (this._flot) {
        delete this._flot;
      }

      // Adding a deferred allows to wait to get actually the data before we draw the chart
      // we decided here to plot the chart in the 'onResize' event
      this.loadedData = $.Deferred();

      this._data = []; // the data that will be sent to FLOT
      let cfg = this.module.getConfiguration;
      let axis;
      let x;
      this.updateOptions(cfg, axis, x);

      this.resolveReady();
    },

    onResize: function () {
      let that = this;

      this.loadedData.done(function () {
        this._plot = that.plot(that._id, that._data, that._options);
        let choiceContainer = $(`#choices${that._id}`);
        choiceContainer.empty();

        $.each(that._data, function (key, val) {
          choiceContainer.append(
            `<br/><input type='checkbox' name='${key}' checked='checked' id='id${key}'></input>` +
              `<label for='id${key}'>${val.label}</label>`
          );
        });

        choiceContainer.find('input').bind('click', function (event, pos, item) {
          that.plotAccordingToChoices(choiceContainer, that._id);
        });
      });
    },

    /* When a value change this method is called. It will be called for all
         possible received variable of this module.
         It will also be called at the beginning and in this case the value is null !
         */
    update: {
      chart: function (moduleValue) {
        let cfg = this.module.getConfiguration;

        this._convertChartToData(moduleValue.get().data);
        let axis = moduleValue.get().axis;
        let x = moduleValue.get().data[0].x;
        this.updateOptions(cfg, axis, x);
        this._plot = this.plot(this._id, this._data, this._options);

        this.loadedData.resolve();
      }
    },

    _convertChartToData: function (value) {
      this._data = [];
      if (!Array.isArray(value) || !value || !Array.isArray(value.x)) return;

      for (let j = 0; j < value.length; j++) {
        let x = value[j].x;
        let y = value[j].y;
        let highlight = value[j]._highlight;
        let info = value[j].serieLabel;
        let label = value[j].info[0].name;
        let s = [];

        for (let i = 0; i < y.length; i++) {
          if ($.isNumeric(x[i]))
            s.push({
              0: x[i],
              1: y[i],
              _highlight: highlight[i]
            });
          else s.push({ 0: i, 1: y[i], _highlight: highlight[i] });
        }

        this._data[j] = {
          data: s,
          info: info,
          label: label
        };
        /* Traversing.getValueFromJPath(info[0],'element.name').done(function(elVal) {
                 self._data[j].label=elVal;
                 self._data[j].info=value[j].info
                 }); */
      }
    },

    updateOptions: function (cfg, axis, x) {
      let posx = null;
      let posy = null;
      let xmin = null;
      let ymin = null;
      let xmax = null;
      let ymax = null;
      let xunit = null;
      let yunit = null;
      if (undefined != axis) {
        posx = axis[0].type;
        posy = axis[1].type;
        xmax = axis[0].max;
        ymax = axis[1].max;
        xmin = axis[0].min;
        ymin = axis[1].min;
        if (Array.isArray(x)) {
          var u = [];
          for (var i = 0; i < x.length; i++) {
            u.push([i, x[i]]);
          }
          xunit = u;
        }
        if (Array.isArray(axis[1].unit)) {
          u = [];
          for (i = 0; i < axis[1].unit.length; i++) {
            u.push([i, axis[1].unit[i]]);
          }
          yunit = u;
        }
      }
      let steps = false;
      let bars = false;
      let lines = false;
      let stack = cfg('stack');
      let barWidth = cfg('barWidth');
      let xlab = cfg('xLabel');
      let ylab = cfg('yLabel');
      let xlabh = cfg('xLabelHeight');
      let xlabw = cfg('xLabelWidth');
      let ylabh = cfg('yLabelHeight');
      let ylabw = cfg('yLabelWidth');

      switch (cfg('preference')) {
        case 'Lines With Steps':
          steps = true;
          lines = true;
          break;
        case 'Bars':
          bars = true;
          break;
        case 'Lines':
          lines = true;
          break;
      }

      this._options = {
        xaxis: {
          show: true,
          position: posx,
          min: xmin,
          max: xmax,
          tickFormatter: function (val, axis) {
            return val < axis.max ? val.toFixed(2) : xlab;
          },
          ticks: xunit,
          labelWidth: xlabw,
          labelHeight: xlabh
        },
        yaxis: {
          position: posy,
          min: ymin,
          max: ymax,
          ticks: yunit,
          tickFormatter: function (val, axis) {
            return val < axis.max ? val.toFixed(2) : ylab;
          },
          labelWidth: ylabw,
          labelHeight: ylabh
        },
        grid: {
          clickable: true,
          hoverable: true
        },
        series: {
          stack: stack,

          lines: { show: lines, fill: cfg('fill'), steps: steps },
          bars: { show: bars, barWidth: barWidth }
        }
      };
    },

    plot: function (id, data, options) {
      let that = this;
      this._plot = $.plot(`#${id}`, data, options);
      $(`#${id}`).bind('plotclick', function (event, pos, item) {
        event.preventDefault();
      });
      $(`#${id}`).bind('plothover', function (event, pos, item) {
        if (item) {
          that.module.controller.elementHover(
            that._data[item.seriesIndex].data[item.dataIndex]
          );
        } else {
          that.module.controller.elementOut();
        }
      });
    },
    plotAccordingToChoices: function (choiceContainer, id) {
      let that = this;
      let data = [];
      choiceContainer.find('input:checked').each(function () {
        let key = $(this).attr('name');
        if (key && that._data[key]) {
          data.push(that._data[key]);
        }
      });

      if (data.length > 0) {
        this.plot(id, data, that._options);
      }
    }
  });

  return View;
});
