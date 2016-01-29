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
    var searchFilter;


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

    function doGrid(ctx) {
        ctx.$container.html('');

        var columns = ctx.getAllSlickColumns().filter(filterSpecialColumns);

        var cids = _.pluck(columns, 'id');
        for (var key in columnFilters) {
            if (cids.indexOf(key) === -1) {
                delete columnFilters[key];
            }
        }

        if (!ctx.hiddenColumns) {
            ctx.hiddenColumns = columns.map(function (col) {
                if (col.colDef && col.colDef.hideColumn && col.colDef.hideColumn[0] === 'yes') {
                    return col.name;
                }
            }).filter(function (v) {
                return v;
            });
        }

        ctx.slick.columns = ctx.getInMainColumns();

        ctx.$rowToolbar = $('<div>').attr('class', 'rowToolbar');
        if (ctx.module.getConfigurationCheckbox('toolbar', 'add')) {
            ctx.$addButton = $('<input type="button" value="New"/>');
            ctx.$addButton.on('click', function () {
                var cols = ctx.grid.getColumns();
                var colidx = _.findIndex(cols, function (v) {
                    return v.editor;
                });
                if (colidx > -1) {
                    ctx.preventRowHelp();
                    ctx.grid.gotoCell(ctx.slick.data.getLength(), colidx, true);
                }
                ctx._openDetails();
            });
            ctx.$rowToolbar.append(ctx.$addButton);
        }

        if (ctx.module.getConfigurationCheckbox('toolbar', 'update')) {
            ctx.$updateButton = $('<input type="button" value="Update"/>');
            ctx.$updateButton.on('click', function () {
                ctx._openDetails();
            });
            ctx.$rowToolbar.append(ctx.$updateButton);
        }

        if (ctx.module.getConfigurationCheckbox('toolbar', 'remove')) {
            ctx.$deleteButton = $('<input type="button" value="Delete"/>');
            ctx.$deleteButton.on('click', function () {
                ctx.deleteRowSelection();
            });
            ctx.$rowToolbar.append(ctx.$deleteButton);
        }

        if (ctx.module.getConfigurationCheckbox('toolbar', 'showHide')) {

            ctx.$showHideSelection = $.tmpl('<input type="button" value="Show/Hide Column"/>\n    <div class="mutliSelect" style="display:none">\n        <ul>\n            {{each columns}}\n            \n            <li><input type="checkbox" value="${name}" checked/>${name}</li>\n            {{/each}}\n        </ul>\n    </div>', {
                columns: columns
            });
            if (ctx.columnSelectionShown) {
                ctx.$showHideSelection.filter('div').show();
            }
            ctx.$showHideSelection.on('click', function () {
                ctx.$showHideSelection.filter('div').toggle();
                ctx.columnSelectionShown = ctx.$showHideSelection.filter('div').is(':visible');
                ctx.onResize();
            });

            for (var i = 0; i < ctx.hiddenColumns.length; i++) {
                ctx.$showHideSelection.find('input[value="' + ctx.hiddenColumns[i] + '"]').removeAttr('checked');
            }

            ctx.$showHideSelection.find('input[type="checkbox"]').on('change', function () {
                if (this.checked) {
                    ctx.hideColumn(this.value);
                } else {
                    ctx.showColumn(this.value);
                }
                ctx.$container.html('');
                return doGrid(ctx);

            });
            ctx.$rowToolbar.append(ctx.$showHideSelection);

        }

        ctx.$actionButtons = new Array(ctx.actionOutButtons.length);
        for (var i = 0; i < ctx.actionOutButtons.length; i++) {
            (function (i) {
                ctx.$actionButtons[i] = $('<input type="button" value="' + ctx.actionOutButtons[i].buttonTitle + '"/>');
                ctx.$actionButtons[i].on('click', function () {
                    ctx.module.controller.sendActionButton(ctx.actionOutButtons[i].actionName, ctx._getSelectedItems());
                });
            })(i);
        }
        ctx.$rowToolbar.append(ctx.$actionButtons);
        ctx.$container.append(ctx.$rowToolbar);

        if (ctx.module.getConfiguration('toolbar') && ctx.module.getConfiguration('toolbar').length === 0 && ctx.$actionButtons && ctx.$actionButtons.length === 0 && ctx.$rowToolbar) {
            ctx.$rowToolbar.remove();
        }

        ctx.$slickgrid = $('<div>').addClass('flex-1');
        ctx.$container.append(ctx.$slickgrid);
        ctx.slick.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
        ctx.slick.plugins.push(ctx.slick.groupItemMetadataProvider);
        ctx.slick.data = new Slick.Data.DataView({
            groupItemMetadataProvider: ctx.slick.groupItemMetadataProvider
        });

        ctx.slick.data.setModule(ctx.module);
        ctx.grid = new Slick.Grid(ctx.$slickgrid, ctx.slick.data, ctx.slick.columns, ctx.slick.options);
        ctx.slick.grid = ctx.grid;

        ctx._newSandbox();

        for (var i = 0; i < ctx.slick.plugins.length; i++) {
            ctx.grid.registerPlugin(ctx.slick.plugins[i]);
        }


        if (ctx.module.getConfiguration('slick.selectionModel') === 'row') {
            ctx.grid.setSelectionModel(new Slick.RowSelectionModel());
        } else {
            ctx.grid.setSelectionModel(new Slick.CellSelectionModel());
        }

        $(ctx.grid.getHeaderRow()).delegate(':input', 'change keyup', _.debounce(function (e) {
            var columnId = $(this).data('columnId');
            if (columnId != null) {
                columnFilters[columnId] = $.trim($(this).val());
                columnFilterFunctions[columnId] = getColumnFilterFunction(columnFilters[columnId]);
                ctx.slick.data.refresh();
            }
        }, 250));

        ctx.grid.onHeaderRowCellRendered.subscribe(function (e, args) {
            $(args.node).empty();
            $("<input type='text'>")
                .css('width', '100%')
                .data('columnId', args.column.id)
                .val(columnFilters[args.column.id])
                .appendTo(args.node);
        });

        ctx.grid.init();

        ctx._activateHighlights();


        ctx.grid.module = ctx.module;

        // Make sure selected elements are correct even when filtering
        ctx.slick.data.syncGridSelection(ctx.grid, true);


        // listen to group expansion...
        if (ctx.module.getConfigurationCheckbox('slickCheck', 'oneUncollapsed')) {
            ctx.slick.groupItemMetadataProvider.onGroupExpanded.subscribe(function (e, args) {
                this.getData().collapseAllGroups(args.item.level);
                this.getData().expandGroup(args.item.groupingKey);
            });
        }

        // wire up model events to drive the grid
        ctx.slick.data.onRowCountChanged.subscribe(function (e, args) {
            ctx.grid.updateRowCount();
            ctx.grid.render();
        });

        ctx.slick.data.onRowsChanged.subscribe(function (e, args) {
            if (ctx.hasFilter) {
                var items = ctx._getItemsInfo(args.rows);
                ctx._runFilter({
                    event: 'rowsChanged',
                    rows: items
                });
            }
            ctx.grid.invalidateRows(args.rows);
            ctx.grid.render();
        });


        ctx.grid.onAddNewRow.subscribe(function (e, args) {
            var data = ctx.module.data.get();
            var newRow = data[data.length - 1];
            ctx._newRow(newRow, args);
        });

        ctx.grid.onRenderCompleted.subscribe(function () {
            ctx._jpathColor();
        });

        ctx.grid.onViewportChanged.subscribe(function () {
            // onViewportChange is not really working properly, so we hack by having a settimeout
            // Acceptable since it is unlikely ctx someone click the delete button only 300 ms after
            // the viewport has changed...
            setTimeout(function () {
                var v = ctx.grid.getViewport();
                if (v !== ctx.lastViewport) {
                    viewportChanged();
                }
            }, 250);

            function viewportChanged() {
                ctx.lastViewport = ctx.grid.getViewport();
                if (ctx.module.getConfigurationCheckbox('slickCheck', 'rowNumbering') && !ctx._preventRowHelp) {
                    var totalLines = ctx.grid.getDataLength();
                    ctx.$rowHelp.html((Math.min(totalLines, ctx.lastViewport.bottom - (ctx.addRowAllowed ? 2 : 1))).toString() + '/' + totalLines);
                    ctx.$rowHelp.fadeIn();
                    clearTimeout(ctx.lastRowHelp);
                    ctx.lastRowHelp = setTimeout(function () {
                        ctx.$rowHelp.fadeOut();
                    }, 1000);
                }
                ctx._preventRowHelp = false;
                ctx._resetDeleteRowListeners();
                ctx._jpathColor();
                ctx._inViewFilter();
            }

            viewportChanged();
        });


        ctx.grid.onMouseEnter.subscribe(function (e) {
            // When scrolling fast, no mouseLeave event takes place
            // Therefore we also have to un-highlight here
            if (ctx._hl) {
                API.highlightId(ctx._hl, 0);
            }

            ctx.count = ctx.count === undefined ? 0 : ctx.count;
            ctx.count++;
            ctx.hovering = true;
            var itemInfo = ctx._getItemInfoFromEvent(e);
            if (!itemInfo) return;


            var hl = itemInfo.item._highlight;
            ctx._hl = hl;
            if (hl) {
                API.highlightId(hl, 1);
                lastHighlight = hl;
            }
            ctx.module.controller.onHover(itemInfo.idx, itemInfo.item);

        });

        ctx.grid.onMouseLeave.subscribe(function (e) {
            ctx._e = e;
            ctx.count--;
            ctx.hovering = false;
            var itemInfo = ctx._getItemInfoFromEvent(e);
            if (!itemInfo) return;
            var hl = itemInfo.item._highlight;
            if (hl) {
                API.highlightId(hl, 0);
            } else if (lastHighlight) {
                API.highlightId(lastHighlight, 0);
            }

        });

        ctx.grid.onColumnsResized.subscribe(function () {
            var cols = ctx.grid.getColumns().filter(function (val) {
                return val.id !== 'rowDeletion' && val.id !== '_checkbox_selector';
            });

            if (ctx.colConfig.length === cols.length) {
                for (var i = 0; i < cols.length; i++) {
                    var colToChange = ctx.colConfig.filter(function (col) {
                        return col === cols[i].colDef;
                    });
                    if (colToChange.length)
                        colToChange[0].width = cols[i].width;
                }
            }
            ctx.grid.invalidate();
        });

        ctx.grid.onCellChange.subscribe(function (e, args) {
            if (ctx.fromPopup) { // We don't really know what has been edited...
                var columns = ctx.getColumnsGivenEditContext();
            } else {
                var column = ctx._getChangedColumn(args.cell);
            }
            var itemInfo = ctx._getItemInfoFromRow(args.row);
            if (itemInfo) {
                if (ctx.hasFilter) {
                    if (columns) {
                        for (var i = 0; i < columns.length; i++) {
                            ctx._runFilter({
                                event: 'cellChanged',
                                row: itemInfo,
                                cell: ctx._getCell({
                                    row: args.row,
                                    cell: i
                                }),
                                column: columns[i]
                            });
                        }
                    } else {
                        ctx._runFilter({
                            event: 'cellChanged',
                            row: itemInfo,
                            cell: ctx._getCell(args),
                            column: column
                        });
                    }

                    ctx._runFilter({
                        event: 'rowsChanged',
                        rows: [itemInfo]
                    });
                }
                ctx.module.controller.onRowChange(itemInfo.idx, itemInfo.item);
            }
            ctx._resetDeleteRowListeners();
        });

        ctx.grid.onClick.subscribe(function (e, args) {
            var columns = ctx.grid.getColumns();
            var itemInfo = ctx._getItemInfoFromRow(args.row);
            if (itemInfo) {
                if (columns[args.cell] && columns[args.cell].id !== 'rowDeletion') {
                    ctx.module.controller.onClick(itemInfo.idx, itemInfo.item);
                }
            }
        });

        ctx.grid.onActiveCellChanged.subscribe(function (e, args) {
            ctx.lastActiveCell = args.cell;
            ctx.lastActiveRow = args.row;

            var columns = ctx.grid.getColumns();
            var itemInfo = ctx._getItemInfoFromRow(args.row);
            if (itemInfo) {
                if (columns[args.cell] && columns[args.cell].id !== 'rowDeletion') {
                    ctx.module.controller.onActive(itemInfo.idx, itemInfo.item);
                }
            }

        });

        ctx.grid.onColumnsReordered.subscribe(function () {
            var cols = ctx.grid.getColumns();
            var conf = ctx.module.definition.configuration.groups.cols[0];
            var names = _.pluck(conf, 'name');
            var ids = _.pluck(cols, 'id');

            if (names.concat().sort().join() !== ids.concat().sort().join()) {
                Debug.warn('Something might be wrong, number of columns in grid and in configuration do not match');
                return;
            }
            ctx.module.definition.configuration.groups.cols[0] = [];
            for (var i = 0; i < cols.length; i++) {
                var idx = names.indexOf(ids[i]);
                if (idx > -1) {
                    ctx.module.definition.configuration.groups.cols[0].push(conf[idx]);
                }
            }
        });

        ctx.grid.onSelectedRowsChanged.subscribe(function (e, args) {
            ctx.lastSelectedRows = args.rows;
            var selectedItems = ctx._getItemsInfo(args.rows);
            if (ctx.hasFilter) {
                ctx._runFilter({
                    event: 'rowsSelected',
                    rows: selectedItems
                });
            }
            ctx.module.controller.onRowsSelected(_.pluck(selectedItems, 'item'));
        });

        ctx.grid.onSort.subscribe(function (e, args) {
            // args.multiColumnSort indicates whether or not this is a multi-column sort.
            // If it is, args.sortCols will have an array of {sortCol:..., sortAsc:...} objects.
            // If not, the sort column and direction will be in args.sortCol & args.sortAsc.

            ctx._makeDataObjects();
            // We'll use a simple comparer function here.
            var items = ctx.slick.data.getItems(), i = 0;
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
                    ctx.slick.data.sort(comparer1, sortCols[i].sortAsc);
                })(i);
            }

            for (i = 0; i < items.length; i++) {
                delete items[i].__elementPosition;
            }
            ctx._updateHighlights();
            ctx.grid.invalidateAllRows();
            ctx.grid.render();
            ctx.module.model.dataTriggerChange(this.module.data);
        });

        ctx.slick.data.beginUpdate();

        var groupings = _.chain(ctx.module.getConfiguration('groupings'))
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
                    ctx._makeDataObjects();
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
            ctx.slick.data.setGrouping(groupings);
            if (ctx.module.getConfigurationCheckbox('slickCheck', 'collapseGroup')) {
                ctx.slick.data.collapseAllGroups(0);
            }
        }


        if (ctx.module.getConfigurationCheckbox('slickCheck', 'filterColumns')) {
            ctx.slick.data.setFilter(searchFilter);
        }

        ctx.slick.data.setItems(ctx.module.data.get(), ctx.idPropertyName);
        ctx.slick.data.endUpdate();

        // get back state before last update
        if (ctx.lastViewport && !ctx.module.getConfigurationCheckbox('slickCheck', 'backToTop')) {
            ctx.grid.scrollRowToTop(ctx.lastViewport.top);
        }

        if (Array.isArray(ctx.lastSelectedRows)) {
            ctx.grid.setSelectedRows(ctx.lastSelectedRows);
        }
        if (!_.isUndefined(ctx.lastActiveRow) && !ctx.module.getConfigurationCheckbox('slickCheck', 'forgetLastActive')) {
            ctx.grid.gotoCell(ctx.lastActiveRow, ctx.lastActiveCell, false, true);
        }


        ctx.grid.render();
        ctx._resetDeleteRowListeners();
        ctx._setBaseCellCssStyle();
        ctx.lastViewport = ctx.grid.getViewport();
        ctx._jpathColor();
        ctx._inViewFilter();
    }

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

            this.hiddenColumns = undefined;
            this.slick = {};
            this.colConfig = (this.module.getConfiguration('cols') || []).filter(function (row) {
                return row.name;
            });
            this.actionColConfig = (this.module.getConfiguration('actionCols') || []).filter(function (row) {
                return row.name;
            });
            this.idPropertyName = '_sgid';
            if (this.module.getConfiguration('filterType') === 'pref') {
                this._setScript(this.module.getConfiguration('filterRow'));
            }

            this.actionRenderer = function (cellNode, row, dataContext, colDef) {
                if (cellNode) {
                    cellNode.innerHTML = 'abc';
                    var context = {
                        event: 'renderAction',
                        renderOptions: {
                            icon: colDef.colDef.icon,
                            disabled: false,
                            action: colDef.colDef.action
                        }
                    };

                    that._runFilter(context);

                    cellNode.innerHTML = `<div style="width:100%; height: 100%"><a class="icon-container"><i class="fa ${context.renderOptions.icon} centered-icon"></i></a></div>`;
                    $(cellNode).find('a')[0].onclick = function () {
                        API.doAction(context.renderOptions.action, dataContext);
                    };
                }
            };

            this.resolveReady();
        },

        preventRowHelp: function () {
            this._preventRowHelp = true;
        },

        deleteRowSelection: function () {
            var rows = this.grid.getSelectedRows();
            var data = this.module.data.get();
            var idx = new Array(rows.length);
            for (var i = 0; i < rows.length; i++) {
                var itemInfo = this._getItemInfoFromRow(rows[i]);
                idx[i] = itemInfo.idx;
            }
            idx = idx.sort();
            var j = 0;
            var removedRows = [];
            for (i = 0; i < rows.length; i++) {
                var removed = data.splice(idx[i] - j++, 1);
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
                        if (!that.module.data.get().length) {
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

                    var rendererOptions = Util.evalOptions(row.rendererOptions);
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
                        colDef: row,
                        rendererOptions: rendererOptions
                    };
                });

            slickCols = _.filter(slickCols, function (val) {
                return val.name;
            });

            // No columns are defined, we use the input object to define them
            if (_.isEmpty(slickCols)) {
                var colNames = [];
                var data = that.module.data.get();
                for (var i = 0; i < data.length; i++) {
                    colNames = _(colNames).push(_.keys(data[i])).flatten().uniq().value();
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

            // Action columns
            var actionColumns = this.getActionColumns();
            for(var i=0; i<actionColumns.length ;i++) {
                if(actionColumns[i].colDef.position === 'begin') {
                    slickCols.unshift(actionColumns[i]);
                } else {
                    slickCols.push(actionColumns[i]);
                }
            }

            // Auto columns
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

        getInMainColumns: function () {
            return this.getSlickColumns().filter(function (col) {
                if (!col.colDef) { // Special columns always in main
                    return true;
                }
                // Action columns always in main
                return !col.colDef.visibility || col.colDef.visibility === 'main' || col.colDef.visibility === 'both';
            });
        },

        getInPopupColumns: function () {
            return this.getAllSlickColumns().filter(function (col) {
                if (!col.colDef) { // Special columns never in popup
                    return false;
                }
                return col.colDef.visibility === 'popup' || col.colDef.visibility === 'both';
            }).filter(function (col) {
                return col.editor;
            }).filter(filterSpecialColumns);
        },

        getActionColumns: function () {
            var that = this;
            return this.actionColConfig.map(col => {
                return {
                    id: col.name,
                    name: col.name,
                    width: +col.width || 25,
                    minWidth: +col.minWidth || 25,
                    maxWidth: +col.maxWidth || 25,
                    selectable: false,
                    resizable: true,
                    focusable: false,
                    sortable: false,
                    formatter: waitingFormatter,
                    asyncPostRender: that.actionRenderer,
                    colDef: col
                }
            });
        },

        getColumnsGivenEditContext: function () {
            if (this.fromPopup) {
                return this.getInPopupColumns();
            } else {
                return this.getInMainColumns();
            }
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
            var editableColumns = this.getInPopupColumns();

            if (editableColumns.length === 0) {
                return;
            }

            var $modal = $("<div class='item-details-form'></div>");
            $modal = $.tmpl('<div class=\'item-details-form\'>\n    {{each columns}}\n    <div class=\'item-details-label\'>\n        ${name}\n    </div>\n    <div class=\'item-details-editor-container\' data-editorid=\'${id.replace(/[^a-zA-Z0-9_-]/g, "_")}\'></div>\n    {{/each}}\n\n    <hr/>\n    <div class=\'item-details-form-buttons\'>\n        <button data-action=\'save\'>Save</button>\n        <button data-action=\'cancel\'>Cancel</button>\n    </div>\n</div>', {
                context: this.grid.getDataItem(this.grid.getActiveCell().row),
                columns: editableColumns
            }).appendTo('body');
            $modal.keydown(function (e) {
                if (e.which == $.ui.keyCode.ENTER) {
                    that.fromPopup = true;
                    that.grid.getEditController().commitCurrentEdit();
                    that.fromPopup = false;
                    e.stopPropagation();
                    e.preventDefault();
                } else if (e.which == $.ui.keyCode.ESCAPE) {
                    that.fromPopup = true;
                    that.grid.getEditController().cancelCurrentEdit();
                    that.fromPopup = false;
                    e.stopPropagation();
                    e.preventDefault();
                }
            });
            $modal.find('[data-action=save]').click(function () {
                that.fromPopup = true;
                that.grid.getEditController().commitCurrentEdit();
                that.fromPopup = false;
            });
            $modal.find('[data-action=cancel]').click(function () {
                that.fromPopup = true;
                that.grid.getEditController().cancelCurrentEdit();
                that.fromPopup = false;
            });
            var containers = $.map(editableColumns, function (c) {
                return $modal.find('[data-editorid=' + c.id.replace(/[^a-zA-Z0-9_-]/g, '_') + ']');
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

                this.module.controller.lastClickedItem = undefined;
                this.module.data = moduleValue;
                this._updateHighlights();

                this.dataObjectsDone = false;
                this.slick.plugins = [];
                this.slick.options = this.getSlickOptions();
                this.generateUniqIds();
                this.addRowAllowed = this.module.getConfigurationCheckbox('slickCheck', 'enableAddRow');

                searchFilter = function (item) {
                    for (var columnId in columnFilters) {
                        if (columnId !== undefined && columnFilters[columnId] !== '') {
                            try {
                                var idx = that.slick.data.getIdxById(item[that.idPropertyName]);
                                var c = that.grid.getColumns()[that.grid.getColumnIndex(columnId)];
                                var jpath = _.clone(DataObject.resurrect(c.jpath));
                                jpath.unshift(idx);
                                if (!that.module.data.getChildSync(jpath) || !columnFilterFunctions[columnId](that.module.data.getChildSync(jpath).get())) {
                                    return false;
                                }
                            } catch (e) {
                                return true;
                            }
                        }
                    }
                    return true;
                };

                cssLoaded.then(function () {
                    doGrid(that);
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

        _newRow: function (newRow, args) {
            this.module.controller.onRowNew(this.slick.data.getLength() - 1, newRow);
            this.module.model.dataTriggerChange(this.module.data);
            this._runFilter({
                row: {
                    item: newRow
                },
                column: args ? args.column : null,
                cell: null,
                event: 'newRow'
            });
            this._resetDeleteRowListeners();
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
                    var removed = that.module.data.get().splice(itemInfo.idx, 1);
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

        // Always available:
        //    getData();          returns the modules input array
        //    getSlick();         returns the slick instance, an object with:
        //                           grid: the grid (handles rendering logic)
        //                           data: the DataView
        //    this.event          The type of event that triggered the filter

        // Context that depends on event:
        //    this.rows           Content of the rows associated to event
        //    this.row            Content of the row associated to event
        //    this.cell           Content of the cell associated to event
        //    this.column         Description of the column associated to event

        // Row description
        //    row.id              The id of the row
        //    row.idx             The idx of the row in the original array
        //    row.item            The contents of the row

        // Possible events:
        //    rowsChanged         Rows has changed
        //    cellChanged         A cell has changed
        //    inView              Rows are now in view
        //    rowsSelected        A new selection of rows has been made
        //    newRow              A new row has been commited to the input array
        //    scriptChanged       The filter script changed
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
                getSlick: function () {
                    return that.slick;
                },
                getData: function () {
                    return that.module.data.get();
                },
                rerender: function (rows) {
                    if (!rows) {
                        that.grid.invalidateAllRows();
                    } else {
                        that.grid.invalidateRows(rows);
                    }
                    that.grid.render();
                },
                API: API
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
                var gridRow = that.slick.data.getRowById(item[that.idPropertyName]);
                if (gridRow === undefined) {
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
            this._highlights = _.pluck(this.module.data.get(), '_highlight');
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
                if (_.any(
                        that._highlighted,
                        function (k) {
                            var hl = item._highlight;
                            if (!Array.isArray(hl)) {
                                hl = [hl];
                            }
                            return hl.indexOf(k) > -1;
                        })
                ) {
                    tmp[i] = that.baseCellCssStyle;
                }
            }
            this.grid.setCellCssStyles('highlight', tmp);
        },

        _activateHighlights: function () {
            var that = this;
            var hl = _(this.module.data.get()).pluck('_highlight').flatten().filter(function (val) {
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
            var data = this.module.data.get();
            for (var i = 0; i < data.length; i++) {
                data[i] = DataObject.check(data[i]);
            }
            this.dataObjectsDone = true;
        },

        _getRowsFromViewport: function () {
            if (!this.lastViewport) return [];
            var rowCount = this.lastViewport.bottom - this.lastViewport.top + 1;
            if (Number.isNaN(rowCount)) return [];
            var rows = new Array(rowCount);
            for (var i = 0; i < rows.length; i++) {
                rows[i] = this.lastViewport.top + i;
            }
            return rows.filter(function (row) {
                return row >= 0;
            });
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

        _getChangedColumn: function (cell) {
            return this.getColumnsGivenEditContext()[cell];
        },

        _getCell: function (args) {
            if (!args || args.row === undefined || args.cell === undefined) {
                return null;
            }
            var itemInfo = this._getItemInfoFromRow(args.row);

            var jpath = this.getColumnsGivenEditContext()[args.cell].jpath.slice();
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
            var data = this.module.data.get();
            for (var i = 0; i < data.length; i++) {
                this.setNextUniqId(data[i]);
            }
        },

        setNextUniqId: function (item, force) {
            if (!item[this.idPropertyName] || force) {
                Object.defineProperty(item, this.idPropertyName, {
                    value: 'id_' + ++uniqueID,
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
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
            var data = this.module.data.get();
            var txt = '';
            var line = [], i, j;
            for (i = 0; i < cols.length; i++) {
                if (cols[i].jpath) // ignore special columns
                    line.push(cols[i].name || '');
            }
            txt += line.join('\t') + '\r\n';
            for (i = 0; i < data.length; i++) {
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

        showColumn: function (column) {
            if (!this.hiddenColumns) return;
            if (this.hiddenColumns.indexOf(column) === -1) {
                this.hiddenColumns.push(column);
                doGrid(this);
            }
        },

        hideColumn: function (column) {
            if (!this.hiddenColumns) return;
            var idx = this.hiddenColumns.indexOf(column);
            if (idx > -1) {
                this.hiddenColumns.splice(idx, 1);
                doGrid(this);
            }
        },

        onActionReceive: {
            addRow: function (item) {
                if (this.slick.data) {
                    item = DataObject.resurrect(item);
                    this.setNextUniqId(item, true);
                    this.slick.data.addItem(item);
                    this._newRow(item);
                }
            },
            rerender: function () {
                console.log('action receive rerender...');
                if (this.grid) {
                    console.log('rerender...');
                    this.grid.invalidateAllRows();
                    this.grid.render();
                }
            },
            hoverRow: function (row) {
                // row can be the row itself or the array's index
                var item;
                var data = this.module.data.get();
                if (_.isNumber(row) || row instanceof DataNumber) {
                    item = data[row];
                } else {
                    item = row;
                }

                if (item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.getRowById(item[this.idPropertyName]);
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onHover(dataIdx, item);
                    this.grid.scrollRowToTop(gridRow);
                }
            },

            selectRow: function (row) {
                var item;
                var data = this.module.data.get();
                if (_.isNumber(row) || row instanceof DataNumber) {
                    item = data[row];
                } else {
                    item = row;
                }

                if (item && item[this.idPropertyName]) {
                    var gridRow = this.slick.data.getRowById(item[this.idPropertyName]);
                    var dataIdx = this.slick.data.getIdxById(item[this.idPropertyName]);
                    this.module.controller.onClick(dataIdx, item);
                    if (!_.isUndefined(gridRow)) {
                        this.grid.scrollRowToTop(gridRow);
                        this.grid.setActiveCell(gridRow, 0);
                    }

                }
            },

            selectRows: function (rows) {
                var srows;
                if (rows === 'all') {
                    srows = new Array(this.slick.data.getLength());
                    for (var i = 0; i < srows.length; i++) {
                        srows[i] = i;
                    }
                } else if (Array.isArray(rows)) {
                    srows = rows;
                } else {
                    srows = [];
                }
                this.grid.setSelectedRows(srows);
            },

            showColumn: function (column) {
                this.showColumn(column);
            },

            hideColumn: function (column) {
                this.hideColumn(column);
            }
        }
    });

    function waitingFormatter() {
        return '...';
    }

    function binFormatter() {
        return '<div style="width:100%; height: 100%;"><a class="recycle-bin"><i class="centered-icon fa fa-trash"></i></a></div>';
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
            Renderer.render(cellNode, dataContext, colDef.jpath, colDef.rendererOptions);
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

    function filterSpecialColumns(col) {
        return col.id !== 'rowDeletion' && col.id !== '_checkbox_selector';
    }

    return View;

});
