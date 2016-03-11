'use strict';

define(['modules/default/defaultcontroller', 'src/util/util', 'lodash', 'src/util/api', 'src/data/structures'], function (Default, Util, _, API, structures) {

    function Controller() {
    }

    $.extend(true, Controller.prototype, Default);

    Controller.prototype.moduleInformation = {
        name: 'Slick Grid',
        description: 'Table editor based on SlickGrid',
        author: 'Daniel Kostro',
        date: '14.10.2014',
        license: 'MIT',
        cssClass: 'slickgrid'
    };

    Controller.prototype.configurationStructure = function () {

        var typeList = Util.getStructuresComboOptions();

        var jpaths = this.module.model.getjPath('row', false);

        return {
            groups: {

                group: {
                    options: {
                        type: 'list',
                        multiple: false
                    },
                    fields: {
                        slickCheck: {
                            type: 'checkbox',
                            title: 'Slick options',
                            options: {
                                editable: 'Selectable / Editable',
                                enableAddRow: 'Enable add row',
                                autoEdit: 'Enable Auto Edit',
                                forceFitColumns: 'Force fit Columns',
                                autoFocus: 'Auto Focus',
                                rowNumbering: 'Show row number when scrolling',
                                oneUncollapsed: 'Maximum One group uncollapsed (per level)',
                                filterColumns: 'Provides search input for each column',
                                backToTop: 'Don\'t remember scroll position on new variable',
                                forgetLastActive: 'Don\'t scroll back to last active row on new variable',
                                highlightScroll: 'Scroll to highlighted line',
                                collapseGroup: 'Collapse groups on start'
                            },
                            default: ['enableCellNavigation', 'rowNumbering', 'forceFitColumns', 'highlightScroll']
                        },
                        autoColumns: {
                            type: 'checkbox',
                            title: 'Auto Columns',
                            options: {
                                remove: 'Column for one-click removal of a line',
                                select: 'Column for easy selection of lines',
                                reorder: 'Column for reordering lines by drag and drop'
                            },
                            default: []
                        },
                        toolbar: {
                            type: 'checkbox',
                            title: 'Toolbar options',
                            options: {
                                add: 'New row',
                                update: 'Update row',
                                remove: 'Remove row',
                                showHide: 'Show/hide column'
                            },
                            default: []
                        },
                        colorjpath: {
                            type: 'combo',
                            title: 'Color jPath',
                            options: jpaths,
                            extractValue: Util.jpathToArray,
                            insertValue: Util.jpathToString
                        },
                        'slick.defaultColumnWidth': {
                            type: 'float',
                            title: 'Default Column Width'
                        },

                        'slick.rowHeight': {
                            type: 'text',
                            title: 'Row Height'
                        },

                        'slick.selectionModel': {
                            type: 'combo',
                            title: 'Selection',
                            options: [
                                {key: 'row', title: 'Row Selection Model'},
                                {key: 'cell', title: 'Cell Selection Model'}
                            ],
                            'default': 'row'
                        },
                        filterType: {
                            type: 'combo',
                            title: 'Filter script source',
                            options: [
                                {key: 'pref', title: 'Define in preferences'},
                                {key: 'invar', title: 'From input variable'}
                            ],
                            displaySource: {pref: 'p', invar: 'i'},
                            default: 'pref'
                        },
                        filterRow: {
                            type: 'jscode',
                            title: 'Filter',
                            default: '// Documentation: https://github.com/NPellet/visualizer/blob/db85d9cc12c6204e4a3afb69bba6d695f6f8bad5/src/modules/types/edition/slick_grid/view.js#L918-L940',
                            displayTarget: ['p']
                        }
                    }
                },
                cols: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Columns'
                    },
                    fields: {
                        name: {
                            type: 'text',
                            title: 'Column ID (mandatory)'
                        },
                        jpath: {
                            type: 'combo',
                            title: 'jPath',
                            options: jpaths,
                            extractValue: Util.jpathToArray,
                            insertValue: Util.jpathToString
                        },
                        editor: {
                            type: 'combo',
                            title: 'Editor',
                            default: 'none',
                            options: [
                                {key: 'none', title: 'None'},
                                {key: 'auto', title: 'Based on type'},
                                {key: 'string', title: 'String'},
                                {key: 'number', title: 'Number'},
                                {key: 'boolean', title: 'Boolean'},
                                {key: 'color', title: 'Color'},
                                {key: 'date', title: 'Date'},
                                {key: 'longtext', title: 'Long Text'}
                            ]
                        },
                        forceType: {
                            type: 'combo',
                            title: 'Force type',
                            default: '',
                            options: typeList
                        },
                        formatter: {
                            type: 'combo',
                            title: 'Formatter',
                            options: [
                                {key: 'typerenderer', title: 'Type Renderer'}
                            ],
                            default: 'typerenderer'
                        },

                        visibility: {
                            type: 'combo',
                            title: 'Visibility',
                            options: [
                                {key: 'both', title: 'Main and Popup'},
                                {key: 'main', title: 'Main'},
                                {key: 'popup', title: 'Popup'}
                            ],
                            default: 'both'
                        },

                        rendererOptions: {
                            type: 'text',
                            title: 'Renderer Options',
                            default: ''
                        },
                        width: {
                            type: 'text',
                            title: 'Width'
                        },
                        minWidth: {
                            type: 'text',
                            title: 'Min Width'
                        },
                        maxWidth: {
                            type: 'text',
                            title: 'Max Width'
                        },
                        hideColumn: {
                            type: 'checkbox',
                            title: 'Hide column at init',
                            options: {
                                yes: 'Yes'
                            },
                            default: []
                        }
                    }
                },
                actionCols: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Action columns'
                    },
                    fields: {
                        name: {
                            type: 'text',
                            title: 'Column ID (mandatory)'
                        },
                        tooltip: {
                            type: 'text',
                            title: 'Tooltip'
                        },
                        icon: {
                            type: 'text',
                            title: 'Icon'
                        },
                        action: {
                            type: 'text',
                            title: 'Action to send'
                        },
                        position: {
                            type: 'combo',
                            title: 'Position',
                            options: [
                                {key: 'begin', title: 'Begin'},
                                {key: 'end', title: 'End'}
                            ],
                            default: 'end'
                        },
                        width: {
                            type: 'text',
                            title: 'Width'
                        },
                        minWidth: {
                            type: 'text',
                            title: 'Min Width'
                        },
                        maxWidth: {
                            type: 'text',
                            title: 'Max Width'
                        }
                    }
                },
                groupings: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Groupings'
                    },

                    fields: {
                        getter: {
                            type: 'combo',
                            title: 'jPath',
                            options: jpaths,
                            extractValue: Util.jpathToArray,
                            insertValue: Util.jpathToString
                        },
                        groupName: {
                            type: 'text',
                            title: 'Group Name'
                        }
                    }
                },
                actionOutButtons: {
                    options: {
                        type: 'table',
                        multiple: true,
                        title: 'Action out buttons'
                    },
                    fields: {
                        actionName: {
                            type: 'text',
                            title: 'Action name'
                        },
                        buttonTitle: {
                            type: 'text',
                            title: 'Button title'
                        }
                    }
                }
            }
        };
    };

    Controller.prototype.configAliases = {
        'colorjPath': ['groups', 'group', 0, 'colorjpath', 0],
        'slickCheck': ['groups', 'group', 0, 'slickCheck', 0],
        'slick.rowHeight': ['groups', 'group', 0, 'slick.rowHeight', 0],
        'slick.selectionModel': ['groups', 'group', 0, 'slick.selectionModel', 0],
        'slick.defaultColumnWidth': ['groups', 'group', 0, 'slick.defaultColumnWidth', 0],
        'filterType': ['groups', 'group', 0, 'filterType', 0],
        'filterRow': ['groups', 'group', 0, 'filterRow', 0],
        'cols': ['groups', 'cols', 0],
        'actionCols': ['groups', 'actionCols', 0],
        'groupings': ['groups', 'groupings', 0],
        'actionOutButtons': ['groups', 'actionOutButtons', 0],
        'toolbar': ['groups', 'group', 0, 'toolbar', 0],
        'autoColumns': ['groups', 'group', 0, 'autoColumns', 0]
    };

    Controller.prototype.references = {
        row: {
            label: 'Row'
        },
        list: {
            label: 'Table',
            type: 'array'
        },
        script: {
            label: 'Filter script',
            type: 'string'
        },
        rows: {
            label: 'Row selection',
            type: 'array'
        }
    };

    Controller.prototype.variablesIn = ['list', 'script'];

    Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
        hoverRow: 'Mimic row hover',
        selectRow: 'Mimic row click',
        selectRows: 'Set selected rows',
        addRow: 'Add a new row',
        showColumn: 'Show a column',
        hideColumn: 'Hide a column',
        rerender: 'Rerender the grid'
    });

    Controller.prototype.events = {
        onSelect: {
            label: 'Row clicked',
            refVariable: ['row'],
            refAction: ['row']
        },
        onHover: {
            label: 'Row hovered',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowChange: {
            label: 'Row changed',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowNew: {
            label: 'Row added',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowsDelete: {
            label: 'Rows deleted',
            refVariable: ['rows'],
            refAction: ['rows']
        },
        onRowActive: {
            label: 'Row actived',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowsSelect: {
            label: 'Rows selected',
            refVariable: ['rows'],
            refAction: ['rows']
        }
    };

    Controller.prototype.onRowsSelected = function (items) {
        items = items.filter(function (v) {
            return !!v;
        });
        this.createDataFromEvent('onRowsSelect', 'rows', items);
        this.sendActionFromEvent('onRowsSelect', 'rows', items);
    };

    Controller.prototype.onHover = function (row, item) {
        var itemId = item[this.module.view.idPropertyName];
        if (this.lastHoveredItemId === itemId) return;
        this.lastHoveredItemId = itemId;
        this.setVarFromEvent('onHover', 'row', 'list', [row]);
        this.sendActionFromEvent('onHover', 'row', item);
    };

    Controller.prototype.onClick = _.throttle(function (row, item) {
        this.lastClickedItem = item;
        this.setVarFromEvent('onSelect', 'row', 'list', [row]);
        this.sendActionFromEvent('onSelect', 'row', item);
    }, 250, {trailing: false});

    Controller.prototype.onActive = function (row, item) {
        this.setVarFromEvent('onRowActive', 'row', 'list', [row]);
        this.sendActionFromEvent('onRowActive', 'row', item);
    };

    Controller.prototype.onRowChange = function (row, item) {
        this.setVarFromEvent('onRowChange', 'row', 'list', [row]);
        this.sendActionFromEvent('onRowChange', 'row', item);
    };


    Controller.prototype.onRowNew = function (row, item) {
        this.setVarFromEvent('onRowNew', 'row', 'list', [row]);
        this.sendActionFromEvent('onRowNew', 'row', item);
    };

    Controller.prototype.onRowsDelete = function (items) {
        this.createDataFromEvent('onRowsDelete', 'rows', items);
        this.sendActionFromEvent('onRowsDelete', 'rows', items);
    };

    Controller.prototype.export = function () {
        return this.module.view.exportToTabDelimited();
    };

    Controller.prototype.sendActionButton = function (name, items) {
        API.doAction(name, items);
    };

    return Controller;

});
