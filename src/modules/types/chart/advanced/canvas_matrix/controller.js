'use strict';

define(['modules/default/defaultcontroller'], function (Default) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        moduleName: 'Matrix display',
        description: 'Display an array of array as a colored matrix',
        author: 'Norman Pellet',
        date: '24.12.2013',
        license: 'MIT',
        cssClass: 'canvas_matrix'
    };

    Controller.prototype.getMatrixElementFromEvent = function (e) {

        var moduleValue;
        if (!(moduleValue = this.module.getDataFromRel('matrix'))) {
            return false;
        }

        var pxPerCell = this.module.view.getPxPerCell();
        var shift = this.module.view.getXYShift();


        e.offsetX = (e.offsetX || e.pageX - $(e.target).offset().left);
        e.offsetY = (e.offsetY || e.pageY - $(e.target).offset().top);

        var x = Math.floor((e.offsetX - shift.x) / pxPerCell);
        var y = Math.floor((e.offsetY - shift.y) / pxPerCell);

        var gridData = moduleValue.get().data;

        if (!gridData || !gridData[0] || x < 0 || y < 0 || y > gridData.length || x > gridData[0].length) {
            return false;
        }

        return [x, y];

    };

    function getHandlerForEvent(controller, name) {
        return function handleEvent(e) {
            var keyed = controller.getMatrixElementFromEvent(e);

            if (!keyed) {
                return;
            }

            controller.setVarFromEvent(name, 'row', 'matrix', ['xLabel', keyed[0]]);
            controller.setVarFromEvent(name, 'col', 'matrix', ['yLabel', keyed[1]]);
            controller.setVarFromEvent(name, 'intersect', 'matrix', ['data', keyed[0], keyed[1]]);
        }
    }

    Controller.prototype.initEvents = function () {

        var dom = $(this.module.getDomContent());

        dom.on('mousemove', 'canvas', $.debounce(25, getHandlerForEvent(this, 'onPixelHover')));
        dom.on('click', 'canvas', getHandlerForEvent(this, 'onPixelClick'));

    };

    Controller.prototype.references = {
        row: {
            label: 'Row',
            description: 'Sends the information description the row'
        },
        col: {
            label: 'Column',
            description: 'Sends the information description the column'
        },
        intersect: {
            label: 'Intersection',
            description: 'Sends the information description the intersection where the mouse is located'
        },
        matrix: {
            label: 'Matrix',
            description: 'A 2D array representing the matrix'
        }
    };

    Controller.prototype.variablesIn = ['matrix'];

    Controller.prototype.events = {
        onPixelHover: {
            label: 'mouse hover pixel',
            description: 'When the mouses moves over a new pixel of the data matrix',
            refVariable: ['row', 'col', 'intersect']
        },
        onPixelClick: {
            label: 'click on a pixel',
            description: 'When the users click on any pixel',
            refVariable: ['row', 'col', 'intersect']
        }/*,
        onPixelDblClick: {
            label: 'double click on a pixel',
            description: 'When the user double clics on any pixel',
            refVariable: ['row', 'col', 'intersect']
        }*/
    };

    Controller.prototype.configurationStructure = function () {
        return {
            groups: {
                group: {
                    options: {
                        type: 'list'
                    },
                    fields: {
                        highcontrast: {
                            default: 'true',
                            type: 'checkbox',
                            title: 'Contrast',
                            options: {'true': 'Take data min/max as boundaries'}
                        },
                        color: {
                            type: 'color',
                            title: 'Color',
                            multiple: true
                        }
                    }
                }
            }
        }
    };

    Controller.prototype.configAliases = {
        colors: ['groups', 'group', 0, 'color'],
        highContrast: ['groups', 'group', 0, 'highcontrast', 0, 0]
    };

    return Controller;

});