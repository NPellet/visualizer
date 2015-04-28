'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Progress bar',
        description: 'Display a progress bar',
        author: 'Michaël Zasso',
        date: '28.04.2015',
        license: 'MIT',
        cssClass: 'progress'
    };

    Controller.prototype.references = {
        progress: {
            label: 'Progression',
            type: 'number'
        },
        total: {
            label: 'Total progression',
            type: 'number'
        }
    };

    Controller.prototype.variablesIn = ['progress', 'total'];

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        mode: {
                            type: 'combo',
                            title: 'Progression type',
                            options: [
                                {title: 'Percentage', key: 'percent'},
                                {title: 'Value and total', key: 'value'}
                            ],
                            'default': 'percent'
                        },
                        showprogress: {
                            type: 'checkbox',
                            title: 'Show progress in bar',
                            options: {
                                show: 'Yes'
                            },
                            'default': ['show']
                        },
                        barcolor: {
                            type: 'spectrum',
                            title: 'Bar color',
                            'default': [204, 204, 204, 1] // #CCC (default of jquery-ui)
                        }
                    }
                }
            }
        }
    };

    Controller.prototype.configAliases = {
        barcolor: ['groups', 'group', 0, 'barcolor', 0],
        showprogress: ['groups', 'group', 0, 'showprogress', 0],
        progressmode: ['groups', 'group', 0, 'mode', 0]
    };

    return Controller;

});
