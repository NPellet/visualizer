'use strict';

define([
  'modules/default/defaultview',
  'src/util/util',
  'src/util/api',
  'src/util/domdeferred',
  'src/util/datatraversing',
  'src/util/context',
], function (Default, Util, API, DomDeferred, Traversing, Context) {
  function View() {}

  $.extend(true, View.prototype, Default, {
    init() {
      var that = this,
        currentColSort;

      var toggle = this.module.getConfiguration('toggle');

      this.domTable = $('<table />', {
        cellpadding: 0,
        cellspacing: 0,
      }).css({ width: '100%' });
      this.domHead = $('<thead />').appendTo(this.domTable);
      this.domBody = $('<tbody />').appendTo(this.domTable);

      this.selected = [];

      // Mouseenter is better in this case because it will
      // not fire multiple times if the element has children
      this.domTable
        .on('mouseenter', 'tbody tr', function () {
          var dataRowId = $(this).index();

          if (!isNaN(dataRowId)) {
            that.module.controller.lineHover(that.module.data, dataRowId);
          }

          // Mouseleave is better than mouseout in this case
        })
        .on('mouseleave', 'tbody tr', function () {
          var dataRowId = $(this).index();

          if (!isNaN(dataRowId)) {
            that.module.controller.lineOut(that.module.data, dataRowId);
          }
        })
        .on('click', 'tr', function () {
          var $this = $(this);

          that.module.controller.lineClick(that.module.data, $this.index());

          if (toggle) {
            if (toggle === 'single' && that.selected[0] !== undefined) {
              that.module.controller.onToggleOff(
                that.module.data,
                that.selected[0],
              );
              $this
                .parent()
                .children()
                .eq(that.selected[0])
                .toggleClass('toggled');

              that.selected = [];
            }

            var index = $this.index();

            if ($this.hasClass('toggled')) {
              that.module.controller.onToggleOff(that.module.data, index);
            } else {
              that.module.controller.onToggleOn(that.module.data, index);
            }

            $this.toggleClass('toggled');

            that.selected.push(index);
          }
        })
        .on('click', 'th', function () {
          // Sorting
          var jpathId = $(this).attr('data-jpath-number'),
            data = that.module.getDataFromRel('list');

          if (!currentColSort || currentColSort.col !== jpathId) {
            if (currentColSort) {
              that.domTable
                .find(`th[data-jpath-number="${currentColSort.col}"] .sort`)
                .remove();
            }

            currentColSort = {
              asc: true,
              col: jpathId,
              span: $('<div class="sort up"></div>'),
            };

            that.domTable
              .find(`th[data-jpath-number="${currentColSort.col}"]`)
              .append(currentColSort.span);
          } else if (currentColSort.col === jpathId) {
            currentColSort.asc = !currentColSort.asc;
            currentColSort.span.toggleClass('up');
          }

          data.sort(function (a, b) {
            return (
              (currentColSort.asc ? 1 : -1) *
              (that.jpaths[jpaths[jpathId].jpath](a) >
              that.jpaths[jpaths[jpathId].jpath](b)
                ? 1
                : -1)
            );
          });

          that.module.model.dataTriggerChange(data);
          that.blank.list.call(that);
          that.update.list.call(that, data);
        });

      this.dom = this.domTable;
      this.module.getDomContent().html(this.dom);
      this.onResize();

      var jpaths = this.module.getConfiguration('colsjPaths'),
        l = jpaths.length,
        j = 0;

      this.colsjPaths = jpaths;
      this.jpaths = {};

      var thead = '<tr>';
      for (; j < l; j++) {
        if (!jpaths[j].jpath) {
          continue;
        }

        Util.addjPathFunction(this.jpaths, jpaths[j].jpath);
        thead += `<th data-jpath-number="${j}">${jpaths[j].name}</th>`;
      }
      thead += '</tr>';

      var colorjpath = this.module.getConfiguration('colorjPath');

      if (colorjpath) {
        this.colorjpath = Util.makejPathFunction(colorjpath);
      }

      this.domHead.html(thead);
      this.resolveReady();
    },

    unload() {
      this.module.getDomContent().empty();
    },

    applyFilterToRow(elId, rowId) {
      if (this.filter) {
        this.filter(this.jqGrid, this.elements[elId], rowId);
      }
    },

    blank: {
      list() {
        if (this.domBody) {
          this.domBody.empty();
        }

        if (!this.module.data) {
          return;
        }

        var i,
          l = this.module.data.length;

        for (i = 0; i < l; i++) {
          if (this.module.data[i] && this.module.data[i].unbindChange) {
            this.module.data[i].unbindChange(this.module.getId());
          }
        }
      },
    },

    update: {
      list(moduleValue) {
        if (moduleValue.type === 'string') {
          return;
        }

        if (!moduleValue) {
          return;
        }

        this.selected = [];

        //     moduleValue = moduleValue.get();

        this.elements = moduleValue;

        var that = this,
          html = '',
          l = moduleValue.get().length;

        this.module.data = moduleValue;

        for (let i = 0; i < l; i++) {
          html += this.buildElement(moduleValue.getChildSync([i]), i);
        }

        this.domBody.html(html);

        // Debouncing the highlighting
        if (this.timeout) {
          window.clearTimeout(this.timeout);
        }

        // Wait before setting the highlights
        this.timeout = window.setTimeout(function () {
          API.killHighlight(that.module.getId());

          for (let i = 0; i < l; i++) {
            API.listenHighlight(
              that.module.data[i],
              function (val) {
                that.doHighlight(i, val);
              },
              false,
              that.module.getId(),
            );

            let dom = that.domBody.find(`#${that.module.getId()}_${i}`);

            that.module.model.dataListenChange(
              that.module.data.get(i),
              function () {
                dom.replaceWith((dom = $(that.buildElement(this, i, true))));
              },
              'list',
            );

            if (that.module.data.get(i).removable) {
              Context.listen(dom.get(0), [
                [
                  '<li><a><span class="ui-icon ui-icon-close"></span> Remove</a></li>',
                  function () {
                    that.onActionReceive.removeRowById.call(that, i);
                  },
                ],
              ]);
            }
          }
        }, 1000); // 1 sec timeout

        this.list = true;
        this.showList = false; // Input data has changed,  showList must be reset.
        this.updateVisibility();
      },
      showList(value) {
        if (!Array.isArray(value)) {
          return;
        }

        this.showList = value;
        this.updateVisibility();
      },
    },

    updateVisibility() {
      if (!this.showList || !this.list) return;

      var s = this.showList;
      var l = s.length;
      var el;
      var id = `${this.module.getId()}_`;
      for (let i = 0; i < l; i++) {
        el = document.querySelector(`#${id + i}`);
        if (s[i]) {
          el.removeAttribute('style');
        } else {
          el.setAttribute('style', 'display:none');
        }
      }
    },

    buildElement(source, i) {
      var jpaths = this.colsjPaths,
        html = '',
        j,
        k = jpaths.length,
        currentVar,
        color;

      html += '<tr';

      if (this.colorjpath) {
        color = this.colorjpath(source);
        if (Array.isArray(color)) {
          if (color.length === 3) {
            color = `rgb(${color.join(',')})`;
          } else {
            color = `rgba(${color.join(',')})`;
          }
        }
        html += ` style="background-color: ${color};"`;
      }

      html += ` id="${this.module.getId()}_${i}" `;
      html += '>';

      j = 0;
      for (; j < k; j++) {
        if (!jpaths[j].jpath) {
          continue;
        }

        html += '<td>';
        currentVar = Traversing.get(
          this.getValue(Traversing.get(source), jpaths[j].jpath),
        );
        if (currentVar === undefined) {
          currentVar = '';
        }
        html += currentVar;
        html += '</td>';
      }
      html += '</tr>';

      return html;
    },

    doHighlight(i, val) {
      let elements = this.domBody.find('tr').eq(i);
      elements[val ? 'addClass' : 'removeClass']('ci-highlight');
    },

    getValue(trVal, jpath) {
      if (!this.jpaths[jpath]) {
        return '';
      }

      return this.jpaths[jpath](trVal);
    },

    getDom() {
      return this.dom;
    },

    onActionReceive: {
      addRow(source) {
        this.elements = this.elements || [];

        if (this.module.getDataFromRel('list').includes(source)) {
          return;
        }

        this.module.getDataFromRel('list').push(source);
        var l = this.elements.length - 1;

        var el = this.buildElement(source, l);
        this.domBody.append(el);
      },

      removeRow(source) {
        this.onActionReceive.removeRowById.call(
          this,
          this.module.getDataFromRel('list').indexOf(source),
        );
      },

      removeRowById(rowId) {
        if (rowId < 0) {
          return;
        }

        var el = this.module.getDataFromRel('list').splice(rowId, 1);
        el[0].unbindChange(this.module.getId());

        var index;

        if ((index = this.selected.indexOf(rowId)) > -1) {
          this.selected.splice(index, 1);
        }

        this.domBody.children().eq(rowId).remove();
      },

      toggleOff(source) {
        var index = this.module.getDataFromRel('list').indexOf(source);
        if (index === -1) {
          return;
        }

        this.module.controller.onToggleOff(this.module.data, index);
        this.domBody.children().eq(index).removeClass('toggled');
      },

      toggleOn(source) {
        var index = this.module.getDataFromRel('list').indexOf(source);

        if (index === -1) {
          return;
        }

        var toggle = this.module.getConfiguration('toggle'),
          that = this;

        if (toggle === 'single' && that.selected[0] !== undefined) {
          that.module.controller.onToggleOff(
            that.module.data,
            that.selected[0],
          );
          that.domBody.children().eq(that.selected[0]).toggleClass('toggled');
          that.selected = [];
        }

        that.selected.push(index);

        this.module.controller.onToggleOn(this.module.data, index);
        this.domBody.children().eq(index).addClass('toggled');
      },

      scrollTo(source) {
        var index = this.module.getDataFromRel('list').indexOf(source);
        if (index === -1) {
          return;
        }

        var el = this.domBody.children().eq(index).get();
        el.scrollIntoView();
      },
    },

    exportToTabDelimited() {
      if (!this.colsjPaths) {
        return;
      }

      var result = [];

      var jpaths = this.colsjPaths;

      var header = [];
      for (var j = 0; j < jpaths.length; j++) {
        header.push(jpaths[j].name);
      }
      result.push(header.join('\t'));

      for (let i = 0; i < this.elements.length; i++) {
        const line = [];
        for (let j = 0; j < jpaths.length; j++) {
          Traversing.getValueFromJPath(this.elements[i], jpaths[j].jpath).done(
            (elVal) => {
              line.push(elVal);
            },
          );
        }
        result.push(line.join('\t'));
      }

      return result.join('\r\n');
    },
  });

  return View;
});
