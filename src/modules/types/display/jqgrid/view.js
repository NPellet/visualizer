'use strict';

define([
  'require',
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'src/util/domdeferred',
  'src/util/datatraversing',
  'src/util/typerenderer',
  'jqgrid',
], function (require, Default, Util, API, DomDeferred, Traversing, Renderer) {
  Util.loadCss('components/jqgrid_edit/css/ui.jqgrid.css');

  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      var that = this;
      var lastTr;

      var actionsOut = this.module.actions_out();
      if (actionsOut) {
        for (var i = 0; i < actionsOut.length; i++) {
          if (
            actionsOut[i].event === 'onToggleOn' ||
            actionsOut[i].event === 'onToggleOff'
          ) {
            this.hasToggleAction = true;
          }
        }
      }

      this.uniqId = `${Util.getNextUniqueId()}_`;
      this.dom = $('<div class="ci-displaylist-list"></div>');
      this.domTable = $('<table />')
        .attr('id', this.uniqId)
        .css({ width: '100%' });

      this.dataSize = 0; // we remember the last arraySize
      this.currentPage = 1; // we remember the last selected page

      this.dom
        .on('mouseover', 'tr.jqgrow', function (e) {
          if (that.module.getConfigurationCheckbox('highlightLine', 'Yes')) {
            $(this).addClass('ci-highlight');
          }
          if (this !== lastTr) {
            that.module.controller.lineHover(
              that.elements,
              $(this).attr('id').replace(that.uniqId, ''),
            );
          }
          lastTr = e.currentTarget;
        })
        .on('mouseout', 'tr.jqgrow', function () {
          if (that.module.getConfigurationCheckbox('highlightLine', 'Yes')) {
            $(this).removeClass('ci-highlight');
          }
          if (this === lastTr) {
            that.module.controller.lineOut(
              that.elements,
              $(this).attr('id').replace(that.uniqId, ''),
            );
            lastTr = null;
          }
        });

      var filter = this.module.getConfiguration('filterRow');
      eval(
        `that.filter = function(jqGrid, source, rowId) { try { \n ${filter}\n } catch(_) { console.log(_); } }`,
      );

      this.module.getDomContent().html(this.dom);
    },

    exportToTabDelimited() {
      if (!this.jpaths) {
        return;
      }

      var result = [];

      var header = [];
      for (let j = 0; j < this.jpaths.length; j++) {
        header.push(this.jpaths[j].name);
      }
      result.push(header.join('\t'));

      for (let i = 0, l = this.elements.length; i < l; i++) {
        const line = [];
        for (let j = 0; j < this.jpaths.length; j++) {
          Traversing.getValueFromJPath(
            this.elements[i],
            this.jpaths[j].jpath,
          ).done((elVal) => {
            line.push(elVal);
          });
        }
        result.push(line.join('\t'));
      }

      return result.join('\r\n');
    },

    unload() {
      this.jqGrid('GridDestroy');
      this.jqGrid = false;
      this.module.getDomContent().empty();
    },

    inDom() {
      var that = this,
        colNames = [],
        colModel = [],
        j = 0,
        editable,
        jpaths = this.module.getConfiguration('colsjPaths'),
        l;

      if (typeof jpaths === 'object') {
        l = jpaths.length;

        for (; j < l; j++) {
          editable =
            jpaths[j].editable !== 'none' &&
            jpaths[j].editable !== 'false' &&
            jpaths[j].editable !== '';
          colNames.push(jpaths[j].name);
          colModel.push({
            name: jpaths[j].name,
            index: jpaths[j].name,
            title: false,
            width: jpaths[j].width || 150,
            editable,
            editoptions:
              jpaths[j].editable === 'select'
                ? { value: jpaths[j].options }
                : {},
            edittype: editable ? jpaths[j].editable : false,
            _jpath: jpaths[j].jpath,
            sortable: true,
            sorttype: jpaths[j].number[0] ? 'float' : 'text',
          });
        }
      }

      var nbLines = this.module.getConfiguration('nbLines') || 20;

      this.domTable = $('<table />').attr('id', this.uniqId).appendTo(this.dom);
      this.domPaging = $('<div />', { id: `pager${this.uniqId}` }).appendTo(
        this.dom,
      );

      $(this.domTable).jqGrid({
        colNames,
        colModel,
        editable: true,
        sortable: true,
        loadonce: false,
        datatype: 'local',
        gridview: true,
        scrollerbar: true,
        height: '100%',
        forceFit: true,
        shrinkToFit: true,
        cellsubmit: 'clientArray',
        cellEdit: true,
        rowNum: nbLines,
        rowList: [2, 10, 20, 30, 100],
        pager: `#pager${this.uniqId}`,

        formatCell(rowid, cellname, value) {
          return $(value).text();
        },

        resizeStop() {
          that.domTable
            .children()
            .children()
            .eq(0)
            .children()
            .each(function (i) {
              jpaths[i].width = $(this).width();
            });
        },

        rowattr() {
          if (arguments[1]._backgroundColor) {
            return {
              style: `background-color: ${arguments[1]._backgroundColor}`,
            };
          }
        },

        beforeSaveCell(rowId, colName, value, rowNum, colNum) {
          if (that.jpaths[colNum].number.includes('number')) {
            value = Number.parseFloat(value);
          }

          that.module.model.dataSetChild(
            that.elements[rowId.replace(that.uniqId, '')], // source
            colModel[colNum]._jpath, // jpath
            value, // value
          );

          that.applyFilterToRow(rowId.replace(that.uniqId, ''), rowId);

          return `<div id="${getIDForCell(rowId, colName)}">${value}</div>`;
        },

        loadComplete() {
          if (!that.jqGrid) {
            return;
          }

          var ids = that.jqGrid('getDataIDs'),
            i = 0,
            l = ids.length,
            id;

          for (; i < l; i++) {
            id = ids[i].replace(that.uniqId, '');
            that.applyFilterToRow(id, ids[i]);
            that.tableElements[id]._inDom.notify();
          }
        },

        viewrecords: true,
        onSelectRow(rowid, status) {
          // rowid--; // ?? Plugin mistake ?
          if (that.hasToggleAction) {
            if (status) {
              $(`#${rowid}`)
                .addClass('bg-orange')
                .removeClass('ui-widget-content ui-state-highlight');
              that.module.controller.onToggleOn(
                that.elements,
                rowid.replace(that.uniqId, ''),
              );
            } else {
              $(`#${rowid}`).removeClass('bg-orange');
              that.module.controller.onToggleOff(
                that.elements,
                rowid.replace(that.uniqId, ''),
              );
            }
          }

          that.module.controller.lineClick(
            that.elements,
            rowid.replace(that.uniqId, ''),
          );
        },

        onSortCol() {
          var ids = that.jqGrid('getDataIDs'),
            i = 0,
            l = ids.length;

          for (; i < l; i++) {
            that.tableElements[i]._inDom.notify();
          }
        },
      });

      this.jqGrid = $(this.domTable).jqGrid.bind(this.domTable);
      this.resolveReady();
    },

    applyFilterToRow(elId, rowId) {
      if (this.filter) {
        this.filter(this.jqGrid, this.elements[elId], rowId);
      }
    },

    onResize() {
      if (!this.jqGrid) {
        return;
      }

      this.jqGrid('setGridWidth', this.width);
      this.jqGrid('setGridHeight', this.height - 26 - 27);
    },

    blank: {
      list() {
        this.currentPage = this.jqGrid('getGridParam', 'page');
        API.killHighlight(this.module.getId());
        this.jqGrid('clearGridData');
        $(this.domTable).trigger('reloadGrid');
      },
    },

    update: {
      list(moduleValue) {
        var list = moduleValue.get(),
          jpaths = this.module.getConfiguration('colsjPaths'),
          elements = [];

        this.jpaths = jpaths;
        this.elements = list;

        this.module.data = moduleValue;

        if (!jpaths) {
          return;
        }

        this.buildElements(list, elements, jpaths);
        this.gridElements = elements;
        this.tableElements = elements;

        var allEls = [],
          i = 0,
          l = elements.length;

        for (; i < l; i++) {
          allEls.push(elements[i]);
        }

        if (this.dataSize !== l) {
          // if the size of the data change we reset the page
          this.currentPage = 1;
          this.dataSize = l;
        }
        this.jqGrid('setGridParam', {
          datatype: 'local',
          data: allEls,
          page: this.currentPage,
        });

        $(this.domTable).trigger('reloadGrid');

        this.module.model.getjPath('list', [0]);
      },
    },

    buildElements(source, arrayToPush, jpaths) {
      var that = this,
        i = 0,
        l = source.length;

      for (; i < l; i++) {
        arrayToPush.push(
          this.buildElement(source.get(i), that.uniqId + i, jpaths),
        );
      }
    },

    buildElement(s, i, jp, m) {
      var element = {},
        j = 0,
        l = jp.length;

      if (!m) {
        this.listenFor(s, jp, i);
      }

      element.id = String(i);
      element.__source = s;

      API.listenHighlight(
        s,
        function (onOff) {
          $(`#${i}`)[onOff ? 'addClass' : 'removeClass']('ci-highlight');
        },
        false,
        this.module.getId(),
      );

      element._inDom = $.Deferred();
      for (; j < l; j++) {
        var id = getIDForCell(element.id, jp[j].name);
        (function (j, id) {
          element._inDom.progress(function () {
            Renderer.render($(`#${id}`), s, jp[j].jpath);
          });
        })(j, id);

        element[jp[j].name] = `<div id="${id}">`;
      }

      var cJpath = this.module.getConfiguration('colorjPath');
      if (cJpath) {
        var color = s.getChildSync(cJpath);
        if (color) {
          element._backgroundColor = String(color);
        }
      }

      return element;
    },

    listenFor(source, jpaths, id) {
      var that = this,
        body = $('body');

      this.module.model.dataListenChange(
        source,
        function () {
          that.jqGrid(
            'setRowData',
            id,
            that.buildElement(this, id, jpaths, true),
          );
          var scroll = body.scrollTop();
          var target = $(`tr#${id}`, that.domTable).get(0);
          if (target) {
            target.scrollIntoView();
            body.scrollTop(scroll);
          }
        },
        'list',
      );
    },

    onActionReceive: {
      addRow(source) {
        this.elements = this.elements || [];
        this.elements.push(source);
        this.module.data = this.elements;
        var jpaths = this.module.getConfiguration('colsjPaths');
        var l = this.elements.length - 1;
        var el = this.buildElement(source, this.uniqId + l, jpaths);
        this.gridElements.push(el);

        this.jqGrid('addRowData', el.id, el);
      },

      removeRow(el) {
        this.elements = this.elements || [];
        var id, index;

        for (var i = 0, l = this.gridElements.length; i < l; i++) {
          if (this.gridElements[i].__source == el) {
            id = this.gridElements[i].id;
            index = i;
            break;
          }
        }

        this.jqGrid('delRowData', id);

        this.elements.splice(index, 0, 1);
        this.gridElements.splice(index, 0, 1);
      },

      addColumn(jpath) {
        var module = this.module;
        var jpath2 = jpath.split('.');
        jpath2 = jpath2.pop();

        var cols = module.getConfiguration('colsjPaths');
        for (var i = 0; i < cols.length; i++) {
          if (jpath === cols[i].jpath) return;
        }

        cols.push({
          name: jpath2,
          editable: false,
          jpath,
          number: false,
        });
        this.module.reload();
      },

      removeColumn(jpath) {
        var module = this.module,
          jpaths = module.getConfiguration('colsjPaths'),
          i = 0,
          l = jpaths.length;

        for (; i < l; i++) {
          if (jpaths[i].jpath == jpath) {
            jpaths.splice(i, 1);
            this.module.reload();
            break;
          }
        }
      },
    },
  });

  function getIDForCell(rowid, column) {
    return `${rowid}_${column}`.replaceAll(/[^\w\d_]/g, '_');
  }

  return View;
});
