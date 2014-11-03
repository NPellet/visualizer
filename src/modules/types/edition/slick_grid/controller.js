define(['modules/default/defaultcontroller', 'src/util/util'], function(Default, Util) {

    var controller = function() {};

    controller.prototype = $.extend(true, {}, Default);

    /*
     Information about the module
     */
    controller.prototype.moduleInformation = {
        moduleName: 'Slick Grid',
        description: 'Table editor based on SlickGrid',
        author: 'Daniel Kostro',
        date: '14.10.2014',
        license: 'MIT',
        cssClass: 'slickgrid'
    };

    controller.prototype.configurationStructure = function(section) {

        var jpaths = this.module.model.getjPath('row', false );


        return {
            groups: {

                group: {
                    options: {
                        type: 'list',
                        multiple: false
                    },

                    fields: {

                        toggle: {
                            type: 'combo',
                            title: 'Line toggling',
                            options: [{key: "0", title: "No"}, {key: "single", title:"Single row"}, {key: "multiple", title:"Multiple rows"}]
                        },

                        colorjpath: {
                            type: 'combo',
                            title: 'Color jPath',
                            options: jpaths,
                            extractValue: Util.jpathToArray,
                            insertValue: Util.jpathToString
                        },

                        slickCheck: {
                            type: 'checkbox',
                            title: 'Slick options',
                            options: {
                                editable: 'Editable',
                                enableAddRow: 'Enable add row',
                                enableCellNavigation: 'Enable Cell Navigation',
                                autoEdit: 'Enable Auto Edit',
                                enableTextSelectionOnCells: 'Enable Text Selection',
                                enableColumnReorder: 'Enable Column reorder',
                                forceFitColumns: 'Force fit Columns'
                            },
                            default: ['editable', 'enableAddRow', 'enableCellNavigation']
                        },

                        "slick.rowHeight": {
                            type: 'text',
                            title: 'Row Height'
                        },


                        filterRow: {
                            type: 'jscode',
                            title: 'Filter'
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
                            title: 'Columns title'
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
                            options: [{key: 'none', title: 'None'},
                                {key: 'auto', title: 'Based on type'},
                                {key: 'TextValue', title: 'Text Value'}
                            ]
                        },

                        formatter: {
                            type: 'combo',
                            title: 'Formatter',
                            options: [
                                {key: 'typerenderer', title: 'Type Renderer'}
                            ]
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

                        selectable: {
                            type: 'checkbox',
                            title: 'Selectable',
                            options: {yes: 'Yes'},
                            default: ['yes']
                        },

                        resizable: {
                            type: 'checkbox',
                            title: 'Resizable',
                            options: {abc: 'Yes'},
                            default: ['yes']
                        },



                        sortable: {
                            type: 'checkbox',
                            title: 'Sortable',
                            options: {yes: 'Yes'},
                            default: ['yes']
                        },

                        focusable: {
                            type: 'checkbox',
                            title: 'Focusable',
                            options: {yes: 'Yes'},
                            default: ['yes']
                        },

                        defaultSortAsc: {
                            type: 'checkbox',
                            title: 'Sort Asc on first click',
                            options: {yes: 'Yes'},
                            default: ['yes']
                        }
                    }
                }
            }
        }
    };

    controller.prototype.configAliases = {
        'colsjPaths': [ 'groups', 'cols', 0 ],
        'toggle': [ 'groups', 'group', 0, 'toggle', 0 ],
        'colorjPath': [ 'groups', 'group', 0, 'colorjpath', 0 ],
        'filterRow': [ 'groups', 'group', 0, 'filterRow', 0 ],
        'slickCheck': [ 'groups', 'group', 0, 'slickCheck', 0 ],
        'slick.rowHeight': [ 'groups', 'group', 0, 'slick.rowHeight', 0 ],
        'cols': ['groups', 'cols', 0]
    };



    /*
        Configuration of the input/output references of the module
    */
    controller.prototype.references = {

        row: {
            label: 'Row'
        },

        list: {
            label: 'Table'
        },

        selectedrows: {
            label: 'Selected rows'
        }
    };


    /*
     Configuration of the module for receiving events, as a static object
     */
    controller.prototype.variablesIn = [ 'list' ];

    /*
     Received actions
     */
    controller.prototype.actionsIn = {
        addRow: 'Add a new row',
        addColumn: 'Add a new column',
        removeColumn: 'Remove a column',
        removeRow: 'Remove a row'
    };

    /*
     Configuration of the module for sending events, as a static object
     */
    controller.prototype.events = {

        // List of all possible events

        onSelect: {
            label: 'A line is selected',
            refVariable: [ 'row' ],
            refAction: [ 'row' ]
        },

        onHover: {
            label: 'Hovers a line',
            refVariable: [ 'row' ],
            refAction: [ 'row' ]
        },

        onToggleOn: {
            label: 'On Toggle On',
            refVariable: [ 'selectedrows' ],
            refAction: [ 'row' ]
        },

        onToggleOff: {
            label: 'On Toggle Off',
            refVariable: [ 'selectedrows' ],
            refAction: [ 'row' ]
        }
    };


    controller.prototype.onHover = function(row) {
        console.log('on hover', row);
        this.setVarFromEvent( 'onHover', 'row', 'list', [ row ] );
        this.sendAction( 'row', this.module.data.get(row), 'onHover' );

    };

    controller.prototype.onClick = function(row) {
        this.setVarFromEvent( 'onSelect', 'row', 'list', [ row ] );
        this.sendAction( 'row', this.module.data.get( row ), 'onSelect' );
    };


    return controller;
});