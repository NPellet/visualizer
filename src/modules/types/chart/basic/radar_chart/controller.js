'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/api'], function (Default, Traversing, API) {

    /**
     * Creates a new empty controller
     * @class Controller
     * @name Controller
     * @constructor
     */
    function controller() {
    }

    // Extends the default properties of the default controller
    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        name: 'Radar chart',
        description: 'Display a Radar chart - Polar area chart - Pie chart et Donut chart based on dhtmlxchart',
        author: 'Khalid Arroub',
        date: '04.07.2014',
        license: 'MIT',
        cssClass: ''
    };


    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {

        // List of all possible events

    };


    /*
     Configuration of the input/output references of the module
     */
    controller.prototype.references = {
        chart: {
            type: ['chart'],
            label: 'A json describing a chart'
        }
    };


    controller.prototype.elementHover = function (element) {
        if (!element) {
            return;
        }


        if (this._highlighted) {
            API.highlight(this._highlighted, 0);
        }
        API.highlight(element, 1);
        this._highlighted = element;
    };

    controller.prototype.elementOut = function () {
        if (this._highlighted) {
            API.highlight(this._highlighted, 0);
        }
    };


    /*
     Configuration of the module for receiving events, as a static object
     In the form of
     */
    controller.prototype.variablesIn = ['chart'];


    controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },

                    fields: {

                        preference: {
                            type: 'combo',
                            title: 'Chart Type',
                            options: [
                                {title: 'Radar', key: 'radar'},
                                {title: 'Pie', key: 'pie'}
                            ]
                            , displaySource: {
                                'radar': 'r',
                                'pie': 'p'

                            }

                        },
                        pie: {
                            type: 'combo',
                            title: 'Pie Type',
                            options: [
                                {title: 'Pie', key: 'pie'},
                                {title: '3D Pie', key: 'pie3D'},
                                {title: 'Donut', key: 'donut'}
                            ],
                            displayTarget: ['p']

                        }
                        , start: {
                            type: 'text',
                            title: 'Start Value Of Y Axis',
                            displayTarget: ['r']
                        },

                        end: {
                            type: 'text',
                            title: 'End Value Of Y Axis',
                            displayTarget: ['r']
                        },

                        step: {
                            type: 'text',
                            title: 'Steps Between',
                            displayTarget: ['r']
                        },
                        point: {
                            type: 'checkbox',
                            title: 'Point',
                            //default: false,
                            options: {'point': 'Show Point Area'},
                            displayTarget: ['r']
                        },
                        lineshape: {
                            type: 'combo',
                            title: 'Line Shape',
                            options: [
                                {title: 'Arc', key: 'arc'},
                                {title: 'Line', key: 'line'}

                            ],
                            displayTarget: ['r']
                        },
                        line: {
                            type: 'checkbox',
                            title: 'Line',
                            options: {'line': 'Hide Line Area'},
                            displayTarget: ['r']
                        },
                        showlegend: {
                            type: 'combo',
                            title: 'Show Legend',
                            options: [
                                {title: 'True', key: 'true'},
                                {title: 'False', key: 'false'}
                            ],
                            displayTarget: ['r'],
                            displaySource: {
                                'true': 't',
                                'false': 'f'

                            }
                        },
                        legendmarker: {
                            type: 'combo',
                            title: 'Legend Marker',
                            options: [
                                {title: 'Cube', key: 'cube'},
                                {title: 'Round', key: 'round'}

                            ],
                            displayTarget: ['r', 't']
                        },
                        legendalign: {
                            type: 'combo',
                            title: 'Legend Align',
                            options: [
                                {title: 'top-right', key: 'top-right'},
                                {title: 'top-left', key: 'top-left'},
                                {title: 'bottom-right', key: 'bottom-right'},
                                {title: 'bottom-left', key: 'bottom-left'}

                            ],
                            displayTarget: ['r', 't']
                        }


                    }
                }
            }
        }
    };

    controller.prototype.configFunctions = {
        'point': function (cfg) {
            return cfg.indexOf('point') == -1 ? true : false;
        },
        'line': function (cfg) {
            return cfg.indexOf('line') == -1 ? false : true;
        }
    };
    controller.prototype.configAliases = {

        'preference': ['groups', 'group', 0, 'preference', 0],
        'pie': ['groups', 'group', 0, 'pie', 0],
        'start': ['groups', 'group', 0, 'start', 0],
        'end': ['groups', 'group', 0, 'end', 0],
        'step': ['groups', 'group', 0, 'step', 0],
        'lineshape': ['groups', 'group', 0, 'lineshape', 0],
        'point': ['groups', 'group', 0, 'point', 0],
        'showlegend': ['groups', 'group', 0, 'showlegend', 0],
        'line': ['groups', 'group', 0, 'line', 0],
        'legendmarker': ['groups', 'group', 0, 'legendmarker', 0],
        'legendalign': ['groups', 'group', 0, 'legendalign', 0]
    };


    return controller;
});