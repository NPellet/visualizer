'use strict';
/*global Slick*/
define([
    'require',
    'modules/default/defaultview',
    'src/util/debug',
    'lodash',
    'src/util/util',
    'src/util/api',
    'src/util/typerenderer',
    'slickgrid'
], function (require, Default, Debug, _, Util, API, Renderer) {

    function View() {
    }

    var cssPromises = [];
    cssPromises.push(Util.loadCss('./components/slickgrid/slick.grid.css'));
    var cssLoaded = Promise.all(cssPromises);

    // A simple filter
    var columnFilters = {};
    var columnFilterFunctions = {};

    var uniqueID = 0;


    var formatters = {
        typerenderer: waitingFormatter,
        'slick.text': Slick.Formatters.Text,
        'slick.percent': Slick.Formatters.PercentComplete,
        'slick.percentbar': Slick.Formatters.PercentCompleteBar,
        'slick.yesno': Slick.Formatters.YesNoSelect
    };

    var typeEditors = {
        boolean: Slick.CustomEditors.Checkbox,
        mf: Slick.CustomEditors.TextValue,
        color: Slick.CustomEditors.ColorValue,
        string: Slick.CustomEditors.TextValue,
        number: Slick.CustomEditors.TextValue,
        date: Slick.CustomEditors.DateValue,
        DataString: Slick.CustomEditors.SpecialNativeObject,
        DataNumber: Slick.CustomEditors.DataNumberEditor,
        DataBoolean: Slick.CustomEditors.DataBooleanEditor
    };

    $.extend(true, View.prototype, Default, {

        init: function () {
            var that = this;
            if (!this.$container) {
                this._id = Util.getNextUniqueId();
                this.$rowHelp = $('<div>').attr('class', 'rowHelp');
                this.$container = $('<div>').attr('id', this._id).css({
                    display: 'flex',
                    'min-height': '100%',
                    'flex-direction': 'column',
                    width: '100%'
                });

                this.module.getDomContent().html(this.$rowHelp);
                this.module.getDomContent().append(this.$container);
            }

            this.actionOutButtons = this.module.getConfiguration('actionOutButtons');
            this.actionOutButtons = this.actionOutButtons || [];
            this.actionOutButtons = _.filter(this.actionOutButtons, function (v) {
                return v.actionName && v.buttonTitle;
            });

            this.$container.on('mouseleave', function () {
                that.module.controller.lastHoveredItemId = null;
            });

            this.slick = {};
            this.colConfig = this.module.getConfiguration('cols');
            this.idPropertyName = '_sgid';
            this.hiddenColumns = [];
            this.resolveReady();
        },

        preventRowHelp: function () {
            this._preventRowHelp = true;
        },

        deleteRowSelection: function () {
            var rows = this.grid.getSelectedRows();
            var idx = new Array(rows.length);
            for (var i = 0; i < rows.length; i++) {
                var itemInfo = this._getItemInfoFromRow(rows[i]);
                idx[i] = itemInfo.idx;
            }
            idx = idx.sort();
            var j = 0;
            var removedRows = [];
            for (i = 0; i < rows.length; i++) {
                var removed = this.module.data.splice(idx[i] - j++, 1);
                if (removed.length) removedRows.push(removed[0]);
            }
            this.lastSelectedRows = [];
            this.module.controller.onRowsDelete(removedRows);
            this.module.data.triggerChange();
        },

        getAllSlickColumns: function () {
            var that = this;
            var tp = $.proxy(typeRenderer, this);

            function getEditor(jpath) {
                var editor;
                var obj = that.module.data.get(0).getChildSync(jpath);
                if (obj instanceof DataString) {
                    editor = Slick.CustomEditors.SpecialNativeObject;
                } else if (obj instanceof DataNumber) {
                    editor = Slick.CustomEditors.DataNumberEditor;
                } else if (obj instanceof DataBoolean) {
                    editor = Slick.CustomEditors.DataBooleanEditor;
                } else {
                    editor = typeEditors[getType(jpath)];
                }
                return editor;
            }

            function getType(jpath) {
                var type;
                var obj = that.module.data.get(0).getChildSync(jpath);
                if (obj instanceof DataObject) {
                    type = obj.type;
                }
                return type;
            }

            var slickCols = this.colConfig.map(function (row) {
                var editor, type;
                if (row.editor === 'auto' && that.module.data) {
                    if (!that.module.data.length) {
                        editor = Slick.CustomEditors.SpecialNativeObject;
                        Debug.warn('Slick grid: using editor based on type when the input variable is empty. Cannot determine type');
                    } else {
                        editor = getEditor(row.jpath);
                        type = getType(row.jpath);
                    }
                } else {
                    editor = typeEditors[row.editor];
                    type = row.editor;
                }

                return {
                    id: row.name,
                    name: row.name,
                    field: row.name,
                    width: +row.width || undefined,
                    minWidth: +row.minWidth || undefined,
                    maxWidth: +row.maxWidth || undefined,
                    resizable: true,
                    selectable: true,
                    focusable: true,
                    sortable: true,
                    defaultSortAsc: true,
                    editor: editor,
                    formatter: formatters[row.formatter],
                    asyncPostRender: (row.formatter === 'typerenderer') ? tp : undefined,
                    jpath: row.jpath,
                    simpleJpath: row.jpath.length === 1,
                    dataType: type
                };
            });

            slickCols = _.filter(slickCols, function (val) {
                return val.name;
            });

            // No columns are define, we use the input object to define them
            if (_.isEmpty(slickCols)) {
                var colNames = [];
                for (var i = 0; i < that.module.data.length; i++) {
                    colNames = _(colNames).push(_.keys(that.module.data[i])).flatten().uniq().value();
                }

                slickCols = _(colNames).filter(function (v) {
                    return v[0] !== '_';
                }).map(function (rowName) {
                    return {
                        id: rowName,
                        name: rowName,
                        field: rowName,
                        resisable: true,
                        selectable: true,
                        focusable: true,
                        sortable: false,
                        editor: getEditor([rowName]),
                        dataType: getType([rowName]),
                        jpath: [rowName],
                        formatter: formatters.typerenderer,
                        asyncPostRender: tp
                    };
                }).value();

            }

            if (this.module.getConfigurationCheckbox('autoColumns', 'remove')) {
                slickCols.unshift({
                    id: 'rowDeletion',
                    width: 30,
                    field: 'rowDeletion',
                    selectable: false,
                    resizable: false,
                    focusable: false,
                    sortable: false,
                    formatter: binFormatter
                });
            }

            if (this.module.getConfigurationCheckbox('autoColumns', 'select')) {
                var checkboxSelector = new Slick.CheckboxSelectColumn({
                    cssClass: 'slick-cell-checkboxsel'
                });

                this.slick.plugins.push(checkboxSelector);

                slickCols.unshift(checkboxSelector.getColumnDefinition());
            }
            return slickCols;
        },

        getSlickColumns: function () {
            var that = this;
            var slickCols = this.getAllSlickColumns();

            return slickCols.filter(function (v) {
                return that.hiddenColumns.indexOf(v.name) === -1;
            });
        },

        getSlickOptions: function () {
            var that = this;
            return {
                editable: that.module.getConfigurationCheckbox('slickCheck', 'editable'),
                enableAddRow: that.module.getConfigurationCheckbox('slickCheck', 'enableAddRow'),
                enableCellNavigation: that.module.getConfigurationCheckbox('slickCheck', 'editable'),
                autoEdit: that.module.getConfigurationCheckbox('slickCheck', 'autoEdit'),
                enableTextSelectionOnCells: true,
                enableColumnReorder: true,
                forceFitColumns: that.module.getConfigurationCheckbox('slickCheck', 'forceFitColumns'),
                multiColumnSort: true,
                asyncEditorLoading: true,
                asyncEditorLoadDelay: 30,
                enableAsyncPostRender: true,
                asyncPostRenderDelay: 0,
                defaultColumnWidth: that.module.getConfiguration('slick.defaultColumnWidth') || 80,
                dataItemColumnValueExtractor: function (item, coldef) {
                    // In order to use jpath, we return the row instead of the column
                    // TODO: use jpath in coldef here?
                    return item;
                },
                explicitInitialization: true,
                rowHeight: that.module.getConfiguration('slick.rowHeight'),
                showHeaderRow: that.module.getConfigurationCheckbox('slickCheck', 'filterColumns'),
                headerRowHeight: 30
            };
        },

        _openDetails: function () {
            var that = this;
            if (this.grid.getEditorLock().isActive() && !this.grid.getEditorLock().commitCurrentEdit()) {
                return;
            }
            var editableColumns = this.slick.columns.filter(function (v) {
                return v.editor;
            });

            if (editableColumns.length === 0) {
                return;
            }

            var $modal = $("<div class='item-details-form'></div>");
            $modal = $.tmpl('<div class=\'item-details-form\'>\n    {{each columns}}\n    <div class=\'item-details-label\'>\n        ${name}\n    </div>\n    <div class=\'item-details-editor-container\' data-editorid=\'${id}\'></div>\n    {{/each}}\n\n    <hr/>\n    <div class=\'item-details-form-buttons\'>\n        <button data-action=\'save\'>Save</button>\n        <button data-action=\'cancel\'>Cancel</button>\n    </div>\n</div>', {
                context: this.grid.getDataItem(this.grid.getActiveCell().row),
                columns: editableColumns
            }).appendTo('body');
            $modal.keydown(function (e) {
                if (e.which == $.ui.keyCode.ENTER) {
                    that.grid.getEditController().commitCurrentEdit();
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.which == $.ui.keyCode.ESCAPE) {
                    that.grid.getEditController().cancelCurrentEdit();
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            $modal.find('[data-action=save]').click(function () {
                that.grid.getEditController().commitCurrentEdit();
            });
            $modal.find('[data-action=cancel]').click(function () {
                that.grid.getEditController().cancelCurrentEdit();
            });
            var containers = $.map(editableColumns, function (c) {
                return $modal.find('[data-editorid=' + c.id + ']');
            });
            var compositeEditor = new Slick.CompositeEditor(
                editableColumns,
                containers,
                {
                    destroy: function () {
                        $modal.remove();
                    }
                }
            );
            if (!this.grid.editActiveCell(compositeEditor))
                $modal.remove();
        },


        inDom: function () {


        },

        doGrid: function () {
            var that = this;
        },

        update: {

            list: function (moduleValue) {
                var that = this;
                this.module.data = moduleValue;
                this._highlights = _.pluck(this.module.data, '_highlight');
                this.dataObjectsDone = false;
                this.slick.plugins = [];
                this.slick.options = this.getSlickOptions();
                this.generateUniqIds();
                this.addRowAllowed = this.module.getConfigurationCheckbox('slickCheck', 'enableAddRow');


                function filter(item) {

                    for (var columnId in columnFilters) {
                        if (columnId !== undefined && columnFilters[columnId] !== '') {
                            var idx = that.slick.data.getIdxById(item[that.idPropertyName]);
                            var c = that.grid.getColumns()[that.grid.getColumnIndex(columnId)];
                            var jpath = _.clone(DataObject.resurrect(c.jpath));
                            jpath.unshift(idx);
                            //if (!that.module.data.getChildSync(jpath) || !that.module.data.getChildSync(jpath).get().toString().match(columnFilters[columnId])) {
                            //    return false;
                            //}
                            if (!that.module.data.getChildSync(jpath) || !columnFilterFunctions[columnId](that.module.data.getChildSync(jpath).get())) {
                                return false;
                            }
                        }
                    }
                    return true;
                }


                cssLoaded.then(function doGrid() {
                    that.slick.columns = that.getSlickColumns();

                    that.$rowToolbar = $('<div>').attr('class', 'rowToolbar');
                    if (that.module.getConfigurationCheckbox('toolbar', 'add')) {
                        that.$addButton = $('<input type="button" value="New"/>');
                        that.$addButton.on('click', function () {
                            var cols = that.grid.getColumns();
                            var colidx = _.findIndex(cols, function (v) {
                                return v.editor;
                            });
                            if (colidx > -1) {
                                that.preventRowHelp();
                                that.grid.gotoCell(that.slick.data.getLength(), colidx, true);
                            }
                            that._openDetails();
                        });
                        that.$rowToolbar.append(that.$addButton);
                    }

                    if (that.module.getConfigurationCheckbox('toolbar', 'update')) {
                        that.$updateButton = $('<input type="button" value="Update"/>');
                        that.$updateButton.on('click', function () {
                            that._openDetails();
                        });
                        that.$rowToolbar.append(that.$updateButton);
                    }

                    if (that.module.getConfigurationCheckbox('toolbar', 'remove')) {
                        that.$deleteButton = $('<input type="button" value="Delete"/>');
                        that.$deleteButton.on('click', function () {
                            that.deleteRowSelection();
                        });
                        that.$rowToolbar.append(that.$deleteButton);
                    }

                    if (that.module.getConfigurationCheckbox('toolbar', 'showHide')) {
                        var columns = that.getAllSlickColumns().filter(function (val) {
                            return val.id !== 'rowDeletion' && val.id !== '_checkbox_selector';
                        });
                        console.log(columns[0]);

                        that.$showHideSelection = $.tmpl('<input type="button" value="Show/Hide Column"/>\n    <div class="mutliSelect" style="display:none">\n        <ul>\n            {{each columns}}\n            \n            <li><input type="checkbox" value="${name}" checked/>${name}</li>\n            {{/each}}\n        </ul>\n    </div>', {
                            columns: columns
                        });
                        if (that.columnSelectionShown) {
                            that.$showHideSelection.filter('div').show();
                        }
                        that.$showHideSelection.on('click', function () {
                            that.$showHideSelection.filter('div').toggle();
                            that.columnSelectionShown = that.$showHideSelection.is(':visible');
                            that.onResize();
                        });
                        for (var i = 0; i < that.hiddenColumns.length; i++) {
                            that.$showHideSelection.find('input[value="' + that.hiddenColumns[i] + '"]').removeAttr('checked');
                        }
                        that.$showHideSelection.find('input[type="checkbox"]').on('change', function () {
                            if (this.checked) {
                                var idx = that.hiddenColumns.indexOf(this.value);
                                if (idx > -1) that.hiddenColumns.splice(idx, 1);
                            } else {
                                that.hiddenColumns.push(this.value);
                            }
                            that.$container.html('');
                            return doGrid();

                        });
                        that.$rowToolbar.append(that.$showHideSelection);

                    }

                    that.$actionButtons = new Array(that.actionOutButtons.length);
                    for (var i = 0; i < that.actionOutButtons.length; i++) {
                        (function (i) {
                            that.$actionButtons[i] = $('<input type="button" value="' + that.actionOutButtons[i].buttonTitle + '"/>');
                            that.$actionButtons[i].on('click', function () {
                                that.module.controller.sendActionButton(that.actionOutButtons[i].actionName, that._getSelectedItems());
                            });
                        })(i);
                    }
                    that.$rowToolbar.append(that.$actionButtons);
                    that.$container.append(that.$rowToolbar);

                    if (that.module.getConfiguration('toolbar').length === 0 && that.$actionButtons.length === 0 && that.$rowToolbar) {
                        that.$rowToolbar.remove();
                    }

                    that.$slickgrid = $('<div>').css({
                        flex: 1
                    });
                    that.$container.append(that.$slickgrid);
                    that.slick.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
                    that.slick.plugins.push(that.slick.groupItemMetadataProvider);
                    that.slick.data = new Slick.Data.DataView({
                        groupItemMetadataProvider: that.slick.groupItemMetadataProvider
                    });

                    that.slick.data.setModule(that.module);
                    that.grid = new Slick.Grid(that.$slickgrid, that.slick.data, that.slick.columns, that.slick.options);

                    for (var i = 0; i < that.slick.plugins.length; i++) {
                        that.grid.registerPlugin(that.slick.plugins[i]);
                    }


                    if (that.module.getConfiguration('slick.selectionModel') === 'row') {
                        that.grid.setSelectionModel(new Slick.RowSelectionModel());
                    } else {
                        that.grid.setSelectionModel(new Slick.CellSelectionModel());
                    }

                    //var columnpicker = new Slick.Controls.ColumnPicker(that.slick.columns, that.grid, that.slick.options);

                    that._activateHighlights();


                    that.grid.module = that.module;


                    // listen to group expansion...
                    if (that.module.getConfigurationCheckbox('slickCheck', 'oneUncollapsed')) {
                        that.slick.groupItemMetadataProvider.onGroupExpanded.subscribe(function (e, args) {
                            this.getData().collapseAllGroups(args.item.level);
                            this.getData().expandGroup(args.item.groupingKey);
                        });
                    }

                    // wire up model events to drive the grid
                    that.slick.data.onRowCountChanged.subscribe(function (e, args) {
                        that.grid.updateRowCount();
                        that.grid.render();
                    });

                    that.slick.data.onRowsChanged.subscribe(function (e, args) {
                        that.grid.invalidateRows(args.rows);
                        that.grid.render();
                    });


                    that.grid.onAddNewRow.subscribe(function (e, args) {
                        that.module.controller.onRowNew(that.module.data.length - 1, that.module.data[that.module.data.length - 1]);
                        that.module.model.dataTriggerChange(that.module.data);
                        that._resetDeleteRowListeners();

                        //var item = args.item;
                        //var jpath = args.column.jpath.slice();
                        //jpath.unshift(that.module.data.length);
                        //that.module.model.dataSetChild(that.module.data, jpath, item).then(function() {
                        //    var row = that.module.data.length - 1;
                        //    that.grid.updateRowCount();
                        //    that.grid.invalidateRow(row);
                        //    that.grid.render();
                        //    that.module.controller.onRowNew(row);
                        //    that._resetDeleteRowListeners();
                        //});
                    });

                    that.grid.onViewportChanged.subscribe(function () {
                        // onViewportChange is not really working properly, so we hack by having a settimeout
                        // Acceptable since it is unlikely that someone click the delete button only 300 ms after
                        // the viewport has changed...
                        setTimeout(function () {
                            that.lastViewport = that.grid.getViewport();
                            that._resetDeleteRowListeners();
                            that._jpathColor();
                        }, 300);
                        that.lastViewport = that.grid.getViewport();
                        if (that.module.getConfigurationCheckbox('slickCheck', 'rowNumbering') && !that._preventRowHelp) {
                            that.$rowHelp.html((that.lastViewport.bottom - (that.addRowAllowed ? 2 : 1)).toString() + '/' + that.grid.getDataLength());
                            that.$rowHelp.fadeIn();
                            clearTimeout(that.lastRowHelp);
                            that.lastRowHelp = setTimeout(function () {
                                that.$rowHelp.fadeOut();
                            }, 1000);
                        }
                        that._preventRowHelp = false;
                        that._jpathColor();
                    });


                    that.grid.onMouseEnter.subscribe(function (e) {
                        // When scrolling fast, no mouseLeave event takes place
                        // Therefore we also have to un-highlight here
                        if (that._hl) {
                            API.highlightId(that._hl, 0);
                        }

                        that.count = that.count === undefined ? 0 : that.count;
                        that.count++;
                        that.hovering = true;
                        var itemInfo = that._getItemInfoFromEvent(e);
                        if (!itemInfo) return;


                        var hl = itemInfo.item._highlight;
                        that._hl = hl;
                        if (hl) {
                            API.highlightId(hl, 1);
                            lastHighlight = hl;
                        }
                        that.module.controller.onHover(itemInfo.idx, itemInfo.item);

                    });

                    that.grid.onMouseLeave.subscribe(function (e) {
                        that._e = e;
                        that.count--;
                        that.hovering = false;
                        var itemInfo = that._getItemInfoFromEvent(e);
                        if (!itemInfo) return;
                        var hl = itemInfo.item._highlight;
                        if (hl) {
                            API.highlightId(hl, 0);
                        } else if (lastHighlight) {
                            API.highlightId(lastHighlight, 0);
                        }

                    });

                    that.grid.onColumnsResized.subscribe(function () {
                        var cols = that.grid.getColumns().filter(function (val) {
                            return val.id !== 'rowDeletion' && val.id !== '_checkbox_selector';
                        });
                        for (var i = 0; i < cols.length; i++) {
                            that.module.definition.configuration.groups.cols[0][i].width = cols[i].width;
                        }
                        that.grid.invalidate();
                    });

                    that.grid.onCellChange.subscribe(function (e, args) {
                        var itemInfo = that._getItemInfoFromRow(args.row);
                        if (itemInfo) {
                            that.module.controller.onRowChange(itemInfo.idx, itemInfo.item);
                        }
                        that._resetDeleteRowListeners();
                    });

                    that.grid.onClick.subscribe(function (e, args) {
                        var columns = that.grid.getColumns();
                        var itemInfo = that._getItemInfoFromRow(args.row);
                        if (itemInfo) {
                            if (columns[args.cell] && columns[args.cell].id !== 'rowDeletion') {
                                that.module.controller.onClick(itemInfo.idx, itemInfo.item);
                            }
                        }
                    });

                    that.grid.onActiveCellChanged.subscribe(function (e, args) {
                        that.lastActiveCell = args.cell;
                        that.lastActiveRow = args.row;

                        var columns = that.grid.getColumns();
                        var itemInfo = that._getItemInfoFromRow(args.row);
                        if (itemInfo) {
                            if (columns[args.cell] && columns[args.cell].id !== 'rowDeletion') {
                                that.module.controller.onActive(itemInfo.idx, itemInfo.item);
                            }
                        }

                    });

                    that.grid.onColumnsReordered.subscribe(function () {
                        var cols = that.grid.getColumns();
                        var conf = that.module.definition.configuration.groups.cols[0];
                        var names = _.pluck(conf, 'name');
                        var ids = _.pluck(cols, 'id');

                        if (names.concat().sort().join() !== ids.concat().sort().join()) {
                            Debug.warn('Something might be wrong, number of columns in grid and in configuration do not match');
                            return;
                        }
                        that.module.definition.configuration.groups.cols[0] = [];
                        for (var i = 0; i < cols.length; i++) {
                            var idx = names.indexOf(ids[i]);
                            if (idx > -1) {
                                that.module.definition.configuration.groups.cols[0].push(conf[idx]);
                            }
                        }
                    });

                    that.grid.onSelectedRowsChanged.subscribe(function (e, args) {
                        that.lastSelectedRows = args.rows;
                        var selectedItems = that._getItems(args.rows);
                        that.module.controller.onRowsSelected(selectedItems);
                    });

                    that.grid.onSort.subscribe(function (e, args) {
                        // args.multiColumnSort indicates whether or not this is a multi-column sort.
                        // If it is, args.sortCols will have an array of {sortCol:..., sortAsc:...} objects.
                        // If not, the sort column and direction will be in args.sortCol & args.sortAsc.

                        that._makeDataObjects();
                        // We'll use a simple comparer function here.
                        var items = that.slick.data.getItems(), i = 0;
                        // Add a position indicatior ==> for stable sort
                        for (i = 0; i < items.length; i++) {
                            items[i].__elementPosition = i;
                        }
                        var sortCols;
                        if (!args.sortCols) {
                            sortCols = [{
                                sortCol: args.sortCol,
                                sortAsc: args.sortAsc
                            }];
                        } else {
                            sortCols = args.sortCols;
                        }
                        for (i = sortCols.length - 1; i >= 0; i--) {
                            (function (i) {
                                //var comparer = function(a) {
                                //    return a.getChildSync(sortCols[i].sortCol.jpath).get();
                                //};

                                var comparer1 = function (a, b) {
                                    var val1 = a.getChildSync(sortCols[i].sortCol.jpath);
                                    var val2 = b.getChildSync(sortCols[i].sortCol.jpath);
                                    if (val1 === undefined) {
                                        if (sortCols[i].sortAsc) return 1;
                                        else return -1;
                                    }
                                    if (val2 === undefined) {
                                        if (sortCols[i].sortAsc) return -1;
                                        else return 1;
                                    }
                                    val1 = val1.get();
                                    val2 = val2.get();
                                    if (val1 < val2) {
                                        return -1;
                                    } else if (val2 < val1) {
                                        return 1;
                                    }
                                    return a.__elementPosition - b.__elementPosition;
                                };
                                that.slick.data.sort(comparer1, sortCols[i].sortAsc);
                            })(i);
                        }

                        for (i = 0; i < items.length; i++) {
                            delete items[i].__elementPosition;
                        }
                        that._jpathColor();
                    });


                    $(that.grid.getHeaderRow()).delegate(':input', 'change keyup', function (e) {
                        var columnId = $(this).data('columnId');
                        if (columnId != null) {
                            columnFilters[columnId] = $.trim($(this).val());
                            columnFilterFunctions[columnId] = getColumnFilterFunction(columnFilters[columnId]);
                            that.slick.data.refresh();
                        }
                    });

                    that.grid.onHeaderRowCellRendered.subscribe(function (e, args) {
                        $(args.node).empty();
                        $("<input type='text'>")
                            .css('width', '100%')
                            .data('columnId', args.column.id)
                            .val(columnFilters[args.column.id])
                            .appendTo(args.node);
                    });

                    //var sortjpath;
                    //function comparer(a, b) {
                    //    var x = a.get(sortjpath), y = b.get(sortjpath);
                    //    return (x == y ? 0 : (x > y ? 1 : -1));
                    //}
                    //
                    //that.grid.onSort.subscribe(function (e, args) {
                    //    if(!args.multiColumnSort) {
                    //        sortjpath = args.sortCol.jpath;
                    //        // using native sort with comparer
                    //        // can be very slow in IE with huge datasets
                    //        that.slick.data.sort(comparer, args.sortAsc);
                    //    }
                    //    else {
                    //        var cols = args.sortCols;
                    //        that.slick.data.sort(function (dataRow1, dataRow2) {
                    //            for (var i = 0, l = cols.length; i < l; i++) {
                    //                var jpath = cols[i].sortCol.jpath;
                    //                var sign = cols[i].sortAsc ? 1 : -1;
                    //                var value1 = dataRow1.get(jpath), value2 = dataRow2.get(jpath);
                    //                var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                    //                if (result != 0) {
                    //                    return result;
                    //                }
                    //            }
                    //            return 0;
                    //        });
                    //    }
                    //    grid.invalidate();
                    //    grid.render();
                    //
                    //});
                    that.grid.init();
                    that.slick.data.beginUpdate();

                    var groupings = _.chain(that.module.getConfiguration('groupings'))
                        .filter(function (val) {
                            if (val && val.groupName && val.getter) return true;
                            return false;
                        })
                        .map(function (val) {
                            var r = {};
                            if (val.getter && val.getter.length > 1) {
                                r.getter = function (row) {
                                    return row.getChildSync(val.getter);
                                };
                                that._makeDataObjects();
                            } else {
                                r.getter = val.getter[0];
                            }

                            r.formatter = function (g) {
                                return val.groupName + ': ' + g.value + "  <span style='color:green'>(" + g.count + ' items)</span>';
                            };
                            r.aggregateCollapsed = false;
                            r.lazyTotalsCalculation = true;
                            return r;
                        }).value();

                    if (groupings.length) {
                        that.slick.data.setGrouping(groupings);
                        if (that.module.getConfigurationCheckbox('slickCheck', 'collapseGroup')) {
                            that.slick.data.collapseAllGroups(0);
                        }

                        //_.each(groupings, function(val) {
                        //    if(val.collapse) {
                        //        that.slick.data.expandGroup(val.getter);
                        //    }
                        //});

                    }


                    if (that.module.getConfigurationCheckbox('slickCheck', 'filterColumns')) {
                        that.slick.data.setFilter(filter);
                    }

                    that.slick.data.setItems(that.module.data, that.idPropertyName);
                    that.slick.data.endUpdate();

                    // get back state before last update
                    if (that.lastViewport && !that.module.getConfigurationCheckbox('slickCheck', 'backToTop')) {
                        that.grid.scrollRowToTop(that.lastViewport.top);
                    }

                    if (Array.isArray(that.lastSelectedRows)) {
                        that.grid.setSelectedRows(that.lastSelectedRows);
                    } else if (!_.isUndefined(that.lastActiveRow) && !that.module.getConfigurationCheckbox('slickCheck', 'forgetLastActive')) {
                        that.grid.setActiveCell(that.lastActiveRow, that.lastActiveCell);
                    }


                    that.grid.render();
                    that._resetDeleteRowListeners();
                    that._setBaseCellCssStyle();
                    that.lastViewport = that.grid.getViewport();
                    that._jpathColor();
                });
            }

        },

        blank: {
            list: function () {
                this.$container.html('');
            }
        },

        _setBaseCellCssStyle: function () {
            var cols = this.grid.getColumns();
            this.baseCellCssStyle = {};
            for (var i = 0; i < cols.length; i++) {
                this.baseCellCssStyle[cols[i].id] = 'highlighted-cell';
            }
        },

        _resetDeleteRowListeners: function () {
            var that = this;
            var $rb = that.$rb = $('#' + that._id).find('a.recycle-bin');
            $rb.off('click');
            $rb.on('click', function (e) {
                var columns = that.grid.getColumns();
                var args = that.grid.getCellFromEvent(e);
                that.lastViewport = that.grid.getViewport();
                if (columns[args.cell] && columns[args.cell].id === 'rowDeletion') {
                    // delete the row...
                    var itemInfo = that._getItemInfoFromRow(args.row);
                    var removed = that.module.data.splice(itemInfo.idx, 1);
                    if (removed.length) that.module.controller.onRowsDelete(removed);
                    that.module.data.triggerChange();
                }
            });
        },

        _getItemInfoFromEvent: function (e) {
            var that = this;
            var cell = this.grid.getCellFromEvent(e);
            if (!cell) return null;
            var id = that.slick.data.mapRowsToIds([cell.row])[0];
            if (!id) return null;
            return {
                id: id,
                idx: that.slick.data.getIdxById(id),
                item: that.slick.data.getItemById(id)
            };
        },

        _getItemInfoFromRow: function (row) {
            var that = this;
            if (_.isUndefined(row)) return null;
            var id = that.slick.data.mapRowsToIds([row])[0];
            if (!id) return null;
            return {
                id: id,
                idx: that.slick.data.getIdxById(id),
                item: that.slick.data.getItemById(id)
            };
        },

        _jpathColor: function () {
            var that = this;
            if (!that.lastViewport) return;
            var colorjPath = that.module.getConfiguration('colorjPath');
            var cols = that.grid.getColumns();
            if (colorjPath && colorjPath.length > 0) {
                that._makeDataObjects();
                for (var i = that.lastViewport.top; i <= that.lastViewport.bottom; i++) {
                    var item = that.grid.getDataItem(i);
                    if (item && item.__group !== true) {
                        var color = item.getChildSync(colorjPath);
                        if (color) {
                            for (var j = 0; j < cols.length; j++) {
                                var node = that.grid.getCellNode(i, j);
                                $(node).css('background-color', color.get());
                            }
                        }
                    }
                }
            }
        },

        _selectHighlight: function () {
            if (this.hovering) {
                return;
            }
            var that = this;
            var idx = _.findIndex(this._highlights, function (val) {
                return val === that._highlighted[0] || (val.indexOf && val.indexOf(that._highlighted[0]) > -1);
            });
            this.lastViewport = this.grid.getViewport();
            if (idx > -1 && this.module.getConfigurationCheckbox('slickCheck', 'highlightScroll')) {
                var item = that.slick.data.getItemByIdx(idx);
                var gridRow = that.slick.data.mapIdsToRows([item[that.idPropertyName]])[0];
                if (!gridRow) return;
                if (gridRow < this.lastViewport.top || gridRow >= this.lastViewport.bottom) {
                    // navigate
                    this.grid.scrollRowToTop(gridRow);
                }

                //this.grid.setActiveCell(gridRow, 0);
            }
        },

        _drawHighlight: function () {
            var that = this;
            this.grid.removeCellCssStyles('highlight');
            var tmp = {};
            this._selectHighlight();
            this.lastViewport = this.grid.getViewport();
            for (var i = this.lastViewport.top; i <= this.lastViewport.bottom; i++) {
                var item = this.grid.getDataItem(i);
                if (!item) continue;
                if (_.any(that._highlighted, function (k) {
                        var hl = item._highlight;
                        if (!(hl instanceof Array)) {
                            hl = [hl];
                        }
                        return hl.indexOf(k) > -1;
                    })) {
                    tmp[i] = that.baseCellCssStyle;
                }
            }
            this.grid.setCellCssStyles('highlight', tmp);
        },

        _activateHighlights: function () {
            var that = this;
            var hl = _(this.module.data).pluck('_highlight').flatten().filter(function (val) {
                return !_.isUndefined(val);
            }).value();

            that._highlighted = [];

            API.killHighlight(this.module.getId());

            for (var i = 0; i < hl.length; i++) {
                (function (i) {
                    API.listenHighlight({_highlight: hl[i]}, function (onOff, key) {
                        if (!key instanceof Array) {
                            key = [key];
                        }
                        if (onOff) {
                            that._highlighted = _(that._highlighted).push(key).flatten().uniq().value();
                        } else {
                            that._highlighted = _.filter(that._highlighted, function (val) {
                                return key.indexOf(val) === -1;
                            });
                        }
                        that._drawHighlight();
                    }, false, that.module.getId());
                })(i);
            }
        },

        _makeDataObjects: function () {
            if (this.dataObjectsDone) return;
            for (var i = 0; i < this.module.data.length; i++) {
                this.module.data[i] = DataObject.check(this.module.data[i]);
            }
            this.dataObjectsDone = true;
        },

        _getItems: function (rows) {
            var selected = [];
            for (var i = 0; i < rows.length; i++) {
                var itemInfo = this._getItemInfoFromRow(rows[i]);
                if (itemInfo)
                    selected.push(itemInfo.item);
            }
            return selected;
        },

        _getSelectedItems: function () {
            return this._getItems(this.grid.getSelectedRows());
        },

        onResize: function () {
            if (this.grid) {
                this.grid.resizeCanvas();
            }
            this.$rowHelp.css({
                bottom: 0
            });
        },

        getNextIncrementalId: function () {
            return ++uniqueID;
        },

        generateUniqIds: function () {
            if (!this.module.data) return;
            for (var i = 0; i < this.module.data.length; i++) {
                if (!this.module.data[i][this.idPropertyName]) {
                    Object.defineProperty(this.module.data[i], this.idPropertyName, {
                        value: 'id_' + ++uniqueID,
                        writable: false,
                        configurable: false,
                        enumerable: false
                    });
                }
            }
        },

        exportToTabDelimited: function () {
            var cols = this.grid.getColumns();
            var txt = '';
            var line = [], i, j;
            for (i = 0; i < cols.length; i++) {
                if (cols[i].jpath) // ignore special columns
                    line.push(cols[i].name || '');
            }
            txt += line.join('\t') + '\r\n';
            for (i = 0; i < this.module.data.length; i++) {
                line = [];
                for (j = 0; j < cols.length; j++) {
                    var jpath = cols[j].jpath;
                    if (!jpath) continue; // again
                    jpath = jpath.slice(0);
                    jpath.unshift(i);
                    var el = this.module.data.getChildSync(jpath, false);
                    el = el ? el.get() : '';
                    if (typeof el === 'string') el = el.replace(/\r/g, '\\r').replace(/\n/g, '\\n').replace(/\t/g, '\\t');
                    line.push(el);
                }
                txt += line.join('\t') + '\r\n';
            }
            return txt;
        },

        onActionReceive: {
            hoverRow: function (row) {
                // row can be the row itself or the array's index
                var item;
                if (_.isNumber(row) || row instanceof DataNumber) {
                    item = this.module.data[row];
                } else {
                    item = row;
                }

                if (item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.mapIdsToRows([item[this.idPropertyName]])[0];
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onHover(dataIdx, item);
                    this.grid.scrollRowToTop(gridRow);
                }
            },

            selectRow: function (row) {
                var item;
                if (_.isNumber(row) || row instanceof DataNumber) {
                    item = this.module.data[row];
                } else {
                    item = row;
                }

                if (item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.mapIdsToRows([item[this.idPropertyName]])[0];
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onClick(dataIdx, item);
                    if (!_.isUndefined(gridRow)) {
                        this.grid.scrollRowToTop(gridRow);
                        this.grid.setActiveCell(gridRow, 0);
                    }

                }
            }
        }
    });

    function waitingFormatter() {
        return '...';
    }

    function binFormatter() {
        return '<div style="width:100%; height: 100%; display: table-cell"><a class="recycle-bin"><i class="fa fa-trash"></i></a></div>';
    }

    function requiredFieldValidator(value) {
        if (value == null || value == undefined || !value.length) {
            return {valid: false, msg: 'This is a required field'};
        } else {
            return {valid: true, msg: null};
        }
    }

    function typeRenderer(cellNode, row, dataContext, colDef) {
        if (dataContext.__group) return;
        this.module.data.traceSync([row]);
        if (cellNode) {
            Renderer.render(cellNode, dataContext, colDef.jpath);
        }

    }

    var filters = {};
    filters.cointains = function (a, search) {
        return a.toLowerCase().match(search.toLowerCase());
    };

    filters.gt = function (a, b) {
        return a > b;
    };

    filters.lt = function (a, b) {
        return a < b;
    };

    filters.interval = function (a, low, high) {
        return a >= low && a <= high;
    };

    filters.reg = function (a, reg, modifiers) {
        var reg = new RegExp(reg, modifiers);
        return a.match(reg);
    };

    function getColumnFilterFunction(query) {
        var match;

        match = query.match(/^"(.*)"$/);
        if (match) {
            return function (val) {
                match = match.toLowerCase();
                val = val.toString().toLowerCase();
                return val.match(match[1]);
            };
        }

        match = query.match(/^\/(.*)\/(i?)/);
        if (match) {
            return function (val) {
                return val.toString().match(new RegExp(match[1], match[2] || undefined));
            };
        }

        match = query.match(/^([<>=]{1,2})([0-9.]+)$/);
        if (match) {
            if (match[1] === '<') {
                return function (val) {
                    return val < match[2];
                };
            } else if (match[1] === '<=' || match[1] === '=<') {
                return function (val) {
                    return val <= match[2];
                };
            } else if (match[1] === '>') {
                return function (val) {
                    return val > match[2];
                };
            } else if (match[1] === '>=' || match[1] === '=>') {
                return function (val) {
                    return val >= match[2];
                };
            } else if (match[1] === '==' || match[1] === '=') {
                return function (val) {
                    return val == match[2];
                };
            }
        }

        match = query.match(/^([0-9.]+)\.\.([0-9.]*)$/);
        if (match) {
            return function (val) {
                return val >= match[1] && val <= match[2];
            };
        }

        return function (val) {
            return val.toString().toLowerCase().match(query.toLowerCase());
        };
    }

    var lastHighlight = '';

    return View;

});
