'use strict';

define(['modules/default/defaultcontroller', 'src/util/datatraversing', 'src/util/util'], function (Default, Traversing, Util) {

    function Controller() {
    }

    Controller.prototype = $.extend(true, {}, Default);

    Controller.prototype.moduleInformation = {
        name: 'Self-organizing map',
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
            for (var j = 0, jj = dataset.x.length; j < jj; j++) {
                if (Math.floor(dataset.x[j]) === x && Math.floor(dataset.y[j]) === y) {
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

    Controller.prototype.configurationStructure = function () {
        var i, ii;

        var modelOptions = [];
        var model = this.module.getDataFromRel('model');
        if (model) {
            var fields = model.options.fields;
            if (fields | 0) {
                for (i = 0; i < fields; i++) {
                    modelOptions.push({key: i, title: i});
                }
            } else {
                for (i = 0, ii = fields.length; i < ii; i++) {
                    modelOptions.push({key: fields[i].name, title: fields[i].name});
                }
            }
        }

        var datasetList = [];
        var datasets = this.module.model.getAllDataFromRel('dataset');
        if (datasets) {
            for (i in datasets) {
                datasetList.push({key: i, title: i});
            }
        }

        var datasetOptions = [];
        var dataset = this.module.getDataFromRel('dataset');
        if (dataset) {
            var el = dataset.getChildSync(['data', '0', 'info', '0']);
            Traversing.getJPathsFromElement(el, datasetOptions);
        }

        return {
            sections: {
                background: {
                    options: {
                        title: 'Background (grid)',
                        multiple: false
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'list'
                            },
                            fields: {
                                colorType: {
                                    type: 'combo',
                                    title: 'Color type',
                                    options: [
                                        {key: 'fixed', title: 'Fixed color'},
                                        {key: 'range', title: 'Color range'},
                                        {key: 'inter', title: 'RGB interpolation'}
                                        //{ key: 'derive', title: 'Derivative'}
                                    ],
                                    'default': 'fixed',
                                    displaySource: {
                                        inter: 'i0',
                                        fixed: 'f0',
                                        range: 'r0'
                                    }
                                },
                                colorSpace: {
                                    type: 'combo',
                                    title: 'Color space',
                                    options: [
                                        {key: 'rgb', title: 'RGB'},
                                        {key: 'hsl', title: 'HSL'},
                                        {key: 'hsv', title: 'HSV'},
                                        {key: 'lab', title: 'CIELab'},
                                        {key: 'lch', title: 'CIELCH'}
                                    ],
                                    'default': 'rgb',
                                    displayTarget: ['r0']
                                },
                                color1: {
                                    type: 'spectrum',
                                    title: 'Color',
                                    'default': [255, 255, 255, 1],
                                    displayTarget: ['i0', 'r0', 'f0']
                                },
                                color2: {
                                    type: 'spectrum',
                                    title: 'Color 2',
                                    'default': [0, 0, 0, 1],
                                    displayTarget: ['i0', 'r0']
                                },
                                field1: {
                                    type: 'combo',
                                    title: 'Field for color 1',
                                    options: modelOptions,
                                    'default': modelOptions[0] ? modelOptions[0].key : '',
                                    displayTarget: ['r0', 'i0']
                                },
                                field2: {
                                    type: 'combo',
                                    title: 'Field for color 2',
                                    options: modelOptions,
                                    'default': modelOptions[1] ? modelOptions[1].key : '',
                                    displayTarget: ['i0']
                                },
                                field3: {
                                    type: 'combo',
                                    title: 'Field for color 3',
                                    options: modelOptions,
                                    'default': modelOptions[2] ? modelOptions[2].key : '',
                                    displayTarget: ['i0']
                                }
                            }
                        }
                    }
                },
                dataset: {
                    options: {
                        title: 'Dataset',
                        multiple: true
                    },
                    groups: {
                        group: {
                            options: {
                                type: 'list'
                            },
                            fields: {
                                dataset: {
                                    type: 'combo',
                                    title: 'Variable',
                                    options: datasetList
                                },
                                colorType: {
                                    type: 'combo',
                                    title: 'Color type',
                                    options: [
                                        {key: 'fixed', title: 'Fixed color'},
                                        {key: 'range', title: 'Color range'},
                                        {key: 'inter', title: 'RGB interpolation'},
                                        {key: 'jpath', title: 'Color jpath'}
                                    ],
                                    'default': 'fixed',
                                    displaySource: {
                                        inter: 'i0',
                                        fixed: 'f0',
                                        range: 'r0',
                                        jpath: 'j0'
                                    }
                                },
                                colorSpace: {
                                    type: 'combo',
                                    title: 'Color space',
                                    options: [
                                        {key: 'rgb', title: 'RGB'},
                                        {key: 'hsl', title: 'HSL'},
                                        {key: 'hsv', title: 'HSV'},
                                        {key: 'lab', title: 'CIELab'},
                                        {key: 'lch', title: 'CIELCH'}
                                    ],
                                    'default': 'rgb',
                                    displayTarget: ['r0']
                                },
                                color1: {
                                    type: 'spectrum',
                                    title: 'Color',
                                    'default': [255, 0, 0, 1],
                                    displayTarget: ['i0', 'r0', 'f0']
                                },
                                color2: {
                                    type: 'spectrum',
                                    title: 'Color 2',
                                    'default': [0, 0, 0, 1],
                                    displayTarget: ['i0', 'r0']
                                },
                                jpath1: {
                                    type: 'combo',
                                    title: 'jpath for color 1',
                                    options: datasetOptions,
                                    extractValue: Util.jpathToArray,
                                    insertValue: Util.jpathToString,
                                    displayTarget: ['r0', 'i0', 'j0']
                                },
                                jpath2: {
                                    type: 'combo',
                                    title: 'jpath for color 2',
                                    options: datasetOptions,
                                    extractValue: Util.jpathToArray,
                                    insertValue: Util.jpathToString,
                                    displayTarget: ['i0']
                                },
                                jpath3: {
                                    type: 'combo',
                                    title: 'jpath for color 3',
                                    options: datasetOptions,
                                    extractValue: Util.jpathToArray,
                                    insertValue: Util.jpathToString,
                                    displayTarget: ['i0']
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    Controller.prototype.configAliases = {
        bgType: ['sections', 'background', 0, 'groups', 'group', 0, 'colorType', 0],
        bgColor1: ['sections', 'background', 0, 'groups', 'group', 0, 'color1', 0],
        bgColor2: ['sections', 'background', 0, 'groups', 'group', 0, 'color2', 0],
        bgSpace: ['sections', 'background', 0, 'groups', 'group', 0, 'colorSpace', 0],
        bgField1: ['sections', 'background', 0, 'groups', 'group', 0, 'field1', 0],
        bgField2: ['sections', 'background', 0, 'groups', 'group', 0, 'field2', 0],
        bgField3: ['sections', 'background', 0, 'groups', 'group', 0, 'field3', 0],
        datasets: ['sections', 'dataset']
    };

    return Controller;

});