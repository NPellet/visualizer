'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing'], function (Default, Traversing) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        name: 'Word cloud',
        description: 'Word visualization',
        author: 'Michaël Zasso',
        date: '19.03.2015',
        license: 'MIT'
    };

    Controller.prototype.references = {
        value: {
            type: 'array',
            label: 'An array of words'
        }
    };

    Controller.prototype.events = {
        //onBrushSelection: {
        //    label: 'A selection has been made',
        //    refVariable: ['value']
        //}
    };

    Controller.prototype.variablesIn = ['value'];

    Controller.prototype.actionsIn = {
        //addColumn: 'Add a column'
    };

    Controller.prototype.configurationStructure = function () {

        //var jpaths = Traversing.getJPathsFromElement(this.module.view._value[0]);
        return {
            groups: {
                group: {
                    options: {
                        type: 'list',
                        multiple: 'false'
                    },
                    fields: {
                        spiral:{
                            type: 'combo',
                            title: 'Spiral',
                            options: [
                                {key: 'archimedean', title: 'Archimedean'},
                                {key: 'rectangular', title:'Rectangular'}
                            ],
                            'default': 'archimedean'
                        },
                        scale:{
                            type: 'combo',
                            title: 'Scale',
                            options: [
                                {key: 'logn', title: 'log n'},
                                {key: 'sqrtn', title:'√n'},
                                {key: 'n', title:'n'}
                            ],
                            'default': 'logn'
                        },
                        orientation: {
                            type: 'float',
                            title: 'Orientation',
                            'default': 5
                        },
                        oneWordPerLine: {
                            type: 'checkbox',
                            title: 'Options',
                            options: {
                                oneWordPerLine: 'One Word Per Line'
                            },
                            'default': ['oneWordPerLine']
                        },
                        fromTo: {
                            type: 'slider',
                            title: 'From To',
                            range: true,
                            min: -180,
                            max: 180,
                            step: 1,
                            'default': [-60,60]
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        spiral: ['groups', 'group', 0, 'spiral', 0],
        scale: ['groups', 'group', 0, 'scale', 0],
        orientation: ['groups', 'group', 0, 'orientation', 0],
        oneWordPerLine: ['groups', 'group', 0, 'oneWordPerLine', 0],
        fromTo: ['groups', 'group', 0, 'fromTo', 0]

    };

    return Controller;

});