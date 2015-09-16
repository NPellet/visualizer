'use strict';

define(['modules/default/defaultcontroller', 'src/util/util', 'lodash', 'src/util/api'], function (Default, Util, _, API) {

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
                                editable: 'Editable',
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
                                select: 'Column for easy selection of lines'
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
                        filterRow: {
                            type: 'jscode',
                            title: 'Filter',
                            default: '// This script will be called on each line once on load\n// And then each time the line is modified\n// Available:\n// this.event\n// this.row\n// this.cell\n// this.jpathRow,\n// this.jpathCell\n// this.data\n// \n'
                        },
                        justInTimeFilter: {
                            type: 'checkbox',
                            title: 'Just in time filter',
                            options: {
                                yes: 'Filter applied only when line is displayed'
                            },
                            default: []
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
                            title: 'Column title (mandatory)'
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
                                {key: 'longtext', title: 'Long Text'},
                                {key: 'DataString', title: 'DataString'},
                                {key: 'DataNumber', title: 'DataNumber'},
                                {key: 'DataBoolean', title: 'DataBoolean'},
                                {key: 'mf', title: 'Molecular Formula'},
                                {key: 'color', title: 'Color'},
                                {key: 'date', title: 'Date'}
                            ]
                        },
                        formatter: {
                            type: 'combo',
                            title: 'Formatter',
                            options: [
                                {key: 'typerenderer', title: 'Type Renderer'}
                            ],
                            default: 'typerenderer'
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
        'filterRow': ['groups', 'group', 0, 'filterRow', 0],
        'justInTimeFilter': ['groups', 'group', 0, 'justInTimeFilter', 0],
        'cols': ['groups', 'cols', 0],
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
        rows: {
            label: 'Row selection',
            type: 'array'
        }
    };

    Controller.prototype.variablesIn = ['list'];

    Controller.prototype.actionsIn = $.extend({}, Default.actionsIn, {
        hoverRow: 'Mimic hover row',
        selectRow: 'Mimic select row',
        addRow: 'Add a new row',
        addColumn: 'Add a new column',
        removeColumn: 'Remove a column',
        removeRow: 'Remove a row'
    });

    Controller.prototype.events = {
        onSelect: {
            label: 'A row was clicked',
            refVariable: ['row'],
            refAction: ['row']
        },
        onHover: {
            label: 'Hovers a line',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowChange: {
            label: 'A row has been edited',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowNew: {
            label: 'A new row has been added',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowsDelete: {
            label: 'Rows have been deleted',
            refVariable: ['rows'],
            refAction: ['rows']
        },
        onRowActive: {
            label: 'A new row became active',
            refVariable: ['row'],
            refAction: ['row']
        },
        onRowsSelect: {
            label: 'Rows have been selected',
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
        this.setVarFromEvent('onSelect', 'row', 'list', [row]);
        this.sendActionFromEvent('onSelect', 'row', item);
    }, 250, {trailing: false});

    Controller.prototype.onActive = function (row, item) {
        var itemId = item[this.module.view.idPropertyName];
        if (this.lastClickedItemId === itemId) return;
        this.lastClickedItemId = itemId;
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
