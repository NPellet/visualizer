'use strict';


define(['modules/default/defaultview', 'src/util/api', 'src/util/color'], function (Default, API, Color) {
  function View() {
  }
  
  $.extend(true, View.prototype, Default, {
    
    init: function () {
      let html = [];
      html.push('<div></div>');
      this.dom = $(html.join(''));
      this.module.getDomContent().html(this.dom);
    },
    
    blank: {
      wellsList: function () {
        this.plate = null;
        this.wellsList = null;
        API.killHighlight(this.module.getId());
        this.dom.empty();
      },
    },

    inDom: function () {
      const that = this;
      this.dom.on('mouseenter mouseleave click', 'td', function (e) {
        const wellsList = that.wellsList;
        const plate = $(this).parents(':eq(3)').index();
        const trIndex = $(this).parent().index();
        const tdIndex = $(this).index();
        const cols = that.cols;
        const rows = that.rows;
        const direction = that.module.getConfiguration('direction', 'vertical') || 'vertical';
        const elementId = direction === 'vertical' ?
          (plate * cols * rows) + tdIndex * rows + trIndex :
          (plate * cols * rows) + trIndex * cols + tdIndex;
        if (!wellsList[elementId]) return;
        let highlight = wellsList[elementId]._highlight;
        if (e.type === 'mouseenter') {
          that.module.controller.createDataFromEvent(
            'onTrackMouse',
            'trackData',
            wellsList[elementId],
          );
          that.module.controller.sendActionFromEvent(
            'onTrackMouse',
            'trackData',
            wellsList[elementId],
          );
          API.highlight([highlight], 1);
        } else if (e.type === 'mouseleave') {
          API.highlight([highlight], 0);
        } else if (e.type === 'click') {
          that.module.controller.sendActionFromEvent(
            'onTrackClick',
            'trackData',
            wellsList[elementId],
          );
        }
      });
      this.resolveReady();
    },

    update: {
      wellsList: function (moduleValue) {
        const cfg = this.module.getConfiguration;
        const cfgc = this.module.getConfigurationCheckbox;
        const cols = cfg('colnumber', 4) || 4;
        const rows = cfg('rownumber', 4) || 4;
        const style = cfg('shape', 'aligned') || 'aligned';
        const direction = cfg('direction', 'vertical') || 'vertical';
        const colorJpath = cfg('colorjpath', false);
        const wellsList = moduleValue.get();
        const colorBySample = cfgc('colorBySample', 'yes');
        const colorByJpathValue = cfgc('colorByJpathValue', 'yes');
        const colorByJpath = cfgc('colorByJpath', 'yes');
        this.wellsList = wellsList;
        this.module.controller.createDataFromEvent('onList', 'list', wellsList);
        let shape;
        switch (style) {
          case 'aligned': {
            shape = {
              shift: false,
              margin: undefined,
            };
            break;
          }
          case 'pairShifted': {
            shape = {
              margin: true,
              index: 0,
            };
            break;
          }
          case 'oddShifted': {
            shape = {
              margin: true,
              index: 1,
            };
            break;
          }
        }
        const wellLabels = createWellLabels({
          cols: cols,
          rows: rows
        }, 2, { direction: direction });
        const labelsList = wellLabels.wellLabels;
        const axis = wellLabels.axis;
        const nbRows = axis.filter((x) => x[0] === 'rows')[0][1].length;
        const nbColumns = axis.filter((x) => x[0] === 'cols')[0][1].length;
        this.rows = nbRows;
        this.cols = nbColumns;
        const nbPlate = Math.ceil(wellsList.length / (nbRows * nbColumns));
        const tables = this.buildGrid(wellsList, labelsList, nbPlate, nbRows, nbColumns, direction, shape);
        this.dom.html(tables);
        const tableNodes = this.dom.find(':eq(0)').children();
        let grid = [];
        for (let u = 0; u < tableNodes.length; u++) {
          let tr = $(tableNodes[u]).find(':eq(1)').children();
          let td = $(tr[0]).children();
          let [rows, columns] = direction === 'vertical' ?
            [td.length, tr.length] : [tr.length, td.length];
          for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
              let [a, b] = direction === 'vertical' ?
                [j, i] : [i, j];
              grid.push({
                index: (a * rows) + b,
                value: tr[a].childNodes[b]
              });
            }
          }
        }
        
        if (!colorBySample && colorByJpath) {
          let arrayPath = colorJpath.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          let jpathItems = [];
          moduleValue.filter(function (item) {
            let value = item.experiment[arrayPath] ? item.experiment[arrayPath].value : null;
            let element = this.find((x) => x === value);
            if (element === undefined && value !== null && typeof value !== 'object') this.push(value);
          }, jpathItems);
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath, jpathItems);
          }
        }

        if (!colorBySample && colorByJpathValue) {
          let jpathValue = cfg('jpathValue', 4) || 4;
          let arrayPath = jpathValue.split('.');
          arrayPath = arrayPath[arrayPath.length - 1];
          for (let i = 0; i < grid.length; i++) {
            this.addConfigurations(grid, i, arrayPath);
          }
        }
        for (let i = 0; i < wellsList.length; i++) {
          this.listenHighlight(grid, wellsList[i]._highlight, i);
        }
      },
    },

    addConfigurations: function (grid, currentItem, colorJpath, jpathItems) {
      let color;
      if (jpathItems) color = Color.getDistinctColorsAsString(jpathItems.length);
      const element = this.wellsList[currentItem];
      if (colorJpath) {
        if (!element) return;
        const val = element.experiment[colorJpath];
        if (jpathItems) {
          for (let i = 0; i < jpathItems.length; i++) {
            jpathItems[i] = typeof jpathItems[i] === 'object' ?
              jpathItems[i].label : jpathItems[i];
          }
          const index = typeof val === 'object' ?
            jpathItems.findIndex((item) => item == val.value) : val;
          $(grid[currentItem].value).find(':eq(1)').css(
            { 'background-color': color[index] }
          );
        } else {
          if (Number.isNaN(parseInt(val ? val.value : NaN, 10))) return;
          let cfg = this.module.getConfiguration;
          let min = cfg('min', 4) || 4;
          let max = cfg('max', 4) || 4;
          let color = cfg('color', 4) || 4;
          max = parseFloat(max);
          min = parseFloat(min);
          let arrayColor = new Array(10).fill(min)
            .map((item, index, array) => item + ((max - min) / 10) * index);
          const index = typeof val === 'object' ?
            arrayColor.findIndex((x) => x > val.value) : val;
          color[3] = index / 10;
          if (index) {
            $(grid[currentItem].value).find(':eq(1)').css(
              { 'background-color': `rgba(${color})` }
            );
          }
        }
      }
    },

    listenHighlight: function (grid, highlight, i) {
      const that = this;
      API.listenHighlight({ _highlight: highlight }, function (onOff, key) {
        if (onOff === 1) {
          if (!grid[i]) return;
          $(grid[i].value).find(':eq(0)').css({
            'border-color': '#F74949'
          });
        } else if (onOff === 0) {
          if (!grid[i]) return;
          $(grid[i].value).find(':eq(0)').css({
            'border-color': '#ddd'
          });
        }
      }, false, that.module.getId());
    },

    buildGrid: function (wellsList, labelsList, nbPlates, nbRows, nbColumns, direction, shape) {
      let colorBySample = this.module.getConfigurationCheckbox('colorBySample', 'yes');
      let wellBorderStyle = this.module.getConfiguration('wellBorderStyle', 'solid');
      let wellSize = this.module.getConfiguration('wellSize', 30);
      let plateGrid = $('<div>');
      for (let u = 0; u < nbPlates; u++) {
        let table = $('<table>');
        for (let i = 0; i < nbRows; i++) {
          let row = $('<tr>').attr({ name: `row${String(i)}` }).css({
            'vertical-align': 'top'
          });
          for (let j = 0; j < nbColumns; j++) {
            let index = direction === 'vertical' ?
              (u * nbRows * nbColumns) + (j * nbRows) + i :
              (u * nbRows * nbColumns) + (i * nbColumns) + j;
            let td = $('<td>');
            let wellBottom = $('<div>').addClass('well-plate-well-bottom').css({
              'border-style': wellBorderStyle,
              'border-radius': `${wellSize}px`,
              height: `${wellSize}px`,
              width: `${wellSize}px`,
            });
            let wellTop = $('<div>').addClass('well-plate-well-top');
            let label = $('<div>').text(Number.isNaN(parseInt(labelsList[index].slice(0, -2)[0])) ?
              labelsList[index].slice(0, -2) : index + 1);
            label.addClass('well-plate-well-top');
            if (shape.margin && (j + shape.index) % 2 !== 0) wellBottom.css({ margin: '30px 0px 0px 0px' });
            let element = colorBySample ? wellsList : new Array(wellsList.length).fill({ color: 'rgba(141, 234, 106)' });
            wellTop.css({
              'background-color': `${element[index] !== undefined ? element[index].color : '#FFFFFF'}`
            });
            wellTop.append(label);
            wellBottom.append(wellTop);
            td.append(wellBottom);
            row.append(td);
          }
          table.append(row);
        }
        let divTag = $('<div>').css({ 'border-style': 'inset' }).append(table);
        plateGrid.append(divTag);
      }
      return plateGrid;
    },
  });
  return View;
});

