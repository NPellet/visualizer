'use strict';

define([
    'modules/default/defaultview',
    'src/util/debug',
    'lodash',
    'src/util/util',
    'src/util/api',
    'src/util/typerenderer',
    'slickgrid',
    'src/util/sandbox'
], function (Default, Debug, _, Util, API, Renderer, Slick, Sandbox) {

    function View() {
    }


    var cssPromises = [];
    cssPromises.push(Util.loadCss('components/slickgrid/slick.grid.css'));
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
        date: Slick.CustomEditors.Date,
        DataString: Slick.CustomEditors.DataStringEditor,
        DataNumber: Slick.CustomEditors.DataNumberEditor,
        DataBoolean: Slick.CustomEditors.DataBooleanEditor,
        longtext: Slick.CustomEditors.LongText
    };

    $.extend(true, View.prototype, Default, {

        init: function () {
            var that = this;
            this._setScript('');
            this.title = String(this.module.definition.title);
            if (!this.$container) {
                this._id = Util.getNextUniqueId();
                this.$rowHelp = $('<div>').attr('class', 'rowHelp');
                this.$container = $('<div>').attr('id', this._id).addClass('main-container');

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
            this.colConfig = (this.module.getConfiguration('cols') || []).filter(function (row) {
                return row.name;
            });
            this.idPropertyName = '_sgid';
            this.hiddenColumns = [];
            if (this.module.getConfiguration('filterType') === 'pref') {
                this._setScript(this.module.getConfiguration('filterRow'));
            }

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
                    editor = Slick.CustomEditors.DataStringEditor;
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
                var jp = jpath.slice(0);
                jp.unshift(0);
                var obj = that.module.data.getChildSync(jp);
                if (obj instanceof DataObject) {
                    type = obj.type;
                }
                return type;
            }

            var slickCols = this.colConfig
                .filter(function (row) {
                    return row.name;
                })
                .map(function (row) {
                    var editor, type;
                    if (row.editor === 'auto' && that.module.data) {
                        if (!that.module.data.length) {
                            editor = Slick.CustomEditors.DataString;
                            Debug.warn('Slick grid: using editor based on type when the input variable is empty. Cannot determine type');
                        } else {
                            editor = getEditor(row.jpath);
                            type = getType(row.jpath);
                        }
                    } else {
                        editor = typeEditors[row.editor];
                        type = getType(row.jpath);
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
                        compositeEditor: (editor === Slick.CustomEditors.LongText) ? Slick.CustomEditors.SimpleLongText : undefined,
                        formatter: formatters[row.formatter],
                        asyncPostRender: (row.formatter === 'typerenderer') ? tp : undefined,
                        jpath: row.jpath,
                        simpleJpath: row.jpath.length === 1,
                        dataType: type,
                        colDef: row
                    };
                });

            slickCols = _.filter(slickCols, function (val) {
                return val.name;
            });

            // No columns are defined, we use the input object to define them
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

        update: {

            script: function (moduleValue, varname) {
                if (this.module.getConfiguration('filterType') === 'invar') {
                    this._setScript(moduleValue.get());
                    this._runFilter({
                        event: 'scriptChanged'
                    });
                }
            },

            list: function (moduleValue, varname) {
                var that = this;
                this.module.data = moduleValue.get();
                this._updateHighlights();

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
                            if (!that.module.data.getChildSync(jpath) || !columnFilterFunctions[columnId](that.module.data.getChildSync(jpath).get())) {
                                return false;
                            }
                        }
                    }
                    return true;
                }


                cssLoaded.then(function doGrid() {
                    that.$container.html('');
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

                        that.$showHideSelection = $.tmpl('<input type="button" value="Show/Hide Column"/>\n    <div class="mutliSelect" style="display:none">\n        <ul>\n            {{each columns}}\n            \n            <li><input type="checkbox" value="${name}" checked/>${name}</li>\n            {{/each}}\n        </ul>\n    </div>', {
                            columns: columns
                        });
                        if (that.columnSelectionShown) {
                            that.$showHideSelection.filter('div').show();
                        }
                        that.$showHideSelection.on('click', function () {
                            that.$showHideSelection.filter('div').toggle();
                            that.columnSelectionShown = that.$showHideSelection.filter('div').is(':visible');
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

                    if (that.module.getConfiguration('toolbar') && that.module.getConfiguration('toolbar').length === 0 && that.$actionButtons && that.$actionButtons.length === 0 && that.$rowToolbar) {
                        that.$rowToolbar.remove();
                    }

                    that.$slickgrid = $('<div>').addClass('flex-1');
                    that.$container.append(that.$slickgrid);
                    that.slick.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
                    that.slick.plugins.push(that.slick.groupItemMetadataProvider);
                    that.slick.data = new Slick.Data.DataView({
                        groupItemMetadataProvider: that.slick.groupItemMetadataProvider
                    });

                    that.slick.data.setModule(that.module);
                    that.grid = new Slick.Grid(that.$slickgrid, that.slick.data, that.slick.columns, that.slick.options);

                    that._newSandbox();

                    for (var i = 0; i < that.slick.plugins.length; i++) {
                        that.grid.registerPlugin(that.slick.plugins[i]);
                    }


                    if (that.module.getConfiguration('slick.selectionModel') === 'row') {
                        that.grid.setSelectionModel(new Slick.RowSelectionModel());
                    } else {
                        that.grid.setSelectionModel(new Slick.CellSelectionModel());
                    }

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

                    that.grid.init();

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
                        if (that.hasFilter) {
                            var items = that._getItemsInfo(args.rows);
                            that._runFilter({
                                event: 'rowsChanged',
                                rows: items
                            });
                        }
                        that.grid.invalidateRows(args.rows);
                        that.grid.render();
                    });


                    that.grid.onAddNewRow.subscribe(function (e, args) {
                        var newRow = that.module.data[that.module.data.length - 1];
                        that.module.controller.onRowNew(that.module.data.length - 1, newRow);
                        that.module.model.dataTriggerChange(that.module.data);
                        that._runFilter({
                            row: newRow,
                            cell: null,
                            event: 'newRow'
                        });
                        that._resetDeleteRowListeners();
                    });

                    that.grid.onViewportChanged.subscribe(function () {
                        // onViewportChange is not really working properly, so we hack by having a settimeout
                        // Acceptable since it is unlikely that someone click the delete button only 300 ms after
                        // the viewport has changed...
                        setTimeout(function () {
                            var v = that.grid.getViewport();
                            if (v !== that.lastViewport) {
                                viewportChanged();
                            }
                        }, 250);

                        function viewportChanged() {
                            that.lastViewport = that.grid.getViewport();
                            if (that.module.getConfigurationCheckbox('slickCheck', 'rowNumbering') && !that._preventRowHelp) {
                                var totalLines = that.grid.getDataLength();
                                that.$rowHelp.html((Math.min(totalLines, that.lastViewport.bottom - (that.addRowAllowed ? 2 : 1))).toString() + '/' + totalLines);
                                that.$rowHelp.fadeIn();
                                clearTimeout(that.lastRowHelp);
                                that.lastRowHelp = setTimeout(function () {
                                    that.$rowHelp.fadeOut();
                                }, 1000);
                            }
                            that._preventRowHelp = false;
                            that._resetDeleteRowListeners();
                            that._jpathColor();
                            that._inViewFilter();
                        }

                        viewportChanged();
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

                        if (that.colConfig.length === cols.length) {
                            for (var i = 0; i < cols.length; i++) {
                                var colToChange = that.colConfig.filter(function (col) {
                                    return col === cols[i].colDef;
                                });
                                if (colToChange.length)
                                    colToChange[0].width = cols[i].width;
                            }
                        }
                        that.grid.invalidate();
                    });

                    that.grid.onCellChange.subscribe(function (e, args) {
                        var column = that.getSlickColumns()[args.cell];
                        var itemInfo = that._getItemInfoFromRow(args.row);
                        if (itemInfo) {
                            if (that.hasFilter) {
                                that._runFilter({
                                    event: 'cellChanged',
                                    row: itemInfo,
                                    cell: that._getCell(args),
                                    column: column
                                });
                            }
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
                        var selectedItems = that._getItemsInfo(args.rows);
                        if (that.hasFilter) {
                            that._runFilter({
                                event: 'rowsSelected',
                                rows: selectedItems
                            });
                        }
                        that.module.controller.onRowsSelected(_.pluck(selectedItems, 'item'));
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
                        that._updateHighlights();
                        that.grid.invalidateAllRows();
                        that.grid.render();
                    });

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
                    that._inViewFilter();
                });
            }

        },

        blank: {
            list: function (varname) {
                this.$container.html('');
            },
            script: function (varname) {
                if (this.module.getConfiguration('filterType') === 'invar') {
                    this._setScript('');
                }
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

        _setScript: function (script) {
            this.filterScript = script || '';
            this.hasFilter = this._hasFilter();
            this._newSandbox();
        },

        _newSandbox: function () {
            this._sandbox = new Sandbox();
            this._sandbox.setContext(this._getNewContext());
            try {
                this.filter = this._sandbox.run(
                    '(function() {' + this.filterScript + '\n})',
                    'Slickgrid' + this.module.getId()
                );
            } catch (e) {
                this._reportError(e);
            }
        },

        _runFilter: function (context) {
            if (this.hasFilter) {
                try {
                    this.filter.call(context);
                } catch (e) {
                    this._reportError(e);
                }
            }
        },

        _getNewContext: function () {
            var that = this;
            return {
                getGrid: function () {
                    return that.grid;
                },
                getData: function () {
                    return that.module.data;
                }
            };
        },

        _reportError: function (e) {
            var message = '';
            if (e && e.stack) {
                message = e.message;
                e = e.stack;
            }
            var str = 'Code executor error';
            if (this.title) {
                str += ' (' + this.title + ')';
            }
            if (message) {
                str += ': ' + message;
            }
            Debug.error(str);
            Debug.warn(e);
        },

        _inViewFilter: function () {
            var that = this;
            if (!that.hasFilter || !that.lastViewport) return;
            var rows = that._getRowsFromViewport();
            var items = that._getItemsInfo(rows);
            that._runFilter({
                rows: items,
                cell: null,
                event: 'inView'
            });
            // If used asynchronously (e.g. in debounce)
            //that.grid.invalidateAllRows();
            //that.grid.render();
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
                if (!gridRow) {
                    return;
                }
                if (gridRow < this.lastViewport.top || gridRow >= this.lastViewport.bottom) {
                    // navigate
                    this.grid.scrollRowToTop(gridRow);
                }

                //this.grid.setActiveCell(gridRow, 0);
            }
        },

        _updateHighlights: function () {
            this._highlights = _.pluck(this.module.data, '_highlight');
        },

        _drawHighlight: function () {
            var that = this;
            this.grid.removeCellCssStyles('highlight');
            var tmp = {};
            this._selectHighlight();
            this.lastViewport = this.grid.getViewport();
            for (var i = this.lastViewport.top; i <= this.lastViewport.bottom; i++) {
                //var item = this.grid.getDataItem(i);
                var itemInfo = this._getItemInfoFromRow(i);
                if (!itemInfo) continue;
                var item = itemInfo.item;
                if (_.any(that._highlighted, function (k) {
                    var hl = item._highlight;
                    if (!Array.isArray(hl)) {
                        hl = [hl];
                    }
                    return hl.indexOf(k) > -1;
                })) {
                    tmp[itemInfo.idx] = that.baseCellCssStyle;
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
                        if (!Array.isArray(key)) {
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

        _getRowsFromViewport: function () {
            if (!this.lastViewport) return [];
            var rows = new Array(this.lastViewport.bottom - this.lastViewport.top + 1);
            for (var i = 0; i < rows.length; i++) {
                rows[i] = this.lastViewport.top + i;
            }
            return rows;
        },

        _getItemsInfo: function (rows) {
            var selected = [];
            if (!this.slick.data) return selected;
            for (var i = 0; i < rows.length; i++) {
                var itemInfo = this._getItemInfoFromRow(rows[i]);
                if (itemInfo)
                    selected.push(itemInfo);
            }
            return selected;
        },

        _getItems: function (rows) {
            var items = this._getItemsInfo(rows);
            return _.pluck(items, 'item');
        },

        _getCell: function (args) {
            if (!args || args.row === undefined || args.cell === undefined) {
                return null;
            }
            var itemInfo = this._getItemInfoFromRow(args.row);
            var jpath = this.getSlickColumns()[args.cell].jpath.slice();
            jpath.unshift(itemInfo.idx);
            var r = this.module.data.getChildSync(jpath);
            if (r !== undefined) r = r.get();
            return r;
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

        _hasFilter: function () {
            return _.any(this.filterScript.split('\n'), function (line) {
                var l = line.replace(' ', '');
                // return false if void line
                return l ? !l.match(/^\s*\/\/a/) : false;
            });
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

})
;
