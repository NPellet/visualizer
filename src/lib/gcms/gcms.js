'use strict';

define(['jquery', 'jsgraph'], function ($, Graph) {
  var defaults = {
    msIsContinuous: false,
    title: 'GC-MS',
    onlyOneMS: false,
    gcSize: '50',
    mainColor: 'black',
    roColor: 'rgba(0, 150, 0, 1)',
    aucColor: 'rgba(200, 0, 0, 1)',
    aucColorT: 'rgba(200, 0, 0, 0.3)'
  };

  function GCMS(domGC, domMS, options) {
    this.options = $.extend(true, {}, defaults, options);

    this.sizeFactor = parseFloat(this.options.gcSize) / 100;

    // A GC can have more than 1 serie
    this.gcData = null;
    this.gcTimes = null;
    this.gcSerie = null;
    this.msSerieMouseTrack = null;

    this.gcDataRO = null;
    this.gcTimesRO = null;
    this.gcSerieRO = null;
    this.msSerieMouseTrackRO = null;

    // Contains the ms Data
    this.msData = null;
    this.msDataRO = null;

    this.domGC = domGC;
    this.domMS = domMS;

    this.firstMsSerie = true;

    this.init();

    this.aucs = [];
  }

  GCMS.prototype = {
    init: function () {
      var that = this;
      var optionsGc = {
        paddingTop: 25,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,
        close: true,
        title: this.options.title,

        plugins: {
          zoom: { zoomMode: 'x' },
          shape: {
            type: 'areaundercurve',
            fillColor: this.options.aucColorT,
            strokeColor: this.options.aucColor,
            strokeWidth: 2
          }
        },
        mouseActions: [
          {
            plugin: 'zoom',
            shift: false,
            ctrl: false
          },
          {
            plugin: 'shape',
            shift: true,
            ctrl: false
          },
          {
            plugin: 'zoom',
            type: 'dblclick',
            options: {
              mode: 'total'
            }
          },
          {
            plugin: 'zoom',
            type: 'mousewheel',
            options: {
              direction: 'y'
            }
          }
        ],

        onAnnotationRemove: function (annot) {
          switch (annot.type) {
            case 'surfaceUnderCurve':
              that.trigger('AUCRemoved', [this]);
              break;
          }
        },

        onAnnotationUnselect: function (annot) {
          that.killMsFromAUC();
        },
        onMouseMoveData: function (event, val) {
          if (that.lockTrackingLine) {
            return;
          }

          var i = Object.keys(val)[0];

          if (val[i] == undefined || (!that.msData && !that.msDataRO)) {
            return;
          }

          var x = val[i].xIndexClosest;

          if (x) {
            that.recalculateMSMove(x);
          }
        }
      };

      var axisGc = {
        bottom: [
          {
            labelValue: 'Time',
            unitModification: 'time:min.sec',
            primaryGrid: false,
            nbTicksPrimary: 10,
            secondaryGrid: false,
            axisDataSpacing: { min: 0, max: 0.1 },

            onZoom: function (from, to) {
              // Zoom on GC has changed
              that.trigger('onZoomGC', [from, to]);
            }
          }
        ],
        left: [
          {
            labelValue: 'Intensity (-)',
            ticklabelratio: 1,
            primaryGrid: true,
            secondaryGrid: false,
            nbTicksPrimary: 3,
            exponentialFactor: -7,
            forcedMin: 0,
            display: false
          }
        ]
      };

      var optionsMs = {
        paddingTop: 5,
        paddingBottom: 0,
        paddingLeft: 20,
        paddingRight: 20,

        shapeSelection: 'multiple',

        close: true,

        plugins: {
          zoom: { zoomMode: 'x' }
        },

        mouseActions: [
          {
            plugin: 'zoom',
            shift: false,
            ctrl: false
          },
          {
            plugin: 'zoom',
            type: 'mousewheel',
            options: {
              direction: 'y'
            }
          },
          {
            plugin: 'zoom',
            type: 'dblclick',
            options: {
              mode: 'total'
            }
          }
        ]

        /*
                 onAnnotationMake: function( annot ) {

                 annot._msIon = new DataObject({
                 name: annot.id,
                 data: [],
                 lineColor: annot.fillColor || annot.strokeColor,
                 lineWidth: '2'
                 });

                 this.options.onAnnotationChange(annot);
                 that.onAnnotationMake(annot);
                 },

                 onAnnotationChange: function( annot ) {

                 var annot = new DataObject(annot, true);

                 var val = annot.position[0].x,
                 index,
                 index2,
                 val,
                 target = [];


                 for(var i = 0, l = that.msData.length; i < l; i++) {

                 index = that.searchBinaryIndexMs(i, val),
                 index2 = index,
                 valAdd = 0;

                 while(that.msData[i][index2] > val - 0.3) {
                 valAdd += that.msData[i][index2 + 1];
                 index2 -= 2;
                 }

                 index2 = index + 2;

                 while(that.msData[i][index2] < val + 0.7) {
                 valAdd += that.msData[i][index2 + 1];
                 index2 += 2;
                 }

                 target.push(that.gcData[i * 2]);
                 target.push(valAdd);
                 }

                 annot._msIon.data = target;
                 annot._msIon.triggerChange();


                 //that.onAnnotationChange();
                 }*/
      };
      var axisMs = {
        bottom: [
          {
            labelValue: 'm/z',
            unitModification: false,

            primaryGrid: false,
            nbTicksPrimary: 10,
            nbTicksSecondary: 4,
            secondaryGrid: false,
            axisDataSpacing: { min: 0, max: 0.1 },

            onZoom: function (from, to) {
              if (that.onZoomMS) {
                that.onZoomMS(from, to);
              }
            }
          }
        ],

        left: [
          {
            labelValue: 'Intensity (-)',
            ticklabelratio: 1,
            primaryGrid: true,
            nbTicksSecondary: 4,
            secondaryGrid: false,
            scientificTicks: true,
            nbTicksPrimary: 3,
            forcedMin: 0,
            display: false,
            axisDataSpacing: { min: 0, max: 0.2 }
          }
        ],

        right: [
          {
            primaryGrid: false,
            secondaryGrid: false,
            nbTicksSecondary: 5,
            display: false,
            axisDataSpacing: { min: 0, max: 0.2 }
          }
        ]
      };

      this.gcGraph = new Graph(this.domGC, optionsGc, axisGc);

      this.setupGCEvents();

      this.msGraph = new Graph(this.domMS, optionsMs, axisMs);

      this.msGraph.getBottomAxis().zoom(0, 100);
      this.msGraph.getLeftAxis().zoom(0, 1);

      this.gcGraph.redraw();
      this.msGraph.redraw();

      this.gcGraph.on('click', function (event) {
        // todo what is this?
        // e = e[3];
        // if (e.target.nodeName === 'path' || e.target.nodeName === 'text') {
        // }
        // that.lockTrackingLine = !that.lockTrackingLine;
      });

      var shape = this.gcGraph.newShape({
        type: 'line',
        position: [{ x: 100, y: 'min' }, { x: 100, y: 'max' }],
        strokeColor: 'rgba(0, 0, 0, 1)',
        strokeWidth: 2
      });

      that.trackingLineGC = shape;
      shape.draw();
      shape.lock();
      shape.redraw();

      this.msGraph.on('shapeSelect', function (shape) {
        that.msShapesSelectChange();
      });

      this.msGraph.on('shapeUnselect', function (shape) {
        that.msShapesSelectChange();
      });

      this.gcGraph.on('shapeSelect', function (shape) {
        var data = shape.getProperties();
        if (data.type === 'areaundercurve') {
          that.trigger('AUCSelected', data);
        }
      });

      this.gcGraph.getXAxis().on('zoom', function () {
        that.gcGraph.getYAxis().scaleToFitAxis();
      });
      /*
             this.gcGraph.shapeHandlers.onSelected.push( function( shape ) {
             that.doMsFromAUC( shape.data, shape );
             } );
             */

      this.lockTrackingLine = false;
    },

    setupGCEvents() {
      var graph = this.gcGraph;

      graph.on('shapeNew', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.aucs.push(shape);
          this.trigger('AUCCreated', [shape]);
        }
      });

      graph.on('shapeSelected', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.doMsFromAUC(shape);
          this.trigger('AUCSelected', [shape]);
        }
      });

      graph.on('shapeUnselected', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.trigger('AUCUnselected', [shape]);
        }
      });

      graph.on('shapeChanged', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.doMsFromAUC(shape);
          this.trigger('AUCChanged', [shape]);
        }
      });

      graph.on('shapeMouseOver', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.doMsFromAUC(shape);
        }
      });

      graph.on('shapeMouseOut', (shape) => {
        if (shape.type === 'areaundercurve') {
          this.clearMsFromAuc();
        }
      });

      /*
             this.gcGraph.shapeHandlers.onAfterMoved.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             that.doMsFromAUC(shape.data, shape);
             that.trigger('AUCChange', shape);
             });

             this.gcGraph.shapeHandlers.onAfterResized.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             that.doMsFromAUC(shape.data, shape);
             that.trigger('AUCChange', shape);
             });

             this.gcGraph.shapeHandlers.onRemoved.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             that.trigger('AUCRemoved', shape);
             });*/
    },

    msShapesSelectChange: function () {
      var shapes = this.msGraph.selectedShapes;

      this.trigger('MZChange', [
        shapes.map(function (shape) {
          return shape.data.mz;
        })
      ]);
    },

    resize: function (w, h) {
      var h1 = h * this.sizeFactor;
      var h2 = h * (1 - this.sizeFactor);

      this.gcGraph.resize(w, h1);
      this.msGraph.resize(w, h2);

      this.gcGraph.drawSeries();
      this.msGraph.drawSeries();

      this.gcGraph._dom.style.height = `${h1}px`;
      this.msGraph._dom.style.height = `${h2}px`;
    },

    doMsFromAUC: function (annot, shape) {
      // Creating an averaged MS on the fly
      if (!this.gcSerie) return;

      var data = annot.getProperties();
      var that = this;
      var xStart = data.position[0].x;
      var xEnd = data.position[1].x;
      var indexStart = that.gcSerie.searchClosestValue(xStart).xBeforeIndex;
      var indexEnd = that.gcSerie.searchClosestValue(xEnd).xBeforeIndex;
      var indexMin = Math.min(indexStart, indexEnd);
      var indexMax = Math.max(indexStart, indexEnd);
      var obj = [];
      var allMs = [];
      var i;
      var j;
      var l;
      var floor;
      var finalMs = [];

      if (indexMax === indexMin) {
        return;
      }

      for (i = indexMin; i <= indexMax; i++) {
        for (j = 0, l = that.msData[i][0].length; j < l; j++) {
          floor = Math.floor(that.msData[i][0][j] + 0.3);
          if (obj[floor]) {
            obj[floor] += that.msData[i][1][j];
          } else {
            obj[floor] = that.msData[i][1][j];
            allMs.push(floor);
          }
        }
      }

      allMs.sort((a, b) => a - b);

      for (i = 0; i < allMs.length; i++) {
        finalMs.push(allMs[i]);
        finalMs.push(Math.round(obj[allMs[i]] / Math.abs(indexMax - indexMin)));
      }

      var buffer;
      if (this.options.onlyOneMS) {
        buffer = that;

        if (this.extMS) {
          this.extMS.kill(true);
          this.extMS = false;
        }
      } else {
        buffer = shape;
      }

      if (!buffer.msFromAucSerie) {
        buffer.msFromAucSerie = this.msGraph
          .newSerie('fromAUC', {
            autoPeakPicking: true,
            lineToZero: !this.options.msIsContinuous,
            autoPeakPickingNb: 10
          })
          .autoAxis()
          .setYAxis(that.msGraph.getRightAxis())
          .setLineWidth(1.5);
      }

      buffer.msFromAucSerie.setData(finalMs);
      buffer.msFromAucSerie.setLineColor(
        annot.strokeColor || annot.fillColor || this.options.aucColor
      );

      // that.msGraph._updateAxes();

      if (this.firstMsSerie) {
        that.msGraph.getBottomAxis().setMinMaxToFitSeries();
        this.firstMsSerie = false;
      }

      that.msGraph
        .getRightAxis()
        .scaleToFitAxis(
          that.msGraph.getBottomAxis() /* , buffer.msFromAucSerie */
        );

      that.msGraph.redraw();
      that.msGraph.drawSeries();

      that.trigger('onMsFromAUCChange', [
        finalMs,
        annot,
        buffer.msFromAucSerie
      ]);
    },

    clearMsFromAuc() {
      if (this.msFromAucSerie) {
        this.msFromAucSerie.setData([]);
        this.msFromAucSerie.draw();
      }
    },

    addAUC: function (from, to, options) {
      var that = this,
        obj = {
          position: [{ x: from }, { x: to }],

          type: 'areaundercurve',
          fillColor: this.options.aucColorT,
          strokeColor: this.options.aucColor,
          strokeWidth: 2,
          selectable: true
        };

      if (options.color) {
        obj.fillColor = options.color;
      }

      if (options.linecolor) {
        obj.strokeColor = options.linecolor;
      }

      this.gcGraph.newShape(obj).then(function (shape) {
        shape.setSerie(that.gcGraph.getSerie(0));

        shape.draw();
        shape.redraw();

        that.aucs.push(shape);
      });

      return obj;
    },

    killAllAUC: function () {
      var that = this;
      this.aucs.map(function (auc) {
        auc.kill();

        if (that.options.onlyOneMS) {
          if (that.msFromAucSerie) {
            that.msFromAucSerie.kill();
          }
        } else {
          if (auc.msFromAucSerie) {
            auc.msFromAucSerie.kill();
          }
        }
      });

      this.aucs = [];
    },

    killMsFromAUC: function () {
      /* return;
            if (!this.msFromAucSerie) {
                return;
            }

            this.msFromAucSerie.kill(true);
            this.msFromAucSerie = false;*/
    },

    kill: function () {
      this.gcGraph.kill();
      this.msGraph.kill();
    },

    zoomOnGC: function (start, end, y) {
      this.gcGraph
        .getBottomAxis()
        .zoom(start - (end - start) * 0.4, end + (end - start) * 0.4);
      this.gcGraph
        .getLeftAxis()
        .scaleToFitAxis(this.gcGraph.getBottomAxis(), start, end);

      this.gcGraph.redraw();
      this.gcGraph.drawSeries();
    },

    setMSContinuous: function (cont) {
      this.options.msIsContinuous = cont;
    },

    getGC: function () {
      return this.gcGraph;
    },

    getMS: function () {
      return this.msGraph;
    },

    blank: function () {
      if (!this.gcSerie) return;

      this.gcGraph.removeShapes();
      this.gcSerie.kill();
      this.gcSerie = null;
      this.gcData = null;
      this.gcTimes = null;

      if (this.msSerieMouseTrack) {
        this.msSerieMouseTrack.kill(true);
        this.msSerieMouseTrack = null;
      }
    },

    blankRO() {
      if (!this.gcSerieRO) return;

      this.gcSerieRO.kill();
      this.gcSerieRO = null;
      this.gcDataRO = null;
      this.gcTimesRO = null;

      if (this.msSerieMouseTrackRO) {
        this.msSerieMouseTrackRO.kill(true);
        this.msSerieMouseTrackRO = null;
      }
    },

    setGC: function (chromatogram) {
      var that = this;

      if (!this.gcGraph) {
        return;
      }

      this.blank();

      for (var serieName in chromatogram.series) {
        if (serieName !== 'ms') {
          var serie = this.gcGraph
            .newSerie('gc', {
              useSlots: false,
              lineColor: this.options.mainColor
            })
            .autoAxis()
            .setData({
              x: chromatogram.times,
              y: chromatogram.series[serieName].data
            })
            .XIsMonotoneous();
          serie.setLineWidth(1, 'selected');
          this.gcGraph.selectSerie(serie);

          var axis = this.gcGraph.getBottomAxis();
          var from = axis.getCurrentMin();
          var to = axis.getCurrentMax();

          this.trigger('onZoomGC', [from, to]);

          this.gcData = chromatogram.series[serieName].data;
          this.gcTimes = chromatogram.times;
          this.gcSerie = serie;

          break;
        }
      }

      this.aucs.map(function (auc) {
        if (!auc.getSerie()) {
          auc.setSerie(that.gcGraph.getSerie(0));
        }

        auc.redraw();
        auc.setPosition();
      });

      this.gcGraph.autoscaleAxes();
      this.gcGraph.draw();
      this.gcGraph.drawSeries();
    },

    setGCRO(chromatogram) {
      if (!this.gcGraph) {
        return;
      }

      this.blankRO();

      for (var serieName in chromatogram.series) {
        if (serieName !== 'ms') {
          var serie = this.gcGraph
            .newSerie('gcro', {
              useSlots: false,
              selectable: false,
              lineColor: this.options.roColor
            })
            .autoAxis()
            .setData({
              x: chromatogram.times,
              y: chromatogram.series[serieName].data
            })
            .XIsMonotoneous();

          this.gcDataRO = chromatogram.series[serieName].data;
          this.gcTimesRO = chromatogram.times;
          this.gcSerieRO = serie;

          break;
        }
      }

      this.gcGraph.autoscaleAxes();
      this.gcGraph.draw();
      this.gcGraph.drawSeries();
    },

    setMS: function (ms) {
      var minX = Infinity;
      var maxX = -Infinity;
      for (var t = 0; t < ms.length; t++) {
        for (var m = 0; m < ms[t][0].length; m++) {
          if (ms[t][0][m] > maxX) {
            maxX = ms[t][0][m];
          }
          if (ms[t][0][m] < minX) {
            minX = ms[t][0][m];
          }
        }
      }
      this.msGraph
        .getBottomAxis()
        .forceMin(minX)
        .forceMax(maxX);
      this.msData = ms;
    },

    setMSRO(ms) {
      this.msDataRO = ms;
    },

    trigger: function (func, params) {
      if (!Array.isArray(params)) {
        params = [params];
      }

      if (this.options[func]) {
        this.options[func].apply(this, params);
      }
    },

    setMSIndexData: function (x) {
      this.recalculateMSMove(x);
    },

    recalculateMSMove: function (x) {
      var ms = this.msData ? this.msData[x] : null;
      var msro = this.msDataRO ? this.msDataRO[x] : null;

      this.trigger('MSChangeIndex', [x, ms]);

      if (!this.msSerieMouseTrack) {
        this.msSerieMouseTrack = this.msGraph
          .newSerie('ms', {
            lineToZero: !this.options.msIsContinuous,
            lineColor: this.options.mainColor
          })
          .autoAxis();
      }

      if (!this.msSerieMouseTrackRO) {
        this.msSerieMouseTrackRO = this.msGraph
          .newSerie('msro', {
            lineToZero: !this.options.msIsContinuous,
            lineColor: this.options.roColor
          })
          .autoAxis();
      }

      var xVal = this.gcTimes ? this.gcTimes[x] : this.gcTimesRO[x];

      var trackData = this.trackingLineGC.getProperties();
      trackData.position[0].x = xVal;
      trackData.position[1].x = xVal;

      this.trackingLineGC.redraw();

      if (!ms && !msro) {
        return;
      }

      if (ms) {
        this.msSerieMouseTrack.setData({
          x: ms[0],
          y: ms[1]
        });
      }

      if (msro) {
        this.msSerieMouseTrackRO.setData({
          x: msro[0],
          y: msro[1]
        });
      }

      if (this.firstMsSerie) {
        this.msGraph.getBottomAxis().setMinMaxToFitSeries();
        this.firstMsSerie = false;
      }

      this.msGraph.draw();

      if (!isNaN(this.msGraph.getBottomAxis().getMinValue())) {
        this.msGraph.getLeftAxis().setMinMaxToFitSeries();
      } else {
        this.msGraph.autoscaleAxes();
      }

      this.msGraph.redraw();
      this.msSerieMouseTrack.draw();
    }
  };

  return GCMS;
});
