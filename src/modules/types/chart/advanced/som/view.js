'use strict';

define(['modules/default/defaultview', 'components/jsgraph/dist/jsgraph.min', 'd3'], function (Default, Graph, d3) {

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

                // Set size of axes to fit the grid
                graph.getXAxis().forceMin(0).forceMax(x);
                graph.getYAxis().forceMin(0).forceMax(y);

                for (var i = 0; i < x; i++) {
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
                            fillColor: 'rgba(0,0,0,0.3)',
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
                var self = this;
                var data = value.getChildSync(['data', '0']);
                var l = data.x.length;
                var theData = new Array(l * 2);
                for (var i = 0; i < l; i++) {
                    theData[i * 2] = data.x[i];
                    theData[i * 2 + 1] = data.y[i];
                }
                var serie = this.series[name] = this.graph.newSerie(name, {
                    layer: 2
                }, 'scatter')
                    .autoAxis()
                    .setData(theData)
                    .setDataStyle({
                        shape: 'circle',
                        r: 2.5,
                        fill: 'rgba(255, 0, 0, 0.3)',
                        stroke: 'rgb(255, 100, 0)'
                    });
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
            this.graph.drawSeries();
        }
    });

    return View;

});