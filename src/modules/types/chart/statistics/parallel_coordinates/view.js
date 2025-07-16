'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'src/util/datatraversing',
  'src/util/context',
  'lib/d3/d3.parcoords',
  'src/util/api',
  'src/util/ui',
  'lodash',
], function (Default, Util, Traversing, Context, d3, API, ui, _) {
  function View() {
    this._id = Util.getNextUniqueId();
    this._value = new DataArray();
    this._addedColumns = {};
    this._currentColumns = {};
    this._previousColumns = [];
  }

  Util.loadCss('lib/d3/d3.parcoords.css');

  $.extend(true, View.prototype, Default, {
    inDom() {
      this.dom = ui.getSafeElement('div').attr({
        id: this._id,
        class: 'parcoords',
      });
      var that = this;
      Context.listen(this.dom[0], [
        [
          '<li><a><span class="ui-icon ui-icon-refresh"></span>Reset selection</a></li>',
          function () {
            that.resetBrush();
          },
        ],
      ]);

      this.jpathConfig = $.extend(
        true,
        [],
        this.module.getConfiguration('colsjPaths'),
      );

      this.preventHighlight = this.module.getConfigurationCheckbox(
        'options',
        'hide',
      );

      this.module.getDomContent().html(this.dom);
      this.resolveReady();
    },
    blank: {
      value() {
        if (this.dom) this.dom.empty();
      },
      columns() {
        for (var i = 0; i < this._previousColumns.length; i++) {
          delete this._currentColumns[this._previousColumns[i].name];
        }
        this._previousColumns = [];
      },
    },
    update: {
      value(value) {
        if (!value) {
          this._value = [];
        } else {
          value = value.get();
          if (value.length === 0) {
            this._value = [];
          } else {
            this._value = value.resurrect();
          }
        }

        this.redrawChart();
      },
      columns(value) {
        if (!Array.isArray(value)) return;

        for (var i = 0; i < value.length; i++) {
          this._currentColumns[value[i].name] = value[i];
        }
        this._previousColumns = value;
        this.redrawChart();
      },
    },
    onActionReceive: {
      addColumn(value) {
        if (value && value.name && value.jpath) {
          this._addedColumns[value.name] = value;
          this.redrawChart();
        }
      },
      removeColumn(value) {
        if (value && value.name) {
          delete this._addedColumns[value.name];
          this.redrawChart();
        }
      },
    },
    onResize() {
      this.dom.css('width', this.width - 2);
      this.redrawChart();
    },
    redrawChart() {
      var that = this;
      this.createIntermediateData();
      this.dom.empty();

      function exportBrush(d) {
        that.module.controller.onBrushSelection(d);
      }

      if (this._data && this._data.length > 0) {
        var cfg = this.module.getConfiguration;
        var cfgCb = this.module.getConfigurationCheckbox;

        this.parcoords = d3.parcoords()(`#${this._id}`);
        var parcoords = this.parcoords;

        parcoords.data(this._data);
        parcoords.detectDimensions();
        if (this._names) {
          parcoords.dimensions(this._names);
        }

        if (this._color) {
          parcoords.color(this._color);
        }

        if (this._data.length > 1000) {
          parcoords.mode('queue');
          parcoords.rate(200);
        }

        parcoords.render();

        var mode = cfg('brushMode');
        parcoords.brushMode(mode);
        if (mode !== 'None') {
          parcoords.brushPredicate(cfg('brushPredicate'));
        }

        if (cfgCb('options', 'reorder')) {
          parcoords.reorderable();
        }
        if (cfgCb('options', 'shadow')) {
          parcoords.shadows();
        }

        if (!cfgCb('options', 'brush')) {
          parcoords.on('brush', exportBrush);
        }

        parcoords.on('brushend', exportBrush);

        this._parcoords = parcoords;
      } else {
        this.dom.html('No column to display');
      }
      this.module.controller.onBrushSelection(this._data);
    },
    createIntermediateData() {
      var columns = this.getColumns(),
        l = columns.length,
        colorJpath = this.module.getConfiguration('colorjpath'),
        that = this;

      if (colorJpath) {
        colorJpath = Util.makejPathFunction(colorJpath);
        this._color = function getItemColor(item) {
          return item.__color ? item.__color : '#000';
        };
      }

      var value = this._value,
        vl = value.length;

      API.killHighlight(this.module.getId());
      this._highlighted = [];

      if (!vl) {
        this._data = [];
        return;
      }

      var i;
      var newValue = new Array(vl);
      var names = new Array(l);

      for (i = 0; i < l; i++) {
        names[i] = columns[i].name.toString();
      }
      this._names = names;

      var newVal, val;
      for (let i = 0; i < vl; i++) {
        newVal = {};
        val = value[i];
        newValue[i] = newVal;

        API.listenHighlight(
          val,
          function (onOff) {
            if (onOff) {
              // add highlight
              that._highlighted.push(that._data[i]);
            } else {
              that._highlighted.splice(
                that._highlighted.indexOf(that._data[i], 1),
              );
            }
            that.updateHighlight();
          },
          false,
          that.module.getId(),
        );

        for (var j = 0; j < l; j++) {
          var theVal = columns[j].jpathF(val);
          newVal[columns[j].name] = theVal ? theVal.valueOf() : theVal;
        }
        if (colorJpath) {
          newVal.__color = colorJpath(val) || '#000000';
        }
        newVal.__id = i;
      }
      this._data = newValue;
    },
    getColumns() {
      var totalConfig = [],
        i;
      var objConfig = {};
      var config = this.jpathConfig;
      if (config) {
        for (i = 0; i < config.length; i++) {
          if (config[i].jpath) {
            objConfig[config[i].name] = $.extend(true, {}, config[i]);
          }
        }
      }

      $.extend(objConfig, this._currentColumns, this._addedColumns);

      for (i in objConfig) {
        totalConfig.push(objConfig[i]);
      }

      for (i = 0; i < totalConfig.length; i++) {
        if (typeof totalConfig[i].jpathF === 'function') continue;
        Object.defineProperty(totalConfig[i], 'jpathF', {
          value: Util.makejPathFunction(totalConfig[i].jpath),
        });
      }
      return totalConfig;
    },
    resetBrush() {
      if (this._parcoords) {
        this._parcoords.brushReset();
        this.module.controller.onBrushSelection(this._data);
      }
    },
    updateHighlight: _.throttle(function () {
      let toHighlight = this._highlighted;
      if (this.preventHighlight) {
        toHighlight = [];
        const brushed = this.parcoords.brushed();
        for (let i = 0; i < this._highlighted.length; i++) {
          if (brushed.includes(this._highlighted[i])) {
            toHighlight.push(this._highlighted[i]);
          }
        }
      }
      if (toHighlight.length > 0) {
        this.parcoords.highlight(toHighlight);
      } else {
        this.parcoords.unhighlight();
      }
    }, 20),
  });

  return View;
});
