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
                                {key: 'evenq', title: 'Even-q'}
                            ],
                            'default': 'combinatorial'
                        },
                        originX: {
                            type: 'float',
                            title: 'Origin X'
                        },
                        originY: {
                            type: 'float',
                            title: 'Origin Y'
                        },
                        originZ: {
                            type: 'float',
                            title: 'Origin Z'
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
        originZ: ['groups', 'group', 0, 'originZ', 0]
    };

    return Controller;

});
