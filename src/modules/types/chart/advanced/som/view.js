'use strict';

define(['modules/default/defaultview', 'components/jsgraph/dist/jsgraph.min', 'src/util/color', 'chroma'], function (Default, Graph, Color, chroma) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {
        init: function () {
            this.dom = document.createElement('div');
            this.dom.style.height = '100%';
            this.dom.style.width = '100%';
            this.dom.style.overflow = 'hidden';
            this.module.getDomContent().html(this.dom);
            this.series = {};
            this.datasetInfo = {};
        },
        inDom: function () {
            var self = this;
            var axisOptions = {
                primaryGrid: false,
                secondaryGrid: false
            };
            this.graph = new Graph(this.dom, {
                close: {
                    left: false,
                    right: false,
                    top: false,
                    bottom: false
                },
                plugins: {
                    'graph.plugin.zoom': {
                        zoomMode: 'xy'
                    }
                },
                pluginAction: {
                    'graph.plugin.zoom': {
                        shift: false,
                        ctrl: false
                    }
                },
                dblclick: {
                    type: 'plugin',
                    plugin: 'graph.plugin.zoom',
                    options: {
                        mode: 'total'
                    }
                }
            }, {
                bottom: [axisOptions],
                left: [axisOptions]
            }, function (graph) {
                graph.shapeHandlers.mouseOver.push(function (shape) {
                    self.module.controller.onCellHover(shape.data);
                });
                graph.getXAxis().hide().setAxisDataSpacing(0, 0);
                graph.getYAxis().hide().setAxisDataSpacing(0, 0);
                self.resolveReady();
            });
        },
        blank: {
            model: function () {
                this.graph.removeShapes();
            },
            dataset: function (name) {
                if (this.series[name]) {
                    this.series[name].kill();
                    delete this.series[name];
                }
                if (this.datasetInfo[name]) {
                    this.datasetInfo[name] = null;
                }
            }
        },
        update: {
            model: function (value) {
                if (String(value.get('name')) !== 'SOM') {
                    return;
                }
                var data = value.get('data');
                var x = data.length,
                    y = data[0].length;
                var graph = this.graph;

                var i;

                var cfg = this.module.getConfiguration.bind(this.module);
                var field1 = cfg('bgField1'),
                    field2 = cfg('bgField2'),
                    field3 = cfg('bgField3');
                var fields = value.options.fields;
                if (Array.isArray(fields)) {
                    for (i = 0; i < fields.length; i++) {
                        if (fields[i].name === field1) {
                            field1 = i;
                        }
                        if (fields[i].name === field2) {
                            field2 = i;
                        }
                        if (fields[i].name === field3) {
                            field3 = i;
                        }
                    }
                }
                var getColor = colorGenerator(cfg('bgType'), cfg('bgSpace'), cfg('bgColor1'), cfg('bgColor2'), field1, field2, field3);

                // Set size of axes to fit the grid
                graph.getXAxis().forceMin(0).forceMax(x);
                graph.getYAxis().forceMin(0).forceMax(y);

                for (i = 0; i < x; i++) {
                    for (var j = 0; j < y; j++) {
                        var shape = graph.newShape({
                            type: 'rect',
                            pos: {
                                x: i,
                                y: j
                            },
                            pos2: {
                                x: i + 1,
                                y: j + 1
                            },
                            shapeOptions: {
                                locked: true
                            },
                            fillColor: getColor(data[i][j])[0],
                            layer: 1,
                            info: data[i][j]
                        }, null, null, true);
                        shape.draw();
                        shape.redraw();
                    }
                }

                this.redraw();
            },
            dataset: function (value, name) {
                var i, getColor;
                var config = this.module.getConfiguration('datasets'),
                    theConfig;
                if (config) {
                    for (i = 0; i < config.length; i++) {
                        if (config[i].groups.group[0].dataset[0] === name) {
                            theConfig = config[i].groups.group[0];
                            break;
                        }
                    }
                }

                if (!theConfig) {
                    getColor = colorGenerator('fixed', null, [255, 0, 0, 1]);
                } else {
                    switch(theConfig.colorType[0]) {
                        case 'fixed':
                            getColor = colorGenerator('fixed', null, theConfig.color1[0]);
                            break;
                        case 'jpath':
                            // TODO perf check
                            getColor = function (value) {
                                var color1 = chroma(String(DataObject.check(value).getChildSync(theConfig.jpath1[0])));
                                var color2 = color1.alpha(color1.alpha() / 2);
                                return [color1.css(), color2.css()];
                            };
                            break;
                    }
                }

                var self = this;
                var data = value.getChildSync(['data', '0']);
                var l = data.x.length;
                var theData = new Array(l * 2);
                var colors = new Array(l), color;
                for (i = 0; i < l; i++) {
                    theData[i * 2] = data.x[i];
                    theData[i * 2 + 1] = data.y[i];
                    color = getColor(data.info[i]);
                    colors[i] = {
                        shape: 'circle',
                        r: 2.5,
                        fill: color[1],
                        stroke: color[0]
                    }
                }
                var serie = this.series[name] = this.graph.newSerie(name, {
                    layer: 2
                }, 'scatter')
                    .autoAxis()
                    .setData(theData)
                    .setDataStyle({
                        shape: 'circle',
                        r: 2.5
                    }, colors);
                if (data.info) {
                    serie.on('mouseover', function (id) {
                        serie.selectPoint(id);
                        self.module.controller.onElementHover(data.x[id], data.y[id], data.info[id]);
                    });
                    serie.on('mouseout', function (id) {
                        serie.selectPoint(id, false);
                    });
                }
                serie.setSelectedStyle({
                    r: 5
                });

                this.redraw();
            }
        },
        onResize: function (width, height) {
            if (!this.graph) {
                return;
            }
            this.graph.resize(width, height);
            this.redraw();
        },
        redraw: function () {
            this.graph.redraw();
            this.graph.autoscaleAxes();
            this.graph.drawSeries();
        }
    });

    function colorGenerator(type, space, colorA1, colorA2, field1, field2, field3) {
        var color1 = chroma(colorA1),
            color2 = chroma(colorA2),
            scale, val1, val2, color;
        if (type === 'fixed') {
            val1 = color1.css();
            val2 = color1.alpha(color1.alpha() / 2).css();
            return function fixedColor() {
                return [val1, val2];
            }
        } else if (type === 'range') {
            scale = chroma.scale([color1, color2]).mode(space);
            return function rangeColor(value) {
                color = scale(value[field1]);
                val1 = color.css();
                val2 = color.alpha(color.alpha() / 2).css();
                return [val1, val2];
            }
        } else if (type === 'inter') {
            var interpolators = getInterpolators(colorA1, colorA2);
            var mean = (colorA1[3] + colorA2[3]) / 2;
            return function interpolatedColor(value) {
                color = chroma([interpolators[0](value[field1]), interpolators[1](value[field2]), interpolators[2](value[field3]), mean]);
                val1 = color.css();
                val2 = color.alpha(color.alpha() / 2).css();
                return [val1, val2];
            }
        }
    }

    function getInterpolators(color1, color2) {
        return [getInterpolator(color1[0], color2[0]), getInterpolator(color1[1], color2[1]), getInterpolator(color1[2], color2[2])];
    }

    function getInterpolator(a, b) {
        a = +a;
        b = +b;
        return function interpolator(t) {
            return a * (1 - t) + b * t;
        };
    }

    return View;

});