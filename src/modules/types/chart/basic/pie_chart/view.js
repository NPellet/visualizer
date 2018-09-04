'use strict';

define([
  'modules/default/defaultview',
  'src/util/datatraversing',
  'src/util/api',
  'src/util/util',
  'lib/flot/jquery.flot',
  'lib/flot/jquery.flot.pie'
], function (Default, Traversing, API, Util) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init: function () {
      // When we change configuration the method init is called again. Also the case when we change completely of view
      if (!this.dom) {
        this._id = Util.getNextUniqueId();
        this.dom = $(`<div id="${this._id}"></div>`)
          .css('height', '100%')
          .css('width', '100%');
        this.module.getDomContent().html(this.dom);
      }

      if (this.dom) {
        // in the dom exists and the preferences has been changed we need to clean the canvas
        this.dom.empty();
      }
      if (this._flot) {
        // if the dom existedd there was probably a rgraph or when changing of view
        delete this._flot;
      }

      // Adding a deferred allows to wait to get actually the data before we draw the chart
      // we decided here to plot the chart in the "onResize" event
      this.loadedData = $.Deferred();

      this.updateOptions();

      this._data = []; // the data that will be sent to FLOT

      this.resolveReady();
    },

    onResize: function () {
      var that = this;
      // the size is now really defined (we are after inDom)
      // and we received the data ...
      this.loadedData.done(function () {
        that._plot = $.plot(`#${that._id}`, that._data, that._options);

        $(`#${that._id}`).bind('plotclick', function (event, pos, item) {
          if (item) {
            // TODO handle click?
          }
        });
        $(`#${that._id}`).bind('plothover', function (event, pos, item) {
          if (item) {
            that.module.controller.elementHover(that._data[item.seriesIndex]);
          } else {
            that.module.controller.elementOut();
          }
        });

        API.killHighlight(that.module.getId());

        for (var i = 0; i < that._data.length; i++) {
          if (!that._data[i]._highlight) continue;
          (function (i) {
            API.listenHighlight(
              that._data[i],
              function (onOff, key) {
                // we need to highlight the correct shape ...
                if (onOff) {
                  // that.module.controller.elementHover(that._data[i]);
                  that._plot.highlight(0, i);
                } else {
                  // that.module.controller.elementOut();
                  that._plot.unhighlight(0, i);
                }
              },
              false,
              that.module.getId()
            );
          })(i);
        }
      });
    },

    /* When a vaue change this method is called. It will be called for all
         possible received variable of this module.
         It will also be called at the beginning and in this case the value is null !
         */
    update: {
      chart: function (moduleValue) {
        if (!moduleValue || !moduleValue.value) return;

        this._convertChartToData(moduleValue.get());

        // data are ready to be ploteed
        this.loadedData.resolve();

        this.onResize();
      },
      yArray: function (moduleValue) {
        this._data = moduleValue.get();
        this.loadedData.resolve();

        this.onResize();
      }
    },

    _convertChartToData: function (value) {
      this._data = [];
      var that = this;
      if (
        !Array.isArray(value.data) ||
        !value.data[0] ||
        !Array.isArray(value.data[0].y)
      )
        return;
      var y = value.data[0].y;
      var highlight = value.data[0]._highlight;
      var infos = value.data[0].info;
      for (let i = 0; i < y.length; i++) {
        this._data[i] = {
          data: y[i]
        };
        if (Array.isArray(highlight) && highlight.length > i) {
          if (Array.isArray(highlight[i])) {
            this._data[i]._highlight = highlight[i];
          } else {
            this._data[i]._highlight = [highlight[i]];
          }
        }
        if (Array.isArray(infos) && infos.length > i) {
          // Data can be retrieved async so to fetch an information from the "info" object we need this strange code
          Traversing.getValueFromJPath(infos[i], 'element.name').done(function (
            elVal
          ) {
            that._data[i].label = elVal;
            that._data[i].info = infos[i];
          });
        }
      }
    },

    updateOptions() {
      this._options = {
        grid: {
          clickable: true,
          hoverable: true
        },
        series: {
          pie: {
            show: true
          }
        }
      };

      this._options.test = this.module.getConfiguration('nodeSize') || 1;
    }
  });

  return View;
});
