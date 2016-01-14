'use strict';

define(['modules/default/defaultcontroller', 'lodash', 'jquery'], function (Default, _, $) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Spectra displayer',
        description: 'Displays a plot, either data or jcamp',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'spectra_displayer'
    };

    Controller.prototype.references = {
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
            label: 'Shape data',
            type: 'object'
        },
        fromToX: {
            label: 'From - To X',
            type: 'fromTo'
        },
        fromToY: {
            label: 'From - To Y',
            type: 'fromTo'
        },
        fromToXY: {
            label: 'Axis boundaries',
            type: 'object'
        },
        trackData: {
            label: 'Tracking data',
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
        series_xy1d: {
            type: 'array',
            label: 'List of series in 1D format ( [ x, y, x, y, ... ] )'
        },
        selectedShape: {
            type: 'object',
            label: 'Shape data'
        },
        selectedData: {
            type: 'array',
            label: 'Selected data'
        }
    };

    Controller.prototype.events = {
        onZoomChange: {
            label: 'Zoom changed',
            refAction: ['fromToX', 'fromToY', 'fromToXY'],
            refVariable: ['fromToX', 'fromToY', 'fromToXY']
        },
        onTrackMouse: {
            label: 'Mouse tracking',
            refVariable: ['trackData'],
            refAction: ['trackData']
        },
        onAnnotationAdd: {
            label: 'Annotation added',
            refAction: ['annotation']
        },
        onMouseOverMarker: {
            label: 'Mouse over a marker',
            refVariable: ['markerInfos', 'markerXY']
        },
        onMouseOutMarker: {
            label: 'Mouse out of a marker'
        },
        onClickMarker: {
            label: 'Mouse clicks a marker',
            refVariable: ['markerInfos', 'markerXY']
        },
        onSelectMarker: {
            label: 'Marker is selected',
            refAction: ['markerInfos']
        },
        onUnselectMarker: {
            label: 'Marker is unselected',
            refAction: ['markerInfos']
        },
        onMouseOverShape: {
            label: 'Mouse over a shape',
            refVariable: ['shapeInfos']
        },
        onShapeSelect: {
            label: 'When a shape is selected',
            refAction: ['selectedShape']
        },
        onShapeUnselect: {
            label: 'When a shape is unselected',
            refAction: ['shapeInfos']
        },
        onShapeClick: {
            label: 'When a shape is clicked',
            refVariable: ['shapeInfos']
        },
        onSelectScatter: {
            label: 'Selection on a scatter plot',
            refVariable: ['selectedData']
        }
    };

    Controller.prototype.variablesIn = ['chart', 'xArray', 'xyArray', 'jcamp', 'annotations', 'series_xy1d'];

    Controller.prototype.actionsIn = {
        fromToX: 'From - To X',
        fromToY: 'From - To Y',
        addSerie: 'Add a serie',
        removeSerie: 'Remove a serie',
        removeSerieByName: 'Remove serie (name as input)',
        selectSerie: 'Select serie',
        unselectSerie: 'Unselect serie'
    };

    var axisFields = {
        checkboxes: {
            type: 'checkbox',
            title: 'Options',
            options: {
                display: 'Display axis',
                flip: 'Flip axis',
                main: 'Show main grid',
                sec: 'Show secondary grid'
            },
            default: ['display']
        },
        label: {
            type: 'text',
            title: 'Axis label',
            default: ''
        },
        beforeSpacing: {
            type: 'text',
            title: 'Spacing before',
            default: '0'
        },
        afterSpacing: {
            type: 'text',
            title: 'Spacing after',
            default: 0
        },
        min: {
            type: 'text',
            title: 'Force min',
            default: ''
        },
        max: {
            type: 'text',
            title: 'Force max',
            default: ''
        },
        nbTicksPrimary: {
            type: 'float',
            title: 'Primary ticks',
            default: 5
        }
    };

    Controller.prototype.configurationStructure = function () {
        var vars = [];
        var currentCfg = this.module.definition.vars_in;

        if (currentCfg) {
            var i = 0,
                l = currentCfg.length;

            for (; i < l; i++) {
                if (currentCfg[i].rel == 'jcamp' || currentCfg[i].rel == 'xArray' || currentCfg[i].rel == 'xyArray' || currentCfg[i].rel == 'chart' || currentCfg[i].rel == 'series_xy1d') {
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
            sections: {
                graph: {
                    options: {
                        title: 'Graph config',
                        multiple: false
                    },
                    groups: {
                        graph: {
                            options: {
                                type: 'list',
                                multiple: false
                            },
                            fields: {
                                url: {
                                    type: 'text',
                                    title: 'Graph URL',
                                    default: ''
                                },
                                zoom: {
                                    type: 'combo',
                                    title: 'Zoom',
                                    options: [
                                        {key: 'none', title: 'None'},
                                        {key: 'x', title: 'X only'},
                                        {key: 'y', title: 'Y only'},
                                        {key: 'xy', title: 'XY'}
                                    ],
                                    default: 'none'
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
                                    default: 0
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
                                legend: {
                                    type: 'combo',
                                    title: 'Show legend',
                                    options: [
                                        {key: 'none', title: 'No legend'},
                                        {key: 'left', title: 'Left'},
                                        {key: 'top', title: 'Top'},
                                        {key: 'bottom', title: 'Bottom'},
                                        {key: 'right', title: 'Right'}
                                    ]
                                },
                                mouseTracking: {
                                    type: 'checkbox',
                                    title: 'Mouse tracking',
                                    options: {track: ''}
                                },
                                selectScatter: {
                                    type: 'checkbox',
                                    title: 'Scatter serie',
                                    options: {
                                        yes: 'Enable scatter serie selection (ALT + draw)'
                                    }
                                }
                            }
                        }
                    }
                },
                axis: {
                    options: {
                        title: 'Axis config',
                        multiple: false
                    },
                    groups: {
                        xAxis: {
                            options: {
                                title: 'X Axis',
                                type: 'list',
                                multiple: false
                            },
                            fields: $.extend({}, axisFields, {
                                axismodification: {
                                    type: 'combo',
                                    title: 'Axis modification',
                                    options: [
                                        {
                                            key: 'none',
                                            title: 'None'
                                        },
                                        {
                                            key: 'timestamptotime',
                                            title: 'Timestamp to time'
                                        },
                                        {
                                            key: 'valtotime',
                                            title: 'Value to time from 0'
                                        },
                                        {
                                            key: 'valtotime:min.sec',
                                            title: 'Seconds to min.sec'
                                        }
                                    ],
                                    default: 'none'
                                }
                            })
                        },
                        yAxis: {
                            options: {
                                title: 'Y Axis',
                                type: 'list',
                                multiple: false
                            },
                            fields: $.extend({}, axisFields, {
                                fitToAxisOnFromTo: {
                                    type: 'checkbox',
                                    title: 'Rescale axis on FromTo',
                                    options: {rescale: ''},
                                    default: []
                                }
                            })
                        }
                    }
                },
                variables: {
                    options: {
                        title: 'Variables',
                        multiple: false
                    },
                    groups: {
                        variables: {
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
                                strokestyle: {
                                    type: 'combo',
                                    title: 'Stroke style',
                                    options: [
                                        {key: '1', title: '1'},
                                        {key: '2', title: '2'},
                                        {key: '3', title: '3'},
                                        {key: '4', title: '4'},
                                        {key: '5', title: '5'},
                                        {key: '6', title: '6'},
                                        {key: '7', title: '7'},
                                        {key: '8', title: '8'},
                                        {key: '9', title: '9'},
                                        {key: '10', title: '10'},
                                        {key: '11', title: '11'}
                                    ],
                                    default: '1'
                                },
                                plotcontinuous: {
                                    type: 'combo',
                                    title: 'Continuous',
                                    options: [
                                        {key: 'continuous', title: 'Continuous'},
                                        {key: 'discrete', title: 'Discrete'},
                                        {key: 'auto', title: 'Auto'}
                                    ],
                                    default: 'continuous'
                                },
                                peakpicking: {
                                    type: 'checkbox',
                                    title: 'Peak Picking',
                                    options: {picking: 'Peak Picking'},
                                    default: []
                                },
                                markers: {
                                    type: 'checkbox',
                                    title: 'Markers',
                                    options: {markers: 'Show markers'},
                                    default: []
                                },
                                markerShape: {
                                    type: 'combo',
                                    title: 'Marker shape',
                                    options: [
                                        {key: '1', title: 'Square'},
                                        {key: '2', title: 'X cross'},
                                        {key: '3', title: '+ cross'},
                                        {key: '4', title: 'Triangle'}
                                    ],
                                    default: '1'
                                },
                                markerSize: {
                                    type: 'float',
                                    title: 'Marker size',
                                    default: 2
                                },
                                normalize: {
                                    type: 'combo',
                                    title: 'Normalize',
                                    options: [
                                        {key: 'none', title: 'None'},
                                        {key: 'max1', title: 'Set max to 1'},
                                        {key: 'max100', title: 'Set max to 100'},
                                        {key: 'sum1', title: 'Set sum to 1'},
                                        {key: 'max1min0', title: 'Max 1, Min 0'}
                                    ],
                                    default: 'none'
                                },
                                optimizeSlots: {
                                    type: 'checkbox',
                                    title: 'Optimize with slots',
                                    options: {slots: ''},
                                    default: []
                                },
                                degrade: {
                                    type: 'float',
                                    title: 'Degrade serie (px/pt)',
                                    default: 0
                                },
                                monotoneous: {
                                    type: 'checkbox',
                                    title: 'X is monotoneous',
                                    options: {yes: ''},
                                    default: []
                                }
                            }
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configFunctions = {
        displayYAxis: indexOf('display'),
        displayXAxis: indexOf('display'),
        vertGridMain: indexOf('main'),
        vertGridSec: indexOf('sec'),
        horGridMain: indexOf('main'),
        horGridSec: indexOf('sec'),
        minX: getFloat,
        minY: getFloat,
        maxX: getFloat,
        maxY: getFloat,
        flipX: indexOf('flip'),
        flipY: indexOf('flip')
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

    Controller.prototype.configAliases = {
        // Graph
        graphurl: ['sections', 'graph', 0, 'groups', 'graph', 0, 'url', 0],
        zoom: ['sections', 'graph', 0, 'groups', 'graph', 0, 'zoom', 0],
        wheelAction: ['sections', 'graph', 0, 'groups', 'graph', 0, 'wheelAction', 0],
        wheelbaseline: ['sections', 'graph', 0, 'groups', 'graph', 0, 'wheelbaseline', 0],
        fullOut: ['sections', 'graph', 0, 'groups', 'graph', 0, 'fullOut', 0],
        legend: ['sections', 'graph', 0, 'groups', 'graph', 0, 'legend', 0],
        mouseTracking: ['sections', 'graph', 0, 'groups', 'graph', 0, 'mouseTracking', 0],
        selectScatter: ['sections', 'graph', 0, 'groups', 'graph', 0, 'selectScatter', 0],
        // X Axis
        displayXAxis: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'checkboxes', 0],
        flipX: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'checkboxes', 0],
        vertGridMain: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'checkboxes', 0],
        vertGridSec: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'checkboxes', 0],
        xLabel: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'label', 0],
        xLeftSpacing: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'beforeSpacing', 0],
        xRightSpacing: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'afterSpacing', 0],
        minX: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'min', 0],
        maxX: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'max', 0],
        xnbTicksPrimary: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'nbTicksPrimary', 0],
        xaxismodification: ['sections', 'axis', 0, 'groups', 'xAxis', 0, 'axismodification', 0],
        // Y Axis
        displayYAxis: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'checkboxes', 0],
        flipY: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'checkboxes', 0],
        horGridMain: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'checkboxes', 0],
        horGridSec: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'checkboxes', 0],
        yLabel: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'label', 0],
        yBottomSpacing: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'beforeSpacing', 0],
        yTopSpacing: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'afterSpacing', 0],
        minY: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'min', 0],
        maxY: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'max', 0],
        ynbTicksPrimary: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'nbTicksPrimary', 0],
        FitYToAxisOnFromTo: ['sections', 'axis', 0, 'groups', 'yAxis', 0, 'fitToAxisOnFromTo', 0],
        // Variables
        plotinfos: ['sections', 'variables', 0, 'groups', 'variables', 0]
    };

    Controller.prototype.zoomChanged = function (axis, min, max) {
        var obj = {
            type: 'fromTo',
            value: {
                from: min,
                to: max
            }
        };
        this.sendActionFromEvent('onZoomChange', 'fromTo' + axis, obj);
        this.createDataFromEvent('onZoomChange', 'fromTo' + axis, obj);
        this.sendBoundaries();
    };

    Controller.prototype.sendBoundaries = _.throttle(function () {
        var boundaries = this.module.model.getBoundaries();
        this.sendActionFromEvent('onZoomChange', 'fromToXY', boundaries);
        this.createDataFromEvent('onZoomChange', 'fromToXY', boundaries);
    }, 1, {leading: false});

    Controller.prototype.onMouseOverMarker = function (xy, infos) {
        this.infos = infos;
        this.createDataFromEvent('onMouseOverMarker', 'markerInfos', infos);
        this.createDataFromEvent('onMouseOverMarker', 'markerXY', xy);
    };

    Controller.prototype.onClickMarker = function (xy, infos, toggledOn) {
        this.infos = infos;
        this.createDataFromEvent('onClickMarker', 'markerInfos', infos);
        this.createDataFromEvent('onClickMarker', 'markerXY', xy);
        if (toggledOn) {
            this.sendActionFromEvent('onSelectMarker', 'markerInfos', infos);
        } else {
            this.sendActionFromEvent('onUnselectMarker', 'markerInfos', infos);
        }
    };

    Controller.prototype.onMouseOutMarker = function (xy, infos) {
        this.createDataFromEvent('onMouseOutMarker', 'markerInfos', infos);
        this.createDataFromEvent('onMouseOutMarker', 'markerXY', xy);
    };

    Controller.prototype.onScatterSelection = function (selectedData) {
        this.selectedData = selectedData;
        this.createDataFromEvent('onSelectScatter', 'selectedData', selectedData);
    };

    Controller.prototype.print = function () {
        return this.module.view.graph._dom.innerHTML;
    };

    return Controller;

});
