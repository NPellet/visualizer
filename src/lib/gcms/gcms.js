'use strict';

define(['jquery', 'jsgraph'], function ($, Graph) {

    var defaults = {
        msIsContinuous: false,
        title: 'GC-MS',
        onlyOneMS: false
    };

    function GCMS(domGC, domMS, options) {

        this.options = $.extend(true, {}, defaults, options);

        // A GC can have more than 1 serie
        this.gcData = null;
        this.gcSerie = null;

        // Contains the ms Data
        this.msData = null;

        this.domGC = domGC;
        this.domMS = domMS;

        this.firstMsSerie = true;

        this.init();

        this.aucs = [];
        this.ingredients = [];
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
                    zoom: {zoomMode: 'x'},
                    shape: {
                        type: 'areaundercurve',
                        color: [200, 0, 0],
                        fillColor: 'rgba(200,0,0,0.3)',
                        strokeColor: 'rgba(200,0,0,1)',
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
                handleMouseLeave: function () {

//							if( that.msSerieMouseTrack ) {
//								that.msSerieMouseTrack.kill();
//								that.msSerieMouseTrack = false;
//							}
                },
                onMouseMoveData: function (e, val) {

                    if (that.lockTrackingLine) {
                        return;
                    }

                    for (var i in val) { // Get the first value
                        break;
                    }

                    if (val[i] == undefined || !that.msData) {
                        return;
                    }

                    var x = val[i].xBeforeIndex;

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
                        axisDataSpacing: {min: 0, max: 0.1},

                        onZoom: function (from, to) {

                            // Zoom on GC has changed
                            that.updateIngredientPeaks();


                            that.trigger('onZoomGC', [from, to]);
                        }
                    }
                ],
                top: [
                    {
                        labelValue: 'RI',
                        primaryGrid: false,
                        secondaryGrid: false
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
                    zoom: {zoomMode: 'x'}
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
                        axisDataSpacing: {min: 0, max: 0.1},

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
                        axisDataSpacing: {min: 0, max: 0.2}
                    }
                ],

                right: [
                    {
                        primaryGrid: false,
                        secondaryGrid: false,
                        nbTicksSecondary: 5,
                        display: false,
                        axisDataSpacing: {min: 0, max: 0.2}
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

            this.gcGraph.on('click', function (e) {
                e = e[3];
                if (e.target.nodeName == 'path' || e.target.nodeName == 'text') {
                    return;
                }

                //that.lockTrackingLine = !that.lockTrackingLine;
            });

            var shape = this.gcGraph.newShape({
                type: 'line',
                position: [
                    {x: 100, y: 'min'},
                    {x: 100, y: 'max'}
                ],
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
                if (data.ingredient) {
                    that.trigger('ingredientSelected', data.ingredient);
                }


                if (data.type == 'areaundercurve') {
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
                    this.trigger('AUCCreated', [shape]);
                }
            });

            graph.on('shapeSelected', (shape) => {
                if (shape.type === 'areaundercurve') {
                    this.doMsFromAUC(shape);
                    this.trigger('AUCSelected', [shape]);
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

            /*this.gcGraph.shapeHandlers.onCreated.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             shape.setSerie(that.gcGraph.getSerie(0));

             that.aucs.push(shape);
             that.trigger('AUCCreated', shape);
             });

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

             this.gcGraph.shapeHandlers.onSelected.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             that.trigger('AUCSelected', shape);
             });

             this.gcGraph.shapeHandlers.onUnselected.push(function (shape) {

             if (!( shape.data.type == 'areaundercurve' )) {
             return;
             }

             that.trigger('AUCUnselected', shape);
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

            this.trigger('MZChange', [shapes.map(function (shape) {
                return shape.data.mz;
            })]);
        },


        resize: function (w, h) {

            var h1 = h * 0.7;
            var h2 = h * 0.3;

            this.gcGraph.resize(w, h1);
            this.msGraph.resize(w, h2);

            this.gcGraph.drawSeries();
            this.msGraph.drawSeries();

            this.gcGraph._dom.style.height = h1 + 'px';
            this.msGraph._dom.style.height = h2 + 'px';
        },


        setRIComponents: function (components) {


            this.gcGraph.getTopAxis().linkToAxis(this.gcGraph.getBottomAxis(), function (val) {

                var result = 0;
                var i;
                for (i = 0; i < components.length; i++) {
                    result += components[i] * Math.pow(val, components.length - i - 1);
                }
                return result;

            }, 1);

            this.gcGraph.redraw();
            this.gcGraph.drawSeries();
        },

        doMsFromAUC: function (annot, shape) { // Creating an averaged MS on the fly
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

            if (indexMax == indexMin) {
                return;
            }

            for (i = indexMin; i <= indexMax; i++) {

                for (j = 0, l = that.msData[i].length; j < l; j += 2) {

                    floor = Math.floor(that.msData[i][j] + 0.3);

                    if (obj[floor]) {

                        obj[floor] += that.msData[i][j + 1];

                    } else {

                        obj[floor] = that.msData[i][j + 1];
                        allMs.push(floor);
                    }
                }
            }

            allMs.sort((a, b) => a - b);

            for (i = 0; i < allMs.length; i++) {
                finalMs.push(allMs[i]);
                finalMs.push(Math.round(obj[allMs[i]] / Math.abs(indexMax - indexMin)));
            }

            if (this.options.onlyOneMS) {
                var buffer = self;

                if (this.extMS) {
                    this.extMS.kill(true);
                    this.extMS = false;
                }

            } else {
                var buffer = shape;
            }

            if (!buffer.msFromAucSerie) {

                buffer.msFromAucSerie = this
                    .msGraph
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
            buffer.msFromAucSerie.setLineColor(annot.strokeColor || annot.fillColor || 'red');

            // that.msGraph._updateAxes();

            if (this.firstMsSerie) {
                that.msGraph.getBottomAxis().setMinMaxToFitSeries();
                this.firstMsSerie = false;
            }

            that.msGraph.getRightAxis().scaleToFitAxis(that.msGraph.getBottomAxis()/*, buffer.msFromAucSerie */);

            that.msGraph.redraw();
            that.msGraph.drawSeries();


            that.trigger('onMsFromAUCChange', [finalMs, annot, buffer.msFromAucSerie]);
        },

        clearMsFromAuc() {
            if (this.msFromAucSerie) {
                this.msFromAucSerie.setData(null);
                this.msFromAucSerie.draw();
            }
        },


        addAUC: function (from, to, options) {

            var that = this,
                obj = {
                    position: [
                        {x: from},
                        {x: to}
                    ],

                    type: 'areaundercurve',
                    color: [200, 0, 0],
                    fillColor: 'rgba(200,0,0,0.3)',
                    strokeColor: 'rgba(200,0,0,1)',
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
            /*return;
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

            this.gcGraph.getBottomAxis().zoom(start - (end - start) * 0.4, end + (end - start) * 0.4);
            this.gcGraph.getLeftAxis().scaleToFitAxis(this.gcGraph.getBottomAxis(), start, end);

            this.gcGraph.redraw();
            this.gcGraph.drawSeries();

            this.updateIngredientPeaks();
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

            this.gcSerie.kill();
            this.gcSerie = null;
            this.gcData = null;

            if (this.msSerieMouseTrack) {
                this.msSerieMouseTrack.kill(true);
                this.msSerieMouseTrack = false;
            }
        },

        setGC: function (gc) {
            var serie,
                that = this;

            if (!this.gcGraph) {
                return;
            }

            this.blank();

            for (var i in gc) {

                serie = this.gcGraph.newSerie(i, {
                    useSlots: false
                }).autoAxis().setData(gc[i]).XIsMonotoneous();
                serie.setLineWidth(1, 'selected');
                this.gcGraph.selectSerie(serie);
                serie.autoAxis();
                this.gcGraph.redraw();
                this.gcGraph.drawSeries();


                var axis = this.gcGraph.getBottomAxis();
                var from = axis.getCurrentMin();
                var to = axis.getCurrentMax();

                this.trigger('onZoomGC', [from, to]);


                this.gcData = gc[i];
                this.gcSerie = serie;

                break;
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
            this.updateIngredientPeaks();
        },

        setMS: function (ms) {
            var minX = Infinity;
            var maxX = -Infinity;
            for (var i = 0; i < ms.length; i++) {
                for (var j = 0; j < ms[i].length; j += 2) {
                    if (ms[i][j] > maxX) {
                        maxX = ms[i][j];
                    }
                    if (ms[i][j] < minX) {
                        minX = ms[i][j];
                    }
                }
            }
            this.msGraph.getBottomAxis().forceMin(minX).forceMax(maxX);
            this.msData = ms;
        },

        setExternalGC: function (gc) {

            if (this.extGC) {
                this.extGC.kill(true);
            }

            this.extGC = this.gcGraph.newSerie('external', {useSlots: true, lineWidth: 2, lineColor: 'red'});
            this.extGC.setXAxis(this.gcGraph.getXAxis());
            this.extGC.setYAxis(this.gcGraph.getRightAxis(0, {
                primaryGrid: false,
                secondaryGrid: false,
                axisDataSpacing: {min: 0, max: 0},
                display: false
            }));
            this.extGC.setData(gc);

            this.gcGraph.redraw();
            this.gcGraph.drawSeries();
        },


        setExternalMS: function (ms, options) {

            if (this.msFromAucSerie) {
                this.msFromAucSerie.kill(true);
                this.msFromAucSerie = false;
            }

            if (this.extMS) {
                this.extMS.kill(true);
            }

            this.extMS = this.msGraph
                .newSerie('ext', {autoPeakPicking: true, lineToZero: !options.continuous, autoPeakPickingNb: 10})
                .autoAxis()
                .setYAxis(this.msGraph.getRightAxis())
                .setLineWidth(3);


            this.extMS.setData(ms);
            this.extMS.setLineColor(options.strokeColor || options.fillColor || 'green');


            if (this.firstMsSerie) {
                this.msGraph.getBottomAxis().setMinMaxToFitSeries();
                this.firstMsSerie = false;
            }

            this.msGraph._updateAxes();

            this.msGraph.getRightAxis().scaleToFitAxis(this.msGraph.getBottomAxis());


            this.msGraph.redraw(true, true, false);
            this.msGraph.drawSeries();
        },

        removeExternalMS: function () {

            if (this.extMS) {
                this.extMS.kill(true);
            }
        },

        trigger: function (func, params) {

            if (!Array.isArray(params)) {
                params = [params];
            }

            if (this.options[func]) {
                this.options[func].apply(this, params);
            }
        },

        redrawMs: function () {

            this.msGraph._updateAxes();
            this.msGraph.getRightAxis().scaleToFitAxis(this.msGraph.getBottomAxis());

            this.msGraph.redraw();
            this.msGraph.drawSeries();
        },

        addIngredient: function (ingredient) {
            ingredient.color = ingredient.color || [100, 100, 100];


            var that = this,
                obj = {
                    pos: {
                        x: ingredient.rt_x,
                        y: ingredient.rt_y,
                        dy: '-10px'

                    },
                    pos2: {
                        dx: 0,
                        dy: '-30px'
                    },

                    ingredient: ingredient,

                    locked: true,
                    selectable: true,
                    moveable: false,
                    resizeable: false,

                    type: 'line',
                    strokeColor: 'rgb(' + ingredient.color.join() + ')',
                    strokeWidth: 2,
                    label: {
                        position: {
                            dx: 0,
                            dy: '-40px'
                        },
                        baseline: 'middle',
                        angle: -90,
                        color: 'rgb(' + ingredient.color.join() + ')',
                        size: 12,
                        text: ingredient.name
                    }
                };


            this.gcGraph.newShape(obj).then(function (shape) {

                that.ingredients.push([ingredient, shape]);

                shape.draw();
                shape.redraw();
            });

            this.updateIngredientPeaks();
        },


        setMSIndexData: function (x) {

            this.recalculateMSMove(x);
        },

        recalculateMSMove: function (x) {
            var that = this;
            var ms = that.msData[x];

            that.trigger('MSChangeIndex', [x, ms]);

            if (!that.msSerieMouseTrack) {

                that.msSerieMouseTrack = that
                    .msGraph
                    .newSerie('', {
                        lineToZero: !that.options.msIsContinuous,
                        lineColor: 'black'
                    })
                    .autoAxis();
            }


            var xVal = that.gcData[x * 2];

            var trackData = that.trackingLineGC.getProperties();
            trackData.position[0].x = xVal;
            trackData.position[1].x = xVal;

            that.trackingLineGC.redraw();

            if (!ms) {
                return;
            }


            that.msSerieMouseTrack.setData(ms);


            if (that.firstMsSerie) {
                that.msGraph.getBottomAxis().setMinMaxToFitSeries();
                that.firstMsSerie = false;
            }

            that.msGraph.draw();


            if (!isNaN(that.msGraph.getBottomAxis().getMinValue())) {

                // that.msGraph.getLeftAxis().scaleToFitAxis(that.msGraph.getBottomAxis(), that.msSerieMouseTrack);
                that.msGraph.getLeftAxis().setMinMaxToFitSeries();

            } else {

                that.msGraph.autoscaleAxes();
            }
            // Autoscale y ?

            that.msGraph.redraw();
            that.msSerieMouseTrack.draw();
        },

        updateIngredientPeaks: function () {

            var that = this;
            var min = this.gcGraph.getXAxis().getMinValue();
            var max = this.gcGraph.getXAxis().getMaxValue();

            this.ingredients = this.ingredients.sort(function (a, b) {

                if (a[0].rt_x < min || a[0].rt_x > max) {

                    return 1;
                }

                if (b[0].rt_x < min || b[0].rt_x > max) {

                    return -1;
                }

                return -(a[0].rt_y - b[0].rt_y);
            });


            var limit = 20,
                xs = [];

            for (var i = 0; i < this.ingredients.length; i++) {

                var cont = false;
                var valX = that.gcGraph.getXAxis().getPx(this.ingredients[i][0].rt_x);

                for (var j = 0; j < xs.length; j++) {

                    var x = xs[j];

                    if (Math.abs(x - valX) < 15) {
                        this.ingredients[i][1].toggleLabel(0, false);
                        limit++;
                        cont = true;
                        break;
                    }
                }

                if (cont) {

                    continue;
                } else {
                    xs.push(valX);
                }


                if (i < limit) {
                    this.ingredients[i][1].toggleLabel(0, true);
                } else {
                    this.ingredients[i][1].toggleLabel(0, false);
                }
            }
        }
    };

    return GCMS;
});
