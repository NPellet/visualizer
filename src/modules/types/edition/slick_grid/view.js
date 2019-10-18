'use strict';

define(
  [
    'jquery',
    'modules/default/defaultview',
    'src/util/debug',
    'lodash',
    'slickgrid',
    'src/util/util',
    'src/util/ui',
    'src/util/color',
    'src/util/api',
    'src/util/typerenderer',
    'src/util/sandbox',
    './copyFormatters'
  ],
  function (
    $,
    Default,
    Debug,
    _,
    Slick,
    Util,
    UI,
    Color,
    API,
    Renderer,
    Sandbox,
    copyFormatters
  ) {
    function View() {}
    var symbolSgid = Symbol('_sgid');

    var cssPromises = [];
    cssPromises.push(Util.loadCss('components/slickgrid/slick.grid.css'));
    var cssLoaded = Promise.all(cssPromises);

    var uniqueID = 0;

    var formatters = {
      typerenderer: waitingFormatter,
      'slick.text': Slick.Formatters.Text,
      'slick.percent': Slick.Formatters.PercentComplete,
      'slick.percentbar': Slick.Formatters.PercentCompleteBar,
      'slick.yesno': Slick.Formatters.YesNoSelect
    };

    const typeEditors = Slick.typeEditors;

    function isSpecialColumn(col) {
      return !col.colDef;
    }

    function doGrid(ctx) {
      ctx.$container.html('');

      ctx.ignoreMyHighlights = ctx.module.getConfigurationCheckbox(
        'slickCheck',
        'ignoreMyHighlights'
      );

      var columns = ctx.getAllSlickColumns().filter(filterSpecialColumns);

      var cids = _.map(columns, 'id');
      for (var key in ctx.columnFilters) {
        if (cids.indexOf(key) === -1) {
          delete ctx.columnFilters[key];
        }
      }

      if (!ctx.hiddenColumns) {
        ctx.hiddenColumns = columns
          .map(function (col) {
            if (
              col.colDef &&
                            col.colDef.hideColumn &&
                            col.colDef.hideColumn[0] === 'yes'
            ) {
              return col.name;
            }
          })
          .filter(function (v) {
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
            ctx.grid.gotoCell(
              ctx.slick.data.getLength(),
              colidx,
              true
            );
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
        // eslint-disable-next-line no-template-curly-in-string
        ctx.$showHideSelection = $.tmpl(
          // eslint-disable-next-line
                    '<input type="button" value="Show/Hide Column"/>\n    <div class="mutliSelect" style="display:none">\n        <ul>\n            {{each columns}}\n            \n            <li><input type="checkbox" value="${name}" checked/>${name}</li>\n            {{/each}}\n        </ul>\n    </div>',
          {
            columns: columns
          }
        );
        if (ctx.columnSelectionShown) {
          ctx.$showHideSelection.filter('div').show();
        }
        ctx.$showHideSelection.on('click', function () {
          ctx.$showHideSelection.filter('div').toggle();
          ctx.columnSelectionShown = ctx.$showHideSelection
            .filter('div')
            .is(':visible');
          ctx.onResize();
        });

        for (var i = 0; i < ctx.hiddenColumns.length; i++) {
          ctx.$showHideSelection
            .find(`input[value="${ctx.hiddenColumns[i]}"]`)
            .removeAttr('checked');
        }

        ctx.$showHideSelection
          .find('input[type="checkbox"]')
          .on('change', function () {
            if (this.checked) {
              ctx.hideColumn(this.value);
            } else {
              ctx.showColumn(this.value);
            }
            return doGrid(ctx);
          });
        ctx.$rowToolbar.append(ctx.$showHideSelection);
      }

      ctx.$actionButtons = new Array(ctx.actionOutButtons.length);
      for (var i = 0; i < ctx.actionOutButtons.length; i++) {
        (function (i) {
          ctx.$actionButtons[i] = $(
            `<input type="button" value="${
              ctx.actionOutButtons[i].buttonTitle
            }"/>`
          );
          ctx.$actionButtons[i].on('click', function () {
            ctx.module.controller.sendActionButton(
              ctx.actionOutButtons[i].actionName,
              ctx._getSelectedItems()
            );
          });
        })(i);
      }
      ctx.$rowToolbar.append(ctx.$actionButtons);
      ctx.$container.append(ctx.$rowToolbar);

      if (
        ctx.module.getConfiguration('toolbar') &&
                ctx.module.getConfiguration('toolbar').length === 0 &&
                ctx.$actionButtons &&
                ctx.$actionButtons.length === 0 &&
                ctx.$rowToolbar
      ) {
        ctx.$rowToolbar.remove();
      }

      ctx.$slickgrid = $('<div>').addClass('flex-1').addClass('visualizer-slickgrid');
      ctx.$container.append(ctx.$slickgrid);
      ctx.slick.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
      ctx.slick.plugins.push(ctx.slick.groupItemMetadataProvider);
      ctx.slick.data = new Slick.Data.DataView({
        groupItemMetadataProvider: ctx.slick.groupItemMetadataProvider
      });

      ctx.slick.data.setModule(ctx.module);
      ctx.grid = new Slick.Grid(
        ctx.$slickgrid,
        ctx.slick.data,
        ctx.slick.columns,
        ctx.slick.options
      );
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

      if (ctx.module.getConfigurationCheckbox('copyPaste', 'active')) {
        ctx.grid.registerPlugin(
          new Slick.CellExternalCopyManager({
            noAutoFocus: ctx.module.getConfigurationCheckbox(
              'copyPasteOptions',
              'noAutoFocus'
            ),
            readOnlyMode: ctx.module.getConfigurationCheckbox(
              'copyPasteOptions',
              'readOnly'
            ),
            newRowCreator: function (nb) {
              if (
                !ctx.module.getConfigurationCheckbox(
                  'copyPasteOptions',
                  'newRows'
                )
              )
                return;
              const rows = [];
              for (let i = 0; i < nb; i++) {
                rows.push({});
              }
              ctx.onActionReceive.addRow.call(ctx, rows);
            },
            dataItemColumnValueExtractor: function (item, colDef) {
              const cpFormatter = copyFormatters[colDef.colDef.copyFormatter];
              if (cpFormatter) {
                return cpFormatter.extract(item, colDef);
              } else if (colDef.CpEditor) {
                var editorArgs = {
                  container: $('<p>'), // a dummy container
                  column: colDef,
                  position: { top: 0, left: 0 }, // a dummy position required by some editors
                  grid: ctx.grid
                };
                var editor = new colDef.CpEditor(editorArgs);
                editor.loadValue(item);
                var retVal = editor.serializeValue();
                editor.destroy();
                return retVal;
              }
            }
          })
        );
      }

      if (ctx.module.getConfigurationCheckbox('autoColumns', 'reorder')) {
        var moveRowsPlugin = new Slick.RowMoveManager({
          cancelEditOnDrag: true
        });
        moveRowsPlugin.onBeforeMoveRows.subscribe(function (e, data) {
          for (var i = 0; i < data.rows.length; i++) {
            // no point in moving before or after itself
            if (
              data.rows[i] == data.insertBefore ||
                            data.rows[i] == data.insertBefore - 1
            ) {
              e.stopPropagation();
              return false;
            }
          }
          return true;
        });

        moveRowsPlugin.onMoveRows.subscribe(function (event, args) {
          var rows = args.rows;
          rows = rows.map(function (r) {
            return ctx._getItemInfoFromRow(r).idx;
          });
          var insertBefore = ctx._getItemInfoFromRow(
            args.insertBefore
          );
          if (insertBefore !== null) insertBefore = insertBefore.idx;

          ctx._makeDataObjects();
          // We'll use a simple comparer function here.
          var items = ctx.slick.data.getItems();
          // Add a position indicatior ==> for stable sort
          for (var i = 0; i < items.length; i++) {
            if (rows.indexOf(i) !== -1) items[i].__pos = 2;
            else if (i < insertBefore || insertBefore === null)
              items[i].__pos = 1;
            else items[i].__pos = 3;
          }

          ctx.slick.data.sort(compMove);

          for (var i = 0; i < items.length; i++) {
            delete items[i].__pos;
          }

          ctx.grid.invalidateAllRows();
          ctx.grid.render();
          ctx.module.model.dataTriggerChange(ctx.module.data);
        });
        ctx.grid.registerPlugin(moveRowsPlugin);
        ctx.grid.onDragInit.subscribe(function (e, dd) {
          // prevent the ctx.grid.from cancelling drag'n'drop by default
          e.stopImmediatePropagation();
        });
        ctx.grid.onDragStart.subscribe(function (e, dd) {
          var data = this.module.data.get();
          var cell = ctx.grid.getCellFromEvent(e);
          if (!cell) {
            return;
          }
          dd.row = cell.row;
          if (!data[dd.row]) {
            return;
          }
          if (Slick.GlobalEditorLock.isActive()) {
            return;
          }
          e.stopImmediatePropagation();
          dd.mode = 'recycle';
          var selectedRows = ctx.grid.getSelectedRows();
          if (
            !selectedRows.length ||
                        $.inArray(dd.row, selectedRows) == -1
          ) {
            selectedRows = [dd.row];
            ctx.grid.setSelectedRows(selectedRows);
          }
          dd.rows = selectedRows;
          dd.count = selectedRows.length;
          var proxy = $('<span></span>')
            .css({
              position: 'absolute',
              display: 'inline-block',
              padding: '4px 10px',
              background: '#e0e0e0',
              border: '1px solid gray',
              'z-index': 99999,
              '-moz-border-radius': '8px',
              '-moz-box-shadow': '2px 2px 6px silver'
            })
            .appendTo('body');
          dd.helper = proxy;
          $(dd.available).css('background', 'pink');
          return proxy;
        });
        ctx.grid.onDrag.subscribe(function (e, dd) {
          if (dd.mode != 'recycle') {
            return;
          }
          dd.helper.css({ top: e.pageY + 5, left: e.pageX + 5 });
        });
        ctx.grid.onDragEnd.subscribe(function (event, dd) {
          if (dd.mode != 'recycle') {
            return;
          }
          dd.helper.remove();
          $(dd.available).css('background', 'beige');
        });
      }

      $(ctx.grid.getHeaderRow()).delegate(
        ':input',
        'change keyup',
        _.debounce(function (event) {
          var columnId = $(this).data('columnId');
          if (columnId != null) {
            ctx.columnFilters[columnId] = $.trim($(this).val());
            ctx.columnFilterFunctions[
              columnId
            ] = getColumnFilterFunction(
              ctx.columnFilters[columnId]
            );
            ctx.slick.data.refresh();
          }
        }, 250)
      );

      ctx.grid.onHeaderRowCellRendered.subscribe(function (event, args) {
        $(args.node).empty();
        $("<input type='text'>")
          .css('width', '100%')
          .data('columnId', args.column.id)
          .val(ctx.columnFilters[args.column.id])
          .appendTo(args.node);
      });

      ctx.grid.init();

      ctx._activateHighlights();

      ctx.grid.module = ctx.module;

      // Make sure selected elements are correct even when filtering
      ctx.slick.data.syncGridSelection(ctx.grid, true);

      // listen to group expansion...
      if (
        ctx.module.getConfigurationCheckbox(
          'slickCheck',
          'oneUncollapsed'
        )
      ) {
        ctx.slick.groupItemMetadataProvider.onGroupExpanded.subscribe(
          function (event, args) {
            this.getData().collapseAllGroups(args.item.level);
            this.getData().expandGroup(args.item.groupingKey);
          }
        );
      }

      // wire up model events to drive the grid
      ctx.slick.data.onRowCountChanged.subscribe(function (event, args) {
        ctx.grid.updateRowCount();
        ctx.grid.render();
      });

      ctx.slick.data.onRowsChanged.subscribe(function (event, args) {
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

      ctx.grid.onAddNewRow.subscribe(function (event, args) {
        const item = args.item;
        ctx.setNextUniqId(item, true);
        ctx.slick.data.addItem(item);
        ctx._newRow(item, args);
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
          if (
            ctx.module.getConfigurationCheckbox(
              'slickCheck',
              'rowNumbering'
            ) &&
                        !ctx._preventRowHelp
          ) {
            var totalLines = ctx.grid.getDataLength();
            ctx.$rowHelp.html(
              `${Math.min(
                totalLines,
                ctx.lastViewport.bottom -
                                    (ctx.addRowAllowed ? 2 : 1)
              ).toString()
              }/${
                totalLines}`
            );
            ctx.$rowHelp.fadeIn();
            clearTimeout(ctx.lastRowHelp);
            ctx.lastRowHelp = setTimeout(function () {
              ctx.$rowHelp.fadeOut();
            }, 1000);
          }
          ctx._preventRowHelp = false;
          ctx._jpathColor();
          ctx._inViewFilter();
        }

        viewportChanged();
      });

      ctx.grid.onMouseEnter.subscribe(function (e) {
        // When scrolling fast, no mouseLeave event takes place
        // Therefore we also have to un-highlight here
        if (ctx._hl) {
          ctx.module.model.highlightId(ctx._hl, 0);
        }

        ctx.count = ctx.count === undefined ? 0 : ctx.count;
        ctx.count++;
        ctx.hovering = true;
        var itemInfo = ctx._getItemInfoFromEvent(e);
        if (!itemInfo) return;

        var hl = itemInfo.item._highlight;
        ctx._hl = hl;
        if (hl) {
          ctx.module.model.highlightId(hl, 1);
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
          ctx.module.model.highlightId(hl, 0);
        } else if (lastHighlight) {
          ctx.module.model.highlightId(lastHighlight, 0);
        }
      });

      ctx.grid.onColumnsResized.subscribe(function () {
        var cols = ctx.grid.getColumns();

        for (let i = 0; i < cols.length; i++) {
          var colToChange = ctx.colConfig.find(function (col) {
            return col === cols[i].colDef;
          });
          if (colToChange) {
            colToChange.width = cols[i].width;
          }
        }
        ctx.grid.invalidate();
      });

      ctx.grid.onCellChange.subscribe(function (event, args) {
        if (ctx.fromPopup) {
          // We don't really know what has been edited...
          var columns = ctx.getColumnsGivenEditContext();
        } else {
          var column = ctx._getChangedColumn(args.cell);
        }

        // When copy-pasting, it is possible this callback gets called
        // on cells that are not editable or that should never be edited
        // (like action columns)
        if (isSpecialColumn(column)) return;

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
                  previous: args.previous,
                  column: columns[i]
                });
              }
            } else {
              ctx._runFilter({
                event: 'cellChanged',
                row: itemInfo,
                cell: ctx._getCell(args),
                column: column,
                previous: args.previous
              });
            }

            ctx._runFilter({
              event: 'rowsChanged',
              rows: [itemInfo]
            });
          }
          ctx.module.controller.onRowChange(
            itemInfo.idx,
            itemInfo.item
          );
        }
      });

      ctx.grid.onClick.subscribe(function (event, args) {
        var columns = ctx.grid.getColumns();
        var itemInfo = ctx._getItemInfoFromRow(args.row);
        if (itemInfo) {
          if (
            columns[args.cell] &&
                        columns[args.cell].id !== 'rowDeletion'
          ) {
            if (
              !columns[args.cell].colDef ||
                            !columns[args.cell].colDef.isAction
            ) {
              ctx.module.controller.onClick(
                itemInfo.idx,
                itemInfo.item
              );
            }
          }
        }
      });

      ctx.grid.onDblClick.subscribe(function (event, args) {
        var itemInfo = ctx._getItemInfoFromRow(args.row);
        ctx.module.controller.onDoubleClick(
          itemInfo.idx,
          itemInfo.item
        );
      });

      ctx.grid.onActiveCellChanged.subscribe(function (event, args) {
        ctx.lastActiveCell = args.cell;
        ctx.lastActiveRow = args.row;

        var itemInfo = ctx._getItemInfoFromRow(args.row);
        if (itemInfo) {
          var columns = ctx.grid.getColumns();
          if (
            columns[args.cell] &&
                        columns[args.cell].id !== 'rowDeletion'
          ) {
            ctx.module.controller.onActive(
              itemInfo.idx,
              itemInfo.item
            );
          }
        }
      });

      ctx.grid.onColumnsReordered.subscribe(function () {
        var cols = ctx.grid.getColumns();
        var conf = ctx.module.definition.configuration.groups.cols[0];
        var names = _.map(conf, 'name');
        var ids = _.map(cols, 'id');

        if (
          names
            .concat()
            .sort()
            .join() !==
                    ids
                      .concat()
                      .sort()
                      .join()
        ) {
          Debug.warn(
            'Something might be wrong, number of columns in grid and in configuration do not match'
          );
          return;
        }
        ctx.module.definition.configuration.groups.cols[0] = [];
        for (var i = 0; i < cols.length; i++) {
          var idx = names.indexOf(ids[i]);
          if (idx > -1) {
            ctx.module.definition.configuration.groups.cols[0].push(
              conf[idx]
            );
          }
        }
      });

      ctx.grid.onSelectedRowsChanged.subscribe(function (event, args) {
        ctx.lastSelectedRows = args.rows.slice();
        var selectedItems = ctx._getItemsInfo(ctx.lastSelectedRows);
        if (ctx.hasFilter) {
          ctx._runFilter({
            event: 'rowsSelected',
            rows: selectedItems
          });
        }
        if (selectedItems.length) {
          const last = selectedItems[ctx.lastSelectedRows.length - 1];
          ctx.module.controller.onLastSelectedRow(
            last.idx,
            last.item
          );
        } else {
          ctx.module.controller.unselectLastRow();
        }

        ctx.module.controller.onRowsSelected(
          _.map(selectedItems, 'item')
        );
      });

      ctx.grid.onSort.subscribe(function (event, args) {
        // args.multiColumnSort indicates whether or not this is a multi-column sort.
        // If it is, args.sortCols will have an array of {sortCol:..., sortAsc:...} objects.
        // If not, the sort column and direction will be in args.sortCol & args.sortAsc.

        ctx._makeDataObjects();
        // We'll use a simple comparer function here.
        var sortCols;
        if (!args.sortCols) {
          sortCols = [
            {
              sortCol: args.sortCol,
              sortAsc: args.sortAsc
            }
          ];
        } else {
          sortCols = args.sortCols;
        }
        for (let i = sortCols.length - 1; i >= 0; i--) {
          var comparer1 = function (val1, val2) {
            if (val1 === undefined) {
              if (sortCols[i].sortAsc) return 1;
              else return -1;
            }
            if (val2 === undefined) {
              if (sortCols[i].sortAsc) return -1;
              else return 1;
            }
            if (val1 < val2) {
              return -1;
            } else if (val2 < val1) {
              return 1;
            }
            return 0;
          };
          let sortCol = sortCols[i];
          let jpath = sortCol.sortCol.jpath;
          ctx.slick.data.sort(comparer1, sortCol.sortAsc, function (
            item
          ) {
            var val = item.getChildSync(jpath);
            if (val !== undefined) val = val.get();
            return val;
          });
        }

        ctx._updateHighlights();
        ctx.grid.invalidateAllRows();
        ctx.grid.render();
        ctx.module.model.dataTriggerChange(this.module.data);
      });

      ctx.slick.data.beginUpdate();

      var groupings = _.chain(ctx.module.getConfiguration('groupings'))
        .filter((val) => val && val.groupName && val.getter)
        .map((val) => {
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
            return (
              `${val.groupName
              }: ${
                g.value
              }  <span style='color:green'>(${
                g.count
              } items)</span>`
            );
          };
          r.aggregateCollapsed = false;
          r.lazyTotalsCalculation = true;
          return r;
        })
        .value();

      if (groupings.length) {
        ctx.slick.data.setGrouping(groupings);
        if (
          ctx.module.getConfigurationCheckbox(
            'slickCheck',
            'collapseGroup'
          )
        ) {
          ctx.slick.data.collapseAllGroups(0);
        }
      }

      if (
        ctx.module.getConfigurationCheckbox(
          'slickCheck',
          'filterColumns'
        ) &&
                ctx.searchFilter
      ) {
        ctx.slick.data.setFilter(ctx.searchFilter);
      }

      ctx.slick.data.setItems(ctx.module.data.get(), ctx.idPropertyName);
      ctx.slick.data.endUpdate();

      // get back state before last update
      if (
        ctx.lastViewport &&
                !ctx.module.getConfigurationCheckbox('slickCheck', 'backToTop')
      ) {
        ctx.grid.scrollRowToTop(ctx.lastViewport.top);
      }

      if (
        !ctx.module.getConfigurationCheckbox(
          'slickCheck',
          'forgetLastSelected'
        ) &&
                Array.isArray(ctx.lastSelectedRows)
      ) {
        ctx.grid.setSelectedRows(ctx.lastSelectedRows);
      }
      if (
        !_.isUndefined(ctx.lastActiveRow) &&
                !ctx.module.getConfigurationCheckbox(
                  'slickCheck',
                  'forgetLastActive'
                )
      ) {
        ctx.grid.gotoCell(
          ctx.lastActiveRow,
          ctx.lastActiveCell,
          false,
          true
        );
      }

      ctx.grid.render();
      ctx._setBaseCellCssStyle();
      ctx.lastViewport = ctx.grid.getViewport();
      ctx._jpathColor();
      ctx._inViewFilter();
    }

    $.extend(true, View.prototype, Default, {
      init: async function () {
        var that = this,
          varname;
        this.columnFilters = {};
        this.columnFilterFunctions = {};
        this.searchFilter = undefined;
        this._setScript('');
        this.title = String(this.module.definition.title);
        if (!this.$container) {
          this._id = Util.getNextUniqueId();
          this.$rowHelp = $('<div>').attr('class', 'rowHelp');
          this.$container = $('<div>')
            .attr('id', this._id)
            .addClass('main-container');

          this.module.getDomContent().html(this.$rowHelp);
          this.module.getDomContent().append(this.$container);
          this._setDeleteRowListener();
        } else {
          this.$container.html('');
        }

        if (this.module.getConfigurationCheckbox('saveInView', 'yes')) {
          varname = this.module.getConfiguration('varname');
        } else {
          varname = undefined;
        }

        this.actionOutButtons = this.module.getConfiguration(
          'actionOutButtons'
        );
        this.actionOutButtons = this.actionOutButtons || [];
        this.actionOutButtons = _.filter(
          this.actionOutButtons,
          (v) => v.actionName && v.buttonTitle
        );

        this.$container.on('mouseleave', function () {
          that.module.controller.lastHoveredItemId = null;
        });

        this.hiddenColumns = undefined;
        this.slick = {};
        this.colConfig = this.module
          .getConfiguration('cols', [], false)
          .filter(function (row) {
            return row.name;
          });
        this.actionColConfig = (
          this.module.getConfiguration('actionCols') || []
        )
          .filter(function (row) {
            return row.name;
          })
          .map(function (row) {
            row.isAction = true;
            return row;
          });
        this.idPropertyName =
                    this.module.getConfiguration('idProperty') || symbolSgid;
        this.autoIdProperty = !this.module.getConfiguration(
          'idProperty'
        );
        if (this.module.getConfiguration('filterType') === 'pref') {
          this._setScript(this.module.getConfiguration('filterRow'));
        }

        this.postRenderer = function (
          cellNode,
          row, dataContext,
          colDef
        ) {
          if (cellNode) {
            let context = {
              event: 'postRender',
              column: colDef,
              row: {
                item: dataContext
              },
              renderOptions: {}
            };
            that._runFilter(context);
            that.postUpdateCell(cellNode, context.renderOptions);
          }
        };

        this.actionRenderer = function (
          cellNode,
          row,
          dataContext,
          colDef
        ) {
          function sendAction() {
            API.doAction(
              context.renderOptions.action,
              dataContext
            );
          }
          if (cellNode) {
            var context = {
              event: 'renderAction',
              column: colDef,
              row: {
                item: dataContext
              },
              renderOptions: {
                icon: colDef.colDef.icon,
                disabled: false,
                action: colDef.colDef.action,
                tooltip: colDef.colDef.tooltip,
                backgroundColor: Color.array2rgba(
                  colDef.colDef.backgroundColor
                ),
                color: colDef.colDef.color,
                clickMode: colDef.colDef.clickMode
              }
            };

            that._runFilter(context);

            if (context.renderOptions.disabled) {
              cellNode.innerHTML = '';
            } else {
              if (context.renderOptions.icon && context.renderOptions.icon.startsWith('fa-')) {
                cellNode.innerHTML = `<div style="width:100%; height: 100%"><a style="display: block; text-align:center;"><i class="fa ${
                  context.renderOptions.icon
                } centered-icon"></i></a></div>`;
              } else {
                cellNode.innerHTML = `<div style="width:100%; height: 100%"><a>${
                  context.renderOptions.icon
                }</a></div>`;
              }
            }

            var $cellNode = $(cellNode);

            that.postUpdateCell(cellNode, context.renderOptions);
            $cellNode.css('cursor', 'default');

            var $a = $cellNode.find('a');
            $a.attr('title', context.renderOptions.tooltip);
           
            if (context.renderOptions.action) {
              if (context.renderOptions.clickMode === 'text') {
                $a.addClass('icon-clickable');
                if ($a.length) {
                  $a[0].onclick = sendAction;
                }
              } else if (
                context.renderOptions.clickMode === 'background'
              ) {
                $cellNode.css('cursor', 'pointer');
                $cellNode.off('click.action');
                $cellNode.on('click.action', sendAction);
              }
            }
            $a.css('color', Color.array2rgba(context.renderOptions.color));
          }
        };

        if (varname) {
          const data = await API.createData(
            varname,
            JSON.parse(this.module.getConfiguration('data'))
          );
          data.onChange(() => {
            this.module.definition.configuration.groups.data[0].data[0] = JSON.stringify(
              data
            );
          });
          that.resolveReady();
        } else {
          that.resolveReady();
        }
      },

      loadEditors: async function () {
        const columns = this.getAllSlickColumns();
        const loadableColumns = columns.filter((col) => col.editor && col.editor.load);
        await Promise.all(loadableColumns.map((col) => col.editor.load()));
      },

      postUpdateCell: function (cellNode, renderOptions) {
        var $cellNode = $(cellNode);
        $cellNode.css(renderOptions);
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
        if (removedRows.length) {
          this._deleteFilter(removedRows);
          this.module.controller.onRowsDelete(removedRows);
          this.module.data.triggerChange();
        }
      },

      getAllSlickColumns: function () {
        var that = this;
        var tp = typeRenderer.bind(this);

        function getEditor(jpath) {
          var editor;
          if (!that.module.data || !that.module.data.length) {
            return undefined;
          }
          var obj = that.module.data.get(0).getChildSync(jpath);
          if (obj instanceof DataString) {
            editor = Slick.CustomEditors.TextValue;
          } else if (obj instanceof DataNumber) {
            editor = Slick.CustomEditors.NumberValue;
          } else if (obj instanceof DataBoolean) {
            editor = Slick.CustomEditors.BooleanValue;
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
          if (DataObject.isDataObject(obj)) {
            type = obj.type;
          }
          return type;
        }

        var slickCols = this.colConfig
          .filter(function (row) {
            return row.name;
          })
          .map(function (row) {
            var editor, CpEditor, type;
            if (row.editor === 'auto' && that.module.data) {
              if (!that.module.data.get().length) {
                editor = Slick.CustomEditors.DataString;
                Debug.warn(
                  'Slick grid: using editor based on type when the input variable is empty. Cannot determine type'
                );
              } else {
                editor = row.forceType
                  ? typeEditors[row.forceType]
                  : getEditor(row.jpath);
                editor = editor || getEditor(row.jpath);
                type = getType(row.jpath);
              }
              CpEditor = editor;
            } else {
              editor = typeEditors[row.editor];
              CpEditor = editor || getEditor(row.jpath);
              type = getType(row.jpath);
            }

            var rendererOptions = Util.evalOptions(
              row.rendererOptions
            );
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
              CpEditor,
              compositeEditor:
                                editor === Slick.CustomEditors.LongText
                                  ? Slick.CustomEditors.SimpleLongText
                                  : undefined,
              formatter: formatters[row.formatter],
              asyncPostRender:
                                row.formatter === 'typerenderer'
                                  ? tp
                                  : that.postRenderer.bind(this),
              jpath: row.jpath,
              simpleJpath: row.jpath.length === 1,
              dataType: type,
              renderType: row.forceType,
              colDef: row,
              editorOptions: row.editorOptions,
              rendererOptions: rendererOptions
            };
          });

        slickCols = _.filter(slickCols, (val) => val.name);

        // No columns are defined, we use the input object to define them
        if (_.isEmpty(slickCols)) {
          var colNames = [];
          var data = that.module.data.get();
          for (var i = 0; i < data.length; i++) {
            colNames = _(colNames)
              .push(_.keys(data[i]))
              .flatten()
              .uniq()
              .value();
          }

          slickCols = _(colNames)
            .filter((v) => v[0] !== '_')
            .map((rowName) => ({
              id: rowName,
              name: rowName,
              field: rowName,
              resisable: true,
              selectable: true,
              focusable: true,
              sortable: false,
              editor: getEditor([rowName]),
              CpEditor: getEditor([rowName]),
              dataType: getType([rowName]),
              jpath: [rowName],
              formatter: formatters.typerenderer,
              asyncPostRender: tp,
              colDef: {
                id: rowName,
                jpath: [rowName]
              }
            }))
            .value();
        }

        // Action columns
        var actionColumns = this.getActionColumns();
        for (var i = 0; i < actionColumns.length; i++) {
          if (actionColumns[i].colDef.position === 'begin') {
            slickCols.unshift(actionColumns[i]);
          } else {
            slickCols.push(actionColumns[i]);
          }
        }

        // Auto columns
        if (
          this.module.getConfigurationCheckbox(
            'autoColumns',
            'remove'
          )
        ) {
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

        if (
          this.module.getConfigurationCheckbox(
            'autoColumns',
            'select'
          )
        ) {
          var checkboxSelector = new Slick.CheckboxSelectColumn({
            cssClass: 'slick-cell-checkboxsel'
          });

          this.slick.plugins.push(checkboxSelector);

          slickCols.unshift(checkboxSelector.getColumnDefinition());
        }

        if (
          this.module.getConfigurationCheckbox(
            'autoColumns',
            'reorder'
          )
        ) {
          slickCols.unshift({
            id: '__selectAndMove',
            name: '',
            width: 40,
            behavior: 'selectAndMove',
            selectable: false,
            resizable: false,
            cssClass: 'cell-reorder dnd',
            formatter: function () {
              return '';
            }
          });
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
          if (isSpecialColumn(col)) {
            // Special columns always in main
            return true;
          }
          // Action columns always in main
          return (
            !col.colDef.visibility ||
                        col.colDef.visibility === 'main' ||
                        col.colDef.visibility === 'both'
          );
        });
      },

      getInPopupColumns: function () {
        return this.getAllSlickColumns()
          .filter(function (col) {
            if (isSpecialColumn(col)) {
              // Special columns never in popup
              return false;
            }
            return (
              col.colDef.visibility === 'popup' ||
                            col.colDef.visibility === 'both'
            );
          })
          .filter(function (col) {
            return col.editor;
          })
          .filter(filterSpecialColumns);
      },

      getActionColumns: function () {
        var that = this;
        return this.actionColConfig.map((col) => {
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
          };
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
          editable: that.module.getConfigurationCheckbox(
            'slickCheck',
            'editable'
          ),
          enableAddRow: that.module.getConfigurationCheckbox(
            'slickCheck',
            'enableAddRow'
          ),
          enableCellNavigation: that.module.getConfigurationCheckbox(
            'slickCheck',
            'editable'
          ),
          autoEdit: that.module.getConfigurationCheckbox(
            'slickCheck',
            'autoEdit'
          ),
          enableTextSelectionOnCells: true,
          enableColumnReorder: true,
          forceFitColumns: that.module.getConfigurationCheckbox(
            'slickCheck',
            'forceFitColumns'
          ),
          multiColumnSort: true,
          asyncEditorLoading: true,
          asyncEditorLoadDelay: 30,
          enableAsyncPostRender: true,
          asyncPostRenderDelay: 0,
          defaultColumnWidth:
                        that.module.getConfiguration(
                          'slick.defaultColumnWidth'
                        ) || 80,
          dataItemColumnValueExtractor: function (item, coldef) {
            // In order to use jpath, we return the row instead of the column
            // TODO: use jpath in coldef here?
            return item;
          },
          explicitInitialization: true,
          rowHeight: that.module.getConfiguration('slick.rowHeight'),
          showHeaderRow: that.module.getConfigurationCheckbox(
            'slickCheck',
            'filterColumns'
          ),
          headerRowHeight: +that.module.getConfiguration(
            'slick.headerRowHeight'
          )
        };
      },

      _openDetails: function () {
        var that = this;
        if (
          this.grid.getEditorLock().isActive() &&
                    !this.grid.getEditorLock().commitCurrentEdit()
        ) {
          return;
        }
        var editableColumns = this.getInPopupColumns();

        if (editableColumns.length === 0) {
          return;
        }

        var $modal = $("<div class='item-details-form'></div>");
        $modal = $.tmpl(
          // eslint-disable-next-line no-template-curly-in-string
          "<div class='item-details-form'>\n    {{each columns}}\n    <div class='item-details-label'>\n        ${name}\n    </div>\n    <div class='item-details-editor-container' data-editorid='${id.replace(/[^a-zA-Z0-9_-]/g, \"_\")}'></div>\n    {{/each}}\n\n    <hr/>\n    <div class='item-details-form-buttons'>\n        <button data-action='save'>Save</button>\n        <button data-action='cancel'>Cancel</button>\n    </div>\n</div>",
          {
            context: this.grid.getDataItem(
              this.grid.getActiveCell().row
            ),
            columns: editableColumns
          }
        ).appendTo('body');
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
          return $modal.find(
            `[data-editorid=${
              c.id.replace(/[^a-zA-Z0-9_-]/g, '_')
            }]`
          );
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
        if (!this.grid.editActiveCell(compositeEditor)) $modal.remove();
      },

      inDom: function () {},

      update: {
        script: function (moduleValue) {
          if (
            this.module.getConfiguration('filterType') === 'invar'
          ) {
            this._setScript(moduleValue.get());
            this._runFilter({
              event: 'scriptChanged'
            });
          }
          // Can be needed in some cases (script changing may affect rendering)
          this.rerender();
        },

        data: function (moduleValue, varName) {
          this.update.list.call(this, moduleValue, varName);
        },

        list: function (moduleValue, varName) {
          var that = this;

          this.module.controller.lastClickedItem = undefined;
          this.module.data = moduleValue;
          this._updateHighlights();

          this.dataObjectsDone = false;
          this.slick.plugins = [];
          this.slick.options = this.getSlickOptions();
          this.generateUniqIds();
          this.addRowAllowed = this.module.getConfigurationCheckbox(
            'slickCheck',
            'enableAddRow'
          );
          var keepSelected = this.module.getConfigurationCheckbox(
            'slickCheck',
            'keepSelected'
          );
          this.searchFilter = function (item) {
            // keep s
            if (keepSelected) {
              var selected = that._getSelectedItems();
              if (
                selected.find(
                  (s) =>
                    item[that.idPropertyName] ===
                                        s[that.idPropertyName]
                )
              ) {
                return true;
              }
            }
            for (var columnId in that.columnFilters) {
              if (
                columnId !== undefined &&
                                that.columnFilters[columnId] !== ''
              ) {
                try {
                  var idx = that.slick.data.getIdxById(
                    item[that.idPropertyName]
                  );
                  var c = that.grid.getColumns()[
                    that.grid.getColumnIndex(columnId)
                  ];
                  var jpath = _.clone(
                    DataObject.resurrect(c.jpath)
                  );
                  jpath.unshift(idx);
                  var val = that.module.data.getChildSync(
                    jpath
                  );
                  if (val && val.get) val = val.get();
                  if (
                    !that.columnFilterFunctions[columnId](
                      val
                    )
                  ) {
                    return false;
                  }
                } catch (e) {
                  return true;
                }
              }
            }
            return true;
          };

          for (let column of this.colConfig) {
            if (copyFormatters[column.copyFormatter]) {
              copyFormatters[column.copyFormatter].load();
            }
          }
          Promise.all([cssLoaded, this.loadEditors()]).then(function () {
            doGrid(that);
          });
        }
      },

      blank: {
        list: function (varname) {
          this.$container.html('');
        },
        script: function (varname) {
          if (
            this.module.getConfiguration('filterType') === 'invar'
          ) {
            this._setScript('');
          }
        }
      },

      _newRow: function (newRow, args) {
        this.module.controller.onRowNew(
          this.slick.data.getLength() - 1,
          newRow
        );
        this.module.model.dataTriggerChange(this.module.data);
        this._runFilter({
          row: {
            item: newRow
          },
          column: args ? args.column : null,
          cell: null,
          event: 'newRow'
        });
      },

      _setBaseCellCssStyle: function () {
        var cols = this.grid.getColumns();
        this.baseCellCssStyle = {};
        for (var i = 0; i < cols.length; i++) {
          this.baseCellCssStyle[cols[i].id] = 'highlighted-cell';
        }
      },

      _setDeleteRowListener: function () {
        var that = this;
        this.$container.on('click', 'a.recycle-bin', function (e) {
          var columns = that.grid.getColumns();
          var args = that.grid.getCellFromEvent(e);
          that.lastViewport = that.grid.getViewport();
          if (
            columns[args.cell] &&
                        columns[args.cell].id === 'rowDeletion'
          ) {
            // delete the row...
            var itemInfo = that._getItemInfoFromRow(args.row);
            var removed = that.module.data
              .get()
              .splice(itemInfo.idx, 1);
            if (removed.length) {
              that._deleteFilter(removed);
              that.module.controller.onRowsDelete(removed);
              that.module.data.triggerChange();
            }
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
        if (colorjPath && colorjPath.length > 0) {
          that._makeDataObjects();
          for (
            var i = that.lastViewport.top;
            i <= that.lastViewport.bottom;
            i++
          ) {
            var item = that.grid.getDataItem(i);
            if (item && item.__group !== true) {
              var color = item.getChildSync(colorjPath);
              var node = that.grid.getCellNode(i, 0);
              if (color) {
                $(node)
                  .parent()
                  .css('background-color', color.get())
                  .addClass('has-color');
              } else {
                $(node)
                  .parent()
                  .css('background-color', '')
                  .removeClass('has-color');
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
      //    this.previous       Content of the cell associated to the event before it was edited
      //    this.column         Description of the column associated to event
      //    this.renderOptions  Can be used to dynamically set rendering options

      // this.renderOptions     on renderAction event
      //    icon                icon to render, e.g. fa-trash
      //    disabled            disable rendering
      //    action              The action to send when cell is clicked
      //    backgroundColor     Background color of the cell
      //    color               Foreground color of the cell
      //    clickMode           'text': only content is clickable. 'background': whole cell is clickable

      // this.renderOptions     on postRender event. Setting those properties will set the corresponding css properties on the top level dom element
      //   backgroundColor      set the background color of the cell
      //   color                set the foreground color of the cell

      // Row description
      //    row.id              The id of the row
      //    row.idx             The idx of the row in the original array
      //    row.item            The contents of the row

      // Possible events:
      //    rowsChanged         Rows has changed
      //    rowsDeleted         Rows have been deleted
      //    cellChanged         A cell has changed
      //    inView              Rows are now in view
      //    rowsSelected        A new selection of rows has been made
      //    newRow              A new row has been commited to the input array
      //    scriptChanged       The filter script changed
      //    renderAction        Called before each rendering of an action cell. Allows to dynamically set rendering
      //    postRender          Called on each row after rendering
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
            `(function() {${this.filterScript}\n})`,
            `Slickgrid${this.module.getId()}`
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
            return that.module.data && that.module.data.get();
          },
          rerender: function (rows) {
            that.rerender(rows);
          },
          API: API
        };
      },

      rerender: function (rows) {
        if (!this.grid) return;
        if (!rows) {
          this.grid.invalidateAllRows();
        } else {
          this.grid.invalidateRows(rows);
        }
        this.grid.render();
      },

      _reportError: function (e) {
        var message = '';
        if (e && e.stack) {
          message = e.message;
          e = e.stack;
        }
        var str = 'Code executor error';
        if (this.title) {
          str += ` (${this.title})`;
        }
        if (message) {
          str += `: ${message}`;
        }
        Debug.error(str);
        Debug.warn(e);
      },

      _inViewFilter: function () {
        var that = this;
        if (!that.hasFilter || !that.lastViewport) return;
        var rows = that._getRowsFromViewport();
        var items = that._getItemsInfo(rows);
        const context =
                that._runFilter({
                  rows: items,
                  cell: null,
                  event: 'inView',
                  // renderOptions: {}
                });

                
        // If used asynchronously (e.g. in debounce)
        // that.grid.invalidateAllRows();
        // that.grid.render();
      },

      _deleteFilter: function (deletedRows) {
        if (!this.hasFilter) return;
        this._runFilter({
          event: 'rowsDeleted',
          rows: deletedRows
        });
      },

      _selectHighlight: function () {
        if (this.hovering) {
          return;
        }
        var that = this;

        if (
          this.module.getConfigurationCheckbox(
            'slickCheck',
            'highlightScroll'
          )
        ) {
          var idx = _.findIndex(this._highlights, function (val) {
            return (
              val !== undefined &&
                            (val === that._highlighted[0] ||
                                (val.indexOf &&
                                    val.indexOf(that._highlighted[0]) > -1))
            );
          });
          if (idx > -1) {
            this.lastViewport = this.grid.getViewport();
            var item = that.slick.data.getItemByIdx(idx);
            var gridRow = that.slick.data.getRowById(
              item[that.idPropertyName]
            );
            if (gridRow === undefined) {
              return;
            }
            if (
              gridRow < this.lastViewport.top ||
                            gridRow >= this.lastViewport.bottom
            ) {
              // navigate
              this.grid.scrollRowToTop(gridRow);
            }
            // this.grid.setActiveCell(gridRow, 0);
          }
        }
      },

      _updateHighlights: function () {
        this._highlights = _.map(this.module.data.get(), '_highlight');
      },

      _drawHighlight: function () {
        var that = this;
        this.grid.removeCellCssStyles('highlight');
        var tmp = {};
        this._selectHighlight();
        this.lastViewport = this.grid.getViewport();
        for (
          let i = this.lastViewport.top;
          i <= this.lastViewport.bottom;
          i++
        ) {
          // var item = this.grid.getDataItem(i);
          var itemInfo = this._getItemInfoFromRow(i);
          if (!itemInfo) continue;
          var item = itemInfo.item;
          if (
          // eslint-disable-next-line no-loop-func
            _.some(that._highlighted, function (k) {
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
        var hl = _(this.module.data.get())
          .map('_highlight')
          .flatten()
          .filter((val) => !_.isUndefined(val))
          .value();

        that._highlighted = [];

        API.killHighlight(this.module.getId());

        for (var i = 0; i < hl.length; i++) {
          (function (i) {
            API.listenHighlight(
              { _highlight: hl[i] },
              function (onOff, key, killerId, senderId) {
                if (
                  that.ignoreMyHighlights &&
                                    senderId === that.module.getId()
                ) {
                  return;
                }
                if (!Array.isArray(key)) {
                  key = [key];
                }
                if (onOff) {
                  that._highlighted = _(that._highlighted)
                    .push(key)
                    .flatten()
                    .uniq()
                    .value();
                } else {
                  that._highlighted = _.filter(
                    that._highlighted,
                    function (val) {
                      return key.indexOf(val) === -1;
                    }
                  );
                }
                that._drawHighlight();
              },
              false,
              that.module.getId()
            );
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
        var rowCount =
                    this.lastViewport.bottom - this.lastViewport.top + 1;
        if (Number.isNaN(rowCount) || rowCount < 0) return [];
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
          if (itemInfo) selected.push(itemInfo);
        }
        return selected;
      },

      _getItems: function (rows) {
        var items = this._getItemsInfo(rows);
        return _.map(items, 'item');
      },

      _getChangedColumn: function (cell) {
        return this.getColumnsGivenEditContext()[cell];
      },

      _getCell: function (args) {
        if (
          !args ||
                    args.row === undefined ||
                    args.cell === undefined
        ) {
          return null;
        }
        var itemInfo = this._getItemInfoFromRow(args.row);

        var jpath = this.getColumnsGivenEditContext()[
          args.cell
        ].jpath.slice();
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
        if (item[this.idPropertyName]) return;
        if (
          this.autoIdProperty &&
                    (item[this.idPropertyName] === undefined || force)
        ) {
          item[this.idPropertyName] = ++uniqueID;
        } else if (!this.autoIdProperty && !item[this.idPropertyName]) {
          throw new Error(
            `An element of slick grid input does not define it's id property "${
              this.idPropertyName
            }"`
          );
        }
      },

      _hasFilter: function () {
        return _.some(this.filterScript.split('\n'), function (line) {
          var l = line.replace(' ', '');
          // return false if void line
          return l ? !l.match(/^\s*\/\/a/) : false;
        });
      },

      _findItem: function (row) {
        var item;
        if (!this.module.data) return null;
        var data = this.module.data.get();
        if (typeof row === 'function') {
          return data.find(row);
        }
        if (_.isNumber(row) || row instanceof DataNumber) {
          item = data[row];
        } else if (
          typeof row === 'string' ||
                    row instanceof DataString
        ) {
          item = {
            [this.idPropertyName]: String(row)
          };
        } else {
          item = row;
        }
        return item;
      },

      exportToTabDelimited: function () {
        this._makeDataObjects();
        var cols = this.grid.getColumns();
        var choices = [
          {
            key: 'all',
            description: 'Export entire list'
          }
        ];
        if (
          this.module.getConfigurationCheckbox(
            'slickCheck',
            'filterColumns'
          )
        ) {
          choices.push({
            key: 'filtered',
            description: 'Export filtered list'
          });
        }
        if (
          this.module.getConfigurationCheckbox(
            'slickCheck',
            'editable'
          )
        ) {
          choices.push({
            key: 'selected',
            description: 'Export selected elements'
          });
        }

        var data;
        return UI.choose(choices, {
          autoSelect: true,
          noConfirmation: true
        }).then((selection) => {
          if (!selection) return;
          selection = String(selection);
          if (selection === 'filtered') {
            data = this.slick.data.getItems(true);
          } else if (selection === 'selected') {
            data = _.map(
              this._getItemsInfo(this.lastSelectedRows || []),
              'item'
            );
          } else {
            data = this.slick.data.getItems();
          }
          var txt = '';
          var line = [],
            i,
            j;
          for (i = 0; i < cols.length; i++) {
            if (cols[i].jpath)
            // ignore special columns
              line.push(cols[i].name || '');
          }
          txt += `${line.join('\t')}\r\n`;
          for (i = 0; i < data.length; i++) {
            line = [];
            for (j = 0; j < cols.length; j++) {
              var jpath = cols[j].jpath;
              if (!jpath) continue; // again
              var el = data[i].getChildSync(jpath, false);
              el = el ? el.get() : '';
              if (typeof el === 'string')
                el = el
                  .replace(/\r/g, '\\r')
                  .replace(/\n/g, '\\n')
                  .replace(/\t/g, '\\t');
              line.push(el);
            }
            txt += `${line.join('\t')}\r\n`;
          }
          return txt;
        });
      },

      hideColumn: function (column) {
        if (!this.hiddenColumns) return;
        if (this.hiddenColumns.indexOf(column) === -1) {
          this.hiddenColumns.push(column);
          doGrid(this);
        }
      },

      showColumn: function (column) {
        if (!this.hiddenColumns) return;
        var idx = this.hiddenColumns.indexOf(column);
        if (idx > -1) {
          this.hiddenColumns.splice(idx, 1);
          doGrid(this);
        }
      },

      toggleColumn: function (column) {
        var idx = this.hiddenColumns.indexOf(column);
        if (idx === -1) {
          this.hideColumn(column);
        } else {
          this.showColumn(column);
        }
      },

      getRowIndexes: function (rows) {
        var data = this.module.data.get();
        var srows, items;
        if (typeof rows === 'function') {
          items = data.filter(rows);
        } else if (rows === 'all') {
          srows = new Array(this.slick.data.getLength());
          for (var i = 0; i < srows.length; i++) {
            srows[i] = i;
          }
        } else if (
          Array.isArray(rows) &&
                    (!rows.length ||
                        (rows.length &&
                            (typeof rows[0] === 'number' ||
                                rows[0] instanceof DataNumber)))
        ) {
          srows = rows;
        } else if (Array.isArray(rows)) {
          items = rows.map(this._findItem.bind(this));
        } else if (
          typeof rows === 'number' ||
                    rows instanceof DataNumber
        ) {
          srows = [rows];
        } else if (rows) {
          items = [this._findItem(rows)];
        } else {
          srows = [];
        }
        if (items) {
          srows = items.filter((item) => item).map((i) => {
            return this.slick.data.getRowById(
              i[this.idPropertyName]
            );
          });
        }
        return srows;
      },

      onActionReceive: {
        appendRow: function (items) {
          this.onActionReceive.addRow.call(this, items);
        },
        prependRow: function (items, ...args) {
          if (this.slick.data) {
            if (!Array.isArray(items)) {
              items = [items];
            }
            for (let i = 0; i < items.length; i++) {
              let item = items[i];
              item = DataObject.resurrect(item);
              this.setNextUniqId(item, true);
              this.slick.data.insertItem(0, item);
              this._newRow(item);
            }
          }
        },
        addRow: function (items) {
          if (this.slick.data) {
            if (!Array.isArray(items)) {
              items = [items];
            }
            for (let i = 0; i < items.length; i++) {
              let item = items[i];
              item = DataObject.resurrect(item);
              this.setNextUniqId(item, true);
              this.slick.data.addItem(item);
              this._newRow(item);
            }
          }
        },
        insertRow: function (items) {
          if (this.slick.data) {
            if (!Array.isArray(items)) {
              items = [items];
              for (let i = 0; i < items.length; i++) {
                let { row, item } = items[i];
                this.setNextUniqId(item, true);
                this.slick.data.insertItem(row, item);
                this._newRow(item);
              }
            }
          }
        },
        rerender: function () {
          if (this.grid) {
            this.grid.invalidateAllRows();
            this.grid.render();
          }
        },
        hoverRow: function (row) {
          // row can be the row itself or the array's index
          var item = this._findItem(row);

          if (item && item[this.idPropertyName]) {
            var gridRow = this.slick.data.getRowById(
              item[this.idPropertyName]
            );
            var dataIdx = this.slick.data.getIdxById(
              item[this.idPropertyName]
            );
            item = this.slick.data.getItem(dataIdx);
            this.module.controller.onHover(dataIdx, item);
            this.grid.scrollRowToTop(gridRow);
          }
        },

        unsetActiveRow: function () {
          this.grid.setSelectedRows(
            this.grid
              .getSelectedRows()
              .filter((idx) => idx !== this.lastActiveRow)
          );
          this.grid.resetActiveCell();
          this.module.controller.unselectRow();
        },

        // "mimick click row"
        selectRow: function (cell) {
          if (typeof cell === 'number') {
            cell = {
              row: cell
            };
          }
          var item = this._findItem(cell.row);
          if (item && item[this.idPropertyName]) {
            var gridRow = this.slick.data.getRowById(
              item[this.idPropertyName]
            );
            var dataIdx = this.slick.data.getIdxById(
              item[this.idPropertyName]
            );
            item = this.slick.data.getItem();
            var column = cell.column;
            if (typeof column !== 'number') {
              // Find column by id
              column = this.slick.columns.findIndex(
                (col) => col.id === column
              );
              if (column === -1) column = 0;
            }
            this.module.controller.onClick(dataIdx, item);
            if (!_.isUndefined(gridRow)) {
              this.grid.scrollRowToTop(gridRow);
              this.grid.setActiveCell(gridRow, column || 0);
            }
          }
        },

        selectRows: function (rows) {
          const nrows = this.getRowIndexes(rows);
          if (nrows) {
            this.grid.setSelectedRows(nrows);
          }
        },

        unselectRows: function (rows) {
          const srows = this.getRowIndexes(rows);
          const crows = this.grid.getSelectedRows();
          const nrows = _.difference(crows, srows);
          this.grid.setSelectedRows(nrows);
        },

        scrollToRow: function (row) {
          const [nrow] = this.getRowIndexes(row);
          this.grid.scrollRowToTop(nrow);
        },

        selectRowsAdd: function (rows) {
          const srows = this.getRowIndexes(rows) || [];
          const crows = this.grid.getSelectedRows();
          const nrows = _.uniq(_.concat(srows, crows));
          this.grid.setSelectedRows(nrows);
        },

        showColumn: function (column) {
          this.showColumn(column);
        },

        hideColumn: function (column) {
          this.hideColumn(column);
        },

        toggleColumn: function (column) {
          this.toggleColumn(column);
        }
      }
    });

    function waitingFormatter() {
      return '...';
    }

    function binFormatter() {
      return '<div style="width:100%; height: 100%;"><a class="icon-clickable recycle-bin"><i class="centered-icon fa fa-trash"></i></a></div>';
    }

    function requiredFieldValidator(value) {
      if (value == null || value == undefined || !value.length) {
        return { valid: false, msg: 'This is a required field' };
      } else {
        return { valid: true, msg: null };
      }
    }

    function typeRenderer(cellNode, row, dataContext, colDef) {
      if (dataContext.__group) return;
      this.module.data.traceSync([row]);
      if (cellNode) {
        var rendererOptions = colDef.rendererOptions || {};
        if (colDef.renderType) {
          rendererOptions.forceType = colDef.renderType;
        }
        Renderer.render(
          cellNode,
          dataContext,
          colDef.jpath,
          rendererOptions
        );
        this.postRenderer(cellNode, row, dataContext, colDef);
      }
    }

    function
    getColumnFilterFunction(query) {
      function pad(n, width, z) {
        z = z || '0';
        n = `${n}`;
        return n.length >= width
          ? n
          : new Array(width - n.length + 1).join(z) + n;
      }

      var match;

      // Force string matcher
      match = query.match(/^"(.*)"$/);
      if (match) {
        return function (val) {
          match = match.toLowerCase();
          val = String(val).toLowerCase();
          return val.match(match[1]);
        };
      }

      // Regular expression matcher
      match = query.match(/^\/(.+)\/(i?)/);
      if (match) {
        return function (val) {
          return String(val).match(
            new RegExp(match[1], match[2] || undefined)
          );
        };
      }

      // Date matcher
      match = query.match(/^([<>=]{1,2})([0-9]+)-([0-9\-:]*)$/);
      if (match) {
        match = query.match(/^([<>=]{0,2})([0-9]+)-([0-9]*)-?([0-9]*)/);
        let year = parseInt(match[2], 10);
        let month = parseInt(match[3], 10);
        let day = parseInt(match[4], 10);
        if (Number.isNaN(month)) month = 1;
        if (Number.isNaN(day)) day = 1;
        const date = new Date();
        date.setUTCFullYear(year);
        date.setUTCMonth(month - 1);
        date.setUTCDate(day);
        date.setUTCHours(0);
        date.setUTCMinutes(0);
        date.setUTCSeconds(0);
        date.setUTCMilliseconds(0);
        if (match[1] === '<') {
          return function (val) {
            const valDate = new Date(val);
            return valDate < date;
          };
        } else if (match[1] === '>') {
          return function (val) {
            const valDate = new Date(val);
            return valDate > date;
          };
        } else if (match[1] === '<=') {
          return function (val) {
            const valDate = new Date(val);
            return valDate <= date;
          };
        } else if (match[1] === '>=') {
          return function (val) {
            const valDate = new Date(val);
            return valDate >= date;
          };
        } else {
          throw new Error('Invalid date operator');
        }
      }

      //
      match = query.match(/^([<>=]{1,2})([0-9.-]+)$/);
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

      match = query.match(/^([0-9.-]+)\.\.([0-9.-]*)$/);
      if (match) {
        return function (val) {
          return val >= match[1] && val <= match[2];
        };
      }

      return function (val) {
        return String(val)
          .toLowerCase()
          .match(query.toLowerCase());
      };
    }

    var lastHighlight = '';

    function filterSpecialColumns(col) {
      return (
        col.id !== 'rowDeletion' &&
                col.id !== '_checkbox_selector' &&
                col.id !== '__selectAndMove'
      );
    }

    function compMove(a, b) {
      return a.__pos - b.__pos;
    }

    return View;
  }
);
