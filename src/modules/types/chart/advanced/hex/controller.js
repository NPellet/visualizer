'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/util'], function (Default, Traversing, Util) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Hexagonal map',
        description: 'Display hexagonal map',
        author: 'Daniel Kostro',
        date: '13.05.2015',
        license: 'MIT'
    };

    Controller.prototype.references = {
        chart: {
            label: 'Chart data'
        }
    };

    Controller.prototype.variablesIn = ['chart'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {

                group: {
                    options: {
                        type: 'list',
                        multiple: false
                    },

                    fields: {
                        coordinateSystem: {
                            type: 'combo',
                            title: 'Coordinate system',
                            options: [
                                {key: 'combinatorial', title: 'Combinatorial'},
                                {key: 'cubic', title: 'Cubic'},
                                {key: 'evenq', title: 'Even-q'},
                                {key: 'oddr', title: 'Odd-r'}
                            ],
                            'default': 'combinatorial',
                            displaySource: {
                                combinatorial: 'comb'
                            }
                        },
                        originX: {
                            type: 'float',
                            title: 'Origin X',
                            displayTarget: ['comb'],
                            default: 0
                        },
                        originY: {
                            type: 'float',
                            title: 'Origin Y',
                            displayTarget: ['comb'],
                            default: 0
                        },
                        originZ: {
                            type: 'float',
                            title: 'Origin Z',
                            displayTarget: ['comb'],
                            default: 0
                        },
                        showColorBar: {
                            type: 'checkbox',
                            title: 'Color bar',
                            options: {show: 'Show'},
                            default: []
                        },
                        enableZoom: {
                            type: 'checkbox',
                            title: 'Enable pan & zoom',
                            options: {yes: 'Yes'},
                            default: []
                        }
                    }
                },
                colorBar: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Color gradient (colors must be numbers)'
                    },
                    fields: {
                        color: {
                            type: 'spectrum',
                            title: 'Stop color'
                        },
                        stopPosition: {
                            type: 'float',
                            title: 'Stop position',
                            default: 0
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        coordinateSystem: ['groups', 'group', 0, 'coordinateSystem', 0],
        originX: ['groups', 'group', 0, 'originX', 0],
        originY: ['groups', 'group', 0, 'originY', 0],
        originZ: ['groups', 'group', 0, 'originZ', 0],
        gradient: ['groups', 'colorBar', 0],
        showColorBar: ['groups', 'group', 0, 'showColorBar', 0],
        enableZoom: ['groups', 'group', 0, 'enableZoom', 0]
    };

    return Controller;

});