function createWellLabels(config, nbPlates, options = {}) {
  let {
    direction = 'vertical'
  } = options;
  let entries = Object.entries(config);
  for (let i = 0; i < entries.length; i++) {
    if (Number.isNaN(parseInt(entries[i][1]))) {
      let label = entries[i][1].toUpperCase().charCodeAt(0);
      let axis = new Array(label - 64).fill()
        .map((item, index) => String.fromCharCode(index + 65));
      entries[i][1] = axis;
    } else {
      let axis = new Array(parseInt(entries[i][1])).fill()
        .map((item, index) => index + 1);
      entries[i][1] = axis;
    }
  }
  let wellLabels = [];
  let [rows, columns] = [entries[0][1], entries[1][1]];
  if (Number.isInteger(rows[0]) && Number.isInteger(columns[0])) {
    let rod = direction === 'vertical' ? rows : columns;
    for (let u = 0; u < nbPlates; u++) {
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let [rowIndex, columnIndex] = direction === 'vertical' ? [i, j] : [j, i];
          row[j] = `${columnIndex * rod.length + rod[rowIndex]}-${u + 1}`;
        }
        wellLabels.push(...row);
      }
    }
  } else {
    [rows, columns] = direction === 'vertical' ? [rows, columns] : [columns, rows];
    for (let u = 0; u < nbPlates; u++) {
      for (let i = 0; i < rows.length; i++) {
        let row = [];
        for (let j = 0; j < columns.length; j++) {
          let element = typeof rows[i] === 'string' ?
            rows[i] + columns[j] : columns[j] + rows[i];
          row[j] = `${element}-${u + 1}`;
        }
        wellLabels.push(...row);
      }
    }
  }
  return {
    wellLabels: wellLabels,
    axis: entries
  };
}

