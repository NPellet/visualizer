'use strict';

define(['modules/default/defaultview', 'jsgraph', 'src/util/datatraversing', 'src/util/api', 'src/util/color', 'src/util/debug'], function (Default, Graph, DataTraversing, API, Color, Debug) {

    function View() {
    }

    $.extend(true, View.prototype, Default, {

        init: function () {
            this.series = {};
            this.seriesDrawn = {};
            this.annotations = {};
            this.dom = $('<div />');
            this.zones = {};
            this.module.getDomContent().html(this.dom);
            this.seriesActions = [];

            this.colorId = 0;
            this.colors = ['red', 'blue', 'green', 'black'];

            this.deferreds = {};
            this.onchanges = {};
        },

        inDom: function () {

            var that = this;

            var prom = new Promise(function (resolve) {

                var cfg = that.module.getConfiguration.bind(that.module),
                    cfgCheckbox = that.module.getConfigurationCheckbox.bind(that.module),
                    graphurl = cfg('graphurl');

                if (graphurl) {

                    $.getJSON(graphurl, {}, function (data) {

                        data.options.onMouseMoveData = function (e, val) {
                            that.module.controller.sendAction('mousetrack', val);
                        };

                        resolve(new Graph(that.dom.get(0), data.options, data.axis));

                    });

                } else {

                    var options = {
                        close: {
                            left: false,
                            right: false,
                            top: false,
                            bottom: false
                        },
                        plugins: {},
                        pluginAction: {}
                    };

                    var zoom = cfg('zoom');
                    if (zoom && zoom !== 'none') {
                        var zoomOptions = {};
                        if (zoom === 'x') {
                            zoomOptions.zoomMode = 'x';
                        } else if (zoom === 'y') {
                            zoomOptions.zoomMode = 'y';
                        } else {
                            zoomOptions.zoomMode = 'xy';
                        }
                        options.plugins['zoom'] = zoomOptions;
                        options.plugins['drag'] = {};
                        options.pluginAction['zoom'] = {
                            shift: false,
                            ctrl: false
                        };
                        options.pluginAction['drag'] = {
                            shift: true,
                            ctrl: false
                        };

                        /*
                         // UPDATE NORMAN FOR DEV

                         options.plugins['shape'] = { type: 'rangex', color: [ 0, 100, 100 ], fillColor: 'rgba(0,100,100,0.3)', strokeColor: 'rgba(0,100,100,1)', strokeWidth: 2 }

                         options.pluginAction[ 'zoom'] = {};
                         options.pluginAction[ 'drag'] = {};
                         options.pluginAction[ 'shape'] = { shift: true, ctrl: false };

                         // END UPDATE NORMAN FOR DEV

                         */

                        options.dblclick = {
                            type: 'plugin',
                            plugin: 'zoom',
                            options: {
                                mode: 'total'
                            }
                        };
                    }

                    var wheel = cfg('wheelAction');
                    if (wheel && wheel !== 'none') {
                        var wheelOptions = {
                            baseline: cfg('wheelbaseline', 0)
                        };

                        if (wheel === 'xAxis') {
                            wheelOptions.direction = 'x';
                        } else {
                            wheelOptions.direction = 'y';
                        }

                        options.wheel = {
                            type: 'plugin',
                            plugin: 'zoom',
                            options: wheelOptions
                        };
                    }

                    if (cfgCheckbox('mouseTracking', 'track')) {
                        options.onMouseMoveData = function (event, result) {
                            that.module.model.trackData = result;
                            that.module.controller.sendActionFromEvent('onTrackMouse', 'trackData', result);
                            that.module.controller.createDataFromEvent('onTrackMouse', 'trackData', result);
                        };
                    }

                    if (cfgCheckbox('selectScatter', 'yes')) {
                        options.plugins.selectScatter = {};
                        options.pluginAction.selectScatter = {
                            shift: false,
                            ctrl: false,
                            alt: true
                        };
                    }

                    var graph = new Graph(that.dom.get(0), options);

                    var xOptions = {};
                    if (cfg('xaxismodification') == 'timestamptotime') {
                        xOptions.type = 'time';
                    } else if (cfg('xaxismodification') == 'valtotime') {
                        xOptions.unitModification = 'time';
                    } else if (cfg('xaxismodification') == 'valtotime:min.sec') {
                        xOptions.unitModification = 'time:min.sec';
                    }

                    // Axes
                    var xAxis = graph.getXAxis(null, xOptions);
                    xAxis
                        .flip(cfgCheckbox('flipAxis', 'flipX'))
                        .setPrimaryGrid(cfgCheckbox('grid', 'vmain'))
                        .setSecondaryGrid(cfgCheckbox('grid', 'vsec'))
                        .setLabel(cfg('xLabel', ''))
                        .forceMin(cfg('minX', false))
                        .forceMax(cfg('maxX', false))
                        .setAxisDataSpacing(cfg('xLeftSpacing', 0), cfg('xRightSpacing', 0));
                    if (!cfgCheckbox('displayAxis', 'x')) {
                        xAxis.hide();
                    }
                    xAxis.on('zoom', function (min, max) {
                        that.module.model.setXBoundaries(min, max);
                    });
                    if (cfgCheckbox('FitYToAxisOnFromTo', 'rescale')) {
                        xAxis.on('zoom', function () {
                            yAxis.scaleToFitAxis(this);
                        });
                    }

                    var yAxis = graph.getYAxis();
                    yAxis
                        .flip(cfgCheckbox('flipAxis', 'flipY'))
                        .setPrimaryGrid(cfgCheckbox('grid', 'hmain'))
                        .setSecondaryGrid(cfgCheckbox('grid', 'hsec'))
                        .setLabel(cfg('yLabel', ''))
                        .forceMin(cfg('minY', false))
                        .forceMax(cfg('maxY', false))
                        .setAxisDataSpacing(cfg('yBottomSpacing', 0), cfg('yTopSpacing', 0));
                    if (!cfgCheckbox('displayAxis', 'y')) {
                        yAxis.hide();
                    }
                    yAxis.on('zoom', function (min, max) {
                        that.module.model.setYBoundaries(min, max);
                    });

                    var legend = cfg('legend', 'none');
                    if (legend !== 'none') {
                        var theLegend = graph.makeLegend({
                            backgroundColor: 'rgba( 255, 255, 255, 0.8 )',
                            frame: true,
                            frameWidth: '1',
                            frameColor: 'rgba( 100, 100, 100, 0.5 )',
                            movable: true
                        });
                        theLegend.setAutoPosition(legend);
                    }

                    resolve(graph);

                }

            });

            prom.then(function (graph) {

                that.graph = graph;
                that.xAxis = graph.getXAxis();
                that.yAxis = graph.getYAxis();

                graph.on('shapeMouseOver', function (shape) {
                    that.module.controller.createDataFromEvent('onMouseOverShape', 'shapeInfos', shape.getData());
                    API.highlight(shape.getData(), 1);
                });

                graph.on('shapeMouseOut', function (shape) {
                    API.highlight(shape.getData(), 0);
                });

                graph.on('shapeResized', function (shape) {
                    that.module.model.dataTriggerChange(shape.getData());
                });

                graph.on('shapeSelect', function (shape) {
                    that.module.controller.createDataFromEvent('onShapeClick', 'shapeInfos', shape.getData());
                    that.module.controller.sendActionFromEvent('onShapeSelect', 'selectedShape', shape.getData());
                });
                graph.on('shapeUnselect', function (shape) {
                    that.module.controller.createDataFromEvent('onShapeClick', 'shapeInfos', shape.getData());
                    that.module.controller.sendActionFromEvent('onShapeUnselect', 'shapeInfos', shape.getData());
                });

                that.onResize();
                that.resolveReady();

            }).catch(function (err) {
                Debug.error('Error loading the graph', err);
            });

        },

        onResize: function () {
            if (!this.graph) {
                return;
            }
            this.graph.resize(this.width, this.height);
            this.redraw(true);
        },

        shouldAutoscale: function (varName) {
            if (this.seriesDrawn[varName]) {
                return false;
            } else {
                this.seriesDrawn[varName] = true;
                return true;
            }
        },

        redraw: function (forceReacalculateAxis, varName) {
            var fullOut = this.module.getConfiguration('fullOut');
            if (varName && fullOut === 'once') {
                if (!this.shouldAutoscale(varName)) {
                    fullOut = 'none';
                } else {
                    fullOut = 'both';
                }
            }

            if (forceReacalculateAxis) {
                this.graph.autoscaleAxes();
            } else if (fullOut == 'none') {
                // nothing to do
            } else if (fullOut == 'xAxis') {
                this.xAxis.setMinMaxToFitSeries();
            } else if (fullOut == 'yAxis') {
                this.yAxis.setMinMaxToFitSeries();
            } else {
                this.graph.autoscaleAxes();
            }

            this.graph.draw();

            var minX = this.xAxis.getCurrentMin();
            var maxX = this.xAxis.getCurrentMax();
            var minY = this.yAxis.getCurrentMin();
            var maxY = this.yAxis.getCurrentMax();

            this.module.model.setXBoundaries(minX, maxX);
            this.module.model.setYBoundaries(minY, maxY);
        },

        doZone: function (varname, zone, value, color) {
            if (value && !zone[2]) {

                var rect = this.graph.newShape('rect', {
                    pos: {
                        x: zone[0]
                    },

                    pos2: {
                        x: zone[1]
                    },

                    fillColor: color,
                    opacity: '0.5'
                });

                rect.setFullHeight();

                zone.push(rect);

            } else if (zone[2] && !value) {

                zone[2].kill();
                zone.splice(2, 1);

            }
        },

        getSerieOptions: function (varname, highlight, data) {
            var that = this,
                plotinfos = this.module.getConfiguration('plotinfos');

            highlight = highlight || [];

            var options = {
                trackMouse: true
            };

            if (plotinfos) {
                for (var i = 0, l = plotinfos.length; i < l; i++) {
                    if (varname == plotinfos[i].variable) {

                        var continuous = plotinfos[i].plotcontinuous;
                        if (continuous === 'auto') {
                            continuous = analyzeContinuous(data);
                        }

                        if (plotinfos[i].markers[0]) {
                            options.markersIndependant = true;
                        }

                        options.lineToZero = continuous == 'discrete';
                        options.useSlots = (plotinfos[i].optimizeSlots ? !!plotinfos[i].optimizeSlots[0] : false);
                        options.strokeWidth = parseInt(plotinfos[i].strokewidth);

                        var pp = plotinfos[i].peakpicking[0];
                        if (pp) {
                            if (options.lineToZero) {
                                options.autoPeakPicking = true;
                            } else {
                                options.autoPeakPicking = 'continuous';
                            }
                        }
                    }
                }
            }


            // 3 June 2014, Norman
            // Ok here for instance we have a problem. The data generated by the graph is NOT in another variable
            // Therefore we create this data from scratch. Easy.
            options.onMouseOverMarker = function (index, infos, xy) {
                API.highlightId(highlight[index[0]], 1);
                that.module.controller.onMouseOverMarker(xy, infos);
            };
            options.onMouseOutMarker = function (index, infos, xy) {
                API.highlightId(highlight[index[0]], 0);
                that.module.controller.onMouseOutMarker(xy, infos);
            };
            options.onToggleMarker = function (xy, infos, toggledOn) {
                that.module.controller.onClickMarker(xy, infos, toggledOn);
            };

            return options;

        },

        setSerieParameters: function (serie, varname, highlight, forceColor) {
            var plotinfos = this.module.getConfiguration('plotinfos');

            if (plotinfos) {

                for (var i = 0, l = plotinfos.length; i < l; i++) {
                    if (varname == plotinfos[i].variable) {

                        var color = forceColor ? forceColor : plotinfos[i].plotcolor;

                        serie.setLineColor(Color.getColor(color));

                        var lineWidth = parseFloat(plotinfos[i].strokewidth);
                        if (isNaN(lineWidth)) lineWidth = 1;

                        serie.setLineWidth(lineWidth);
                        serie.setLineStyle(parseInt(plotinfos[i].strokestyle) || 1);

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

                        if (plotinfos[i].monotoneous && plotinfos[i].monotoneous[0]) {
                            serie.XIsMonotoneous();
                        }

                        if (plotinfos[i].degrade) {
                            serie.degrade(plotinfos[i].degrade);
                        }
                    }
                }
            }

            if (highlight) {
                API.listenHighlight({_highlight: highlight}, function (value, commonKeys) {
                    for (var i = 0, ii = commonKeys.length; i < ii; i++) {
                        var key = commonKeys[i];
                        for (var j = 0, jj = highlight.length; j < jj; j++) {
                            var high = highlight[j];
                            if (Array.isArray(high)) {
                                for (var k = 0; k < high.length; k++) {
                                    if (high[k] == key) {
                                        serie.toggleMarker([j, 0], !!value, true);
                                    }
                                }
                            } else if (high == key) {
                                serie.toggleMarker([j, 0], !!value, true);
                            }
                        }
                    }
                }, false, this.module.getId());
            }

        },


        blank: {

            xyArray: function (varName) {

                this.removeSerie(varName);
            },

            xArray: function (varName) {

                this.removeSerie(varName);
            },


            series_xy1d: function (varName) {

                this.removeSerie(varName);
            },


            jcamp: function (varName) {

                this.removeSerie(varName);
            },

            chart: function (varName) {

                this.removeSerie(varName);
            },

            annotations: function (varName) {
                this.removeAnnotations(varName);
            }

        },


        update: {

            chart: function (moduleValue, varname) {
                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                moduleValue = moduleValue.get();
                var existingNames = [];

                var that = this;
                var data = moduleValue.data;
                for (var i = 0; i < data.length; i++) {

                    var aData = data[i];

                    if (i === 0 && moduleValue.axis) {
                        if (moduleValue.axis[aData.xAxis]) {
                            this.xAxis.setLabel(moduleValue.axis[aData.xAxis].name);
                        }
                        if (moduleValue.axis[aData.yAxis]) {
                            this.yAxis.setLabel(moduleValue.axis[aData.yAxis].name);
                        }
                    }


                    var defaultStyle = aData.defaultStyle || {};
                    var serieName = aData.label || varname;
                    if (existingNames.indexOf(serieName) > -1) {
                        serieName += '-' + i;
                    }

                    existingNames.push(serieName);

                    var valFinal = [];

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
                                    valFinal.push(aData.x ? aData.x[j] : j);
                                    valFinal.push(aData.y[j]);
                                }
                            }
                            break;
                    }


                    var serie = this.graph.newSerie(serieName, this.getSerieOptions(varname, aData._highlight, valFinal), aData.type || undefined);

                    this.normalize(valFinal, varname);
                    serie.setData(valFinal);

                    if (aData.info) {
                        serie.infos = aData.info;
                    }

                    serie.autoAxis();
                    if (String(aData.type) === 'scatter') {
                        if (this.module.getConfigurationCheckbox('selectScatter', 'yes')) {
                            var plugin = this.graph.getPlugin('selectScatter');
                            plugin.setSerie(serie);
                            (function (serie) {
                                plugin.on('selectionEnd', function (selectedIndices) {
                                    var result = [];
                                    var info = serie.infos;
                                    if (info) {
                                        result = info.filter(function (value, index) {
                                            return selectedIndices.indexOf(index) >= 0;
                                        });
                                    }
                                    that.module.controller.onScatterSelection(result);
                                });
                            })(serie);
                        }
                    } else {
                        var color = defaultStyle.lineColor || (data.length > 1 ? Color.getNextColorRGB(i, data.length) : null);
                        this.setSerieParameters(serie, varname, aData._highlight, color);
                    }

                    this.series[varname].push(serie);
                }

                this.redraw(false, varname);
            },

            xyArray: function (moduleValue, varname) {

                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                if (!moduleValue) {
                    return;
                }

                var val = moduleValue.get();

                var serie = this.graph.newSerie(varname, this.getSerieOptions(varname, null, val));

                this.normalize(val, varname);
                serie.setData(val);
                serie.autoAxis();
                this.setSerieParameters(serie, varname);

                this.series[varname].push(serie);
                this.redraw(false, varname);
            },

// in fact it is a Y array ...
            xArray: function (moduleValue, varname) {
                var val = moduleValue.get();
                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                var minX = this.module.getConfiguration('minX', 0);
                var maxX = this.module.getConfiguration('maxX', val.length - 1);
                var step = (maxX - minX) / (val.length - 1);
                var val2 = [];
                for (var i = 0, l = val.length; i < l; i++) {
                    val2.push(minX + step * i);
                    val2.push(val[i]);
                }

                var serie = this.graph.newSerie(varname, this.getSerieOptions(varname, null, val2));

                this.normalize(val2, varname);

                serie.setData(val2);
                serie.autoAxis();
                this.setSerieParameters(serie, varname);
                this.series[varname].push(serie);
                this.redraw(false, varname);
            },

            annotations: function (value, varName) {
                this.annotations[varName] = this.annotations[varName] || [];
                var annotations = value.get();
                var i = 0, l = annotations.length;
                var that = this;
                for (; i < l; i++) {
                    (function (i) {
                        var annotation = annotations[i];
                        var shape = that.graph.newShape(String(annotation.type), annotation);
                        that.annotations[varName][i] = shape;

                        shape.setSerie(that.graph.getSerie(0));
//TODO annotation.onChange
//                Debug.debug('annotation.onChange is disabled, need to be fixed');
//                annotation.onChange( annotation, function( value ) {
//
//                 shape.draw();
//                 shape.redraw();
//
//                 }, self.module.getId() );
//
                        API.listenHighlight(annotation, function (onOff) {
                            if (onOff) {
                                shape.highlight({
                                    fill: 'black'
                                });
                            } else {
                                shape.unHighlight();
                            }
                        }, false, that.module.getId() + varName);

                        that.module.model.dataListenChange(annotations.traceSync([i]), function (v) {

                            shape.redraw();

                        }, 'annotations');

                        shape.draw();
                        shape.redraw();

                    })(i);
                }
            },

            jcamp: function (moduleValue, varname) {

                if (!moduleValue) {
                    return;
                }

                moduleValue = String(moduleValue.get()); // Get the true jcamp value

                var that = this,
                    serie,
                    spectra;

                API.killHighlight(this.module.getId() + varname);

                if (!this.graph) {
                    return;
                }

                this.zones[varname] = moduleValue._zones;

                if (that.deferreds[varname]) {
                    that.deferreds[varname].reject();
                }

                that.deferreds[varname] = $.Deferred();
                var def = that.deferreds[varname];

                require(['jcampconverter'], function (JcampConverter) {

                    JcampConverter.convert(moduleValue, {lowRes: 1024}, true).then(function (spectra) {

                        if (def.state() == 'rejected') {
                            return;
                        }

                        that.deferreds[varname] = false;
                        that.series[varname] = that.series[varname] || [];
                        that.series[varname] = [];

                        if (spectra.contourLines) {

                            serie = that.graph.newSerie(varname, that.getSerieOptions(varname), 'contour');

                            serie.setData(spectra.contourLines);
                            serie.autoAxis();
                            that.setSerieParameters(serie, varname);
                            that.series[varname].push(serie);

                        } else {

                            spectra = spectra.spectra;
                            for (var i = 0, l = spectra.length; i < l; i++) {
                                var data = spectra[i].data[spectra[i].data.length - 1];

                                serie = that.graph.newSerie(varname, that.getSerieOptions(varname, null, data));

                                that.normalize(data, varname);
                                serie.setData(data);
                                serie.autoAxis();
                                that.setSerieParameters(serie, varname);
                                that.series[varname].push(serie);
                                break;
                            }

                            API.listenHighlight(moduleValue._highlight || [], function (value, commonKeys) {

                                for (var i = 0; i < commonKeys.length; i++) {

                                    if (that.zones[varname][commonKeys[i]]) {

                                        that.doZone(varname, that.zones[varname][commonKeys [i]], value, that.series[varname].options.lineColor);
                                    }
                                }
                            }, true, that.module.getId() + varname);
                        }
                        that.redraw(false, varname);
                    });
                });
            },


            series_xy1d: function (data, varname) { // Receives an array of series. Blank the other ones.

                /*if( ! data.data ) {
                 return;
                 }*/

                var that = this;
                require(['src/util/color'], function (Color) {

                    var colors = Color.getDistinctColors(data.length);
                    //   self.graph.removeSeries();

                    //data = data.get();

                    var i = 0,
                        l = data.length;

                    for (; i < l; i++) {

                        var opts = that.getSerieOptions(varname, null, data[i].data);

                        var serie = that.graph.newSerie(data[i].name, opts);


                        serie.autoAxis();
                        that.series[varname].push(serie);

                        if (data[i].data) {
                            serie.setData(data[i].data);
                        }

                        //	serie.setLabel( data[ i ].label.toString( ) );
                        serie.setLineWidth(data[i].lineWidth || opts.strokeWidth || 1);
                        serie.setLineColor(data[i].lineColor || 'rgb(' + colors[i].join() + ')');
                        serie.setLineWidth(3, 'selected');

                        //                    serie.setLineColor(data[ i ].lineColor || Color.getColor(Color.getNextColorRGB(i, l)));
                        serie.extendStyles();
                    }

                    that.redraw();


                });

            }
        },

        setOnChange: function (id, varname, obj) {


            if (this.onchanges[varname]) {
                this.onchanges[varname].obj.unbindChange(this.onchanges[varname].id);
            }

            this.onchanges[varname] = {obj: obj, id: id};


        },

        removeAnnotations: function (varName) {
            API.killHighlight(this.module.getId() + varName);
            if (this.annotations[varName]) {
                for (var i = 0; i < this.annotations[varName].length; i++) {
                    this.annotations[varName][i].kill();
                }
            }
            this.annotations[varName] = [];
        },

        removeSerie: function (serieName) {
            if (this.series[serieName]) {
                for (var i = 0; i < this.series[serieName].length; i++) {
                    this.series[serieName][i].kill(true);
                }
            }

            this.series[serieName] = [];
        },

        makeSerie: function (data, value, name) {

            var that = this,
                serie = this.graph.newSerie(data.name);

            data.onChange(function () {

                serie.setData(data.data);
                that.graph.draw();
            });

            this.onActionReceive.removeSerieByName.call(this, data.name || {});
            serie.autoAxis();
            serie.setData(data.data);

            this.seriesActions.push([value, serie, data.name]);
            this.setSerieParameters(serie, name);

            if (data.lineColor) {
                serie.setLineColor(data.lineColor);
            }

            if (data.lineWidth) {
                serie.setLineWidth(data.lineWidth);
            }

            this.redraw();
        },

        onActionReceive: {

            fromToX: function (value) {
                this.xAxis.zoom(value.from, value.to);
                this.graph.draw();
            },

            fromToY: function (value) {
                this.yAxis.zoom(value.from, value.to);
                this.graph.draw();
            },

            addSerie: function (value) {

                this.colorId++;

                if (value.name) {
                    this.makeSerie(value, value, value.name);
                } else {

                    for (var i in value) {
                        this.makeSerie(value[i], value);
                    }
                }
            },

            removeSerie: function (value) {

                for (var i = 0, l = this.seriesActions.length; i < l; i++) {

                    if (this.seriesActions[i][0] == value) {
                        this.seriesActions[i][1].kill();
                        this.seriesActions.splice(i, 1);
                    }
                }
            },

            removeSerieByName: function (value) {
                for (var i = 0; i < this.seriesActions.length; i++) {
                    if (this.seriesActions[i][2] == value) {
                        this.seriesActions[i][1].kill();
                        this.seriesActions.splice(i, 1);
                        i--;
                    }
                }
            },

            selectSerie: function (serieName) {

                var s = this.graph.getSerie(serieName.valueOf());

                if (s) {
                    s.select('selected');
                }
            },

            unselectSerie: function (serieName) {

                var s = this.graph.getSerie(serieName.valueOf());

                if (s) {
                    s.unselect();
                }
            }

        },

        normalize: function (array, varname) {

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

            if (Array.isArray(array[0])) { // Normalize from [[x1,y1],[x2,y2]]
                if (normalize == 'max1' || normalize == 'max100') {
                    var factor = 1;
                    if (normalize == 'max100') factor = 100;
                    maxValue = -Infinity;
                    for (i = 0; i < array.length; i++) {
                        if (array[i][1] > maxValue) maxValue = array[i][1];
                    }
                    for (i = 0; i < array.length; i++) {
                        array[i][1] /= maxValue / factor;
                    }
                } else if (normalize == 'sum1') {
                    total = 0;
                    for (i = 0; i < array.length; i++) {
                        total += array[i][1];
                    }
                    for (i = 0; i < array.length; i++) {
                        array[i][1] /= total;
                    }
                } else if (normalize == 'max1min0') {
                    maxValue = -Infinity;
                    minValue = Infinity;
                    for (i = 0; i < array.length; i++) {
                        if (array[i][1] > maxValue) maxValue = array[i][1];
                        if (array[i][1] < minValue) minValue = array[i][1];
                    }
                    ratio = 1 / (maxValue - minValue);
                    for (i = 0; i < array.length; i++) {
                        array[i][1] = (array[i][1] - minValue) * ratio;
                    }
                }
            } else { // Normalize from [x1,y1,x2,y2]
                if (normalize == 'max1' || normalize == 'max100') {
                    var factor = 1;
                    if (normalize == 'max100') factor = 100;
                    maxValue = -Infinity;
                    for (i = 1; i < array.length; i = i + 2) {
                        if (array[i] > maxValue) maxValue = array[i];
                    }
                    for (i = 1; i < array.length; i = i + 2) {
                        array[i] /= maxValue / factor;
                    }
                } else if (normalize == 'sum1') {
                    total = 0;
                    for (i = 1; i < array.length; i = i + 2) {
                        total += array[i];
                    }
                    for (i = 1; i < array.length; i = i + 2) {
                        array[i] /= total;
                    }
                } else if (normalize == 'max1min0') {
                    maxValue = -Infinity;
                    minValue = Infinity;
                    for (i = 1; i < array.length; i = i + 2) {
                        if (array[i] > maxValue) maxValue = array[i];
                        if (array[i] < minValue) minValue = array[i];
                    }
                    ratio = 1 / (maxValue - minValue);
                    for (i = 1; i < array.length; i = i + 2) {
                        array[i] = (array[i] - minValue) * ratio;
                    }
                }
            }
        }

    });

    function analyzeContinuous(data) {
        if (Array.isArray(data)) {
            var minInterval = Infinity;
            var maxInterval = -Infinity;
            var interval, i, ii;
            if (typeof data[0] === 'number') {
                for (i = 0, ii = data.length - 2; i < ii; i += 2) {
                    interval = data[i + 2] - data[i];
                    if (interval > maxInterval) maxInterval = interval;
                    if (interval < minInterval) minInterval = interval;
                }
            } else {
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
