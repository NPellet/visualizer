'use strict';

define(['modules/default/defaultview', 'components/jsgraph/dist/jsgraph.min', 'src/util/datatraversing', 'components/jcampconverter/src/jcampconverter'], function (Default, Graph, Traversing, JcampConverter) {

    function View() {
    }

    View.prototype = $.extend(true, {}, Default, {

        init: function () {
            this.dom = $('<table cellpadding="0" cellspacing="0" class="nmr-wrapper"><tr><td></td><td class="nmr-1d nmr-1d-x nmr-main"></td></tr><tr class="nmr-main"><td class="nmr-1d nmr-1d-y"></td><td class="nmr-2d"></td></tr></table>');
            this.module.getDomContent().html(this.dom);
        },

        inDom: function () {

            var self = this;

            this.graphs = {};
            this.series = {};

            // Create 2D graph
            this.graphs['_2d'] = new Graph(this.dom.find('.nmr-2d').get(0), {
                close: {
                    left: false,
                    top: false,
                    right: false
                },
                paddingBottom: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                plugins: {
                    'graph.plugin.zoom': {
                        zoomMode: 'xy',
                        onZoomStart: function (graph, x, y, e) {
                            self.graphs['x']._pluginExecute('graph.plugin.zoom', 'onMouseDown', [ self.graphs['x'], x, y, e, true ]);
                            self.graphs['y']._pluginExecute('graph.plugin.zoom', 'onMouseDown', [ self.graphs['y'], x, y, e, true ]);
                        },
                        onZoomMove: function (graph, x, y, e) {
                            self.graphs['x']._pluginExecute('graph.plugin.zoom', 'onMouseMove', [ self.graphs['x'], x, y, e, true ]);
                            self.graphs['y']._pluginExecute('graph.plugin.zoom', 'onMouseMove', [ self.graphs['y'], x, y, e, true ]);
                        },
                        onZoomEnd: function (graph, x, y, e) {
                            self.graphs['x']._pluginExecute('graph.plugin.zoom', 'onMouseUp', [ self.graphs['x'], x, y, e, true ]);
                            self.graphs['y']._pluginExecute('graph.plugin.zoom', 'onMouseUp', [ self.graphs['y'], x, y, e, true ]);
                        },
                        onDblClick: function (x, y, prefs, e) {
                            self.graphs['y']._pluginExecute('graph.plugin.zoom', 'onDblClick', [ self.graphs['y'], x, y, { mode: 'total' }, e, true ]);
                            self.graphs['x']._pluginExecute('graph.plugin.zoom', 'onDblClick', [ self.graphs['x'], x, y, { mode: 'total' }, e, true ]);
                        }
                    }
                },
                dblclick: {
                    type: 'plugin',
                    plugin: 'graph.plugin.zoom',
                    options: {
                        mode: 'total'
                    }
                },
                pluginAction: {
                    'graph.plugin.zoom': { shift: false, ctrl: false },
                    'graph.plugin.shape': { shift: true, ctrl: false }
                },
                wheel: {
                    type: 'toSeries'
                }
            });

            // Create 2D serie
            this.series['_2d'] = this.graphs['_2d'].newSerie('serie2d', {}, 'contour')
                .autoAxis();
            this.series['_2d'].getXAxis()
                .setLabel('ppm')
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false)
                .setDisplay(false)
                .flip(true);
            this.series['_2d'].getYAxis()
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false)
                .setDisplay(false)
                .flip(true);

            // Create 1D x graph
            this.graphs['x'] = new Graph(this.dom.find('.nmr-1d-x').get(0), {
                close: {
                    left: false,
                    top: false,
                    right: false
                },
                paddingBottom: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 0,
                plugins: {
                    'graph.plugin.zoom': {
                        zoomMode: 'x',
                        onZoomStart: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseDown', [ self.graphs[ '_2d' ], x, undefined, e, true ]);
                        },
                        onZoomMove: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseMove', [ self.graphs[ '_2d' ], x, undefined, e, true ]);
                        },
                        onZoomEnd: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseUp', [ self.graphs[ '_2d' ], x, undefined, e, true ]);
                        },
                        onDblClick: function (x, y, prefs, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onDblClick', [ self.graphs[ '_2d' ], x, y, { mode: 'xtotal' }, e, true ]);
                        }
                    }
                },
                dblclick: {
                    type: 'plugin',
                    plugin: 'graph.plugin.zoom',
                    options: {
                        mode: 'total'
                    }
                },
                pluginAction: {
                    'graph.plugin.zoom': { shift: false, ctrl: false },
                    'graph.plugin.shape': { shift: true, ctrl: false }
                }
            });

            // Created 1D y serie
            this.series['x'] = this.graphs['x'].newSerie('serieX', { useSlots: true })
                .autoAxis();
            this.series['x'].getYAxis()
                .setDisplay(false)
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false);
            this.series['x'].getXAxis()
                .flip(true)
                .setLabel('ppm')
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false).
                setTickPosition('outside');

            // Create 1D y graph
            this.graphs['y'] = new Graph(this.dom.find('.nmr-1d-y').get(0), {
                close: {
                    left: false,
                    top: false,
                    right: false
                },
                paddingBottom: 0,
                paddingTop: 0,
                paddingLeft: 0,
                paddingRight: 10,
                plugins: {
                    'graph.plugin.zoom': {
                        zoomMode: 'y',
                        onZoomStart: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseDown', [ self.graphs[ '_2d' ], undefined , y, e, true ]);
                        },
                        onZoomMove: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseMove', [ self.graphs[ '_2d' ], undefined , y, e, true ]);
                        },
                        onZoomEnd: function (graph, x, y, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onMouseUp', [ self.graphs[ '_2d' ], undefined, y, e, true ]);
                        },
                        onDblClick: function (x, y, prefs, e) {
                            self.graphs[ '_2d' ]._pluginExecute('graph.plugin.zoom', 'onDblClick', [ self.graphs[ '_2d' ], x, y, { mode: 'ytotal' }, e, true ]);
                        }
                    }
                },
                dblclick: {
                    type: 'plugin',
                    plugin: 'graph.plugin.zoom',
                    options: {
                        mode: 'total'
                    }
                },
                pluginAction: {
                    'graph.plugin.zoom': { shift: false, ctrl: false },
                    'graph.plugin.shape': { shift: true, ctrl: false }
                },
                wheel: {
                    type: 'plugin',
                    plugin: 'graph.plugin.zoom',
                    options: {
                        direction: 'x'
                    }
                }
            });

            // Create 1D y serie
            this.series['y'] = this.graphs['y'].newSerie('serieY', { flip: true, useSlots: true })
                .setXAxis(self.graphs['y'].getBottomAxis())
                .setYAxis(self.graphs['y'].getRightAxis());
            this.series['y'].getYAxis()
                .setLabel('ppm')
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false)
                .flip(true)
                .setTickPosition('outside');
            this.series['y'].getXAxis()
                .togglePrimaryGrid(false)
                .toggleSecondaryGrid(false)
                .setDisplay(false)
                .flip(true);

            this.resolveReady();

        },

        onResize: function () {
            if (this.graphs['_2d']) {
                this.graphs['_2d'].resize(this.width - 60, this.height - 60);
            }
            if (this.graphs['x']) {
                this.graphs['x'].resize(this.width - 60, 50);
            }
            if (this.graphs['y']) {
                this.graphs['y'].resize(50, this.height - 60);
            }
            this.redraw();
        },

        update: {

            jcampx: function (moduleValue) {
                this.addSerieJcampXOrY(moduleValue, true, false);
            },

            jcampy: function (moduleValue) {
                this.addSerieJcampXOrY(moduleValue, false, true);
            },

            jcampxy: function (moduleValue) {
                this.addSerieJcampXOrY(moduleValue, true, true);
            },

            jcamp2d: function (moduleValue) {
                var self = this;
                JcampConverter(String(moduleValue.get())).then(function (result) {
                    var data = result.contourLines;
                    self.series['_2d'].setData(data);
                    self.redraw();
                });
            },

            annotations: function (value) {
                /*
                 TODO annotations ?
                 */
                /* value = DataTraversing.getValueIfNeeded(value);

                 console.log(value);
                 if (!value)
                 return;

                 this.annotations = value;
                 this.resetAnnotations(true);*/
            }
        },


        addSerieJcampXOrY: function (value, x, y) {
            var self = this;
            JcampConverter(String(value.get())).then(function (result) {
                var data = result.spectra[0].data[0];
                if (x) {
                    self.series['x'].setData(data);
                }
                if (y) {
                    self.series['y'].setData(data);
                }
                self.redraw();
            });
        },

        redraw: function () {
            if (this.graphs['y']) {
                this.graphs['y'].redraw();
                this.graphs['y'].autoscaleAxes();
                this.graphs['y'].drawSeries();
            }
            if (this.graphs['x']) {
                this.graphs['x'].redraw();
                this.graphs['x'].autoscaleAxes();
                this.graphs['x'].drawSeries();
            }
            if (this.graphs['_2d']) {
                this.graphs['_2d'].redraw();
                this.graphs['_2d'].autoscaleAxes();
                this.graphs['_2d'].drawSeries();
            }
        }

    });

    return View;

});

 
