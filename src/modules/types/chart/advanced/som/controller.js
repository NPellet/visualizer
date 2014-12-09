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
        },
        elementList: {
            label: 'Lists of dataset elements'
        },
        cellInfo: {
            label: 'Cell information'
        },
        coords: {
            label: 'Coordinates'
        }
    };

    Controller.prototype.events = {
        onCellHover: {
            label: 'Hover a cell',
            refVariable: ['elementList', 'cellInfo']
        },
        /*onCellClick: {
         label: 'Click a cell',
         refVariable: ['element']
         }*/
        onElementHover: {
            label: 'Hover a dataset element',
            refVariable: ['element', 'coords']
        }
    };

    Controller.prototype.variablesIn = ['model', 'dataset'];

    Controller.prototype.onElementHover = function (x, y, info) {
        this.createDataFromEvent('onElementHover', 'coords', [x, y]);
        this.createDataFromEvent('onElementHover', 'element', info);
    };

    Controller.prototype.onCellHover = function (cell) {
        var x = cell.pos.x,
            y = cell.pos.y;
        var datasets = this.module.model.getAllDataFromRel('dataset');

        var result = {};
        for (var i in datasets) {
            var dataset = datasets[i].getChildSync(['data', 0]);
            result[i] = [];
            for(var j = 0, jj = dataset.x.length; j < jj; j++) {
                if(Math.floor(dataset.x[j]) === x && Math.floor(dataset.y[j]) === y) {
                    result[i].push(dataset.info[j]);
                }
            }
        }
        this.createDataFromEvent('onCellHover', 'elementList', result);

        this.createDataFromEvent('onCellHover', 'cellInfo', {
            x: x,
            y: y,
            info: cell.info
        });
    };

    return Controller;

});