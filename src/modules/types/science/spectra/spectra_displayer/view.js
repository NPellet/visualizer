'use strict';

define([
  'jquery',
  'modules/default/defaultview',
  'jsgraph',
  'json-chart',
  'src/util/api',
  'src/util/color',
  'src/util/debug',
  'src/util/util',
], function ($, Default, Graph, JSONChart, API, Color, Debug, Util) {
  const defaultScatterStyle = {
    shape: 'circle',
    cx: 0,
    cy: 0,
    r: 3,
    height: '5px',
    width: '5px',
    stroke: 'transparent',
    fill: 'black',
  };

  const fullOutMap = {
    x: 'xAxis',
    y: 'yAxis',
    xy: 'both',
  };

  const svgDoctype =
    '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      this.series = {};
      this.seriesDrawn = {};
      this.annotations = {};
      this.dom = $('<div />');
      this.module.getDomContent().html(this.dom);
      this.seriesActions = [];

      this.colorId = 0;
      this.colors = ['red', 'blue', 'green', 'black'];
      this.onchanges = {};
      this.highlightOptions = Object.assign(
        {
          fill: 'black',
        },
        Util.evalOptions(this.module.getConfiguration('highlightOptions')),
      );

      this.serieHiddenState = new Map();
    },

    inDom() {
      var prom = new Promise((resolve) => {
        var cfg = this.module.getConfiguration;
        var cfgCheckbox = this.module.getConfigurationCheckbox;
        var graphurl = cfg('graphurl');

        if (graphurl) {
          $.getJSON(graphurl, {}, (data) => {
            data.options.onMouseMoveData = (event, val) => {
              this.module.controller.sendAction('mousetrack', val);
            };

            resolve(new Graph(this.dom.get(0), data.options, data.axis));
          });
        } else {
          var options = {
            close: {
              top: false,
              right: false,
              bottom: false,
              left: false,
            },
            plugins: {},
            mouseActions: [],
          };

          options.plugins.drag = {};
          options.mouseActions.push({
            plugin: 'drag',
            shift: true,
            ctrl: false,
          });

          var zoom = cfg('zoom');

          let dezoomMode;
          if (zoom === 'x') {
            dezoomMode = 'gradualX';
          } else if (zoom === 'y') {
            dezoomMode = 'gradualY';
          } else {
            dezoomMode = 'gradualXY';
          }

          options.plugins.zoom = {};
          options.mouseActions.push({
            plugin: 'zoom',
            type: 'dblclick',
            options: {
              mode: 'total',
            },
          });
          options.mouseActions.push({
            plugin: 'zoom',
            type: 'dblclick',
            shift: true,
            options: {
              mode: dezoomMode,
            },
          });

          options.plugins.peakPicking = {};

          if (zoom && zoom !== 'none') {
            var zoomOptions = {};
            if (zoom === 'x') {
              zoomOptions.zoomMode = 'x';
            } else if (zoom === 'y') {
              zoomOptions.zoomMode = 'y';
            } else {
              zoomOptions.zoomMode = 'xy';
            }
            if (cfgCheckbox('independantYZoom', 'yes')) {
              zoomOptions.axes = 'serieSelected';
            }
            options.plugins.zoom = zoomOptions;
            options.mouseActions.push({
              plugin: 'zoom',
              shift: false,
              ctrl: false,
            });
          }
          var wheel = cfg('wheelAction');
          if (wheel && wheel !== 'none') {
            var wheelOptions = {
              baseline:
                wheel == 'zoomYMousePos'
                  ? 'mousePosition'
                  : cfg('wheelbaseline', 0),
            };

            if (wheel === 'zoomX') {
              wheelOptions.direction = 'x';
            } else {
              wheelOptions.direction = 'y';
            }

            options.mouseActions.push({
              plugin: 'zoom',
              type: 'mousewheel',
              options: wheelOptions,
            });
          }

          options.mouseActions.push({
            callback: (wheelDelta, event) => {
              this.module.controller.sendActionFromEvent(
                'onMouseWheel',
                'mouseEvent',
                event,
              );
              this.module.controller.sendActionFromEvent(
                'onMouseWheel',
                'wheelDelta',
                wheelDelta,
              );
            },
            type: 'mousewheel',
          });

          options.mouseActions.push({
            callback: (wheelDelta, event) => {
              this.module.controller.sendActionFromEvent(
                'onMouseWheelShift',
                'mouseEvent',
                event,
              );
              this.module.controller.sendActionFromEvent(
                'onMouseWheelShift',
                'wheelDelta',
                wheelDelta,
              );
            },
            shift: true,
            type: 'mousewheel',
          });

          const useMouseTracking = cfgCheckbox('mouseTracking', 'track');
          if (useMouseTracking) {
            options.mouseMoveData = true;
            options.mouseMoveDataOptions = {
              useAxis: cfg('trackingAxis'),
            };
          }

          const selectScatterPlugin = cfgCheckbox('selectScatter', 'yes');
          if (selectScatterPlugin) {
            options.plugins.selectScatter = {};
            options.mouseActions.push({
              plugin: 'selectScatter',
              alt: true,
            });
          }

          var xOptions = {
            nbTicksPrimary: cfg('xnbTicksPrimary', 5),
          };

          if (cfg('xaxismodification') == 'timestamptotime') {
            xOptions.type = 'time';
          } else if (cfg('xaxismodification') == 'valtotime') {
            xOptions.unitModification = 'time';
          } else if (cfg('xaxismodification') == 'valtotime:min.sec') {
            xOptions.unitModification = 'time:min.sec';
          }

          options.mouseMoveDataOptions = {
            useAxis: cfg('trackingAxis'),
          };

          var graph = new Graph(this.dom.get(0), options, {
            bottom: [xOptions],
          });
          this.graph = graph;

          var xAxis = graph.getXAxis(0, xOptions);
          this.xAxis = xAxis;

          // Axes

          xAxis
            .flip(cfg('flipX', false))
            .setPrimaryGrid(cfg('vertGridMain', false))
            .setSecondaryGrid(cfg('vertGridSec', false))
            .setPrimaryGridColor('#DADADA')
            .setSecondaryGridColor('#F0F0F0')
            .setGridLinesStyle() // Force redrawing the grid lines (see https://github.com/NPellet/visualizer/issues/766#issuecomment-172378003)
            .setLabel(cfg('xLabel', ''))
            .forceMin(cfg('minX', false))
            .forceMax(cfg('maxX', false))
            .setAxisDataSpacing(
              cfg('xLeftSpacing', 0),
              cfg('xRightSpacing', 0),
            );
          if (!cfg('displayXAxis', true)) {
            xAxis.hide();
          }
          const xZoomHandler = ([min, max]) => {
            this.module.model.setXBoundaries(min, max);
          };
          xAxis.on('zoom', xZoomHandler);
          xAxis.on('zoomOutFull', xZoomHandler);
          if (cfgCheckbox('FitYToAxisOnFromTo', 'rescale')) {
            xAxis.on('zoom', function () {
              yAxis.scaleToFitAxis(this);
            });
          }

          this.numberOfYAxes = 0;
          var yAxis = this.getYAxis(0);
          this.yAxis = yAxis;

          var legend = cfg('legend', 'none');
          if (legend !== 'none') {
            var theLegend = graph.makeLegend({
              backgroundColor: 'rgba( 255, 255, 255, 0.8 )',
              frame: true,
              frameWidth: '1',
              frameColor: 'rgba( 100, 100, 100, 0.5 )',
              movable: cfgCheckbox('legendOptions', 'movable'),
              isSerieHideable: cfgCheckbox('legendOptions', 'isSerieHideable'),
              isSerieSelectable: cfgCheckbox(
                'legendOptions',
                'isSerieSelectable',
              ),
            });
            theLegend.setAutoPosition(legend);
          }

          if (useMouseTracking) {
            const trackLineOptions = {
              useAxis: cfg('trackingAxis'),
              mode: 'individual',
            };
            const showTracingLegend = cfgCheckbox('mouseTracking', 'legend');
            if (showTracingLegend) {
              Object.assign(trackLineOptions, {
                legend: true,
                legendType: 'common',
              });
            }
            graph.trackingLine(trackLineOptions);
            graph.on('mouseMoveData', (event, result) => {
              this.module.model.trackData = result;
              this.module.controller.sendActionFromEvent(
                'onTrackMouse',
                'trackData',
                result,
              );
              this.module.controller.sendActionFromEvent(
                'onTrackMouse',
                'mouseEvent',
                event,
              );
              this.module.controller.sendActionFromEvent(
                'onTrackMouse',
                'dataAndEvent',
                {
                  data: result,
                  event: event,
                },
              );
              this.module.controller.createDataFromEvent(
                'onTrackMouse',
                'trackData',
                result,
              );
            });
            graph.on('click', (e) => {
              if (this.module.model.trackData) {
                this.module.controller.sendActionFromEvent(
                  'onTrackClick',
                  'trackData',
                  this.module.model.trackData,
                );
                this.module.controller.sendActionFromEvent(
                  'onTrackClick',
                  'mouseEvent',
                  e[3],
                );
                this.module.controller.sendActionFromEvent(
                  'onTrackClick',
                  'dataAndEvent',
                  {
                    data: this.module.model.trackData,
                    event: e[3],
                  },
                );
                this.module.controller.createDataFromEvent(
                  'onTrackClick',
                  'trackData',
                  this.module.model.trackData,
                );
              }
            });
          }

          if (selectScatterPlugin) {
            var plugin = graph.getPlugin('selectScatter');

            plugin.on('selectionEnd', (selectedIndices) => {
              const serie = plugin.options.serie;
              var result = [];
              var info = serie.infos;
              if (info) {
                result = selectedIndices.map((index) => info[index]);
              }
              this.module.controller.onScatterSelection(result);
            });
          }

          graph.draw(true);
          resolve(graph);
        }
      });

      prom
        .then((graph) => {
          this.graph = graph;
          this.xAxis = graph.getXAxis(0);
          this.yAxis = graph.getYAxis(0);

          graph.on('shapeMouseOver', (shape) => {
            this.module.controller.createDataFromEvent(
              'onMouseOverShape',
              'shapeProperties',
              shape.getProperties(),
            );
            this.module.controller.createDataFromEvent(
              'onMouseOverShape',
              'shapeInfos',
              shape.getData(),
            );
            API.highlight(shape.getData(), 1);
          });

          graph.on('shapeMouseOut', (shape) => {
            API.highlight(shape.getData(), 0);
          });

          graph.on('shapeResized', (shape) => {
            this.module.model.dataTriggerChange(shape.getData());
          });

          graph.on('shapeMoved', (shape) => {
            this.module.model.dataTriggerChange(shape.getData());
          });

          graph.on('shapeClicked', (shape) => {
            this.module.controller.createDataFromEvent(
              'onShapeClick',
              'shapeProperties',
              shape.getProperties(),
            );
            this.module.controller.createDataFromEvent(
              'onShapeClick',
              'shapeInfos',
              shape.getData(),
            );
            this.module.controller.sendActionFromEvent(
              'onShapeClick',
              'shapeInfos',
              shape.getData(),
            );
            this.module.controller.sendActionFromEvent(
              'onShapeClick',
              'dataAndEvent',
              {
                data: shape.getData(),
                event: event,
              },
            );
          });

          graph.on('shapeSelected', (shape) => {
            this.module.controller.sendActionFromEvent(
              'onShapeSelect',
              'selectedShape',
              shape.getData(),
            );
          });
          graph.on('shapeUnselected', (shape) => {
            this.module.controller.sendActionFromEvent(
              'onShapeUnselect',
              'shapeInfos',
              shape.getData(),
            );
          });

          this.onResize();
          this.resolveReady();
        })
        .catch((err) => {
          Debug.error('Error loading the graph', err);
        });
    },

    getYAxis(index) {
      if (this.numberOfYAxes > index) {
        return this.graph.getYAxis(index);
      }

      var cfg = this.module.getConfiguration;

      var yAxis;
      for (var i = this.numberOfYAxes; i <= index; i++) {
        var yOptions = {
          nbTicksPrimary: cfg('ynbTicksPrimary', 5),
        };
        yAxis = this.graph.getYAxis(i, yOptions);
        if (i === 0) {
          yAxis
            .setPrimaryGrid(cfg('horGridMain', false))
            .setSecondaryGrid(cfg('horGridSec', false))
            .setPrimaryGridColor('#DADADA')
            .setSecondaryGridColor('#F0F0F0')
            .setGridLinesStyle()
            .setLabel(cfg('yLabel', ''));
          if (!cfg('displayYAxis', true)) {
            yAxis.hide();
          }
          const yZoomHandler = ([min, max]) => {
            this.module.model.setYBoundaries(min, max);
          };
          yAxis.on('zoom', yZoomHandler);
          yAxis.on('zoomOutFull', yZoomHandler);
        } else {
          yAxis
            .setPrimaryGrid(false)
            .setSecondaryGrid(false)
            .setGridLinesStyle()
            .hide();
        }
        yAxis
          .flip(cfg('flipY', false))
          .forceMin(cfg('minY', false))
          .forceMax(cfg('maxY', false))
          .setAxisDataSpacing(cfg('yBottomSpacing', 0), cfg('yTopSpacing', 0));

        this.numberOfYAxes++;
      }

      return yAxis;
    },

    onResize() {
      if (!this.graph) {
        return;
      }
      this.graph.resize(this.width, this.height);
      this.graph.updateLegend();
    },

    shouldAutoscale(varName) {
      if (this.seriesDrawn[varName]) {
        return false;
      } else {
        this.seriesDrawn[varName] = true;
        return true;
      }
    },

    redraw(forceReacalculateAxis, varName) {
      var fullOut;
      if (forceReacalculateAxis) {
        fullOut = 'both';
      } else {
        fullOut = this.module.getConfiguration('fullOut');
        if (varName && fullOut === 'once') {
          if (!this.shouldAutoscale(varName)) {
            fullOut = 'none';
          } else {
            fullOut = 'both';
          }
        }
      }

      this.fullOut(fullOut);
    },

    fullOut(type) {
      switch (type) {
        case 'both':
          this.graph.autoscaleAxes();
          break;
        case 'xAxis':
          this.xAxis.setMinMaxToFitSeries();
          break;
        case 'yAxis':
          this.yAxis.setMinMaxToFitSeries();
          break;
      }

      this.graph.draw();
      this.graph.updateLegend();

      var minX = this.xAxis.getCurrentMin();
      var maxX = this.xAxis.getCurrentMax();
      var minY = this.yAxis.getCurrentMin();
      var maxY = this.yAxis.getCurrentMax();

      this.module.model.setXBoundaries(minX, maxX);
      this.module.model.setYBoundaries(minY, maxY);
    },

    getSerieOptions(varname, highlight, data) {
      let plotinfos = this.module.getConfiguration('plotinfos'),
        others = {},
        options = {
          trackMouse: true,
        };

      highlight = highlight || [];

      if (plotinfos) {
        for (var i = 0, l = plotinfos.length; i < l; i++) {
          if (varname == plotinfos[i].variable) {
            var continuous = plotinfos[i].plotcontinuous;
            if (continuous.startsWith('auto')) {
              continuous = analyzeContinuous(data, continuous);
            }

            if (plotinfos[i].markers[0]) {
              options.markersIndependent = false;
            }

            options.lineToZero = continuous == 'discrete';
            options.strokeWidth = parseInt(plotinfos[i].strokewidth, 10);

            var pp = plotinfos[i].peakpicking[0];
            if (pp) {
              others.peakPicking = true;
            }
          }
        }
      }

      options.onMouseOverMarker = (index, infos, xy) => {
        API.highlightId(highlight[index], 1);
        this.module.controller.onMouseOverMarker(xy, infos);
      };
      options.onMouseOutMarker = (index, infos, xy) => {
        API.highlightId(highlight[index], 0);
        this.module.controller.onMouseOutMarker(xy, infos);
      };
      options.onToggleMarker = (xy, infos, toggledOn) => {
        this.module.controller.onClickMarker(xy, infos, toggledOn);
      };

      options.overflowY = this.module.getConfigurationCheckbox(
        'overflow',
        'overflowY',
      );
      options.overflowX = this.module.getConfigurationCheckbox(
        'overflow',
        'overflowX',
      );

      return { options: options, others: others };
    },

    setSerieParameters(serie, varname, options = {}) {
      const {
        highlight,
        style = {},
        styles = { unselected: {}, selected: {} },
      } = options;
      var plotinfos = this.module.getConfiguration('plotinfos');
      const stackVerticalSpacing = this.module.getConfiguration(
        'stackVerticalSpacing',
      );
      var foundInfo = false;
      serie.autoAxis();
      if (this.serieHiddenState.get(varname)) {
        serie.hidden = true;
      } else {
        serie.hidden = false;
      }

      let plotinfosStyle = {};
      if (plotinfos) {
        const axes = new Set();
        for (var plotinfo of plotinfos) {
          axes.add(plotinfo.axis ? Number(plotinfo.axis) : 0);
        }
        const minAxis = Math.min(...axes);
        const nbAxes = axes.size || 1;
        for (var i = 0, l = plotinfos.length; i < l; i++) {
          if (varname == plotinfos[i].variable) {
            foundInfo = true;
            const axisIdx =
              (plotinfos[i].axis ? Number(plotinfos[i].axis) : 0) - minAxis;
            var axis = this.getYAxis(axisIdx);
            const startSpan = axisIdx * stackVerticalSpacing || 0;
            const endSpan = 1 - stackVerticalSpacing * (nbAxes - 1 - axisIdx);
            axis.setSpan(startSpan, endSpan);
            serie.setYAxis(axis);

            if (
              plotinfos[i].adaptTo &&
              String(plotinfos[i].adaptTo) !== 'none'
            ) {
              var other = this.getYAxis(Number(plotinfos[i].adaptTo));
              axis.adaptTo(other, 0, 0);
            }

            plotinfosStyle.lineColor = Color.getColor(plotinfos[i].plotcolor);

            var lineWidth = parseFloat(plotinfos[i].strokewidth);
            if (isNaN(lineWidth)) lineWidth = 1;
            serie.setLineWidth(lineWidth);

            plotinfosStyle.lineStyle = parseInt(plotinfos[i].strokestyle) || 1;

            if (plotinfos[i].markers[0] && serie.showMarkers) {
              var color = style.lineColor || plotinfos[i].plotcolor;
              serie.showMarkers();
              serie.setMarkers([
                {
                  type: parseInt(plotinfos[i].markerShape, 10),
                  zoom: plotinfos[i].markerSize,
                  strokeColor: Color.getColor(color),
                  fillColor: Color.getColor(color),
                  points: 'all',
                },
              ]);
            }

            if (plotinfos[i].degrade) {
              serie.degrade(plotinfos[i].degrade);
            }

            if (plotinfos[i].tracking && plotinfos[i].tracking[0] === 'yes') {
              serie.allowTrackingLine({
                useAxis: this.module.getConfiguration('trackingAxis'),
              });
            }
          }
        }
      }

      let newUnselectedStyle = Object.assign(
        {},
        serie.getStyle(),
        plotinfosStyle,
        style,
        styles.unselected,
      );
      serie.setStyle(newUnselectedStyle, 'unselected');
      let newSelectedStyle = Object.assign(
        {},
        serie.getStyle(),
        plotinfosStyle,
        style,
        styles.selected,
      );
      serie.setStyle(newSelectedStyle, 'selected');

      if (!foundInfo) {
        serie.setYAxis(this.getYAxis(0));
      }

      if (highlight) {
        API.listenHighlight(
          { _highlight: highlight },
          (value, commonKeys) => {
            for (var i = 0, ii = commonKeys.length; i < ii; i++) {
              var key = commonKeys[i];
              for (var j = 0, jj = highlight.length; j < jj; j++) {
                var high = highlight[j];
                if (Array.isArray(high)) {
                  for (var k = 0; k < high.length; k++) {
                    if (high[k] == key) {
                      serie.toggleMarker(j, !!value, true);
                    }
                  }
                } else if (high == key) {
                  serie.toggleMarker(j, !!value, true);
                }
              }
            }
          },
          false,
          this.module.getId(),
        );
      }
    },

    registerSerieEvents(serie, seriename) {
      serie.on('hide', () => {
        this.serieHiddenState.set(seriename, true);
      });

      serie.on('show', () => {
        this.serieHiddenState.set(seriename, false);
      });
    },

    blank: {
      xyArray(varName) {
        this.removeSerie(varName);
      },

      xArray(varName) {
        this.removeSerie(varName);
      },

      series_xy1d(varName) {
        this.removeSerie(varName);
      },

      jcamp(varName) {
        this.removeSerie(varName);
      },

      chart(varName) {
        this.removeAnnotations(varName);
        this.removeSerie(varName);
      },

      annotations(varName) {
        this.removeAnnotations(varName);
      },
    },

    update: {
      chart(moduleValue, varname) {
        this.annotations[varname] = [];
        this.series[varname] = this.series[varname] || [];
        this.removeSerie(varname);

        moduleValue = JSONChart.check(moduleValue.get());

        var existingNames = new Set();

        // in spectra diplayer we don't have the correct format currently. still need to change it for now
        if (moduleValue.series) {
          moduleValue.data = convertSeries(moduleValue.series);
        }

        let data = moduleValue.data;

        if (moduleValue.annotations) {
          for (const annotation of moduleValue.annotations) {
            let shape = this.graph.newShape(
              String(annotation.type),
              annotation,
              false,
              annotation.properties,
            );
            if (!shape) {
              continue;
            }
            shape.draw();
            this.annotations[varname].push(shape);
          }
        }

        if (moduleValue.axes) {
          if (moduleValue.axes.x)
            setAxisOptions(this.xAxis, moduleValue.axes.x);
          if (moduleValue.axes.y)
            setAxisOptions(this.yAxis, moduleValue.axes.y);
        }

        function setAxisOptions(axis, options) {
          if (options.label) axis.setLabel(options.label);
          if (options.units) axis.setUnit(options.units);
          if (options.unit) axis.setUnit(options.unit);
          if (options.flipped) axis.flip(options.flipped);
          axis.setUnitWrapper(
            options.unitWrapperBefore === undefined
              ? '('
              : options.unitWrapperBefore,
            options.unitWrapperAfter === undefined
              ? ')'
              : options.unitWrapperAfter,
          );

          if (options.display === false) axis.hide();
          if (options.display === true) axis.show();
          if (options.logScale === true) axis.setLogScale(true);
        }

        for (let i = 0; i < data.length; i++) {
          var aData = data[i];
          if (i === 0 && moduleValue.axis) {
            if (moduleValue.axis[aData.xAxis]) {
              this.xAxis.setLabel(moduleValue.axis[aData.xAxis].label);
            }
            if (moduleValue.axis[aData.yAxis]) {
              this.yAxis.setLabel(moduleValue.axis[aData.yAxis].label);
            }
          }

          var defaultStyle = aData.defaultStyle || {};
          var defaultStyles = aData.defaultStyles || {};

          var serieName = varname;
          if (existingNames.has(serieName)) {
            serieName += `-${i}`;
          }
          existingNames.add(serieName);

          var serieLabel = aData.label || serieName;

          var valFinal = [];
          var valFinalX = [];
          var valFinalY = [];

          switch (String(aData.type)) {
            case 'zone':
              if (aData.yMin && aData.yMax) {
                for (var j = 0, l = aData.yMax.length; j < l; j++) {
                  valFinal.push(aData.x ? aData.x[j] : j);
                  valFinal.push(aData.yMin[j], aData.yMax[j]);
                }
              }
              break;
            case 'contour':
              valFinal = aData.contourLines;
              break;
            default:
              if (aData.y) {
                for (var j = 0, l = aData.y.length; j < l; j++) {
                  valFinalX.push(aData.x ? aData.x[j] : j);
                  valFinalY.push(aData.y[j]);
                }
              }

              break;
          }

          var serieType = String(aData.type || 'line');

          if (serieType == 'color') {
            serieType = 'line.color';
          }
          var hasColor = false;
          if (Array.isArray(aData.color)) {
            hasColor = true;
            serieType = 'line.color';
          }

          let serieOptions = this.getSerieOptions(varname, aData._highlight, [
            valFinalX,
            valFinalY,
          ]);

          var serie = this.graph.newSerie(
            serieName,
            serieOptions.options,
            serieType,
          );

          this.registerSerieEvents(serie, serieName);

          if (serieOptions.others.peakPicking) {
            this.graph.getPlugin('peakPicking').setSerie(serie);
          }

          if (!serie) {
            throw new Error(`The serie of type ${serieType} was not created !`);
          }
          serie.setLabel(serieLabel);
          //                    this.normalize(valFinal, varname);

          if (
            serieType == 'line' ||
            serieType == undefined ||
            serieType == 'scatter' ||
            serieType == 'line.color'
          ) {
            var wave = Graph.newWaveform();

            wave.setData(valFinalY, valFinalX);

            this.normalize(wave, varname);

            if (serieOptions.useSlots) {
              wave.aggregate();
            }

            serie.setWaveform(wave);

            for (let styleName of ['selected', 'unselected']) {
              let style = Object.assign(
                {
                  lineWidth: styleName === 'selected' ? 2 : 1,
                  lineColor: 'black',
                  lineStyle: 0,
                },
                styleName === 'unselected' ? defaultStyle : undefined,
                (defaultStyles || {})[styleName],
                styleName === 'unselected' ? aData.style : undefined,
                (aData.styles || {})[styleName],
              );
              serie.setStyle(style, styleName);
            }
          } else {
            serie.setData(valFinal);
          }

          if (hasColor) {
            let colors = aData.color;
            if (!Array.isArray(colors)) {
              throw new Error('Serie colors must be an array');
            }
            serie.setColors(colors);
          }

          if (aData.info) {
            serie.infos = aData.info;
          }

          serie.autoAxis();

          if (serieType === 'scatter') {
            let modifiers = [];
            if (Array.isArray(aData.styles)) {
              modifiers = aData.styles;
            } else if (typeof aData.styles == 'object') {
              modifiers = aData.styles;
            }

            /* Demo of how to change the style */
            /*
              serie.setMarkerStyle(
                {
                  fill: 'red'
                },
                [{ fill: 'yellow' }],
                'unselected'
              );
              serie.setMarkerStyle(
                {
                  fill: 'pink'
                },[],
                'selected'
              );
              */

            let keys = new Set(
              Object.keys(defaultStyles).concat(Object.keys(modifiers)),
            );
            for (const styleName of keys) {
              serie.setMarkerStyle(
                Object.assign(
                  {},
                  defaultScatterStyle,
                  defaultStyle,
                  defaultStyles[styleName] || {},
                ),
                modifiers[styleName] || [],
                styleName,
              );
            }

            if (this.module.getConfigurationCheckbox('selectScatter', 'yes')) {
              var plugin = this.graph.getPlugin('selectScatter');
              plugin.setSerie(serie);
            }
          } else {
            if (aData.styles && aData.styles instanceof Object) {
              this.setSerieParameters(serie, varname, {
                styles: aData.styles,
              });
            } else if (aData.style) {
              this.setSerieParameters(serie, varname, {
                style: aData.style,
              });
            } else {
              var color =
                defaultStyle.lineColor ||
                (data.length > 1
                  ? Color.getNextColorRGB(i, data.length)
                  : null);
              let style = {};
              if (color) {
                style.lineColor = Color.getColor(color);
              }
              this.setSerieParameters(serie, varname, {
                highlight: aData._highlight,
                style,
              });
            }
          }

          if (aData.annotations) {
            for (const annotation of aData.annotations) {
              let shape = this.graph.newShape(
                String(annotation.type),
                annotation,
                false,
                annotation.properties,
              );
              if (!shape) {
                continue;
              }
              shape.draw();
              this.annotations[varname].push(shape);
            }
          }

          this.series[varname].push(serie);
        }

        this.redraw(false, varname);
      },

      xyArray(moduleValue, varname) {
        this.series[varname] = this.series[varname] || [];
        this.removeSerie(varname);

        if (!moduleValue) {
          return;
        }

        let val = moduleValue.get(),
          serieOptions = this.getSerieOptions(varname, null, val),
          serie = this.graph.newSerie(varname, serieOptions.options);

        this.registerSerieEvents(serie, varname);

        if (serieOptions.others.peakPicking) {
          this.graph.getPlugin('peakPicking').setSerie(serie);
        }

        let valX = [],
          valY = [],
          wave = Graph.newWaveform();

        for (var i = 0, l = val.length; i < l; i += 2) {
          valX.push(val[i]);
          valY.push(val[i + 1]);
        }

        wave.setData(valY, valX);

        this.normalize(wave, varname);

        if (serieOptions.useSlots) {
          wave.aggregate();
        }

        serie.setWaveform(wave);
        this.setSerieParameters(serie, varname);

        this.series[varname].push(serie);
        this.redraw(false, varname);
      },

      // in fact it is a Y array ...
      xArray(moduleValue, varname) {
        // Use wave.rescaleX( offset, shift );
        var val = moduleValue.get();
        this.series[varname] = this.series[varname] || [];
        this.removeSerie(varname);

        var minX = this.module.getConfiguration('minX', 0);
        var maxX = this.module.getConfiguration('maxX', val.length - 1);
        var step = (maxX - minX) / (val.length - 1);

        var waveform = Graph.newWaveform();
        waveform.setData(val);
        waveform.rescaleX(minX, (maxX - minX) / (val.length - 1));

        let serieOptions = this.getSerieOptions(varname, null, [null, [val]]);
        var serie = this.graph.newSerie(varname, serieOptions.options);

        this.registerSerieEvents(serie, varname);

        if (serieOptions.others.peakPicking) {
          this.graph.getPlugin('peakPicking').setSerie(serie);
        }

        this.normalize(waveform, varname);

        if (serieOptions.useSlots) {
          waveform.aggregate();
        }

        serie.setWaveform(waveform);
        //                this.normalize(val2, varname);

        this.setSerieParameters(serie, varname);
        this.series[varname].push(serie);
        this.redraw(false, varname);
      },

      annotations(value, varName) {
        this.annotations[varName] = this.annotations[varName] || [];
        const annotations = value.get();
        for (let i = 0; i < annotations.length; i++) {
          let annotation = annotations[i];
          annotation.selectOnClick = true;

          let shape = this.graph.newShape(
            String(annotation.type),
            annotation,
            false,
            annotation.properties,
          );

          if (!shape) {
            return;
          }

          this.annotations[varName][i] = shape;

          shape.autoAxes();

          API.listenHighlight(
            annotation,
            (onOff) => {
              if (onOff) {
                shape.highlight(this.highlightOptions);
              } else {
                shape.unHighlight();
              }
            },
            false,
            this.module.getId() + varName,
          );

          this.module.model.dataListenChange(
            annotations.traceSync([i]),
            (v) => {
              shape.redraw();
            },
            'annotations',
          );

          shape.draw();
          shape.redraw();
        }
      },

      jcamp(moduleValue, varname) {
        var that = this;
        var serie;

        if (!this.graph) {
          return;
        }

        var options = moduleValue._options || {};

        var value = moduleValue.get();
        var valueType = DataObject.getType(value);
        if (valueType === 'string') {
          require(['jcampconverter'], (JcampConverter) => {
            let parsed = JcampConverter.convert(
              String(value),
              options,
            ).flatten.filter(
              (entry) =>
                (entry.spectra && entry.spectra.length > 0) ||
                entry.contourLines,
            )[0];
            displaySpectra(parsed);
          });
        } else {
          displaySpectra(value);
        }

        function displaySpectra(spectra) {
          that.series[varname] = that.series[varname] || [];
          that.series[varname] = [];

          if (spectra.flatten && spectra.flatten[0]) {
            spectra = spectra.flatten[0];
          }

          if (spectra.contourLines) {
            serie = that.graph.newSerie(
              varname,
              that.getSerieOptions(varname).options,
              'contour',
            );

            that.registerSerieEvents(serie, varname);

            serie.setData(spectra.contourLines);
            that.setSerieParameters(serie, varname);
            that.series[varname].push(serie);
          } else {
            if (spectra.spectra) {
              spectra = spectra.spectra;
            }

            if (!Array.isArray(spectra)) return;
            for (let spectrum of spectra) {
              let data = spectrum.data;

              let serieOptions = that.getSerieOptions(varname, null, data);
              serie = that.graph.newSerie(varname, serieOptions.options);
              that.registerSerieEvents(serie, varname);

              if (serieOptions.others.peakPicking) {
                that.graph.getPlugin('peakPicking').setSerie(serie);
              }

              var waveform = Graph.newWaveform();
              waveform.setData(data.Y || data.y, data.X || data.x);
              that.normalize(waveform, varname);
              if (serieOptions.useSlots) {
                waveform.aggregate();
              }

              serie.setWaveform(waveform);

              that.setSerieParameters(serie, varname);
              that.series[varname].push(serie);
              break;
            }
          }

          that.redraw(false, varname);
        }
      },

      series_xy1d(data, varname) {
        // Receives an array of series. Blank the other ones.
        require(['src/util/color'], (Color) => {
          var colors = Color.getDistinctColors(data.length);
          //   self.graph.removeSeries();

          // data = data.get();

          var i = 0,
            l = data.length;

          for (; i < l; i++) {
            var opts = this.getSerieOptions(varname, null, data[i].data);

            var serie = this.graph.newSerie(data[i].name, opts.options);
            this.graph.registerSerieEvents(serie, data[i].name);

            serie.autoAxis();
            this.series[varname].push(serie);

            if (data[i].data) {
              serie.setData(data[i].data);
            }

            // serie.setLabel( data[ i ].label.toString( ) );
            serie.setLineWidth(data[i].lineWidth || opts.strokeWidth || 1);

            serie.setLineColor(
              data[i].lineColor || `rgb(${colors[i].join()})`,
              false,
              true,
            );
            serie.setLineWidth(3, 'selected');
            serie.extendStyles();
          }

          this.redraw();
        });
      },
    },

    setOnChange(id, varname, obj) {
      if (this.onchanges[varname]) {
        this.onchanges[varname].obj.unbindChange(this.onchanges[varname].id);
      }

      this.onchanges[varname] = { obj: obj, id: id };
    },

    removeAnnotations(varName) {
      API.killHighlight(this.module.getId() + varName);
      if (this.annotations[varName]) {
        for (var i = 0; i < this.annotations[varName].length; i++) {
          if (this.annotations[varName][i]) {
            this.annotations[varName][i].kill();
          }
        }
      }
      this.annotations[varName] = [];
    },

    removeSerie(serieName) {
      if (this.series[serieName]) {
        for (var i = 0; i < this.series[serieName].length; i++) {
          this.series[serieName][i].kill(true);
        }
      }

      this.series[serieName] = [];
    },

    makeSerie(data, value, name) {
      var serie = this.graph.newSerie(data.name);

      this.registerSerieEvents(serie, data.name);

      data.onChange(() => {
        serie.setData(data.data);
        this.graph.draw();
      });

      this.onActionReceive.removeSerieByName.call(this, data.name || {});
      serie.setData(data.data);

      this.seriesActions.push([value, serie, data.name]);
      this.setSerieParameters(serie, name);

      if (data.lineColor) {
        serie.setLineColor(data.lineColor, false, true);
      }

      if (data.lineWidth) {
        serie.setLineWidth(data.lineWidth);
      }

      this.redraw();
    },

    onActionReceive: {
      fromToX(value) {
        this.xAxis.zoom(value.from, value.to);
        this.graph.draw();
      },

      fromToY(value) {
        this.yAxis.zoom(value.from, value.to);
        this.graph.draw();
      },

      addSerie(value) {
        this.colorId++;

        if (value.name) {
          this.makeSerie(value, value, value.name);
        } else {
          for (var i in value) {
            this.makeSerie(value[i], value);
          }
        }
      },

      removeSerie(value) {
        for (var i = 0, l = this.seriesActions.length; i < l; i++) {
          if (this.seriesActions[i][0] == value) {
            this.seriesActions[i][1].kill();
            this.seriesActions.splice(i, 1);
          }
        }
      },

      removeSerieByName(value) {
        for (var i = 0; i < this.seriesActions.length; i++) {
          if (this.seriesActions[i][2] == value) {
            this.seriesActions[i][1].kill();
            this.seriesActions.splice(i, 1);
            i--;
          }
        }
      },

      selectSerie(serieName) {
        const s = this.graph.getSerie(serieName.valueOf());
        if (s) {
          s.select('selected');
        }
      },

      unselectSerie(serieName) {
        const s = this.graph.getSerie(serieName.valueOf());
        if (s) {
          s.unselect();
        }
      },

      toggleGrid(options) {
        let gridShow = !this.xAxis.options.primaryGrid;
        this.xAxis.setPrimaryGrid(gridShow);
        this.xAxis.setSecondaryGrid(gridShow);
        this.yAxis.setPrimaryGrid(gridShow);
        this.yAxis.setSecondaryGrid(gridShow);
        this.graph.redraw();
      },

      fullOut(value) {
        this.fullOut(fullOutMap[String(value)]);
      },

      exportSVG() {
        this.doSVGExport();
      },
    },

    doSVGExport() {
      const svgStr = this.getSVGString();
      if (svgStr) {
        this.module.controller.exportSVG(svgStr);
      }
    },

    getSVGElement() {
      const svg = this.dom.find('svg');
      return svg[0];
    },

    getSVGString() {
      const serializer = new XMLSerializer();
      const svgElement = this.getSVGElement();
      if (!svgElement) return;
      return svgDoctype + serializer.serializeToString(svgElement);
    },

    normalize(waveform, varname) {
      var plotinfos = this.module.getConfiguration('plotinfos');
      var maxValue, minValue, total, ratio, i, l;

      if (!plotinfos) return;
      var normalize = '';
      for (i = 0, l = plotinfos.length; i < l; i++) {
        if (varname == plotinfos[i].variable) {
          normalize = plotinfos[i].normalize;
        }
      }
      if (!normalize) return;

      waveform.normalize(normalize);
    },
  });

  function analyzeContinuous(data, continuous) {
    if (Array.isArray(data)) {
      var minInterval = Infinity;
      var maxInterval = -Infinity;
      var interval, i, ii;
      var MIN_FOR_CONTINUOUS = 20;

      if (typeof data[0] === 'number') {
        if (data.length < MIN_FOR_CONTINUOUS * 2 - 1) return 'discrete';
        for (i = 0, ii = data.length - 2; i < ii; i += 2) {
          interval = data[i + 2] - data[i];
          if (interval > maxInterval) maxInterval = interval;
          if (interval < minInterval) minInterval = interval;
        }
      } else if (Array.isArray(data[0]) && data.length === 2) {
        if (continuous === 'automass') {
          if (isContinuous({ x: data[0], y: data[1] })) {
            return 'continuous';
          } else {
            return 'discrete';
          }
        } else {
          if (data[0].length < MIN_FOR_CONTINUOUS) return 'discrete';
          for (let i = 0; i < data[0].length - 1; i++) {
            interval = data[0][i + 1] - data[0][i];
            if (interval > maxInterval) maxInterval = interval;
            if (interval < minInterval) minInterval = interval;
          }
        }
      } else {
        if (data.length < MIN_FOR_CONTINUOUS) return 'discrete';
        for (i = 0, ii = data.length - 1; i < ii; i++) {
          interval = data[i + 1][0] - data[i][0];
          if (interval > maxInterval) maxInterval = interval;
          if (interval < minInterval) minInterval = interval;
        }
      }
      if (Math.abs(minInterval / maxInterval) < 0.9) {
        return 'discrete';
      } else {
        return 'continuous';
      }
    }
  }

  function max(array) {
    let maxValue = array[0];
    for (let item of array) {
      if (item > maxValue) maxValue = item;
    }
    return maxValue;
  }

  // Code is largely copied from :
  // https://github.com/cheminfo-js/molecular-formula/blob/master/packages/ms-spectrum/src/isContinuous.js
  function isContinuous(data, options = {}) {
    const {
      minLength = 100,
      maxDeltaRatio = 3,
      relativeHeightThreshold = 0.001,
    } = options;
    const minRadio = 1 / maxDeltaRatio;
    const maxRatio = 1 * maxDeltaRatio;

    let xs = data.x;
    let ys = data.y;
    if (xs.length < minLength) {
      return false;
    } else {
      const minHeight = max(ys) * relativeHeightThreshold;

      let previousDelta = xs[1] - xs[0];
      let success = 0;
      let failed = 0;
      for (let i = 0; i < xs.length - 1; i++) {
        if (ys[i] < minHeight || ys[i + 1] < minHeight) {
          previousDelta = 0;
          continue;
        }
        let delta = xs[i + 1] - xs[i];
        if (previousDelta) {
          let ratio = delta / previousDelta;
          if (
            (Math.abs(delta) > 0.1 || ratio < minRadio || ratio > maxRatio) &&
            ys[i] !== 0 &&
            ys[i + 1] !== 0
          ) {
            failed++;
            break;
          } else {
            success++;
          }
        }
        previousDelta = delta;
      }
      if (success / failed < 10) {
        return false;
      }
    }
    return true;
  }

  return View;
});

function convertSeries(series) {
  let data = [];
  for (let serie of series) {
    data.push({
      x: serie.data.x,
      y: serie.data.y,
      color: serie.data.color,
      styles: convertStyle(serie.style),
      label: serie.name,
      annotations: serie.annotations,
    });
  }
  return data;
}

function convertStyle(styles) {
  if (!Array.isArray(styles)) {
    styles = [
      {
        name: 'unselected',
        style: styles,
      },
    ];
  }
  let newStyles = {};

  for (let style of styles) {
    let newStyle = {};
    if (style.style && style.style.line) {
      newStyle.lineStyle = style.style.line.dash;
      newStyle.lineWidth = style.style.line.width;
      newStyle.lineColor = style.style.line.color;
    }
    newStyles[style.name || 'unselected'] = newStyle;
  }
  if (!newStyles.selected && newStyles.unselected) {
    newStyles.selected = Object.assign({}, newStyles.unselected, {
      lineWidth: 3,
    });
  }
  return newStyles;
}
