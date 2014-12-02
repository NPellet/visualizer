'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'Self-organizing map',
        description: 'Display the result of a SOM analysis',
        author: 'Michaël Zasso',
        date: '01.12.2014',
        license: 'MIT'
    };

    Controller.prototype.references = {
        model: {
            label: 'The SOM model'
        },
        dataset: {
            label: 'Projected dataset',
            type: 'chart'
        },
        element: {
            label: 'Dataset element'
        }
    };

    Controller.prototype.events = {
        onCellHover: {
            label: 'Hover a cell',
            refVariable: ['element']
        },
        onCellClick: {
            label: 'Click a cell',
            refVariable: ['element']
        }
    };

    Controller.prototype.variablesIn = ['model', 'dataset'];

    return Controller;

});