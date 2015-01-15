define([ 'modules/default/defaultcontroller' ], function (Default) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    };

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);


    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Plotter',
        description: 'Displays a plot, either data or jcamp',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'spectra_displayer'
    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {

        // ouput
        x: {
            label: 'X position',
            type: 'number'
        },

        markerInfos: {
            label: 'Marker infos',
            type: 'object'
        },

        markerXY: {
            label: 'Marker [x,y]',
            type: 'array'
        },

        shapeInfos: {
            label: 'Shape infos',
            type: 'object'
        },

        // input
        chart: {
            type: 'chart',
            label: 'Chart object'
        },

        xArray: {
            type: 'array',
            label: '1D Y array'
        },

        xyArray: {
            type: 'array',
            label: '1D XY array'
        },

        jcamp: {
            type: ['jcamp', 'string'],
            label: 'Jcamp data'
        },

        annotations: {
            type: ['array'],
            label: 'Annotation file'
        },

        fromTo: {
            type: 'fromTo',
            label: 'From - To data'
        },

        series_xy1d: {
            type: 'array',
            label: 'List of series in 1D format ( [ x, y, x, y, ... ] )'
        },

        selectedShape: {
            type: 'object',
            label: 'Selected shape'
        }
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {

        // List of all possible events
        onZoomChange: {
            label: 'Zoom changed',
            refAction: [ 'fromTo' ]
        },

        onTrackMouse: {
            label: 'Mouse tracking',
            refVariable: [ 'x' ],
            refAction: [ 'x' ]
        },

        onAnnotationAdd: {
            label: 'Annotation added',
            refAction: [ 'annotation' ]
        },

        onMouseOverMarker: {
            label: 'Mouse over a marker',
            refVariable: [ 'markerInfos', 'markerXY' ]
        },

        onMouseOutMarker: {
            label: 'Mouse out of a marker'
        },

        onClickMarker: {
            label: 'Mouse clicks a marker',
            refVariable: [ 'markerInfos', 'markerXY' ]
        },

        onMouseOverShape: {
            label: 'Mouse over a shape',
            refVariable: ['shapeInfos']
        },

        onShapeSelect: {
            label: 'When a shape is selected',
            refAction: [ 'selectedShape' ]
        }
    };


    /*
     Configuration of the module for receiving events, as a static object
     */
    controller.prototype.variablesIn = [ 'chart', 'xArray', 'xyArray', 'jcamp', 'annotations', 'fromTo', 'series_xy1d' ];

    /*
     Received actions
     In the form of

     {
     actionRef: 'actionLabel'
     }
     */
    controller.prototype.actionsIn = {
        'fromTo': 'From-To',
        'addSerie': 'Add a serie',
        'removeSerie': 'Remove a serie',
        'removeSerieByName': 'Remove serie (name as input)',
        'selectSerie': 'Select serie',
        'unselectSerie': 'Unselect serie'
    };


    controller.prototype.configurationStructure = function (section) {

        var vars = [];
        var currentCfg = this.module.definition.vars_in;

        if (currentCfg) {

            var i = 0,
                l = currentCfg.length;

            for (; i < l; i++) {
                if (currentCfg[i].rel == 'jcamp' || currentCfg[i].rel == 'xArray' || currentCfg[i].rel == 'xyArray' || currentCfg[i].rel == 'chart' || currentCfg[ i ].rel == "series_xy1d") {
                    vars.push({
                        title: currentCfg[i].name,
                        key: currentCfg[i].name
                    });
                }
            }
        }


        if (this.module.view.seriesActions) {

            for (var i = 0, l = this.module.view.seriesActions.length; i < l; i++) {

                vars.push({
                    title: this.module.view.seriesActions[i][2],
                    key: this.module.view.seriesActions[i][2]
                });
            }
        }

        return {
            groups: {

                group: {

                    options: {
                        type: 'list'
                    },

                    fields: {

                        graphurl: {
                            type: 'text',
                            title: 'Graph URL',
                            default: ''
                        },

                        flip: {
                            type: 'checkbox',
                            title: 'Axis flipping',
                            options: { 'flipX': 'Flip X', 'flipY': "Flip Y"},
                            caseDisplay: {
                                flipX: 1,
                                flipY: 2
                            },
                            default: []
                        },

                        displayAxis: {
                            type: 'checkbox',
                            title: 'Display axis',
                            options: {
                                'x': 'X',
                                'y': 'Y'
                            },
                            displayCase: [ 1 ],
                            default: ['y']
                        },

                        grids: {
                            type: 'checkbox',
                            title: 'Grids',
                            displayCase: [ 2 ],
                            options: { 'hmain': 'Horizontal Main', 'hsec': 'Honrizontal Seconday', 'vmain': 'Vertical Main', 'vsec': 'Vertical Secondary' },
                            default: []
                        },

                        xLabel: {
                            type: 'text',
                            title: 'X axis label',
                            default: ''
                        },

                        yTopSpacing: {
                            type: 'text',
                            title: 'Spacing above the data',
                            default: 0
                        },

                        yBottomSpacing: {
                            type: 'text',
                            title: 'Spacing below the data',
                            default: 0
                        },

                        xLeftSpacing: {
                            type: 'text',
                            title: 'Spacing left',
                            default: 0
                        },

                        xRightSpacing: {
                            type: 'text',
                            title: 'Spacing right',
                            default: 0
                        },

                        yLabel: {
                            type: 'text',
                            title: 'Y axis label',
                            default: ''
                        },

                        minX: {
                            type: 'text',
                            title: 'Min X',
                            default: ''
                        },

                        maxX: {
                            type: 'text',
                            title: 'Max X',
                            default: ''
                        },

                        minY: {
                            type: 'text',
                            title: 'Min Y',
                            default: ''
                        },

                        maxY: {
                            type: 'text',
                            title: 'Max Y',
                            default: ''
                        },

                        zoom: {
                            type: 'combo',
                            multiple: true,
                            title: 'Zoom',
                            options: [
                                {key: 'x', title: 'X only'},
                                {key: 'y', title: 'Y only'},
                                {key: 'xy', title: 'XY'},
                                {key: 'none', title: 'None'}
                            ],
                            default: 'none'
                        },


                        shiftxtozero: {
                            type: 'checkbox',
                            title: 'Shift X to Min',
                            options: {'shift': ''},
                            default: []
                        },


                        xaxismodification: {
                            type: 'combo',
                            title: 'X axis modification',
                            options: [{key:'timestamptotime', title:'Timestamp to time'}, {key:'valtotime', title:'Value to time from 0'}, {key:'valtotime:min.sec', title:'Seconds to min.sec'}],
                            default: []
                        },

                        wheelAction: {
                            type: 'combo',
                            title: 'Mouse Wheel',
                            options: [
                                {key: 'zoomX', title: 'Zoom X'},
                                {key: 'zoomY', title: 'Zoom Y'},
                                {key: 'none', title: 'None'}
                            ],
                            default: 'none'
                        },

                        wheelbaseline: {
                            type: 'float',
                            title: 'Wheel baseline',
                            'default': 0
                        },

                        fullOut: {
                            type: 'combo',
                            title: 'Full out on load',
                            options: [
                                {key: 'none', title: 'Never'},
                                {key: 'xAxis', title: 'X axis'},
                                {key: 'yAxis', title: 'Y axis'},
                                {key: 'both', title: 'Both axis'},
                                {key: 'once', title: 'Once per input variable'}
                            ],
                            default: 'both'
                        },


                        FitYToAxisOnFromTo: {
                            type: 'checkbox',
                            title: 'Rescale Y axis on FromTo receive',
                            options: {'rescale': ''}
                        },

                        legend: {
                            type: 'combo',
                            title: 'Show legend',
                            options: [
                                {key: 'none', title: 'No legend'},
                                {key: 'topleft', title: 'Top-left'},
                                {key: 'topright', title: 'Top-right'},
                                {key: 'bottomleft', title: 'Bottom-left'},
                                {key: 'bottomright', title: 'Bottom-right'}
                            ]
                        }
                    }
                },


                plotinfos: {

                    options: {
                        type: 'table',
                        multiple: true
                    },

                    fields: {

                        variable: {
                            type: 'combo',
                            title: 'Variable',
                            options: vars,
                            default: ''
                        },

                        plotcolor: {
                            type: 'color',
                            title: 'Color',
                            default: [1, 1, 255, 1]
                        },


                        strokewidth: {
                            type: 'text',
                            title: 'Width (px)',
                            default: '1'
                        },

                        plotcontinuous: {
                            type: 'checkbox',
                            title: 'Continuous',
                            options: {'continuous': 'Continuous'},
                            default: ['continuous']
                        },

                        peakpicking: {
                            type: 'checkbox',
                            title: 'Peak Picking',
                            options: {'picking': 'Peak Picking'},
                            default: []
                        },


                        markers: {
                            type: 'checkbox',
                            title: 'Markers',
                            options: {'markers': 'Show markers'},
                            default: []
                        },

                        normalize: {
                            type: 'combo',
                            title: 'Normalize',
                            options: [
                                {key: 'none', title: 'None'},
                                {key: 'max1', title: 'Set max to 1'},
                                {key: 'sum1', title: 'Set sum to 1'},
                                {key: 'max1min0', title: 'Max 1, Min 0'}
                            ],
                            default: 'none'
                        },

                        optimizeSlots: {
                            type: 'checkbox',
                            title: 'Optimize with slots',
                            options: { 'slots': '' },
                            default: []
                        },

                        degrade: {
                            type: 'float',
                            title: 'Degrade serie (px/pt)',
                            'default': 0
                        },

                        monotoneous: {
                            type: 'checkbox',
                            title: 'X is monotoneous',
                            options: { 'yes': '' },
                            'default': []
                        }
                    }
                }
            }
        }
    };

    controller.prototype.configFunctions = {
        displayYAxis: indexOf('y'),
        displayXAxis: indexOf('x'),
        vertGridMain: indexOf('vmain'),
        vertGridSec: indexOf('vsec'),
        horGridMain: indexOf('hmain'),
        horGridSec: indexOf('hsec'),
        shiftxtozero: indexOf('shift'),
        //FitYToAxisOnFromTo: indexOf('rescale'),
        minX: getFloat,
        minY: getFloat,
        maxX: getFloat,
        maxY: getFloat,
     //   xaxismodification: indexOf('xaxismodification'),
        flipX: indexOf('flipX'),
        flipY: indexOf('flipY')
    };

    function indexOf(name) {
        return function (value) {
            return value.indexOf(name) > -1;
        };
    }

    function getFloat(value) {
        value = parseFloat(value);
        return isNaN(value) ? null : value;
    }

    controller.prototype.configAliases = {

        graphurl: [ 'groups', 'group', 0, 'graphurl', 0 ],
        shiftxtozero: [ 'groups', 'group', 0, 'shiftxtozero', 0 ],
        displayYAxis: [ 'groups', 'group', 0, 'displayAxis', 0 ],
        yLabel: [ 'groups', 'group', 0, 'yLabel', 0 ],
        displayXAxis: [ 'groups', 'group', 0, 'displayAxis', 0 ],
        xLabel: [ 'groups', 'group', 0, 'xLabel', 0 ],
        vertGridMain: [ 'groups', 'group', 0, 'grids', 0 ],
        vertGridSec: [ 'groups', 'group', 0, 'grids', 0 ],
        xastime: [ 'groups', 'group', 0, 'xastime', 0 ],
        horGridMain: [ 'groups', 'group', 0, 'grids', 0 ],
        horGridSec: [ 'groups', 'group', 0, 'grids', 0 ],
        xLeftSpacing: [ 'groups', 'group', 0, 'xLeftSpacing', 0 ],
        xRightSpacing: [ 'groups', 'group', 0, 'xRightSpacing', 0 ],
        yBottomSpacing: [ 'groups', 'group', 0, 'yBottomSpacing', 0 ],
        yTopSpacing: [ 'groups', 'group', 0, 'yTopSpacing', 0 ],
        wheelAction: [ 'groups', 'group', 0, 'wheelAction', 0 ],
        fullOut: [ 'groups', 'group', 0, 'fullOut', 0 ],
        FitYToAxisOnFromTo: [ 'groups', 'group', 0, 'FitYToAxisOnFromTo', 0 ],
        zoom: [ 'groups', 'group', 0, 'zoom', 0 ],
        minX: [ 'groups', 'group', 0, 'minX', 0 ],
        minY: [ 'groups', 'group', 0, 'minY', 0 ],
        maxX: [ 'groups', 'group', 0, 'maxX', 0 ],
        maxY: [ 'groups', 'group', 0, 'maxY', 0 ],
        flipX: [ 'groups', 'group', 0, 'flip', 0 ],
        flipY: [ 'groups', 'group', 0, 'flip', 0 ],
        plotinfos: [ 'groups', 'plotinfos', 0 ],
        wheelbaseline: [ 'groups', 'group', 0, 'wheelbaseline', 0],

        displayAxis: ['groups', 'group', 0, 'displayAxis', 0],
        flipAxis: ['groups', 'group', 0, 'flip', 0],
        grid: ['groups', 'group', 0, 'grids', 0],
        xaxismodification: ['groups', 'group', 0, 'xaxismodification', 0],
        legend: ['groups', 'group', 0, 'legend', 0]
    };

    controller.prototype.zoomChanged = function (min, max) {

        var obj = {
            type: 'fromTo',
            value: {
                from: min,
                to: max
            }
        };

        this.sendAction('fromto', obj);
    };

    controller.prototype.onMouseOverMarker = function (xy, infos) {
        this.infos = infos;
        this.createDataFromEvent('onMouseOverMarker', 'markerInfos', infos);
        this.createDataFromEvent('onMouseOverMarker', 'markerXY', xy);
    };

    controller.prototype.onClickMarker = function (xy, infos) {
        this.infos = infos;
        this.createDataFromEvent('onClickMarker', 'markerInfos', infos);
        this.createDataFromEvent('onClickMarker', 'markerXY', xy);
    };

    controller.prototype.onMouseOutMarker = function (xy, infos) {
        this.createDataFromEvent('onMouseOutMarker', 'markerInfos', infos);
        this.createDataFromEvent('onMouseOutMarker', 'markerXY', xy);
    };

    controller.prototype.print = function () {
        return this.module.view.graph._dom.innerHTML;
    };

    return controller;
});
