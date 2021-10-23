'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'src/util/datatraversing',
  'lib/gcms/gcms',
  'jcampconverter',
  'src/util/color'
], function ($, Default, Traversing, GCMS, Converter, Color) {
  function View() {}

  $.extend(true, View.prototype, Default, {

    init: function () {
      var div1 = document.createElement('div');
      var div2 = document.createElement('div');

      var domGraph = document.createElement('div');

      domGraph.appendChild(div1);
      domGraph.appendChild(div2);

      div2.style.width = '100%';
      div2.style.height = '100px';

      div1.style.width = '100%';
      div1.style.height = '250px';

      this.div1 = div1;
      this.div2 = div2;

      this.dom = domGraph;
      this.module.getDomContent().html(domGraph);
      this.resolveReady();
    },

    inDom: function () {
      var that = this;
      var getConfig = (name) => {
        var value = this.module.getConfiguration(name);
        return Color.array2rgba(value);
      };
      var aucColor = getConfig('auccolor');
      var autColorT = aucColor.replace(/,[^,]+\)$/, ', 0.3)');

      this.gcmsInstance = new GCMS(this.div1, this.div2, {
        gcSize: this.module.getConfiguration('gcsize'),
        mainColor: getConfig('maincolor'),
        roColor: getConfig('rocolor'),
        aucColor: aucColor,
        aucColorT: autColorT,


        onMsFromAUCChange: function (ms) {
          that.module.controller.createDataFromEvent('onMSChange', 'ms', ms);
        },

        MZChange: function (ms) {
          that.module.controller.sendActionFromEvent('onMZSelectionChange', 'mzList', ms);
        },

        MSChangeIndex: function (msIndex, ms) {
          that.module.controller.sendActionFromEvent('onMSIndexChanged', 'msIndex', msIndex);
          that.module.controller.createDataFromEvent('onMSIndexChanged', 'msMouse', ms);
        },

        onZoomGC: function (from, to) {
          that.module.controller.sendActionFromEvent('onZoomGCChange', 'fromtoGC', [from, to]);
          that.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (to + from) / 2);
        },

        onlyOneMS: true
      });
    },

    unload: function () {
      this.dom.remove();
    },

    onResize: function () {
      this.gcmsInstance.resize(this.width, this.height);
    },

    blank: {
      jcamp() {
        this.gcmsInstance.blank();
      },
      jcampRO() {
        this.gcmsInstance.blankRO();
      }
    },

    update: {
      jcamp: function (moduleValue) {
        moduleValue = String(moduleValue.get());
        Converter.convert(moduleValue, { chromatogram: true }, true).then((jcamp) => {
          if (jcamp.chromatogram && jcamp.chromatogram.series.ms) {
            this.gcmsInstance.setGC(jcamp.chromatogram);
            this.gcmsInstance.setMS(jcamp.chromatogram.series.ms.data);

            this.module.controller.createDataFromEvent('onJCampParsed', 'msdata', jcamp.chromatogram.series.ms.data);
            this.module.controller.createDataFromEvent('onJCampParsed', 'gcdata', jcamp.chromatogram);

            this.jcamp = jcamp.chromatogram;
          }
        });
      },

      jcampRO: function (moduleValue) {
        moduleValue = String(moduleValue.get());
        Converter.convert(moduleValue, { chromatogram: true }, true).then((jcamp) => {
          if (jcamp.chromatogram && jcamp.chromatogram.series.ms) {
            this.gcmsInstance.setGCRO(jcamp.chromatogram);
            this.gcmsInstance.setMSRO(jcamp.chromatogram.series.ms.data);
          }
        });
      },

      annotationgc: function (value) {
        if (!value) {
          return;
        }

        this.resetAnnotationsGC();
        this.addAnnotations(value);
      }
    },

    getDom: function () {
      return this.dom;
    },

    resetAnnotationsGC: function () {
      if (!this.gcmsInstance) {
        return;
      }

      this.gcmsInstance.killAllAUC();
    },

    addAnnotations: function (a) {
      var that = this;
      a.map(function (source) {
        var shapeData = that.gcmsInstance.addAUC(source.from, source.to, source);
        shapeData._originalSource = source;
      });

      this.annotations = a;
    },


    onActionReceive: {
      fromtoGC: function (value) {
        var from = value.from - Math.abs(value.to - value.from) * 0.1;
        var to = value.to + Math.abs(value.to - value.from) * 0.1;

        this.gcmsInstance.getGC().getBottomAxis()._doZoomVal(from, to, true);
        this.gcmsInstance.getGC().redraw(true, true, false);
        this.gcmsInstance.getGC().drawSeries();

        this.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (to + from) / 2);

        this.gcmsInstance.updateIngredientPeaks();
      },

      fromtoMS: function (value) {
        this.gcmsInstance.getMS().getBottomAxis()._doZoomVal(value.from, value.to, true);
      },

      zoomOnAnnotation: function (value) {
        if (!value.pos && !value.pos2) {
          return;
        }
        this.gcmsInstance.zoomOn(value.pos.x, value.pos2.x, value._max || false);
        this.module.controller.sendActionFromEvent('onZoomGCChange', 'centerGC', (value.pos.x + value.pos2.x) / 2);
        this.gcmsInstance.updateIngredientPeaks();
      },

      centerGC: function (value) {
        var a = this.gcmsInstance.getGC().getBottomAxis();

        var mi = a.getCurrentMin();
        var ma = a.getCurrentMax();

        var interval = Math.abs(ma - mi) / 2;

        a._doZoomVal(value - interval, value + interval, true);
        this.gcmsInstance.getGC().redraw(true, true, false);
        this.gcmsInstance.getGC().drawSeries();
      },

      setMSIndexData: function (x) {
        this.gcmsInstance.setMSIndexData(x);
      }
    }
  });

  return View;
});
