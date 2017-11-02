'use strict';

define([
    'jquery',
    'modules/default/defaultview',
    'jsgraph',
    'json-chart',
    'src/util/datatraversing',
    'src/util/api',
    'src/util/color',
    'src/util/debug',
    'src/util/util'
], function ($, Default, Graph, JSONChart, DataTraversing, API, Color, Debug, Util) {

    const defaultScatterStyle = {
        shape: 'circle',
        cx: 0,
        cy: 0,
        r: 3,
        height: '5px',
        width: '5px',
        stroke: 'transparent',
        fill: 'black'
    };

    const fullOutMap = {
        x: 'xAxis',
        y: 'yAxis',
        xy: 'both'
    };

    const svgDoctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

    function View() {
    }

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

            this.deferreds = {};
            this.onchanges = {};
            this.highlightOptions = Object.assign({
                fill: 'black'
            }, Util.evalOptions(this.module.getConfiguration('highlightOptions')));

        },

        inDom() {
            var prom = new Promise(resolve => {

                var cfg = this.module.getConfiguration;
                var cfgCheckbox = this.module.getConfigurationCheckbox;
                var graphurl = cfg('graphurl');

                if (graphurl) {
                    $.getJSON(graphurl, {}, data => {
                        data.options.onMouseMoveData = (e, val) => {
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
                            left: false
                        },
                        plugins: {},
                        mouseActions: []
                    };

                    options.plugins.drag = {};
                    options.mouseActions.push({
                        plugin: 'drag',
                        shift: true,
                        ctrl: false
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
                            mode: 'total'
                        }
                    });
                    options.mouseActions.push({
                        plugin: 'zoom',
                        type: 'dblclick',
                        shift: true,
                        options: {
                            mode: dezoomMode
                        }
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
                            ctrl: false
                        });
                    }

                    var wheel = cfg('wheelAction');
                    if (wheel && wheel !== 'none') {
                        var wheelOptions = {
                            baseline: cfg('wheelbaseline', 0)
                        };

                        if (wheel === 'zoomX') {
                            wheelOptions.direction = 'x';
                        } else {
                            wheelOptions.direction = 'y';
                        }

                        options.mouseActions.push({
                            plugin: 'zoom',
                            type: 'mousewheel',
                            options: wheelOptions
                        });
                    }

                    const useMouseTracking = cfgCheckbox('mouseTracking', 'track');
                    if (useMouseTracking) {
                        options.onMouseMoveData = (event, result) => {
                            this.module.model.trackData = result;
                            this.module.controller.sendActionFromEvent('onTrackMouse', 'trackData', result);
                            this.module.controller.sendActionFromEvent('onTrackMouse', 'mouseEvent', event);
                            this.module.controller.createDataFromEvent('onTrackMouse', 'trackData', result);
                        };
                    }

                    const selectScatterPlugin = cfgCheckbox('selectScatter', 'yes');
                    if (selectScatterPlugin) {
                        options.plugins.selectScatter = {};
                        options.mouseActions.push({
                            plugin: 'selectScatter',
                            alt: true
                        });
                    }

                    var graph = new Graph(this.dom.get(0), options);
                    this.graph = graph;

                    if (useMouseTracking) {
                        graph.on('click', (e) => {
                            if (this.module.model.trackData) {
                                this.module.controller.sendActionFromEvent('onTrackClick', 'trackData', this.module.model.trackData);
                                this.module.controller.sendActionFromEvent('onTrackClick', 'mouseEvent', e[3]);
                                this.module.controller.createDataFromEvent('onTrackClick', 'trackData', this.module.model.trackData);
                            }
                        });
                    }

                    if (selectScatterPlugin) {
                        var plugin = graph.getPlugin('selectScatter');
                        plugin.on('selectionEnd', selectedIndices => {
                            const serie = plugin.serie;
                            var result = [];
                            var info = serie.infos;
                            if (info) {
                                result = selectedIndices.map(index => info[index]);
                            }
                            this.module.controller.onScatterSelection(result);
                        });
                    }

                    var xOptions = {
                        nbTicksPrimary: cfg('xnbTicksPrimary', 5)
                    };

                    if (cfg('xaxismodification') == 'timestamptotime') {
                        xOptions.type = 'time';
                    } else if (cfg('xaxismodification') == 'valtotime') {
                        xOptions.unitModification = 'time';
                    } else if (cfg('xaxismodification') == 'valtotime:min.sec') {
                        xOptions.unitModification = 'time:min.sec';
                    }

                    // Axes
                    var xAxis = graph.getXAxis(0, xOptions);
                    this.xAxis = xAxis;
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
                        .setAxisDataSpacing(cfg('xLeftSpacing', 0), cfg('xRightSpacing', 0));
                    if (!cfg('displayXAxis', true)) {
                        xAxis.hide();
                    }
                    const xZoomHandler = ([min, max]) => {
                        this.module.model.setXBoundaries(min, max);
                    };
                    xAxis.on('zoom', xZoomHandler).on('zoomOutFull', xZoomHandler);
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
                            isSerieSelectable: cfgCheckbox('legendOptions', 'isSerieSelectable')
                        });
                        theLegend.setAutoPosition(legend);
                    }

                    graph.draw(true);
                    resolve(graph);


                }

            });

            prom.then(graph => {
                this.graph = graph;
                this.xAxis = graph.getXAxis(0);
                this.yAxis = graph.getYAxis(0);

                graph.on('shapeMouseOver', shape => {
                    this.module.controller.createDataFromEvent('onMouseOverShape', 'shapeProperties', shape.getProperties());
                    this.module.controller.createDataFromEvent('onMouseOverShape', 'shapeInfos', shape.getData());
                    API.highlight(shape.getData(), 1);
                });

                graph.on('shapeMouseOut', shape => {
                    API.highlight(shape.getData(), 0);
                });

                graph.on('shapeResized', shape => {
                    this.module.model.dataTriggerChange(shape.getData());
                });

                graph.on('shapeSelected', shape => {
                    this.module.controller.createDataFromEvent('onShapeClick', 'shapeProperties', shape.getProperties());
                    this.module.controller.createDataFromEvent('onShapeClick', 'shapeInfos', shape.getData());
                    this.module.controller.sendActionFromEvent('onShapeSelect', 'selectedShape', shape.getData());
                });
                graph.on('shapeUnselected', shape => {
                    this.module.controller.createDataFromEvent('onShapeClick', 'shapeProperties', shape.getProperties());
                    this.module.controller.createDataFromEvent('onShapeClick', 'shapeInfos', shape.getData());
                    this.module.controller.sendActionFromEvent('onShapeUnselect', 'shapeInfos', shape.getData());
                });

                this.onResize();
                this.resolveReady();

            }).catch(err => {
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
                    nbTicksPrimary: cfg('ynbTicksPrimary', 5)
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
                    yAxis.on('zoom', yZoomHandler).on('zoomOutFull', yZoomHandler);
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
                    trackMouse: true
                };

            highlight = highlight || [];

            if (plotinfos) {
                for (var i = 0, l = plotinfos.length; i < l; i++) {
                    if (varname == plotinfos[i].variable) {

                        var continuous = plotinfos[i].plotcontinuous;
                        if (continuous === 'auto') {
                            continuous = analyzeContinuous(data);
                        }

                        if (plotinfos[i].markers[0]) {
                            options.markersIndependent = false;
                        }

                        options.lineToZero = continuous == 'discrete';
                        options.strokeWidth = parseInt(plotinfos[i].strokewidth);

                        others.peakPicking = true;
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

            return {options: options, others: others};

        },

        setSerieParameters(serie, varname, highlight, forceColor) {

            serie.setXAxis(0);
            serie.setOptions({
                overflowY: this.module.getConfigurationCheckbox('overflow', 'overflowY'),
                overflowX: this.module.getConfigurationCheckbox('overflow', 'overflowX')
            });

            var plotinfos = this.module.getConfiguration('plotinfos');
            const stackVerticalSpacing = this.module.getConfiguration('stackVerticalSpacing');
            var foundInfo = false;
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
                        const axisIdx = (plotinfos[i].axis ? Number(plotinfos[i].axis) : 0) - minAxis;
                        var axis = this.getYAxis(axisIdx);
                        const startSpan = axisIdx * stackVerticalSpacing || 0;
                        const endSpan = 1 - (stackVerticalSpacing * (nbAxes - 1 - axisIdx));
                        axis.setSpan(startSpan, endSpan);
                        serie.setYAxis(axis);

                        if (plotinfos[i].adaptTo && String(plotinfos[i].adaptTo) !== 'none') {
                            var other = this.getYAxis(Number(plotinfos[i].adaptTo));
                            axis.adaptTo(other, 0, 0);
                        }

                        var color = forceColor ? forceColor : plotinfos[i].plotcolor;

                        serie.setLineColor(Color.getColor(color), false, true);

                        var lineWidth = parseFloat(plotinfos[i].strokewidth);
                        if (isNaN(lineWidth)) lineWidth = 1;

                        serie.setLineWidth(lineWidth);
                        serie.setLineStyle(parseInt(plotinfos[i].strokestyle) || 1, false, true);

                        if (plotinfos[i].markers[0] && serie.showMarkers) {
                            serie.showMarkers();
                            serie.setMarkers([{
                                type: parseInt(plotinfos[i].markerShape),
                                zoom: plotinfos[i].markerSize,
                                strokeColor: Color.getColor(color),
                                fillColor: Color.getColor(color),
                                points: 'all'
                            }]);
                        }


                        if (plotinfos[i].degrade) {
                            serie.degrade(plotinfos[i].degrade);
                        }

                        if (plotinfos[i].tracking && plotinfos[i].tracking[0] === 'yes') {
                            serie.allowTrackingLine({});
                        }
                    }
                }
            }

            if (!foundInfo) {
                serie.setYAxis(this.getYAxis(0));
            }

            if (highlight) {
                API.listenHighlight({_highlight: highlight}, (value, commonKeys) => {
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
                }, false, this.module.getId());
            }
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
                this.removeSerie(varName);
            },

            annotations(varName) {
                this.removeAnnotations(varName);
            }
        },

        update: {
            chart(moduleValue, varname) {
                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                moduleValue = JSONChart.check(moduleValue.get());
                var existingNames = new Set();

                var data = moduleValue.data;
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
                        serieName += '-' + i;
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

                    var serieType = aData.type;

                    if (serieType == 'color') {
                        serieType = 'line.color';
                    }
                    var hasColor = false;

                    if (Array.isArray(aData.color)) {
                        hasColor = true;
                        serieType = 'line.color';
                    }

                    let serieOptions = this.getSerieOptions(varname, aData._highlight, [valFinalX, valFinalY]);

                    var serie = this.graph.newSerie(serieName, serieOptions.options, serieType);

                    if (serieOptions.others.peakPicking) {
                        this.graph.getPlugin('peakPicking').setSerie(serie);
                    }

                    if (!serie) {
                        console.log(serieType);
                        throw 'The serie was not created !';
                    }
                    serie.setLabel(serieLabel);
                    //                    this.normalize(valFinal, varname);

                    if (serieType == 'line' || serieType == undefined || serieType == 'scatter' || serieType == 'line.color') { // jsGraph 2.0

                        var wave = Graph.newWaveform();

                        wave.setData(valFinalY, valFinalX);

                        this.normalize(wave, varname);

                        if (serieOptions.useSlots) {
                            wave.aggregate();
                        }

                        serie.setWaveform(wave);
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

                    if (String(aData.type) === 'scatter') {
                        
                        let modifiers = [];
                        if (Array.isArray(aData.styles)) {
                            modifiers = aData.styles;
                        } else if (typeof aData.styles == 'object') {
                            modifiers = aData.styles.unselected;
                        }

                        let keys = new Set(Object.keys(defaultStyles).concat(Object.keys(modifiers)));

                        keys.forEach((styleName) => {

                            serie.setStyle(
                                Object.assign({}, defaultScatterStyle, defaultStyle, defaultStyles[ styleName ] || {}), modifiers[ styleName ] || [], styleName
                            );
                        });

                        if (this.module.getConfigurationCheckbox('selectScatter', 'yes')) {
                            var plugin = this.graph.getPlugin('selectScatter');
                            plugin.setSerie(serie);
                        }

                    } else {
                        var color = defaultStyle.lineColor || (data.length > 1 ? Color.getNextColorRGB(i, data.length) : null);
                        this.setSerieParameters(serie, varname, aData._highlight, color);
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

                if (serieOptions.others.peakPicking) {
                    this.graph.getPlugin('peakPicking').setSerie(serie);
                }

                let valX = [],
                    valY = [],
                    wave = Graph.newWaveform();

                for (var i = 0, l = val.length; i < l; i += 2) {
                    valX.push(val[ i ]);
                    valY.push(val[ i + 1 ]);
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
                    
                    let shape = this.graph.newShape(String(annotation.type), annotation);

                    if( ! shape ) {
                        return;
                    }

                    this.annotations[varName][i] = shape;

                    shape.autoAxes();

                    API.listenHighlight(annotation, onOff => {
                        if (onOff) {
                            shape.highlight(this.highlightOptions);
                        } else {
                            shape.unHighlight();
                        }
                    }, false, this.module.getId() + varName);

                    this.module.model.dataListenChange(annotations.traceSync([i]), v => {
                        shape.redraw();
                    }, 'annotations');

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

                if (this.deferreds[varname]) {
                    this.deferreds[varname].reject();
                }

                this.deferreds[varname] = $.Deferred();
                var def = this.deferreds[varname];

                var options = moduleValue._options || {};

                var value = moduleValue.get();
                var valueType = DataObject.getType(value);
                if (valueType === 'string') {
                    require(['jcampconverter'], JcampConverter => {
                        JcampConverter.convert(String(value), options, true).then(displaySpectra);
                    });
                } else {
                    displaySpectra(value);
                }

                function displaySpectra(spectra) {
                    if (def.state() == 'rejected') {
                        return;
                    }

                    that.deferreds[varname] = false;
                    that.series[varname] = that.series[varname] || [];
                    that.series[varname] = [];

                    if (spectra.contourLines) {
                        serie = that.graph.newSerie(varname, that.getSerieOptions(varname).options, 'contour');

                        serie.setData(spectra.contourLines);
                        that.setSerieParameters(serie, varname);
                        that.series[varname].push(serie);
                    } else {
                        spectra = spectra.spectra;
                        for (var i = 0, l = spectra.length; i < l; i++) {
                            var data = spectra[i].data[spectra[i].data.length - 1];

                            let dataX = [];
                            let dataY = [];


                            if (data.x && data.y) {
                                dataX = data.x;
                                dataY = data.y;
                            } else if (Array.isArray(data[0])) {
                                dataX = data[0];
                                dataY = data[1];
                            } else {
                                for (var i = 0; i < data.length; i += 2) {
                                    dataX.push(data[ i ]);
                                    dataY.push(data[ i + 1 ]);
                                }
                            }

                            let serieOptions = that.getSerieOptions(varname, null, data);
                            serie = that.graph.newSerie(varname, serieOptions.options);


                            if (serieOptions.others.peakPicking) {
                                that.graph.getPlugin('peakPicking').setSerie(serie);
                            }


                            var waveform = Graph.newWaveform();
                            waveform.setData(dataY, dataX);
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

            series_xy1d(data, varname) { // Receives an array of series. Blank the other ones.
                require(['src/util/color'], Color => {

                    var colors = Color.getDistinctColors(data.length);
                    //   self.graph.removeSeries();

                    //data = data.get();

                    var i = 0,
                        l = data.length;

                    for (; i < l; i++) {

                        var opts = this.getSerieOptions(varname, null, data[i].data);

                        var serie = this.graph.newSerie(data[i].name, opts.options);


                        serie.autoAxis();
                        this.series[varname].push(serie);

                        if (data[i].data) {
                            serie.setData(data[i].data);
                        }

                        //	serie.setLabel( data[ i ].label.toString( ) );
                        serie.setLineWidth(data[i].lineWidth || opts.strokeWidth || 1);
                        serie.setLineColor(data[i].lineColor || 'rgb(' + colors[i].join() + ')', false, true);
                        serie.setLineWidth(3, 'selected');
                        serie.extendStyles();
                    }

                    this.redraw();
                });
            }
        },

        setOnChange(id, varname, obj) {
            if (this.onchanges[varname]) {
                this.onchanges[varname].obj.unbindChange(this.onchanges[varname].id);
            }

            this.onchanges[varname] = {obj: obj, id: id};
        },

        removeAnnotations(varName) {
            API.killHighlight(this.module.getId() + varName);
            if (this.annotations[varName]) {
                for (var i = 0; i < this.annotations[varName].length; i++) {
                    if( this.annotations[varName][i] ) {
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

            fullOut(value) {
                this.fullOut(fullOutMap[String(value)]);
            },

            exportSVG() {
                this.doSVGExport();
            }
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

        }
    });

    function analyzeContinuous(data) {
        if (Array.isArray(data)) {
            var minInterval = Infinity;
            var maxInterval = -Infinity;
            var interval, i, ii;
            var MIN_FOR_CONTINUOUS = 20;
            if (typeof data[0] === 'number') {
                if (data.length < (MIN_FOR_CONTINUOUS * 2 - 1)) return 'discrete';
                for (i = 0, ii = data.length - 2; i < ii; i += 2) {
                    interval = data[i + 2] - data[i];
                    if (interval > maxInterval) maxInterval = interval;
                    if (interval < minInterval) minInterval = interval;
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

    return View;

});
