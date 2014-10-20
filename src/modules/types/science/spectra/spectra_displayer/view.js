'use strict';

define(['modules/default/defaultview', 'components/jsgraph/dist/jsgraph', 'src/util/datatraversing', 'src/util/api', 'src/util/util', 'src/util/debug'], function (Default, Graph, DataTraversing, API, Util, Debug) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            this.series = {};
            this.colorvars = [];
            this.dom = $('<div />');
            this.zones = {};
            this._currentHighlights = { };
            this.module.getDomContent().html(this.dom);
            this.seriesActions = [ ];

            this.colorId = 0;
            this.colors = [ 'red', 'blue', 'green', 'black' ];

            this.deferreds = {};
            this.onchanges = {};
        },

        inDom: function () {

            var self = this;

            var prom = new Promise(function (resolve, reject) {

                var cfg = self.module.getConfiguration.bind(self.module),
                    cfgCheckbox = self.module.getConfigurationCheckbox.bind(self.module),
                    graphurl = cfg('graphurl');

                if (graphurl) {

                    $.getJSON(graphurl, {}, function (data) {

                        data.options.onMouseMoveData = function (e, val) {
                            self.module.controller.sendAction('mousetrack', val);
                        };

                        resolve(new Graph(self.dom.get(0), data.options, data.axis));

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
                        options.plugins['graph.plugin.zoom'] = zoomOptions;
                        options.pluginAction['graph.plugin.zoom'] = {shift: false, ctrl: false};
                        options.dblclick = {
                            type: 'plugin',
                            plugin: 'graph.plugin.zoom',
                            options: {
                                mode: 'total'
                            }
                        }
                    }

                    var wheel = cfg('wheelAction');
                    if (wheel && wheel !== 'none') {
                        var wheelOptions = {};

                        if (wheel === 'xAxis') {
                            wheelOptions.direction = 'x';
                        } else {
                            wheelOptions.direction = 'y';
                        }

                        options.wheel = {
                            type: 'plugin',
                            plugin: 'graph.plugin.zoom',
                            options: wheelOptions
                        };
                    }

                    var graph = new Graph(self.dom.get(0), options);

                    var xOptions = {};
                    if (cfgCheckbox('xAsTime', 'xastime')) {
                        xOptions.type = 'time';
                    }

                    // Axes
                    var xAxis = graph.getXAxis(null, xOptions);
                    xAxis
                        .flip(cfgCheckbox('flipAxis', 'flipX'))
                        .togglePrimaryGrid(cfgCheckbox('grid', 'vmain'))
                        .toggleSecondaryGrid(cfgCheckbox('grid', 'vsec'))
                        .setLabel(cfg('xLabel', ''))
                        .forceMin(cfg('minX', false))
                        .forceMax(cfg('maxX', false))
                        .setAxisDataSpacing(cfg('xLeftSpacing', 0), cfg('xRightSpacing', 0));
                    if(!cfgCheckbox('displayAxis', 'x')) {
                        xAxis.hide();
                    }

                    var yAxis = graph.getYAxis();
                    yAxis
                        .flip(cfgCheckbox('flipAxis', 'flipY'))
                        .togglePrimaryGrid(cfgCheckbox('grid', 'hmain'))
                        .toggleSecondaryGrid(cfgCheckbox('grid', 'hsec'))
                        .setLabel(cfg('yLabel', ''))
                        .forceMin(cfg('minY', false))
                        .forceMax(cfg('maxY', false))
                        .setAxisDataSpacing(cfg('yBottomSpacing', 0), cfg('yTopSpacing', 0));
                    if (!cfgCheckbox('displayAxis', 'y')) {
                        yAxis.hide();
                    }


                    var legend = cfg('legend', 'none');
                    if(legend !== 'none') {
                        var theLegend = graph.makeLegend({
                            backgroundColor: 'rgba( 255, 255, 255, 0.8 )',
                            frame: true,
                            frameWidth: '1',
                            frameColor: 'rgba( 100, 100, 100, 0.5 )',
                            movable: true
                        });
                        var posX, posY;
                        switch (legend) {
                            case 'topright':
                                posX = 'right';
                                posY = 'top';
                                break;
                            case 'bottomright':
                                posX = 'right';
                                posY = 'bottom';
                                break;
                            case 'topleft':
                                posX = 'left';
                                posY = 'top';
                                break;
                            case 'bottomleft':
                                posX = 'left';
                                posY = 'bottom';
                                break;
                        }
                        theLegend.setPosition({
                                dx: '-10px',
                                dy: '10px',
                                x: 'max',
                                y: 'max'
                            },
                            posX, // Reference point
                            posY // Reference point
                        );
                    }

                    resolve(graph);

                }

            });

            prom.then(function (graph) {

                self.graph = graph;
                self.xAxis = graph.getXAxis();
                self.yAxis = graph.getYAxis();

                graph.shapeHandlers.mouseOver.push(function (shape) {
                    API.highlight(shape.data, 1);
                });

                graph.shapeHandlers.mouseOut.push(function (shape) {
                    API.highlight(shape.data, 0);
                });

                self.onResize();
                self.resolveReady();

            });

        },

        onResize: function () {
            if( ! this.graph ) {
                return;
            }

            this.graph.resize( this.width, this.height );
            this.graph.redraw();
        },

        redraw: function (forceReacalculateAxis) {

            var cfg = $.proxy(this.module.getConfiguration, this.module);

            if (forceReacalculateAxis) {
                this.graph.redraw();
            } else if (cfg('fullOut') == "none") {
                this.graph.redraw(true, true);
            } else if (cfg('fullOut') == "xAxis") {
                this.graph.redraw(false, true);
            } else if (cfg('fullOut') == "yAxis") {
                this.graph.redraw(true, false);
            } else {
                this.graph.redraw();
            }

            this.graph.autoscaleAxes();
            this.graph.drawSeries();

        },

        doZone: function (varname, zone, value, color) {
            if (value && !zone[2]) {

                var serie = this.series[varname][0];
                var rect = this.graph.makeShape({
                    type: 'rect',
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

        getSerieOptions: function (varname, highlight) {
            var self = this,
                plotinfos = this.module.getConfiguration('plotinfos');

            highlight = highlight || [];

            var options = {
                trackMouse: true
            };

            if (plotinfos) {
                for (var i = 0, l = plotinfos.length; i < l; i++) {
                    if (varname == plotinfos[i].variable) {

                        options.lineToZero = !plotinfos[i].plotcontinuous[0];
                        options.useSlots = (plotinfos[i].optimizeSlots ? !!plotinfos[i].optimizeSlots[0] : false);

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
                API.highlight(highlight[index[0]], 1);
                self.module.controller.onMouseOverMarker(xy, infos);
            };
            options.onMouseOutMarker = function (index, infos, xy) {
                API.highlight(highlight[index[0]], 0);
                self.module.controller.onMouseOutMarker(xy, infos);
            };

            return options;

        },

        setSerieParameters: function (serie, varname, highlight) {
            var plotinfos = this.module.getConfiguration('plotinfos');

            highlight = highlight || [];

            if (plotinfos) {

                for (var i = 0, l = plotinfos.length; i < l; i++) {
                    if (varname == plotinfos[i].variable) {

                        serie.setLineColor(Util.getColor(plotinfos[i].plotcolor));
                        serie.setLineWidth(parseFloat(plotinfos[i].strokewidth) || 1);

                        if (plotinfos[i].markers[0] && serie.showMarkers) {
                            serie.showMarkers();
                            serie.setMarkers([{
                                type: 1,
                                zoom: 2,
                                strokeColor: Util.getColor(plotinfos[i].plotcolor),
                                fillColor: Util.getColor(plotinfos[i].plotcolor),
                                points: 'all'
                            }]);
                        }

                        if(plotinfos[i].monotoneous && plotinfos[i].monotoneous[0]) {
                            serie.XIsMonotoneous();
                        }

                        if(plotinfos[i].degrade) {
                            serie.degrade(plotinfos[i].degrade);
                        }
                    }
                }
            }

            API.listenHighlight(highlight, function (value, commonKeys) {
                serie.toggleMarker([ highlight.indexOf(commonKeys[0]), 0 ], value, true);
            });

        },


        blank: {

            xyArray: function (varName) {

                this.removeSerie(varName);
            },

            xArray: function (varName) {

                this.removeSerie(varName);
            },

            jcamp: function (varName) {

                this.removeSerie(varName);
            },

            chart: function (varName) {

                this.removeSerie(varName);
            }
        },


        update: {

            fromTo: function (moduleValue) {
                var view = this;

                if (!moduleValue || !moduleValue.value)
                    return;

                if (view.dom.data('spectra')) {
                    view.dom.data('spectra').setBoundaries(moduleValue.value.from, moduleValue.value.to);
                }

            },

            /* OLD FORMAT
             * chart: function(moduleValue, varname) {

<<<<<<< HEAD
				if( this.graph ) {

					this.graph.getBottomAxis()._doZoomVal(moduleValue.value.from, moduleValue.value.to, true);
					this.graph.redraw( false, true, false );
					this.graph.drawSeries();
				}
=======
             this.series[varname] = this.series[varname] || [];
             this.removeSerie( varname );
>>>>>>> jsgraph

             if(!moduleValue)
             return;

             var newSeries=moduleValue.series || moduleValue;
             if (!(newSeries instanceof Array)) {
             newSeries=[newSeries];
             }

             for (var i=0; i<newSeries.length; i++) {
             var newSerie = newSeries[i];
             var valFinal=[];
             if(newSerie.y) {
             for(var j = 0, l = newSerie.y.length; j < l; j++) {
             valFinal.push(newSerie.x ? newSerie.x[j] : j);
             valFinal.push(newSerie.y[j]);
             }
             }

             var serie = this.graph.newSerie(varname, {trackMouse: true});

             this.setSerieParameters(serie, varname, newSerie._highlight);

             this.normalize( valFinal, varname );
             serie.setData( valFinal );

             if( newSerie.infos ) {
             serie.setInfos( newSerie.infos );
             }
             serie.autoAxis();
             this.series[varname].push(serie);
             }

             this.redraw();
             },*/

            chart: function (moduleValue, varname) {
                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                if (!moduleValue) {
                    return;
                }

                moduleValue = moduleValue.get();

                var data = moduleValue.data;
                for (var i = 0; i < data.length; i++) {

                    var aData = data[i];
                    var serieName = data.serieLabel;

                    var valFinal = [];

                    switch(aData.serieType) {
                        case "zone":
                            if(aData.yMin && aData.yMax) {
                                for(var j= 0, l= aData.yMax.length; j<l; j++) {
                                    valFinal.push(aData.x ? aData.x[j] : j);
                                    valFinal.push(aData.yMin[j], aData.yMax[j]);
                                }
                            }
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


                    var serie = this.graph.newSerie(serieName, this.getSerieOptions(varname, aData._highlight), aData.serieType || undefined);

                    this.normalize(valFinal, varname);
                    serie.setData(valFinal);

                    if (aData.infos) {
                        serie.setInfos(aData.infos);
                    }

                    serie.autoAxis();
                    this.setSerieParameters(serie, varname, aData._highlight);

                    this.series[varname].push(serie);
                }

                this.redraw();
            },

            xyArray: function (moduleValue, varname) {

                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                if (!moduleValue) {
                    return;
                }

                var val = moduleValue.get();

                var serie = this.graph.newSerie(varname, this.getSerieOptions(varname));
             
                this.normalize(val, varname);
                serie.setData(val);
                serie.autoAxis();
                this.setSerieParameters(serie, varname);

                this.series[varname].push(serie);
                this.redraw();
            },

// in fact it is a Y array ...
            xArray: function (moduleValue, varname) {
                var self = this,
                    val;


                //			self.graph.setOption('zoomMode', self.module.getConfiguration( 'zoom' ) );

                this.series[varname] = this.series[varname] || [];
                this.removeSerie(varname);

                if (!moduleValue)
                    return;

                val = DataTraversing.getValueIfNeeded(moduleValue);

                var serie = self.graph.newSerie(varname, this.getSerieOptions(varname));

                function buildVal(val) {
                    var minX = self.module.getConfiguration('minX', 0);
                    var maxX = self.module.getConfiguration('maxX', val.length - 1);
                    var step = (maxX - minX) / (val.length - 1);
                    var val2 = [];
                    for (var i = 0, l = val.length; i < l; i++) {
                        val2.push(minX + step * i);
                        val2.push(val[i]);
                    }

                    self.normalize(val2, varname);

                    return val2;
                }

                var changeid = moduleValue.onChange(function () {

                    serie.setData(buildVal(this.get()));
                    self.redraw();
                });

                this.setOnChange(changeid, varname, moduleValue);


                $.when(val).then(function (value) {

                    // lineToZero: !continuous}
                   

                    serie.setData(buildVal(value));

                    serie.autoAxis();
                    self.setSerieParameters(serie, varname);
                    self.series[ varname ].push(serie);
                    self.redraw();
                });

            },

            annotations: function (value) {
                API.killHighlight(this.module.getId());
                this.annotations = value.get();
                this.resetAnnotations();
            },

            jcamp: function (moduleValue, varname) {

                if (!moduleValue) {
                    return;
                }

                moduleValue = String(moduleValue.get()); // Get the true jcamp value

                var self = this,
                    serie,
                    spectra;

                API.killHighlight(this.module.getId() + varname);

                if (!this.graph) {
                    return;
                }

                this.zones[varname] = moduleValue._zones;

                if (self.deferreds[ varname ]) {
                    self.deferreds[ varname ].reject();
                }

                self.deferreds[ varname ] = $.Deferred();
                var def = self.deferreds[ varname ];

                require([ 'components/jcampconverter/build/jcampconverter' ], function (JcampConverter) {

                    JcampConverter.convert(moduleValue, { lowRes: 1024 }, true).then(function (spectra) {

                        if (def.state() == "rejected") {
                            return;
                        }

                        self.deferreds[ varname ] = false;
                        self.series[ varname ] = self.series[ varname ] || [];
                        self.series[ varname ] = [];

                        if (spectra.contourLines) {

                            serie = self.graph.newSerie(varname, self.getSerieOptions(varname), 'contour');
                            
                            serie.setData(spectra.contourLines);
                            serie.autoAxis();
                            self.setSerieParameters(serie, varname);
                            self.series[ varname ].push(serie);

                        } else {

                            spectra = spectra.spectra;
                            for (var i = 0, l = spectra.length; i < l; i++) {
                                serie = self.graph.newSerie(varname, self.getSerieOptions(varname));

                                var data = spectra[i].data[spectra[i].data.length - 1];

                                
                                self.normalize(data, varname);
                                serie.setData(data);
                                serie.autoAxis();
                                self.setSerieParameters(serie, varname);
                                self.series[varname].push(serie);
                                break;
                            }

                            API.listenHighlight(moduleValue._highlight || [], function (value, commonKeys) {

                                for (var i = 0; i < commonKeys.length; i++) {

                                    if (self.zones[ varname ][ commonKeys[ i ] ]) {

                                        self.doZone(varname, self.zones[ varname ][ commonKeys [ i ] ], value, self.series[varname].options.lineColor);
                                    }
                                }
                            }, true, self.module.getId() + varname);
                        }
                        self.redraw();
                        self.resetAnnotations();
                    });
                });
            },


            series_xy1d: function (data) { // Receives an array of series. Blank the other ones.

                /*if( ! data.data ) {
                 return;
                 }*/

                this.graph.removeSeries();

                //data = data.get();

                var i = 0,
                    l = data.length;

                for (; i < l; i++) {

                    var serie = this.graph.newSerie();

                    serie.autoAxis();
                    serie.setData(data[ i ].data);
                    //	serie.setLabel( data[ i ].label.toString( ) );
                    serie.setLineWidth(data[ i ].lineWidth || 1);
                    serie.setLineColor(data[ i ].lineColor || Util.getColor(Util.getNextColorRGB(i, l)));
                }

                this.redraw();
            }
        },

        setOnChange: function (id, varname, obj) {


            if (this.onchanges[ varname ]) {
                this.onchanges[ varname ].obj.unbindChange(this.onchanges[ varname ].id);
            }

            this.onchanges[ varname ] = { obj: obj, id: id };


        },

        resetAnnotations: function () {
            if (!this.annotations) {
                return;
            }
            if (this.annotationShapes) {
                for(i = 0; i < this.annotationShapes.length; i++) {
                    this.annotationShapes[i].kill();
                }
            }
            this.annotationShapes = [];
            var i = 0, l = this.annotations.length;
            for (; i < l; i++) {
                this.doAnnotation(this.annotations[i]);
            }
        },

        doAnnotation: function (annotation) {
            if (!this.graph) {
                return;
            }

            var self = this,
                shape = this.graph.newShape(annotation);

            shape.then(function (shape) {
                self.annotationShapes.push(shape);
                shape.setSelectable(false);
                shape.setMovable(false);
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
                            fill:'black'
                        });
                    } else {
                        shape.unHighlight();
                    }
                }, false, self.module.getId());

                shape.draw();
                shape.redraw();
            });

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

            var self = this,
                serie = this.graph.newSerie(data.name);

            data.onChange(function () {

                serie.setData(data.data);
                self.graph.redraw();
                self.graph.drawSeries();
            });

            this.onActionReceive.removeSerieByName.call(this, data.name || {});
            serie.autoAxis();
            serie.setData(data.data);

            this.seriesActions.push([ value, serie, data.name ]);
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
            fromTo: function (value) {
                this.graph.getBottomAxis()._doZoomVal(value.value.from, value.value.to, true);

                this.graph.redraw(true);
                this.graph.drawSeries();

            },

            addSerie: function (value) {

                this.colorId++;
                value = value.get();

                if (value.name) {
                    this.makeSerie(value, value, value.name);
                } else {

                    for (var i in value) {
                        this.makeSerie(value[i], value);
                    }
                }
            },

            removeSerie: function (value) {

                value = value.get();

                for (var i = 0, l = this.seriesActions.length; i < l; i++) {

                    if (this.seriesActions[ i ][ 0 ] == value) {
                        this.seriesActions[ i ][ 1 ].kill();
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
            }
        },

        getDom: function () {
            return this.dom;
        },

        normalize: function (array, varname) {

            var plotinfos = this.module.getConfiguration('plotinfos');
            var maxValue, minValue, i, l;

            if (!plotinfos) return;
            var normalize = "";
            for (i = 0, l = plotinfos.length; i < l; i++) {
                if (varname == plotinfos[i].variable) {
                    normalize = plotinfos[i].normalize
                }
            }
            if (!normalize) return;
            if (normalize == "max1") {
                maxValue = Number.MIN_VALUE;
                for (i = 1; i < array.length; i = i + 2) {
                    if (array[i] > maxValue) maxValue = array[i];
                }
                for (i = 1; i < array.length; i = i + 2) {
                    array[i] /= maxValue;
                }
            } else if (normalize == "sum1") {
                var total = 0;
                for (i = 1; i < array.length; i = i + 2) {
                    total += array[i];
                }
                for (i = 1; i < array.length; i = i + 2) {
                    array[i] /= total;
                }
            } else if (normalize == "max1min0") {
                maxValue = Number.MIN_VALUE;
                minValue = Number.MAX_VALUE;
                for (i = 1; i < array.length; i = i + 2) {
                    if (array[i] > maxValue) maxValue = array[i];
                    if (array[i] < minValue) minValue = array[i];
                }
                var ratio = 1 / (maxValue - minValue);
                for (i = 1; i < array.length; i = i + 2) {
                    array[i] = (array[i] - minValue) * ratio;
                }
            }
        }

    });

    return View;

});